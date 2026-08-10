const { test } = require('node:test');
const assert = require('node:assert');
const { gpPointsFor, sprintPointsFor, maxRemainingPoints, checkElimination } =
    require('../../js/championship-calc-engine.js');

test('gpPointsFor returns the 2026 GP scale, 0 outside top 10', () => {
    assert.strictEqual(gpPointsFor(1), 25);
    assert.strictEqual(gpPointsFor(10), 1);
    assert.strictEqual(gpPointsFor(11), 0);
    assert.strictEqual(gpPointsFor(null), 0);
});

test('sprintPointsFor returns the 2026 sprint scale, 0 outside top 8', () => {
    assert.strictEqual(sprintPointsFor(1), 8);
    assert.strictEqual(sprintPointsFor(8), 1);
    assert.strictEqual(sprintPointsFor(9), 0);
});

test('maxRemainingPoints combines standard races (25) and sprint weekends (33)', () => {
    assert.strictEqual(maxRemainingPoints(10, 2), 10 * 25 + 2 * 33);
    assert.strictEqual(maxRemainingPoints(0, 0), 0);
});

test('checkElimination: true when even a perfect run cannot close the gap', () => {
    // trailing driver has 100 pts, leader has 400, only 1 standard race left (max 25) -> eliminated
    assert.strictEqual(checkElimination(100, 400, 1, 0), true);
});

test('checkElimination: false when the gap is still closeable', () => {
    // trailing driver 200 pts, leader 219 pts, 10 races + 2 sprints left -> not eliminated
    assert.strictEqual(checkElimination(200, 219, 10, 2), false);
});

test('maxRemainingPoints: carsPerEntity scales the ceiling for constructors', () => {
    assert.strictEqual(maxRemainingPoints(10, 2, 1), maxRemainingPoints(10, 2)); // default is 1, unchanged
    assert.strictEqual(maxRemainingPoints(10, 2, 2), maxRemainingPoints(10, 2) * 2);
});

test('checkElimination: carsPerEntity changes the verdict for the same points gap', () => {
    const trailingPoints = 0;
    const leaderPoints = 150;
    const standardRacesLeft = 5;
    const sprintWeekendsLeft = 0;
    // Driver-scale (default, 1 car): ceiling 5*25=125 < 150 gap -> eliminated
    assert.strictEqual(checkElimination(trailingPoints, leaderPoints, standardRacesLeft, sprintWeekendsLeft), true);
    // Constructor-scale (2 cars): ceiling 5*25*2=250 >= 150 gap -> not eliminated
    assert.strictEqual(checkElimination(trailingPoints, leaderPoints, standardRacesLeft, sprintWeekendsLeft, 2), false);
});

const { computePaceStats } = require('../../js/championship-calc-engine.js');

test('computePaceStats: average and spread from real per-race points', () => {
    const gpHistory = [25, 18, 25, 18, 25, 18, 25, 18, 25, 18, 25]; // alternating win/2nd, 11 races
    const sprintHistory = [8, 6, 8, 6];
    const pace = computePaceStats(gpHistory, sprintHistory);
    assert.strictEqual(pace.avgGP, gpHistory.reduce((a, b) => a + b) / gpHistory.length);
    assert.ok(pace.stdGP > 0);
    assert.strictEqual(pace.avgSprint, 7);
});

test('computePaceStats: falls back to a sane spread with too few samples', () => {
    const pace = computePaceStats([25], []);
    assert.strictEqual(pace.avgGP, 25);
    assert.strictEqual(pace.stdGP, 2); // floor applied - one sample can't produce a real stddev
    assert.strictEqual(pace.avgSprint, 0);
    assert.strictEqual(pace.stdSprint, 1);
});

const { runMonteCarlo } = require('../../js/championship-calc-engine.js');

function seededRng(seedStart) {
    // Deterministic LCG so the Monte Carlo test isn't flaky.
    let seed = seedStart;
    return function () {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };
}

test('runMonteCarlo: probabilities sum to ~1.0 across all drivers', () => {
    const drivers = [
        { id: 'a', currentPoints: 219, eliminated: false,
          history: { gpHistory: [25, 18, 25, 10, 25, 18, 25, 10, 25, 18, 25], sprintHistory: [8, 6] },
          races: Array.from({ length: 11 }, (_, i) => ({ locked: false, isSprint: i === 4 })) },
        { id: 'b', currentPoints: 169, eliminated: false,
          history: { gpHistory: [18, 15, 12, 15, 18, 10, 12, 15, 10, 12, 15], sprintHistory: [6, 4] },
          races: Array.from({ length: 11 }, (_, i) => ({ locked: false, isSprint: i === 4 })) }
    ];
    const probs = runMonteCarlo(drivers, 500, seededRng(42));
    const total = Object.values(probs).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(total - 1) < 0.01, `expected ~1.0, got ${total}`);
});

test('runMonteCarlo: a much faster driver wins the large majority of simulations', () => {
    const drivers = [
        { id: 'fast', currentPoints: 219, eliminated: false,
          history: { gpHistory: [25, 25, 25, 25, 25], sprintHistory: [8, 8] },
          races: Array.from({ length: 5 }, () => ({ locked: false, isSprint: false })) },
        { id: 'slow', currentPoints: 219, eliminated: false,
          history: { gpHistory: [2, 4, 2, 4, 2], sprintHistory: [1, 1] },
          races: Array.from({ length: 5 }, () => ({ locked: false, isSprint: false })) }
    ];
    const probs = runMonteCarlo(drivers, 500, seededRng(7));
    assert.ok(probs.fast > 0.9, `expected fast driver to dominate, got ${probs.fast}`);
});

test('runMonteCarlo: eliminated drivers never win', () => {
    const drivers = [
        { id: 'leader', currentPoints: 400, eliminated: false,
          history: { gpHistory: [10, 12, 8, 10, 12], sprintHistory: [3, 4] },
          races: [{ locked: false, isSprint: false }] },
        { id: 'out', currentPoints: 50, eliminated: true,
          history: { gpHistory: [25, 25, 25], sprintHistory: [8, 8] },
          races: [{ locked: false, isSprint: false }] }
    ];
    const probs = runMonteCarlo(drivers, 200, seededRng(1));
    assert.strictEqual(probs.out, 0);
});

const { simulateDriverRemainingPoints } = require('../../js/championship-calc-engine.js');

test('simulateDriverRemainingPoints: mix of a locked race and an unlocked race sums correctly', () => {
    // Locked race: P1 with sprint P1 -> 25 + 8 = 33 exact points, taken from gpPosition/sprintPosition
    // directly (not resampled). Unlocked race: resampled from gpHistory via the seeded rng.
    // With seededRng(3), the first rng() call is 0.5415987374920392, which against a 3-item
    // gpHistory ([10, 20, 30]) resolves to index 1 -> value 20 (verified by running
    // sampleFromHistory with the same seed independently before writing this assertion).
    const history = { gpHistory: [10, 20, 30], sprintHistory: [4, 5, 6] };
    const races = [
        { locked: true, isSprint: true, gpPosition: 1, sprintPosition: 1 },
        { locked: false, isSprint: false }
    ];
    const total = simulateDriverRemainingPoints(races, history, seededRng(3));
    assert.strictEqual(total, 53); // 33 (locked) + 20 (resampled gpHistory[1])
});

test('simulateDriverRemainingPoints: missing history does not throw and contributes 0 for unlocked races', () => {
    const races = [
        { locked: false, isSprint: false },
        { locked: true, isSprint: false, gpPosition: 3 }
    ];
    assert.doesNotThrow(() => simulateDriverRemainingPoints(races, undefined, seededRng(9)));
    const total = simulateDriverRemainingPoints(races, undefined, seededRng(9));
    assert.strictEqual(total, 15); // unlocked race contributes 0 (no history to sample from); locked P3 = 15

    // Also verify the same guard holds when the driver has no `history` field at all,
    // exercised through the public runMonteCarlo entry point.
    const drivers = [
        { id: 'x', currentPoints: 100, eliminated: false, races: [{ locked: false, isSprint: false }] }
    ];
    assert.doesNotThrow(() => runMonteCarlo(drivers, 1, seededRng(9)));
    const probs = runMonteCarlo(drivers, 1, seededRng(9));
    assert.strictEqual(probs.x, 1); // sole driver, unlocked race added 0 -> total stays at currentPoints
});

const { requiredResultGap } = require('../../js/championship-calc-engine.js');

test('requiredResultGap: computes points-per-race needed to close the gap', () => {
    const r = requiredResultGap(219, 169, 11); // leader 219, rival 169, 11 races left
    assert.strictEqual(r.gap, 50);
    assert.strictEqual(r.perRaceNeeded, Math.round((50 / 11) * 10) / 10);
});

test('requiredResultGap: returns null when there is no gap to close (rival already ahead)', () => {
    assert.strictEqual(requiredResultGap(169, 219, 11), null);
});

test('requiredResultGap: returns null when there are no races left to close the gap', () => {
    assert.strictEqual(requiredResultGap(219, 169, 0), null);
});

test('requiredResultGap: returns null for a tie (no gap to close)', () => {
    assert.strictEqual(requiredResultGap(200, 200, 5), null);
});

const { titleBoundary } = require('../../js/championship-calc-engine.js');

test('titleBoundary: trailing driver still alive - computes ceiling and max opponent allowance', () => {
    // Selected has 169, opponent (leader) has 219. 11 standard races + 1 sprint left, 1 car.
    // Ceiling = 11*25 + 1*33 = 308. Best case = 169 + 308 = 477.
    const r = titleBoundary(169, 219, 11, 1, 1);
    assert.strictEqual(r.ceiling, 308);
    assert.strictEqual(r.bestCase, 477);
    assert.strictEqual(r.eliminated, false);
    assert.strictEqual(r.maxOpponentAllowed, 477 - 219); // 258
});

test('titleBoundary: eliminated driver - maxOpponentAllowed clamps to 0, not negative', () => {
    // Selected has 50, opponent has 400, only 1 race left (ceiling 25) -> best case 75, eliminated.
    const r = titleBoundary(50, 400, 1, 0, 1);
    assert.strictEqual(r.eliminated, true);
    assert.strictEqual(r.bestCase, 75);
    assert.strictEqual(r.maxOpponentAllowed, 0);
});

test('titleBoundary: carsPerEntity scales the ceiling for constructors', () => {
    const oneCar = titleBoundary(100, 300, 5, 0, 1);
    const twoCar = titleBoundary(100, 300, 5, 0, 2);
    assert.strictEqual(oneCar.ceiling, 125);
    assert.strictEqual(twoCar.ceiling, 250);
    assert.strictEqual(oneCar.eliminated, true); // best case 225 < 300
    assert.strictEqual(twoCar.eliminated, false); // best case 350 >= 300
});

const {
    gpPositionFromPoints, sprintPositionFromPoints, simulateDetailedOutcome, findWinningScenarios
} = require('../../js/championship-calc-engine.js');

test('gpPositionFromPoints / sprintPositionFromPoints: reverse the scoring tables, null for outside points', () => {
    assert.strictEqual(gpPositionFromPoints(25), 1);
    assert.strictEqual(gpPositionFromPoints(1), 10);
    assert.strictEqual(gpPositionFromPoints(0), null);
    assert.strictEqual(sprintPositionFromPoints(8), 1);
    assert.strictEqual(sprintPositionFromPoints(1), 8);
    assert.strictEqual(sprintPositionFromPoints(0), null);
});

test('simulateDetailedOutcome: locked races count toward the total but are not in `finishes`; unlocked races report a position', () => {
    const races = [
        { locked: true, isSprint: false, gpPosition: 1 },
        { locked: false, isSprint: false }
    ];
    const history = { gpHistory: [25], sprintHistory: [] }; // single-value history - deterministic regardless of rng
    const outcome = simulateDetailedOutcome(races, history, () => 0.5);
    assert.strictEqual(outcome.total, 50); // 25 (locked P1) + 25 (resampled, only possible value)
    assert.strictEqual(outcome.finishes.length, 1); // only the unlocked race is reported
    assert.strictEqual(outcome.finishes[0].gpPosition, 1);
});

test('simulateDetailedOutcome: a zero-points draw reports gpPosition null (outside the points)', () => {
    const races = [{ locked: false, isSprint: false }];
    const history = { gpHistory: [0], sprintHistory: [] };
    const outcome = simulateDetailedOutcome(races, history, () => 0.5);
    assert.strictEqual(outcome.total, 0);
    assert.strictEqual(outcome.finishes[0].gpPosition, null);
});

test('findWinningScenarios: finds examples when selected can plausibly beat opponent', () => {
    const selected = { currentPoints: 100, history: { gpHistory: [25, 25, 25], sprintHistory: [] }, races: [{ locked: false, isSprint: false }] };
    const opponent = { currentPoints: 100, history: { gpHistory: [0, 0, 0], sprintHistory: [] }, races: [{ locked: false, isSprint: false }] };
    const examples = findWinningScenarios(selected, opponent, 3, 200, seededRng(1));
    assert.ok(examples.length > 0, 'expected to find at least one winning scenario');
    examples.forEach(ex => assert.ok(ex.selectedTotal > ex.opponentTotal));
});

test('findWinningScenarios: returns fewer than requested (not an error) when the budget is exhausted', () => {
    const selected = { currentPoints: 0, history: { gpHistory: [0], sprintHistory: [] }, races: [{ locked: false, isSprint: false }] };
    const opponent = { currentPoints: 1000, history: { gpHistory: [25], sprintHistory: [] }, races: [{ locked: false, isSprint: false }] };
    const examples = findWinningScenarios(selected, opponent, 3, 50, seededRng(2));
    assert.strictEqual(examples.length, 0); // truly impossible within this tiny budget
});
