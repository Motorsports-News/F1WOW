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
