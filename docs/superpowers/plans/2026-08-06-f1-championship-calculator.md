# F1 2026 Championship Calculator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live, client-side F1 2026 Championship Calculator (drivers + constructors) with a Monte Carlo probability engine, a 12-remaining-race scenario editor, and mathematical elimination detection — as a new, currently-unlinked page that can be tested locally without touching anything already live.

**Architecture:** Three plain `<script>`-loadable JS files with no build step, matching this static site's existing convention (no bundler, no framework): a pure calculation engine (points math, elimination test, Monte Carlo — zero DOM/fetch dependencies, so it's testable with Node's built-in test runner), a data layer (fetches/shapes live season data, reusing `cachedJson()`/`fetchMergedSeasonResults()` from `script.js`), and a UI layer (renders the carousel/standings/results and owns all DOM events). The engine's core logic and the deterministic elimination test were already validated against live 2026 data in a throwaway prototype this session (`championship-calculator-prototype.html`, untracked, never linked) — this plan reimplements that logic as production-quality, tested, modular code, it does not just promote the prototype file.

**Tech Stack:** Vanilla JS (ES2017+, no modules/bundler — matches `script.js`), Node's built-in `node:test` + `node:assert` for the calculation engine's unit tests (zero new dependencies — the repo has no test framework installed and this avoids adding one), Python (matching existing `scripts/gen-*.py` generators) for the one-time page-scaffolding script, existing `styles.css` design tokens.

**Guardrail for every task below:** nothing in this plan modifies `index.html`, `articles.json`, `sitemap.xml`, any nav/footer include, or runs `npm run publish`, until the explicit, separately-gated Task 15 ("Launch Checklist") — and Task 15 itself must not be executed without the user's explicit go-ahead in a fresh confirmation, even if every prior task is complete. Every file this plan creates is new; no existing tracked file is edited except at Task 15.

---

## Chunk 1: Calculation Engine + Data Layer

The core differentiator (probability + elimination math) built first, in isolation, fully unit-tested with zero UI risk.

### Task 1: Points math + elimination test

**Files:**
- Create: `js/championship-calc-engine.js`
- Test: `scripts/tests/championship-calc-engine.test.js`

- [ ] **Step 1: Write the failing test**

Create `scripts/tests/championship-calc-engine.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tests/championship-calc-engine.test.js`
Expected: FAIL — `Cannot find module '../../js/championship-calc-engine.js'`

- [ ] **Step 3: Write minimal implementation**

Create `js/championship-calc-engine.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/tests/championship-calc-engine.test.js`
Expected: `pass 5`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/championship-calc-engine.js scripts/tests/championship-calc-engine.test.js
git commit -m "feat: add championship calculator points math and elimination test"
```

---

### Task 2: Pace statistics (mean/stddev from real season results)

**Files:**
- Modify: `js/championship-calc-engine.js`
- Test: `scripts/tests/championship-calc-engine.test.js`

- [ ] **Step 1: Write the failing test**

Append to `scripts/tests/championship-calc-engine.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tests/championship-calc-engine.test.js`
Expected: FAIL — `computePaceStats is not a function`

- [ ] **Step 3: Write minimal implementation**

In `js/championship-calc-engine.js`, add above the `ChampionshipCalc` object definition:

```js
    function mean(arr) {
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    }

    function stddev(arr, m) {
        if (arr.length < 2) return null; // not enough samples for a real stddev
        const variance = arr.reduce((a, b) => a + (b - m) * (b - m), 0) / (arr.length - 1);
        return Math.sqrt(variance);
    }

    // Floors keep the Monte Carlo engine from collapsing to zero variance on drivers
    // with very few or very consistent results - some spread is always realistic in F1.
    function computePaceStats(gpPointsHistory, sprintPointsHistory) {
        const avgGP = mean(gpPointsHistory);
        const stdGP = Math.max(stddev(gpPointsHistory, avgGP) || 0, 2);
        const avgSprint = mean(sprintPointsHistory);
        const stdSprint = Math.max(stddev(sprintPointsHistory, avgSprint) || 0, 1);
        return { avgGP, stdGP, avgSprint, stdSprint };
    }
```

Update the `ChampionshipCalc` object and its exports list to add `mean, stddev, computePaceStats,`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/tests/championship-calc-engine.test.js`
Expected: `pass 7`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/championship-calc-engine.js scripts/tests/championship-calc-engine.test.js
git commit -m "feat: add pace statistics (mean/stddev) to championship calc engine"
```

---

### Task 3: Monte Carlo simulation engine

> **AMENDED 2026-08-06, post-implementation:** the original spec below (normal-distribution sampling via `randNormal`/clamping, `pace: {avgGP, stdGP, ...}` driver fixtures) was implemented, then code review found it systematically understates high-pace leaders whose average sits close to the 25-point cap — exactly the real 2026 leader's profile. It was replaced with **empirical resampling**: each simulated race draws a random value from the driver's own real per-race points history instead of a fitted bell curve. `randNormal`/`boundedNormal` were removed as dead code; `simulateDriverRemainingPoints` and `runMonteCarlo` now take a `history: {gpHistory, sprintHistory}` object per driver instead of `pace`. See the amended design spec's Decision 3 for the full "why." **Tasks 5 and 9 below are written against the corrected `history`-based shape already** — the original `pace`-fixture code in this Task 3 section is kept only as a historical record of what was tried and superseded; do not re-implement it.

**Files:**
- Modify: `js/championship-calc-engine.js`
- Test: `scripts/tests/championship-calc-engine.test.js`

- [ ] **Step 1: Write the failing test**

Append to `scripts/tests/championship-calc-engine.test.js`:

```js
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
        { id: 'a', currentPoints: 219, eliminated: false, pace: { avgGP: 18, stdGP: 9.8, avgSprint: 5.3, stdSprint: 3 },
          races: Array.from({ length: 11 }, (_, i) => ({ locked: false, isSprint: i === 4 })) },
        { id: 'b', currentPoints: 169, eliminated: false, pace: { avgGP: 13.7, stdGP: 5.2, avgSprint: 4.5, stdSprint: 3 },
          races: Array.from({ length: 11 }, (_, i) => ({ locked: false, isSprint: i === 4 })) }
    ];
    const probs = runMonteCarlo(drivers, 500, seededRng(42));
    const total = Object.values(probs).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(total - 1) < 0.01, `expected ~1.0, got ${total}`);
});

test('runMonteCarlo: a much faster driver wins the large majority of simulations', () => {
    const drivers = [
        { id: 'fast', currentPoints: 219, eliminated: false, pace: { avgGP: 20, stdGP: 3, avgSprint: 6, stdSprint: 1 },
          races: Array.from({ length: 5 }, () => ({ locked: false, isSprint: false })) },
        { id: 'slow', currentPoints: 219, eliminated: false, pace: { avgGP: 5, stdGP: 3, avgSprint: 1, stdSprint: 1 },
          races: Array.from({ length: 5 }, () => ({ locked: false, isSprint: false })) }
    ];
    const probs = runMonteCarlo(drivers, 500, seededRng(7));
    assert.ok(probs.fast > 0.9, `expected fast driver to dominate, got ${probs.fast}`);
});

test('runMonteCarlo: eliminated drivers never win', () => {
    const drivers = [
        { id: 'leader', currentPoints: 400, eliminated: false, pace: { avgGP: 10, stdGP: 3, avgSprint: 3, stdSprint: 1 },
          races: [{ locked: false, isSprint: false }] },
        { id: 'out', currentPoints: 50, eliminated: true, pace: { avgGP: 25, stdGP: 0.1, avgSprint: 8, stdSprint: 0.1 },
          races: [{ locked: false, isSprint: false }] }
    ];
    const probs = runMonteCarlo(drivers, 200, seededRng(1));
    assert.strictEqual(probs.out, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tests/championship-calc-engine.test.js`
Expected: FAIL — `runMonteCarlo is not a function`

- [ ] **Step 3: Write minimal implementation**

In `js/championship-calc-engine.js`, add:

```js
    function randNormal(m, s, rng) {
        rng = rng || Math.random;
        let u = 0, v = 0;
        while (u === 0) u = rng();
        while (v === 0) v = rng();
        const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        return m + z * s;
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
                total += Math.max(0, Math.min(25, randNormal(pace.avgGP, pace.stdGP, rng)));
                if (race.isSprint) total += Math.max(0, Math.min(8, randNormal(pace.avgSprint, pace.stdSprint, rng)));
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
            const maxTotal = Math.max(...Object.values(totals));
            const topIds = Object.keys(totals).filter(id => totals[id] === maxTotal);
            topIds.forEach(id => { wins[id] += 1 / topIds.length; });
        }
        const probabilities = {};
        drivers.forEach(d => { probabilities[d.id] = wins[d.id] / simulations; });
        return probabilities;
    }
```

Update the `ChampionshipCalc` exports to add `randNormal, simulateDriverRemainingPoints, runMonteCarlo,`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/tests/championship-calc-engine.test.js`
Expected: `pass 10`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/championship-calc-engine.js scripts/tests/championship-calc-engine.test.js
git commit -m "feat: add Monte Carlo simulation engine to championship calc"
```

---

### Task 4: Required-result line generator

**Files:**
- Modify: `js/championship-calc-engine.js`
- Test: `scripts/tests/championship-calc-engine.test.js`

- [ ] **Step 1: Write the failing test**

Append to `scripts/tests/championship-calc-engine.test.js`:

```js
const { requiredResultGap } = require('../../js/championship-calc-engine.js');

test('requiredResultGap: computes points-per-race needed to close the gap', () => {
    const r = requiredResultGap(219, 169, 11); // leader 219, rival 169, 11 races left
    assert.strictEqual(r.gap, 50);
    assert.strictEqual(r.perRaceNeeded, Math.round((50 / 11) * 10) / 10);
});

test('requiredResultGap: returns null when there is no gap to close (rival already ahead)', () => {
    assert.strictEqual(requiredResultGap(169, 219, 11), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tests/championship-calc-engine.test.js`
Expected: FAIL — `requiredResultGap is not a function`

- [ ] **Step 3: Write minimal implementation**

In `js/championship-calc-engine.js`, add:

```js
    // Plain-English "how far behind, and by how much per race" framing - the v1
    // required-results output. (A full combinatorial "guaranteed clinch" search is
    // a v1.x feature, deliberately out of scope here - see design spec.)
    function requiredResultGap(leaderPoints, rivalPoints, racesLeftCount) {
        const gap = leaderPoints - rivalPoints;
        if (gap <= 0) return null;
        const perRaceNeeded = racesLeftCount > 0 ? Math.round((gap / racesLeftCount) * 10) / 10 : gap;
        return { gap, perRaceNeeded, racesLeftCount };
    }
```

Update the `ChampionshipCalc` exports to add `requiredResultGap`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/tests/championship-calc-engine.test.js`
Expected: `pass 12`, `fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/championship-calc-engine.js scripts/tests/championship-calc-engine.test.js
git commit -m "feat: add required-result gap generator to championship calc engine"
```

---

### Task 5: Data layer (live standings, schedule, results, pace inputs)

**Files:**
- Create: `js/championship-calc-data.js`
- Create: `scripts/verify-championship-api-assumptions.js` (one-off Node smoke check, not a permanent test — the API-shape assumptions this depends on are worth re-verifying if anything ever looks wrong, so keep the script but it isn't run automatically)

This file is browser-only (depends on `cachedJson`, `API_BASE`, `CURRENT_YEAR`, `fetchMergedSeasonResults` from `script.js`, and `fetch`/`localStorage`), so it is **not** covered by the Node unit tests in Task 1-4 — that's a deliberate, existing-convention choice (this codebase has no DOM/fetch mocking library installed, and the project's established pattern for this kind of code is manual browser verification, e.g. `python server.py` + browser console, exactly as documented in `CLAUDE.md`). Step 2 below is a one-time script to confirm the live API still matches the shape this code assumes — run it now, not as a CI/regression gate.

- [ ] **Step 1: Write the data layer**

Create `js/championship-calc-data.js`:

```js
// Fetches and shapes live 2026 season data for the championship calculator.
// Depends on globals from script.js: cachedJson, API_BASE, CURRENT_YEAR, fetchMergedSeasonResults.
// Browser-only - not required() by the Node engine tests (see Task 5 notes in the plan).

async function loadChampionshipCalcData(topN) {
    topN = topN || 12;

    const standingsData = await cachedJson(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`);
    const list = standingsData.MRData.StandingsTable.StandingsLists[0];
    const standings = list.DriverStandings.slice(0, topN);
    const completedRound = parseInt(list.round);

    const scheduleData = await cachedJson(`${API_BASE}/${CURRENT_YEAR}.json?limit=30`);
    const schedule = scheduleData.MRData.RaceTable.Races;

    const mergedResults = await fetchMergedSeasonResults();

    const sprintData = await cachedJson(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`);
    const sprintResults = sprintData.MRData.RaceTable.Races;

    const remainingRaces = schedule
        .filter(r => parseInt(r.round) > completedRound)
        .map(r => ({ round: parseInt(r.round), name: r.raceName, date: r.date, isSprint: !!r.Sprint }));

    const drivers = standings.map(s => {
        const id = s.Driver.driverId;
        const gpHistory = mergedResults
            .map(r => {
                const res = r.Results.find(x => x.Driver.driverId === id);
                return res ? parseFloat(res.points) : null;
            })
            .filter(v => v !== null);
        const sprintHistory = sprintResults.map(r => {
            const res = r.SprintResults.find(x => x.Driver.driverId === id);
            return res ? parseFloat(res.points) : 0;
        });
        return {
            id,
            code: s.Driver.code,
            team: s.Constructors[0].name,
            currentPoints: parseFloat(s.points),
            pace: ChampionshipCalc.computePaceStats(gpHistory, sprintHistory), // display only (see Task 3 amendment)
            history: { gpHistory, sprintHistory } // used by the simulation engine
        };
    });

    return { drivers, remainingRaces, completedRound };
}
```

- [ ] **Step 2: Verify the live API still matches these assumptions**

Create `scripts/verify-championship-api-assumptions.js`:

```js
// One-off check that the Jolpica API still matches what championship-calc-data.js
// assumes. Not an automated test - run manually if the calculator ever looks wrong.
const API_BASE = 'https://api.jolpi.ca/ergast/f1';
const CURRENT_YEAR = 2026;

async function main() {
    const standingsRes = await fetch(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`);
    const standingsData = await standingsRes.json();
    const list = standingsData.MRData.StandingsTable.StandingsLists[0];
    console.log('Completed round:', list.round, '- top driver:', list.DriverStandings[0].Driver.code);

    const scheduleRes = await fetch(`${API_BASE}/${CURRENT_YEAR}.json?limit=30`);
    const scheduleData = await scheduleRes.json();
    const schedule = scheduleData.MRData.RaceTable.Races;
    console.log('Schedule length:', schedule.length, '(expect 23 for the full 2026 season)');
    console.log('Sprint rounds on the calendar:', schedule.filter(r => r.Sprint).map(r => r.round).join(','));

    const sprintRes = await fetch(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`);
    const sprintData = await sprintRes.json();
    console.log('Sprint results so far:', sprintData.MRData.RaceTable.Races.length, 'rounds');

    console.log('\nIf all of the above look sane, championship-calc-data.js\'s assumptions still hold.');
}

main().catch(e => { console.error('API ASSUMPTION CHECK FAILED:', e); process.exit(1); });
```

Run: `node scripts/verify-championship-api-assumptions.js`
Expected: prints the current round, 23 scheduled races, the known sprint rounds, and no errors.

- [ ] **Step 3: Manual browser verification**

Run: `python server.py` (if not already running), then open a page that loads `script.js` and `js/championship-calc-data.js` (the Task 6 page shell will do this — for now, verify via the browser console on any existing page after adding a temporary `<script src="js/championship-calc-data.js">` tag, or wait and fold this check into Task 10's checklist). In the browser console:

```js
loadChampionshipCalcData(10).then(console.log)
```

Expected: an object with `drivers` (10 entries, each with `id`, `code`, `team`, `currentPoints`, `pace.avgGP` roughly matching real season form), `remainingRaces` (12 entries starting at the round after the last completed one), `completedRound` (11).

- [ ] **Step 4: Commit**

```bash
git add js/championship-calc-data.js scripts/verify-championship-api-assumptions.js
git commit -m "feat: add live data layer for championship calculator"
```

---

## Chunk 2: Drivers Scenario UI

Builds the real page — unlinked from nav/homepage, `noindex`, local-only — wiring the Chunk 1 engine to a race-by-race carousel.

### Task 6: Page shell (unlinked, noindex)

**Files:**
- Create: `scripts/gen-championship-calculator-page.py`
- Create (by running the script above): `championship-calculator.html`

Follow this repo's established pattern for scaffolding a new full page (see `scripts/gen-silly-season.py`, `scripts/gen-points-system.py`): copy header/nav/footer boilerplate from an existing hub-style page (`race-hub.html` is the right base — it's a non-article utility page with the same nav/footer shell, not an article template) and replace the body.

- [ ] **Step 1: Write the generator script**

Create `scripts/gen-championship-calculator-page.py`:

> **AMENDED post-implementation:** the original tail-extraction below (`tail = base[tail_start:]` to end-of-file) had a real bug — it captured `race-hub.html`'s own page-specific inline `<script>...initHub()...</script>` block (targets `#hubRound`/`#hubSessions`/etc, which don't exist on the new page), throwing console errors on every load. Fixed to slice only `</main>` through the end of the shared `script.js` tag, then append `</body></html>` explicitly. The code block below already reflects the corrected version.

```python
# Scaffold the championship calculator page shell.
# NOINDEX + not linked from anywhere yet - only Task 15 (explicitly gated) removes
# the noindex tag and wires this into nav/sitemap/articles.json.
#
# DO NOT RE-RUN this script after Task 7 - unlike other scripts/gen-*.py generators
# (which target a finished article that's never touched again), championship-calculator.html
# gets extensive hand-written UI/CSS/JS added directly to it in every task after this one.
# Re-running this would silently overwrite all of that back to the bare Task 6 shell.
import re

base = open('race-hub.html', encoding='utf-8').read()
SLUG = 'championship-calculator.html'

head = base[:base.find('<main')]

# Tail = shared footer + shared script.js loader only.
# race-hub.html's own page-specific inline <script>...initHub()...</script>
# block (targets #hubRound/#hubSessions/etc, which don't exist on this page)
# must be excluded, or it throws console errors on every load.
main_end = base.find('</main>') + len('</main>')
script_tag_start = base.find('<script src="script.js')
script_tag_end = base.find('</script>', script_tag_start) + len('</script>')
tail = base[main_end:script_tag_end] + '\n</body>\n</html>\n'

TITLE = 'F1 2026 Championship Calculator (Prototype)'
head = re.sub(r'<title>[^<]*</title>', f'<title>{TITLE}</title>', head)
head = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>Internal build in progress.', head)
# Hard-block indexing until Task 15 explicitly removes this.
head = head.replace('</head>', '    <meta name="robots" content="noindex, nofollow">\n</head>', 1)

body = '''    <main class="main" id="main">
        <div class="proto-wrap" style="max-width:980px;margin:0 auto;padding:30px 20px 60px;">
            <h1 style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:2rem;margin-bottom:6px;">F1 2026 Championship Calculator</h1>
            <p style="color:var(--text-muted);margin-bottom:30px;">Live standings, a 12-race scenario editor, and a Monte Carlo win-probability model for the rest of the 2026 season.</p>

            <div id="calcLoading" style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">Loading live standings and season data&hellip;</div>

            <div id="calcApp" style="display:none;">
                <section class="proto-section" id="calcStandingsSection"></section>
                <section class="proto-section" id="calcCarouselSection"></section>
                <section class="proto-section" id="calcResultsSection" style="display:none;"></section>
            </div>
        </div>
    </main>
'''

out = head + body + tail
open(SLUG, 'w', encoding='utf-8').write(out)
print('written', SLUG)
```

- [ ] **Step 2: Run it**

Run: `python scripts/gen-championship-calculator-page.py`
Expected: `written championship-calculator.html`

- [ ] **Step 3: Verify it's not indexable and not linked anywhere**

Run:
```bash
grep -c "noindex" championship-calculator.html
grep -rl "championship-calculator.html" *.html articles.json sitemap.xml 2>/dev/null
```
Expected: first command prints `1`; second command prints nothing (no other file references it yet).

- [ ] **Step 4: Commit**

```bash
git add scripts/gen-championship-calculator-page.py championship-calculator.html
git commit -m "feat: scaffold championship calculator page shell (unlinked, noindex)"
```

---

### Task 7: Standings render + CSS

**Files:**
- Modify: `championship-calculator.html`

- [ ] **Step 1: Add the calculator-specific CSS**

In `championship-calculator.html`, before `</head>`, add:

```html
<style>
    .proto-section { background: var(--f1-dark); border: 1px solid var(--border-color); border-radius: 12px; padding: 22px; margin-bottom: 24px; }
    .proto-section h2 { font-family: 'Barlow Condensed', sans-serif; font-size: 1.3rem; margin-bottom: 14px; }
    .calc-carousel-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .calc-carousel-nav button { background: rgba(255,255,255,0.08); border: 1px solid var(--border-color); color: #fff; border-radius: 6px; padding: 6px 14px; cursor: pointer; font-size: 1.1rem; }
    .calc-carousel-nav button:disabled { opacity: 0.3; cursor: default; }
    .calc-race-label { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.05rem; }
    .calc-race-dots { display: flex; gap: 6px; justify-content: center; margin-top: 14px; flex-wrap: wrap; }
    .calc-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.15); cursor: pointer; border: none; }
    .calc-dot.locked { background: var(--f1-red); }
    .calc-dot.current { outline: 2px solid #fff; }
    .scenario-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    .scenario-table th, .scenario-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid var(--border-color); }
    .scenario-table select { background: rgba(255,255,255,0.06); color: #fff; border: 1px solid var(--border-color); border-radius: 6px; padding: 6px 8px; font-family: 'Chakra Petch', sans-serif; }
    .result-row { display: flex; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
    .result-row:last-child { border-bottom: none; }
    .result-driver { flex: 0 0 150px; font-weight: 700; }
    .result-bar-wrap { flex: 1; background: rgba(255,255,255,0.08); border-radius: 6px; height: 22px; overflow: hidden; }
    .result-bar { height: 100%; background: linear-gradient(90deg, var(--f1-red), #b80500); transition: width 0.4s ease; }
    .result-pct { flex: 0 0 60px; text-align: right; font-weight: 800; font-variant-numeric: tabular-nums; }
    .badge { font-size: 0.72rem; padding: 3px 8px; border-radius: 5px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.03em; }
    .badge-alive { background: rgba(0,200,80,0.15); color: #3ddc84; }
    .badge-out { background: rgba(200,0,0,0.15); color: #ff6b6b; }
    .badge-champ { background: rgba(255,193,7,0.15); color: #ffc107; }
    .required-line { font-size: 1rem; line-height: 1.7; padding: 16px; background: rgba(255,255,255,0.04); border-radius: 8px; margin-top: 10px; }
</style>
```

- [ ] **Step 2: Add the standings-render JS module**

Create `js/championship-calc-ui.js`, starting with just the standings piece:

```js
// UI layer for the championship calculator - owns all DOM rendering and events.
// Depends on: ChampionshipCalc (championship-calc-engine.js), loadChampionshipCalcData
// (championship-calc-data.js), sanitizeHTML (script.js).

let calcState = null; // set by initChampionshipCalculator()

function renderStandings(drivers) {
    const leaderPoints = drivers[0].currentPoints;
    const rows = drivers.map(d => `
        <tr class="standings-row">
            <td>${sanitizeHTML(d.code)}</td>
            <td>${sanitizeHTML(d.team)}</td>
            <td>${d.currentPoints}</td>
            <td>${d.currentPoints === leaderPoints ? '—' : '-' + (leaderPoints - d.currentPoints)}</td>
        </tr>`).join('');

    document.getElementById('calcStandingsSection').innerHTML = `
        <h2>Current Standings</h2>
        <div class="standings-container">
            <table class="standings-table" aria-label="Current driver standings">
                <thead><tr><th>Driver</th><th>Team</th><th>Points</th><th>Gap to Leader</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

async function initChampionshipCalculator() {
    try {
        const data = await loadChampionshipCalcData(12);
        calcState = { ...data, scenario: {} }; // scenario[driverId][round] = { gpPosition, sprintPosition }
        document.getElementById('calcLoading').style.display = 'none';
        document.getElementById('calcApp').style.display = 'block';
        renderStandings(calcState.drivers);
    } catch (err) {
        document.getElementById('calcLoading').textContent = 'Failed to load live data: ' + err.message;
    }
}

document.addEventListener('DOMContentLoaded', initChampionshipCalculator);
```

- [ ] **Step 3: Wire the new scripts into the page**

In `championship-calculator.html`, immediately before `<script src="script.js...">`, add:

```html
    <script src="js/championship-calc-engine.js"></script>
    <script src="js/championship-calc-data.js"></script>
```

And after the `script.js` tag, add:

```html
    <script src="js/championship-calc-ui.js"></script>
```

- [ ] **Step 4: Manual verification**

Run: `python server.py` (kill any existing instance on port 8000 first — see `CLAUDE.md`), open `http://localhost:8000/championship-calculator.html`.
Expected: loading message briefly appears, then a standings table renders with real current points (top 12 drivers) and a correct gap-to-leader column.

- [ ] **Step 5: Commit**

```bash
git add championship-calculator.html js/championship-calc-ui.js
git commit -m "feat: render live standings on championship calculator page"
```

---

### Task 8: Race-by-race carousel scenario editor

**Files:**
- Modify: `js/championship-calc-ui.js`

- [ ] **Step 1: Add carousel state and render function**

In `js/championship-calc-ui.js`, add:

```js
let calcCurrentRaceIndex = 0;

function ordinalLabel(p) {
    return p === 1 ? '1st' : p === 2 ? '2nd' : p === 3 ? '3rd' : p + 'th';
}

function positionOptions(max) {
    let opts = '<option value="">— (outside points)</option>';
    for (let p = 1; p <= max; p++) opts += `<option value="${p}">${ordinalLabel(p)}</option>`;
    return opts;
}

function renderCarousel() {
    const race = calcState.remainingRaces[calcCurrentRaceIndex];
    const total = calcState.remainingRaces.length;

    const rows = calcState.drivers.map(d => {
        const locked = calcState.scenario[d.id]?.[race.round];
        const gpVal = locked?.gpPosition || '';
        const sprintVal = locked?.sprintPosition || '';
        return `
        <tr>
            <td>${sanitizeHTML(d.code)}</td>
            <td><select data-driver="${d.id}" data-kind="gp">${positionOptions(10)}</select></td>
            <td ${race.isSprint ? '' : 'style="display:none;"'}><select data-driver="${d.id}" data-kind="sprint">${positionOptions(8)}</select></td>
        </tr>`;
    }).join('');

    const dots = calcState.remainingRaces.map((r, i) => {
        const hasAnyLock = calcState.drivers.some(d => calcState.scenario[d.id]?.[r.round]);
        return `<button class="calc-dot ${hasAnyLock ? 'locked' : ''} ${i === calcCurrentRaceIndex ? 'current' : ''}" data-index="${i}" title="Round ${r.round}: ${sanitizeHTML(r.name)}"></button>`;
    }).join('');

    document.getElementById('calcCarouselSection').innerHTML = `
        <h2>Set Race Results</h2>
        <div class="calc-carousel-nav">
            <button id="calcPrevRace" ${calcCurrentRaceIndex === 0 ? 'disabled' : ''}>&lsaquo; Prev</button>
            <span class="calc-race-label">Round ${race.round} — ${sanitizeHTML(race.name)}${race.isSprint ? ' (Sprint)' : ''}</span>
            <button id="calcNextRace" ${calcCurrentRaceIndex === total - 1 ? 'disabled' : ''}>Next &rsaquo;</button>
        </div>
        <table class="scenario-table">
            <thead><tr><th>Driver</th><th>GP Finish</th><th ${race.isSprint ? '' : 'style="display:none;"'}>Sprint Finish</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <div class="calc-race-dots">${dots}</div>`;

    // restore selected values now that the DOM elements exist
    calcState.drivers.forEach(d => {
        const locked = calcState.scenario[d.id]?.[race.round];
        if (!locked) return;
        const gpSel = document.querySelector(`select[data-driver="${d.id}"][data-kind="gp"]`);
        if (gpSel && locked.gpPosition) gpSel.value = String(locked.gpPosition);
        const sprintSel = document.querySelector(`select[data-driver="${d.id}"][data-kind="sprint"]`);
        if (sprintSel && locked.sprintPosition) sprintSel.value = String(locked.sprintPosition);
    });

    document.getElementById('calcPrevRace').onclick = () => { calcCurrentRaceIndex--; renderCarousel(); };
    document.getElementById('calcNextRace').onclick = () => { calcCurrentRaceIndex++; renderCarousel(); };
    document.querySelectorAll('.calc-dot').forEach(dot => {
        dot.onclick = () => { calcCurrentRaceIndex = parseInt(dot.dataset.index); renderCarousel(); };
    });
    document.querySelectorAll('.scenario-table select').forEach(sel => {
        sel.onchange = () => { onScenarioChange(race, sel); };
    });
}

function onScenarioChange(race, changedSelect) {
    const driverId = changedSelect.dataset.driver;
    const gpSel = document.querySelector(`select[data-driver="${driverId}"][data-kind="gp"]`);
    const sprintSel = document.querySelector(`select[data-driver="${driverId}"][data-kind="sprint"]`);
    const gpPosition = gpSel.value ? parseInt(gpSel.value) : null;
    const sprintPosition = (race.isSprint && sprintSel && sprintSel.value) ? parseInt(sprintSel.value) : null;

    if (!calcState.scenario[driverId]) calcState.scenario[driverId] = {};
    if (gpPosition === null && sprintPosition === null) {
        delete calcState.scenario[driverId][race.round];
    } else {
        calcState.scenario[driverId][race.round] = { gpPosition, sprintPosition };
    }
    renderCarousel(); // refresh dot-lock indicators
    recomputeResults();
}
```

Update `initChampionshipCalculator()` to call `renderCarousel();` after `renderStandings(...)`, and add a no-op `function recomputeResults() { /* Task 9 fills this in */ }` stub so the file loads without errors.

- [ ] **Step 2: Manual verification**

Refresh `http://localhost:8000/championship-calculator.html`.
Expected: a "Set Race Results" section appears below standings, showing Round 12 (Dutch GP) with a visible Sprint column (it's a sprint weekend). Clicking "Next" advances to Round 13 (Italian GP) and hides the sprint column. Setting a GP finish for a driver turns that race's dot red; navigating away and back preserves the selection.

- [ ] **Step 3: Commit**

```bash
git add js/championship-calc-ui.js
git commit -m "feat: add race-by-race scenario carousel to championship calculator"
```

---

### Task 9: Wire the engine — probability results + required-result line

**Files:**
- Modify: `js/championship-calc-ui.js`

- [ ] **Step 1: Implement `recomputeResults()`**

Replace the stub from Task 8 with:

```js
function recomputeResults() {
    const drivers = calcState.drivers;
    const remaining = calcState.remainingRaces;

    // Points after applying every locked race for every driver.
    const pointsNow = {};
    drivers.forEach(d => {
        let pts = d.currentPoints;
        remaining.forEach(r => {
            const locked = calcState.scenario[d.id]?.[r.round];
            if (!locked) return;
            pts += ChampionshipCalc.gpPointsFor(locked.gpPosition);
            if (r.isSprint) pts += ChampionshipCalc.sprintPointsFor(locked.sprintPosition);
        });
        pointsNow[d.id] = pts;
    });

    const leaderId = drivers.reduce((a, b) => (pointsNow[a.id] >= pointsNow[b.id] ? a : b)).id;
    const leaderPoints = pointsNow[leaderId];

    // Elimination uses only *unlocked* remaining races as the "still available" pool -
    // a locked race is already spent and contributes no further max-possible points.
    const unlockedStandard = id => remaining.filter(r => !r.isSprint && !calcState.scenario[id]?.[r.round]).length;
    const unlockedSprint = id => remaining.filter(r => r.isSprint && !calcState.scenario[id]?.[r.round]).length;

    const eliminated = {};
    drivers.forEach(d => {
        if (d.id === leaderId) { eliminated[d.id] = false; return; }
        eliminated[d.id] = ChampionshipCalc.checkElimination(
            pointsNow[d.id], leaderPoints, unlockedStandard(d.id), unlockedSprint(d.id)
        );
    });
    const isChampion = leaderId && drivers.every(d => d.id === leaderId || eliminated[d.id]);

    // Monte Carlo only needs to simulate each driver's *unlocked* remaining races.
    const simDrivers = drivers.map(d => ({
        id: d.id,
        currentPoints: pointsNow[d.id],
        eliminated: eliminated[d.id],
        history: d.history,
        races: remaining.map(r => {
            const locked = calcState.scenario[d.id]?.[r.round];
            return locked
                ? { locked: true, isSprint: r.isSprint, gpPosition: locked.gpPosition, sprintPosition: locked.sprintPosition }
                : { locked: false, isSprint: r.isSprint };
        })
    }));
    const probabilities = ChampionshipCalc.runMonteCarlo(simDrivers, 3000);

    renderResults(drivers, pointsNow, eliminated, isChampion, probabilities, leaderId);
}

function renderResults(drivers, pointsNow, eliminated, isChampion, probabilities, leaderId) {
    const section = document.getElementById('calcResultsSection');
    section.style.display = 'block';

    const sorted = [...drivers].sort((a, b) => probabilities[b.id] - probabilities[a.id]);
    const rows = sorted.map(d => {
        const pct = (probabilities[d.id] * 100).toFixed(1);
        const badge = d.id === leaderId && isChampion ? '<span class="badge badge-champ">Champion</span>'
            : eliminated[d.id] ? '<span class="badge badge-out">Eliminated</span>'
            : '<span class="badge badge-alive">Alive</span>';
        return `
        <div class="result-row">
            <div class="result-driver">${sanitizeHTML(d.code)} ${badge}</div>
            <div class="result-bar-wrap"><div class="result-bar" style="width:${pct}%"></div></div>
            <div class="result-pct">${pct}%</div>
        </div>`;
    }).join('');

    const leader = sorted[0];
    const rival = sorted[1];
    const remainingRaceCount = calcState.remainingRaces.filter(r =>
        !calcState.scenario[rival.id]?.[r.round]).length;
    const gapInfo = ChampionshipCalc.requiredResultGap(pointsNow[leader.id], pointsNow[rival.id], remainingRaceCount);

    const requiredLine = isChampion
        ? `<strong>${sanitizeHTML(leader.code)} is mathematically champion</strong> under this scenario.`
        : gapInfo
            ? `To close the gap, <strong>${sanitizeHTML(rival.code)}</strong> needs to outscore <strong>${sanitizeHTML(leader.code)}</strong> by an average of <strong>${gapInfo.perRaceNeeded} points per race</strong> across the ${gapInfo.racesLeftCount} rounds still open (currently ${gapInfo.gap} points behind).`
            : '';

    section.innerHTML = `
        <h2>Championship Win Probability</h2>
        <div>${rows}</div>
        <div class="required-line">${requiredLine}</div>
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin-top:10px;">
            Model: each driver's unlocked remaining races are resampled from their own actual 2026 race-by-race results this season. First-pass estimate, not an official probability.
        </p>`;
}
```

- [ ] **Step 2: Trigger an initial computation on load**

In `initChampionshipCalculator()`, after `renderCarousel();`, add `recomputeResults();` so the page shows the "everything blank" baseline probability immediately, before any editing.

- [ ] **Step 3: Manual verification**

Refresh the page.
Expected: a "Championship Win Probability" section appears showing all 12 drivers with probability bars summing to ~100%, the actual leader shown as favorite, and a required-result sentence for the #2 driver by probability. Set the leader to finish P10 across a few upcoming races and confirm their probability visibly drops and, eventually, their elimination badge can flip to "Eliminated" if pushed far enough (test by setting several bad results in a row).

- [ ] **Step 4: Commit**

```bash
git add js/championship-calc-ui.js
git commit -m "feat: wire Monte Carlo engine to championship calculator UI"
```

---

### Task 10: Full manual verification checklist (drivers mode)

**Known, deliberately-deferred item from Task 8's code review:** `renderCarousel()` fully re-renders its `<tbody>`/dots/nav on every single edit (including the `<select>` that triggered the change), so keyboard focus is lost after each field a user fills in. Not a blocker for an internal `noindex` prototype, but worth a conscious decision (fix it, or explicitly accept it) before Task 15 launch — this checklist is the right place to surface that decision, not to silently forget it.

**Files:** none — verification only.

- [ ] Run `python server.py`, confirm no duplicate instance is already bound to port 8000 (`CLAUDE.md` — kill duplicates first).
- [ ] Open `http://localhost:8000/championship-calculator.html`.
- [ ] Confirm the page is not reachable from any nav link, the homepage, or search (view-source and confirm `<meta name="robots" content="noindex, nofollow">` is present).
- [ ] Confirm standings match the live values also shown on `http://localhost:8000/championship.html` (cross-check against the site's existing standings page).
- [ ] Step through all 12 remaining races via Next/Prev and via clicking dots directly; confirm the sprint column only appears on the two sprint rounds (Zandvoort, Singapore).
- [ ] Lock in a scenario where the current leader finishes last in every remaining race; confirm their elimination badge eventually flips to "Eliminated" and another driver becomes "Champion" once every rival is mathematically shut out.
- [ ] Reload the page (no persistence yet — expected to reset; URL-state persistence is Task 13).
- [ ] Run `node --test scripts/tests/championship-calc-engine.test.js` one more time to confirm nothing in Chunk 2 broke the Chunk 1 engine (it shouldn't have touched that file).
- [ ] Confirm `git status` shows no modifications to `index.html`, `articles.json`, `sitemap.xml`, `styles.css`, or `script.js` — only new files created in Chunks 1-2.

---

## Chunk 3: Constructors' Mode

### Task 11: Constructor data aggregation

**Files:**
- Modify: `js/championship-calc-data.js`
- Test: manual (same rationale as Task 5 — browser/fetch-dependent)

- [ ] **Step 1: Add constructor standings + pace to the data layer**

In `js/championship-calc-data.js`, add a second exported function:

```js
async function loadConstructorCalcData(topN) {
    topN = topN || 8;

    const standingsData = await cachedJson(`${API_BASE}/${CURRENT_YEAR}/constructorstandings.json`);
    const list = standingsData.MRData.StandingsTable.StandingsLists[0];
    const standings = list.ConstructorStandings.slice(0, topN);

    const scheduleData = await cachedJson(`${API_BASE}/${CURRENT_YEAR}.json?limit=30`);
    const schedule = scheduleData.MRData.RaceTable.Races;
    const completedRound = parseInt(list.round);
    const remainingRaces = schedule
        .filter(r => parseInt(r.round) > completedRound)
        .map(r => ({ round: parseInt(r.round), name: r.raceName, date: r.date, isSprint: !!r.Sprint }));

    const mergedResults = await fetchMergedSeasonResults();
    const sprintData = await cachedJson(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`);
    const sprintResults = sprintData.MRData.RaceTable.Races;

    const constructors = standings.map(s => {
        const id = s.Constructor.constructorId;
        // Combine both cars' points per round - this is the one real difference from
        // the drivers' engine: a team's pace/variance reflects BOTH drivers together.
        const gpHistory = mergedResults.map(r => {
            const teamResults = r.Results.filter(x => x.Constructor.constructorId === id);
            return teamResults.length ? teamResults.reduce((sum, x) => sum + parseFloat(x.points), 0) : null;
        }).filter(v => v !== null);
        // Same null-exclusion pattern as gpHistory (and as the Task 5 fix for drivers'
        // sprintHistory) - a round with no entries for this team is excluded rather than
        // defaulted to 0, so a future mid-season team change can't inject a spurious 0.
        const sprintHistory = sprintResults.map(r => {
            const teamResults = r.SprintResults.filter(x => x.Constructor.constructorId === id);
            return teamResults.length ? teamResults.reduce((sum, x) => sum + parseFloat(x.points), 0) : null;
        }).filter(v => v !== null);
        return {
            id,
            code: s.Constructor.name,
            team: s.Constructor.name,
            currentPoints: parseFloat(s.points),
            pace: ChampionshipCalc.computePaceStats(gpHistory, sprintHistory), // display only (see Task 3 amendment)
            history: { gpHistory, sprintHistory } // used by the simulation engine
        };
    });

    return { drivers: constructors, remainingRaces, completedRound };
}
```

Note the returned shape is deliberately identical to `loadChampionshipCalcData()` (`drivers`/`remainingRaces`/`completedRound`, with `drivers` here holding constructor entries) — this is what lets the UI layer reuse every rendering function unchanged in Task 12.

Update the file's module export guard (if one exists from Task 5) to also export `loadConstructorCalcData`.

- [ ] **Step 2: Manual verification**

In the browser console on the calculator page:
```js
loadConstructorCalcData(8).then(console.log)
```
Expected: 8 constructors, points matching `http://localhost:8000/championship.html`'s constructor table, `pace.avgGP` roughly double a single driver's average (two cars scoring).

- [ ] **Step 3: Commit**

```bash
git add js/championship-calc-data.js
git commit -m "feat: add constructor data aggregation to championship calc data layer"
```

---

### Task 12: Constructors tab (reusing the drivers UI components)

**Files:**
- Modify: `championship-calculator.html`
- Modify: `js/championship-calc-ui.js`

- [ ] **Step 1: Add a mode tab to the page shell**

In `championship-calculator.html`, inside the `<main>` body created in Task 6, add a tab control just above `#calcStandingsSection`:

```html
<div class="calc-mode-tabs" style="display:flex;gap:10px;margin-bottom:20px;">
    <button id="calcTabDrivers" class="run-btn" style="opacity:1;">Drivers</button>
    <button id="calcTabConstructors" class="run-btn" style="opacity:0.5;">Constructors</button>
</div>
```

Add matching CSS for `.run-btn` next to the other calculator styles from Task 7 (reuse the same red-button style already established in `f1-2026-points-system-explained.html`'s `.run-btn`/`pc-chip` pattern for visual consistency):

```css
.run-btn { background: var(--f1-red); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; cursor: pointer; }
```

- [ ] **Step 2: Generalize the UI state to support either mode**

In `js/championship-calc-ui.js`, since every render function already reads from `calcState.drivers`/`calcState.remainingRaces`/`calcState.scenario` generically (constructors and drivers share that exact shape from Task 11's note), the only new code needed is mode-switching:

```js
let calcMode = 'drivers';

async function switchCalcMode(mode) {
    calcMode = mode;
    document.getElementById('calcTabDrivers').style.opacity = mode === 'drivers' ? '1' : '0.5';
    document.getElementById('calcTabConstructors').style.opacity = mode === 'constructors' ? '1' : '0.5';

    const data = mode === 'drivers' ? await loadChampionshipCalcData(12) : await loadConstructorCalcData(8);
    calcState = { ...data, scenario: {} };
    calcCurrentRaceIndex = 0;
    renderStandings(calcState.drivers);
    renderCarousel();
    recomputeResults();
}
```

Update `initChampionshipCalculator()` to call `switchCalcMode('drivers')` instead of the old inline load+render sequence, and wire the tab buttons:

```js
document.getElementById('calcTabDrivers').onclick = () => switchCalcMode('drivers');
document.getElementById('calcTabConstructors').onclick = () => switchCalcMode('constructors');
```

- [ ] **Step 3: Manual verification**

Refresh the page. Click "Constructors" — confirm the standings table, carousel, and probability results all re-render for constructors (team names instead of driver codes, points roughly double). Click back to "Drivers" and confirm it returns to the driver view with a fresh (reset) scenario. Set a scenario in Drivers mode, switch to Constructors, switch back — confirm the Drivers scenario was cleared (acceptable for v1; no cross-mode persistence is expected).

- [ ] **Step 4: Commit**

```bash
git add championship-calculator.html js/championship-calc-ui.js
git commit -m "feat: add constructors mode tab to championship calculator"
```

---

## Chunk 4: Sharing + Launch Gate

### Task 13: Shareable scenario link (URL-encoded state)

**Files:**
- Modify: `js/championship-calc-ui.js`

- [ ] **Step 1: Add encode/decode + a share button**

In `js/championship-calc-ui.js`, add:

```js
function encodeScenario() {
    const payload = { mode: calcMode, scenario: calcState.scenario };
    return btoa(encodeURIComponent(JSON.stringify(payload)));
}

function decodeScenario(encoded) {
    try {
        return JSON.parse(decodeURIComponent(atob(encoded)));
    } catch (e) {
        return null;
    }
}

function updateShareUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('s', encodeScenario());
    window.history.replaceState(null, '', url.toString());
}
```

Call `updateShareUrl();` at the end of `recomputeResults()` so the URL always reflects the current scenario.

In `initChampionshipCalculator()`, before calling `switchCalcMode('drivers')`, check for an incoming scenario:

```js
const incoming = new URL(window.location.href).searchParams.get('s');
const decoded = incoming ? decodeScenario(incoming) : null;
await switchCalcMode(decoded?.mode || 'drivers');
if (decoded?.scenario) {
    calcState.scenario = decoded.scenario;
    renderCarousel();
    recomputeResults();
}
```

- [ ] **Step 2: Add a visible "Copy Link" button**

In the results section template inside `renderResults()`, add above the closing `` ` `` :

```html
<button class="run-btn" id="calcCopyLink" style="margin-top:14px;">Copy Shareable Link</button>
```

After setting `section.innerHTML = ...` in `renderResults()`, wire it:

```js
    document.getElementById('calcCopyLink').onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        const btn = document.getElementById('calcCopyLink');
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy Shareable Link'; }, 1500);
    };
```

- [ ] **Step 3: Manual verification**

Set a scenario, click "Copy Shareable Link", paste the URL into a new browser tab. Expected: the page loads with the same scenario already applied (same locked races, same probability results) without any manual re-entry.

- [ ] **Step 4: Commit**

```bash
git add js/championship-calc-ui.js
git commit -m "feat: add shareable URL-encoded scenario state to championship calculator"
```

---

### Task 14: Share-card image (extends existing OG-card generator pattern)

**Files:**
- Modify: `scripts/gen-og-cards.py` (read first — see note below)
- Manual verification only; no automated test (image generation, matches how `gen-og-cards.py` itself has none)

- [ ] **Step 1: Read the existing generator before touching it**

Before writing any code, read `scripts/gen-og-cards.py` in full to learn its exact card layout (kerb-stripe background, auto-fit headline text, branding) — this task extends that established pattern for a *dynamic* stat card (e.g. "ANTONELLI — 74% TITLE PROBABILITY") rather than inventing new image-generation code. Do not duplicate its layout logic; add a new function that reuses its existing drawing helpers.

- [ ] **Step 2: Add a scenario-card generation function**

The exact function signature depends on what Step 1 reveals about `gen-og-cards.py`'s internal structure (e.g. its existing headline-card function's parameters) — refactor the shared drawing logic (background, branding, font-fit) into a helper both the existing per-article card generator and this new function call, rather than copy-pasting the whole card layout. This keeps the two card types visually identical in style with one shared implementation.

Target output: given a driver code and a probability percentage, produce a 1200x630 JPEG with the same kerb-stripe/branding treatment as article cards, headlined with e.g. `ANTONELLI: 74% TO WIN THE 2026 TITLE`.

- [ ] **Step 3: Wire a "Download Share Card" button**

This requires a small server-side step (Python) since the existing card generator is Python/PIL, not a client-side canvas — for a static site with no backend, the cleanest v1 approach is: generate a small fixed set of "current state" cards for the current leader/top-3 ahead of time (e.g. as part of a manual pre-publish step, not live per-scenario) rather than building a live image-generation API. Do NOT attempt to build a serverless image-generation endpoint for this — that would require infrastructure this static site doesn't have and is disproportionate to a v1 feature. Scope this down to: the "Copy Shareable Link" from Task 13 is the primary v1 share mechanism; a static "current leader's odds" card (regenerated whenever `npm run publish` runs, similar to how article OG cards regenerate) is the v1 image, not a per-scenario dynamic image.

- [ ] **Step 4: Manual verification**

Run the extended `gen-og-cards.py` (or its new function directly) and visually confirm the generated share card matches the site's existing branded card style.

- [ ] **Step 5: Commit**

```bash
git add scripts/gen-og-cards.py
git commit -m "feat: add championship-calculator share card to og-card generator"
```

---

### Task 15: Launch Checklist — DO NOT EXECUTE WITHOUT EXPLICIT USER GO-AHEAD

**This task is the only one in this entire plan that touches currently-live production files or pushes anything to `main`. Every prior task creates new, unlinked files only. Do not run any step in this task until the user has explicitly confirmed they want the calculator to go live — re-confirm even if the rest of the plan is long done, since time may have passed and circumstances may have changed (e.g. AdSense review status, mid-season events).**

- [ ] Remove the `<meta name="robots" content="noindex, nofollow">` tag from `championship-calculator.html`.
- [ ] Resolve Design Spec Open Question 2 (standalone page vs. section of `championship.html`) with the user before proceeding — this plan built it as a standalone page; confirm that's still wanted.
- [ ] Add a nav entry (footer, per `CLAUDE.md`'s "header nav is deliberately minimal... full nav lives in the footer" convention).
- [ ] Add full SEO metadata (title/description/canonical/OG/Twitter/JSON-LD) following the same pattern used for every article this season (see `scripts/gen-points-system.py` for the reference regex-substitution approach).
- [ ] Decide whether this needs an `articles.json` entry (it's a tool page, not an article — probably not, but confirm) and whether it needs a homepage callout.
- [ ] Add it to `scripts/generate-sitemap.js`'s scope if it's currently excluded as an experiment-style file, or confirm the glob already picks it up.
- [ ] Bump the `styles.css`/`script.js` cache-bust version site-wide **only if** this work touched either shared file (it shouldn't have — everything so far is new files) — verify with `git diff --stat styles.css script.js` showing no changes before skipping this step.
- [ ] Run `npm run publish` and review its diff to `index.html`/`sitemap.xml`/`data.json` before committing.
- [ ] Commit with the standard exclusion list from `CLAUDE.md`.
- [ ] **Explicitly ask the user before running `git push origin main`.** Do not push as part of "finishing the plan" — pushing to `main` is production deployment and needs its own confirmation even after every other box above is checked.
