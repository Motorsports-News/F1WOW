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

    const ChampionshipCalc = {
        GP_POINTS, SPRINT_POINTS,
        gpPointsFor, sprintPointsFor,
        maxRemainingPoints, checkElimination
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ChampionshipCalc;
    } else {
        root.ChampionshipCalc = ChampionshipCalc;
    }
})(typeof window !== 'undefined' ? window : globalThis);
