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

    // Each race entry: { isSprint, gpLocked, gpPosition?, sprintLocked, sprintPosition? }.
    // Legacy entries ({ locked: true, ... }) lock both sides at once. The two sides can
    // also be locked independently (drag-to-order boards): a sprint weekend where the
    // user set the GP result but left the sprint simulated is gpLocked without
    // sprintLocked. Locked sides use the user-set finishing position directly; unlocked
    // sides are simulated by resampling from the driver's own real 2026 per-race history.
    function gpIsLocked(race) {
        return !!(race.locked || race.gpLocked);
    }
    function sprintIsLocked(race) {
        return !!(race.locked || race.sprintLocked);
    }

    function simulateDriverRemainingPoints(races, history, rng) {
        history = history || {};
        let total = 0;
        races.forEach(race => {
            if (gpIsLocked(race)) {
                total += gpPointsFor(race.gpPosition);
            } else {
                total += sampleFromHistory(history.gpHistory, rng);
            }
            if (race.isSprint) {
                if (sprintIsLocked(race)) {
                    total += sprintPointsFor(race.sprintPosition);
                } else {
                    total += sampleFromHistory(history.sprintHistory, rng);
                }
            }
        });
        return total;
    }

    // Splits one trial's win across every driver tied at the top total. Exact
    // float-equality tie detection is intentional here, not a bug to later "fix"
    // with an epsilon comparison: locked races contribute exact integer point
    // totals, and resampled history values are themselves drawn from a finite set
    // of real (often integer) per-race point values, so real point-masses exist at
    // shared values. Genuine ties between similar drivers are plausible, not just
    // theoretical. (Shared by runMonteCarlo and runMonteCarloStable.)
    function settleTrial(totals, wins) {
        const maxTotal = Math.max(...Object.values(totals));
        const topIds = Object.keys(totals).filter(id => totals[id] === maxTotal);
        topIds.forEach(id => { wins[id] += 1 / topIds.length; });
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
            settleTrial(totals, wins);
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

    // ---- Partial-lock variants (drag-to-order boards) ----
    // A lock entry for one round may now be partial on sprint weekends: an absent
    // gpPosition/sprintPosition key means that side is still open (simulated,
    // still scoreable), while an explicit null means locked at zero (P11+/DNF).
    // Legacy entries from old share links always carry both keys, so they resolve
    // to "nothing still available" exactly as before. These helpers replace the
    // count-based maxRemainingPoints/checkElimination/titleBoundary math whenever
    // the scenario can contain partial locks.

    // Max points still on the table for ONE car in a single remaining race.
    function raceMaxAvailable(isSprint, locked) {
        if (!locked) return isSprint ? 33 : 25;
        let max = 0;
        if (locked.gpPosition === undefined) max += 25;
        if (isSprint && locked.sprintPosition === undefined) max += 8;
        return max;
    }

    // races: [{ isSprint, round }]; locksByRound: { [round]: { gpPosition?, sprintPosition? } }.
    function availablePointsRemaining(races, locksByRound, carsPerEntity) {
        carsPerEntity = carsPerEntity || 1;
        const total = races.reduce((sum, r) =>
            sum + raceMaxAvailable(!!r.isSprint, locksByRound ? locksByRound[r.round] : undefined), 0);
        return total * carsPerEntity;
    }

    function checkEliminationFromAvailable(driverPoints, leaderPoints, availableMax) {
        return driverPoints + availableMax < leaderPoints;
    }

    function titleBoundaryFromAvailable(selectedPoints, opponentPoints, availableMax) {
        const bestCase = selectedPoints + availableMax;
        return {
            eliminated: bestCase < opponentPoints,
            bestCase,
            ceiling: availableMax,
            maxOpponentAllowed: Math.max(0, bestCase - opponentPoints)
        };
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
    // implied by each unlocked side's resampled points value. Sides the user locked
    // aren't included in `finishes` - the user already set them, so they're not part
    // of "what would need to happen" in a generated scenario. A partially-locked
    // sprint weekend contributes a finish entry only for its simulated GP side.
    function simulateDetailedOutcome(races, history, rng) {
        history = history || {};
        let total = 0;
        const finishes = [];
        races.forEach(race => {
            const gpLocked = gpIsLocked(race);
            const spLocked = sprintIsLocked(race);
            const gpPts = gpLocked
                ? gpPointsFor(race.gpPosition)
                : sampleFromHistory(history.gpHistory, rng);
            let sprintPts = 0, sprintPosition = null;
            if (race.isSprint) {
                if (spLocked) {
                    sprintPts = sprintPointsFor(race.sprintPosition);
                } else {
                    sprintPts = sampleFromHistory(history.sprintHistory, rng);
                    sprintPosition = sprintPositionFromPoints(sprintPts);
                }
            }
            total += gpPts + sprintPts;
            if (!gpLocked) {
                finishes.push({
                    gpPosition: gpPositionFromPoints(gpPts),
                    sprintPosition: race.isSprint && !spLocked ? sprintPosition : null
                });
            }
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

    // ---- Stable Monte Carlo (deterministic, cell-independent draws) ----
    // runMonteCarlo above pulls every draw from one shared sequential stream, so
    // locking a race (or eliminating a driver) shifts how many draws everyone
    // processed after it consumes - two scenarios differing ONLY in round 3 also
    // end up with different sampled values for rounds 4+. The drag boards and
    // drama presets need visible probabilities to move only because the scenario
    // moved, and share links should promise the recipient the sender's exact
    // numbers. So every (driver, race, side, trial) cell here draws from its own
    // hashed seed: locking one race changes exactly that race's contribution,
    // nothing else, and the same (scenario, seed) always yields identical
    // probabilities - same for every visitor, every reload, every browser
    // (Math.imul and >>> are spec-deterministic).
    function hashUnit(a, b, c, d, e) {
        // 32-bit FNV-1a over the integer arguments, then a murmur3 fmix32
        // finalizer. The finalizer is not optional polish: with the tiny integers
        // these cells use (driver/race/side indexes), raw FNV-1a's high bit does
        // not avalanche between neighbouring cells, which showed up as correlated
        // draws across drivers (caught by the "other drivers' probabilities
        // unchanged" test - a joint cell that should occur ~5 times in 300 trials
        // occurred exactly 0 times).
        let h = 0x811c9dc5;
        h = Math.imul(h ^ a, 0x01000193);
        h = Math.imul(h ^ b, 0x01000193);
        h = Math.imul(h ^ c, 0x01000193);
        h = Math.imul(h ^ d, 0x01000193);
        if (e !== undefined) h = Math.imul(h ^ e, 0x01000193);
        h ^= h >>> 16;
        h = Math.imul(h, 0x85ebca6b);
        h ^= h >>> 13;
        h = Math.imul(h, 0xc2b2ae35);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    }

    function sampleAtUnit(history, u) {
        if (!history || !history.length) return 0;
        return history[Math.min(Math.floor(u * history.length), history.length - 1)];
    }

    // Same driver/race entry shapes and semantics as runMonteCarlo (including
    // partial locks); baseSeed picks the deterministic stream.
    function runMonteCarloStable(drivers, simulations, baseSeed) {
        const wins = {};
        drivers.forEach(d => { wins[d.id] = 0; });
        const prepped = drivers.map((d, di) => ({
            id: d.id,
            currentPoints: d.currentPoints,
            eliminated: !!d.eliminated,
            gpH: d.history ? d.history.gpHistory : null,
            spH: d.history ? d.history.sprintHistory : null,
            races: d.races.map((race, ri) => ({
                isSprint: !!race.isSprint,
                gpLocked: gpIsLocked(race),
                gpPts: gpIsLocked(race) ? gpPointsFor(race.gpPosition) : 0,
                spLocked: race.isSprint ? sprintIsLocked(race) : false,
                spPts: race.isSprint && sprintIsLocked(race) ? sprintPointsFor(race.sprintPosition) : 0,
                di, ri
            }))
        }));
        for (let t = 0; t < simulations; t++) {
            const totals = {};
            prepped.forEach(p => {
                if (p.eliminated) { totals[p.id] = p.currentPoints; return; }
                let total = p.currentPoints;
                p.races.forEach(r => {
                    total += r.gpLocked ? r.gpPts
                        : sampleAtUnit(p.gpH, hashUnit(baseSeed, r.di, r.ri, 0, t));
                    if (r.isSprint) {
                        total += r.spLocked ? r.spPts
                            : sampleAtUnit(p.spH, hashUnit(baseSeed, r.di, r.ri, 1, t));
                    }
                });
                totals[p.id] = total;
            });
            settleTrial(totals, wins);
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
        sampleFromHistory, simulateDriverRemainingPoints, runMonteCarlo, runMonteCarloStable, hashUnit,
        requiredResultGap, titleBoundary,
        raceMaxAvailable, availablePointsRemaining, checkEliminationFromAvailable, titleBoundaryFromAvailable,
        gpPositionFromPoints, sprintPositionFromPoints, simulateDetailedOutcome, findWinningScenarios
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ChampionshipCalc;
    } else {
        root.ChampionshipCalc = ChampionshipCalc;
    }
})(typeof window !== 'undefined' ? window : globalThis);
