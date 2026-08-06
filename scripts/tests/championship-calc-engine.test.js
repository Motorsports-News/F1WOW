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
