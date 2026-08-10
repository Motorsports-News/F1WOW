// Pure calculation engine for the championship calculator.
// No DOM, no fetch - loadable as a plain <script> in the browser
// (attaches to window.ChampionshipCalc) and via require() in Node tests.
(function (root) {
    'use strict';

    const GP_POINTS = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };
    const SPRINT_POINTS = { 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1 };
    const GP_POSITION_FROM_POINTS = { 25: 1, 18: 2, 15: 3, 12: 4, 10: 5, 8: 6, 6: 7, 4: 8, 2: 9, 1: 10 };
    const SPRINT_POSITION_FROM_POINTS = { 8: 1, 7: 2, 6: 3, 5: 4, 4: 5, 3: 6, 2: 7, 1: 8 };

    function gpPointsFor(position) {
        return GP_POINTS[position] || 0;
    }

    function sprintPointsFor(position) {
        return SPRINT_POINTS[position] || 0;
    }

    function maxRemainingPoints(standardRacesLeft, sprintWeekendsLeft, carsPerEntity) {
        carsPerEntity = carsPerEntity || 1;
        return (standardRacesLeft * 25 + sprintWeekendsLeft * 33) * carsPerEntity;
    }

    // Standard F1 elimination test: even if the trailing driver wins every remaining
    // race/sprint (best case) and the leader scores zero for the rest of the season
    // (worst case for the leader), can the trailing driver still catch them?
    // carsPerEntity scales the ceiling for constructors (2 cars) vs drivers (1, the default).
    function checkElimination(driverPoints, leaderPoints, standardRacesLeft, sprintWeekendsLeft, carsPerEntity) {
        const bestCase = driverPoints + maxRemainingPoints(standardRacesLeft, sprintWeekendsLeft, carsPerEntity);
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

    // Kept for display purposes only (see design spec Decision 3) - the simulation
    // itself samples from raw history, not these fitted stats.
    // Returns { avgGP, stdGP, avgSprint, stdSprint }.
    function computePaceStats(gpPointsHistory, sprintPointsHistory) {
        const avgGP = mean(gpPointsHistory);
        const stdGP = Math.max(stddev(gpPointsHistory, avgGP) || 0, 2);
        const avgSprint = mean(sprintPointsHistory);
        const stdSprint = Math.max(stddev(sprintPointsHistory, avgSprint) || 0, 1);
        return { avgGP, stdGP, avgSprint, stdSprint };
    }

    // Empirical resampling: draw a random value from the driver's own real per-race
    // points history, instead of fitting a distribution. Naturally bounded (can only
    // produce values the driver has actually scored) and has no shape assumption to
    // get wrong - replaces an earlier normal-distribution approach that systematically
    // understated drivers whose average sits close to the points cap (see design spec
    // Decision 3 for the full story).
    function sampleFromHistory(history, rng) {
        rng = rng || Math.random;
        if (!history || !history.length) return 0;
        const idx = Math.min(Math.floor(rng() * history.length), history.length - 1);
        return history[idx];
    }

    // Each race entry: { locked, isSprint, gpPosition?, sprintPosition? }.
    // Locked races use the user-set finishing position directly; unlocked races
    // are simulated by resampling from the driver's own real 2026 per-race history.
    function simulateDriverRemainingPoints(races, history, rng) {
        history = history || {};
        let total = 0;
        races.forEach(race => {
            if (race.locked) {
                total += gpPointsFor(race.gpPosition);
                if (race.isSprint) total += sprintPointsFor(race.sprintPosition);
            } else {
                total += sampleFromHistory(history.gpHistory, rng);
                if (race.isSprint) total += sampleFromHistory(history.sprintHistory, rng);
            }
        });
        return total;
    }

    // drivers: [{ id, currentPoints, history, races, eliminated }]. Eliminated drivers are
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
                    : d.currentPoints + simulateDriverRemainingPoints(d.races, d.history, rng);
            });
            // Exact float-equality tie detection is intentional here, not a bug to later
            // "fix" with an epsilon comparison: locked races contribute exact integer point
            // totals, and resampled history values are themselves drawn from a finite set of
            // real (often integer) per-race point values, so real point-masses exist at
            // shared values. Genuine ties between similar drivers are plausible, not just
            // theoretical - dividing a "win" across topIds below is the correct handling.
            const maxTotal = Math.max(...Object.values(totals));
            const topIds = Object.keys(totals).filter(id => totals[id] === maxTotal);
            topIds.forEach(id => { wins[id] += 1 / topIds.length; });
        }
        const probabilities = {};
        drivers.forEach(d => { probabilities[d.id] = wins[d.id] / simulations; });
        return probabilities;
    }

    // Plain-English "how far behind, and by how much per race" framing - the v1
    // required-results output. (A full combinatorial "guaranteed clinch" search is
    // a v1.x feature, deliberately out of scope here - see design spec.)
    // Callers should pair this with checkElimination() before displaying it - an
    // arithmetically correct "needs N points/race" can still describe an impossible
    // scenario (e.g. N > 25) if the rival is actually already eliminated.
    function requiredResultGap(leaderPoints, rivalPoints, racesLeftCount) {
        const gap = leaderPoints - rivalPoints;
        if (gap <= 0 || racesLeftCount <= 0) return null;
        const perRaceNeeded = Math.round((gap / racesLeftCount) * 10) / 10;
        return { gap, perRaceNeeded, racesLeftCount };
    }

    // The genuine best-case/worst-case boundary for a selected driver's title chances,
    // as opposed to requiredResultGap's simplified "average points per race" framing.
    // Answers "how much can the opponent still score before I'm mathematically done?"
    // rather than "what average pace would close the gap" - the two can read very
    // differently for a driver who's a long way back with few races left, where no
    // realistic average pace exists but the driver isn't eliminated yet either.
    function titleBoundary(selectedPoints, opponentPoints, standardRacesLeft, sprintWeekendsLeft, carsPerEntity) {
        const ceiling = maxRemainingPoints(standardRacesLeft, sprintWeekendsLeft, carsPerEntity);
        const bestCase = selectedPoints + ceiling;
        const eliminated = checkElimination(selectedPoints, opponentPoints, standardRacesLeft, sprintWeekendsLeft, carsPerEntity);
        const maxOpponentAllowed = Math.max(0, bestCase - opponentPoints);
        return { eliminated, bestCase, ceiling, maxOpponentAllowed };
    }

    // Reverse of gpPointsFor/sprintPointsFor. null means "outside the points" (P11+
    // for a GP, P9+ for a sprint) - this also covers a retirement/DNF, since the
    // underlying data only stores points scored, not finishing/classification status,
    // so a genuine DNF and a lapped P14 are indistinguishable from points alone.
    function gpPositionFromPoints(points) {
        return GP_POSITION_FROM_POINTS[points] || null;
    }
    function sprintPositionFromPoints(points) {
        return SPRINT_POSITION_FROM_POINTS[points] || null;
    }

    // Like simulateDriverRemainingPoints, but also records the finishing position
    // implied by each unlocked race's resampled points value. Locked races aren't
    // included in `finishes` - the user already set them, so they're not part of
    // "what would need to happen" in a generated scenario.
    function simulateDetailedOutcome(races, history, rng) {
        history = history || {};
        let total = 0;
        const finishes = [];
        races.forEach(race => {
            if (race.locked) {
                total += gpPointsFor(race.gpPosition);
                if (race.isSprint) total += sprintPointsFor(race.sprintPosition);
                return;
            }
            const gpPts = sampleFromHistory(history.gpHistory, rng);
            let sprintPts = 0, sprintPosition = null;
            if (race.isSprint) {
                sprintPts = sampleFromHistory(history.sprintHistory, rng);
                sprintPosition = sprintPositionFromPoints(sprintPts);
            }
            total += gpPts + sprintPts;
            finishes.push({ gpPosition: gpPositionFromPoints(gpPts), sprintPosition });
        });
        return { total, finishes };
    }

    // Rejection-samples full remaining seasons until it finds `count` distinct trials
    // where `selected` actually ends up ahead of `opponent`, or gives up after
    // `maxAttempts`. selected/opponent: { currentPoints, history, races } (same shape
    // runMonteCarlo's driver entries use). For a driver whose true probability is
    // tiny, finding even one such trial can take many attempts - if none turn up in
    // the budget, it's more honest to return an empty list than to fabricate one.
    function findWinningScenarios(selected, opponent, count, maxAttempts, rng) {
        rng = rng || Math.random;
        const examples = [];
        for (let attempt = 0; attempt < maxAttempts && examples.length < count; attempt++) {
            const selOutcome = simulateDetailedOutcome(selected.races, selected.history, rng);
            const oppOutcome = simulateDetailedOutcome(opponent.races, opponent.history, rng);
            const selectedTotal = selected.currentPoints + selOutcome.total;
            const opponentTotal = opponent.currentPoints + oppOutcome.total;
            if (selectedTotal > opponentTotal) {
                examples.push({ selected: selOutcome, opponent: oppOutcome, selectedTotal, opponentTotal });
            }
        }
        return examples;
    }

    const ChampionshipCalc = {
        GP_POINTS, SPRINT_POINTS,
        gpPointsFor, sprintPointsFor,
        maxRemainingPoints, checkElimination,
        mean, stddev, computePaceStats,
        sampleFromHistory, simulateDriverRemainingPoints, runMonteCarlo,
        requiredResultGap, titleBoundary,
        gpPositionFromPoints, sprintPositionFromPoints, simulateDetailedOutcome, findWinningScenarios
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ChampionshipCalc;
    } else {
        root.ChampionshipCalc = ChampionshipCalc;
    }
})(typeof window !== 'undefined' ? window : globalThis);
