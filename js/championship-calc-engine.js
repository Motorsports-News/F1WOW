// Pure calculation engine for the championship calculator.
// No DOM, no fetch - loadable as a plain <script> in the browser
// (attaches to window.ChampionshipCalc) and via require() in Node tests.
(function (root) {
    'use strict';

    const GP_POINTS = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };
    const SPRINT_POINTS = { 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1 };

    function gpPointsFor(position) {
        return GP_POINTS[position] || 0;
    }

    function sprintPointsFor(position) {
        return SPRINT_POINTS[position] || 0;
    }

    function maxRemainingPoints(standardRacesLeft, sprintWeekendsLeft) {
        return standardRacesLeft * 25 + sprintWeekendsLeft * 33;
    }

    // Standard F1 elimination test: even if the trailing driver wins every remaining
    // race/sprint (best case) and the leader scores zero for the rest of the season
    // (worst case for the leader), can the trailing driver still catch them?
    function checkElimination(driverPoints, leaderPoints, standardRacesLeft, sprintWeekendsLeft) {
        const bestCase = driverPoints + maxRemainingPoints(standardRacesLeft, sprintWeekendsLeft);
        return bestCase < leaderPoints;
    }

    function mean(arr) {
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    }

    // Returns null when arr has fewer than 2 samples - not enough data for a real
    // standard deviation. Callers must handle that null (see computePaceStats' floor).
    function stddev(arr, m) {
        if (arr.length < 2) return null; // not enough samples for a real stddev
        const variance = arr.reduce((a, b) => a + (b - m) * (b - m), 0) / (arr.length - 1);
        return Math.sqrt(variance);
    }

    // Floors keep the Monte Carlo engine from collapsing to zero variance on drivers
    // with very few or very consistent results - some spread is always realistic in F1.
    // Returns { avgGP, stdGP, avgSprint, stdSprint }.
    function computePaceStats(gpPointsHistory, sprintPointsHistory) {
        const avgGP = mean(gpPointsHistory);
        const stdGP = Math.max(stddev(gpPointsHistory, avgGP) || 0, 2);
        const avgSprint = mean(sprintPointsHistory);
        const stdSprint = Math.max(stddev(sprintPointsHistory, avgSprint) || 0, 1);
        return { avgGP, stdGP, avgSprint, stdSprint };
    }

    function randNormal(m, s, rng) {
        rng = rng || Math.random;
        let u = 0, v = 0;
        while (u === 0) u = rng();
        while (v === 0) v = rng();
        const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        return m + z * s;
    }

    // Rejection-sample a normal draw into [min, max] - NOT clamp. Clamping a raw draw
    // biases the effective mean toward the boundary for any driver whose distribution
    // has real mass near/above the cap (measured ~7% low for a realistic high-pace
    // leader profile in code review) - the wrong direction for this feature, since it
    // understates exactly the dominant drivers it needs to model credibly.
    function boundedNormal(m, s, min, max, rng) {
        for (let attempt = 0; attempt < 20; attempt++) {
            const v = randNormal(m, s, rng);
            if (v >= min && v <= max) return v;
        }
        return Math.max(min, Math.min(max, randNormal(m, s, rng))); // pathological fallback
    }

    // Each race entry: { locked, isSprint, gpPosition?, sprintPosition? }.
    // Locked races use the user-set finishing position directly; unlocked races
    // are simulated from the driver's own pace (their actual 2026 average/spread).
    function simulateDriverRemainingPoints(races, pace, rng) {
        let total = 0;
        races.forEach(race => {
            if (race.locked) {
                total += gpPointsFor(race.gpPosition);
                if (race.isSprint) total += sprintPointsFor(race.sprintPosition);
            } else {
                total += boundedNormal(pace.avgGP, pace.stdGP, 0, 25, rng);
                if (race.isSprint) total += boundedNormal(pace.avgSprint, pace.stdSprint, 0, 8, rng);
            }
        });
        return total;
    }

    // drivers: [{ id, currentPoints, pace, races, eliminated }]. Eliminated drivers are
    // still included in every simulated season (so probabilities across all drivers sum
    // to 1) but are locked to their current points - they can never register a "win" tie.
    function runMonteCarlo(drivers, simulations, rng) {
        const wins = {};
        drivers.forEach(d => { wins[d.id] = 0; });
        for (let sim = 0; sim < simulations; sim++) {
            const totals = {};
            drivers.forEach(d => {
                totals[d.id] = d.eliminated
                    ? d.currentPoints
                    : d.currentPoints + simulateDriverRemainingPoints(d.races, d.pace, rng);
            });
            // Exact float-equality tie detection is intentional here, not a bug to later
            // "fix" with an epsilon comparison: locked races contribute exact integer point
            // totals, and boundedNormal's rejection sampling still lets unlocked draws land
            // exactly on 0 or 25 (or 0/8 for sprints), so real point-masses exist at those
            // boundaries. Genuine ties between similar-pace drivers are plausible, not just
            // theoretical - dividing a "win" across topIds below is the correct handling.
            const maxTotal = Math.max(...Object.values(totals));
            const topIds = Object.keys(totals).filter(id => totals[id] === maxTotal);
            topIds.forEach(id => { wins[id] += 1 / topIds.length; });
        }
        const probabilities = {};
        drivers.forEach(d => { probabilities[d.id] = wins[d.id] / simulations; });
        return probabilities;
    }

    const ChampionshipCalc = {
        GP_POINTS, SPRINT_POINTS,
        gpPointsFor, sprintPointsFor,
        maxRemainingPoints, checkElimination,
        mean, stddev, computePaceStats,
        randNormal, boundedNormal, simulateDriverRemainingPoints, runMonteCarlo
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ChampionshipCalc;
    } else {
        root.ChampionshipCalc = ChampionshipCalc;
    }
})(typeof window !== 'undefined' ? window : globalThis);
