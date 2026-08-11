// UI layer for the championship calculator - owns all DOM rendering and events.
// Depends on: ChampionshipCalc (championship-calc-engine.js), loadChampionshipCalcData
// (championship-calc-data.js), sanitizeHTML (script.js).

let calcState = null; // set by initChampionshipCalculator()
let calcMode = 'drivers';

const STANDINGS_VISIBLE = 5;

function renderStandings(drivers) {
    if (!drivers || !drivers.length) {
        document.getElementById('calcStandingsSection').innerHTML = '<p>No standings data available.</p>';
        return;
    }
    // Constructors mode reuses this same renderer (calcState.drivers holds constructor
    // entries there), but a constructor's code/team are the same full name - showing
    // both a "Driver" and "Team" column would just duplicate that name across two cells.
    const isConstructors = calcMode === 'constructors';
    const leaderPoints = drivers[0].currentPoints;
    const rowHtml = (d, hidden) => `
        <tr class="standings-row${hidden ? ' calc-standings-hidden-row' : ''}" ${hidden ? 'style="display:none;"' : ''}>
            <td>${sanitizeHTML(d.code)}</td>
            ${isConstructors ? '' : `<td>${sanitizeHTML(d.team)}</td>`}
            <td>${d.currentPoints}</td>
            <td>${d.currentPoints === leaderPoints ? '—' : '-' + (leaderPoints - d.currentPoints)}</td>
        </tr>`;

    // Everyone beyond the top 5 is supporting context, not the point of the page -
    // collapse it by default. These rows live in the SAME <tbody> as the visible
    // ones (just display:none) rather than a second separate <table>, so the
    // columns stay properly aligned and the toggle button below is a normal
    // sibling of the table, not something that visually floats apart from it.
    const visible = drivers.slice(0, STANDINGS_VISIBLE).map(d => rowHtml(d, false)).join('');
    const rest = drivers.slice(STANDINGS_VISIBLE);
    const hiddenRows = rest.map(d => rowHtml(d, true)).join('');
    const toggleBtn = rest.length
        ? `<button class="calc-standings-more-btn" id="calcStandingsMoreBtn" aria-expanded="false">${rest.length} more</button>`
        : '';

    document.getElementById('calcStandingsSection').innerHTML = `
        <h2>Current Standings</h2>
        <div class="standings-container">
            <table class="standings-table" aria-label="Current ${isConstructors ? 'constructor' : 'driver'} standings">
                <thead><tr><th>${isConstructors ? 'Team' : 'Driver'}</th>${isConstructors ? '' : '<th>Team</th>'}<th>Points</th><th>Gap to Leader</th></tr></thead>
                <tbody>${visible}${hiddenRows}</tbody>
            </table>
            ${toggleBtn}
        </div>`;

    const moreBtn = document.getElementById('calcStandingsMoreBtn');
    if (moreBtn) {
        moreBtn.onclick = () => {
            const section = document.getElementById('calcStandingsSection');
            const willExpand = moreBtn.getAttribute('aria-expanded') !== 'true';
            section.querySelectorAll('.calc-standings-hidden-row').forEach(row => {
                row.style.display = willExpand ? '' : 'none';
            });
            moreBtn.setAttribute('aria-expanded', String(willExpand));
            moreBtn.textContent = willExpand ? 'Show fewer' : `${rest.length} more`;
        };
    }
}

let calcCurrentRaceIndex = 0;

function ordinalLabel(p) {
    return p === 1 ? '1st' : p === 2 ? '2nd' : p === 3 ? '3rd' : p + 'th';
}

function positionOptions(max) {
    let opts = '<option value="" title="Outside the points (P11+ or DNF)">—</option>';
    for (let p = 1; p <= max; p++) opts += `<option value="${p}">${ordinalLabel(p)}</option>`;
    return opts;
}

const REDUCE_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function renderCarousel() {
    const race = calcState.remainingRaces[calcCurrentRaceIndex];
    const total = calcState.remainingRaces.length;

    const rows = calcState.drivers.map(d => {
        const locked = calcState.scenario[d.id]?.[race.round];
        const pts = locked
            ? ChampionshipCalc.gpPointsFor(locked.gpPosition) + (race.isSprint ? ChampionshipCalc.sprintPointsFor(locked.sprintPosition) : 0)
            : null;
        const ptsLabel = pts === null ? '&ndash;' : (pts > 0 ? '+' + pts : '0');
        return `
        <tr class="${locked ? 'calc-locked-row' : ''}">
            <td>${sanitizeHTML(d.code)}</td>
            <td><select data-driver="${sanitizeHTML(d.id)}" data-kind="gp">${positionOptions(10)}</select></td>
            <td ${race.isSprint ? '' : 'style="display:none;"'}><select data-driver="${sanitizeHTML(d.id)}" data-kind="sprint">${positionOptions(8)}</select></td>
            <td><span class="calc-pts-preview ${pts > 0 ? 'has-pts' : ''}">${ptsLabel}</span></td>
        </tr>`;
    }).join('');

    // Round chips show the actual round number and lock state at a glance, instead
    // of an unlabeled row of identical dots.
    const chips = calcState.remainingRaces.map((r, i) => {
        const hasAnyLock = calcState.drivers.some(d => calcState.scenario[d.id]?.[r.round]);
        return `<button class="calc-race-chip ${hasAnyLock ? 'locked' : ''} ${i === calcCurrentRaceIndex ? 'current' : ''}" data-index="${i}" title="Round ${r.round}: ${sanitizeHTML(r.name)}">${r.round}</button>`;
    }).join('');

    const hasAnyScenario = Object.values(calcState.scenario).some(perRound => Object.keys(perRound).length > 0);

    const section = document.getElementById('calcCarouselSection');
    section.innerHTML = `
        <h2>Set Race Results</h2>
        <div class="calc-carousel-nav">
            <button id="calcPrevRace" ${calcCurrentRaceIndex === 0 ? 'disabled' : ''}>&lsaquo; Prev</button>
            <span class="calc-race-label">Round ${race.round} — ${sanitizeHTML(race.name)}${race.isSprint ? ' (Sprint)' : ''}</span>
            <button id="calcNextRace" ${calcCurrentRaceIndex === total - 1 ? 'disabled' : ''}>Next &rsaquo;</button>
        </div>
        <table class="scenario-table" style="opacity:${REDUCE_MOTION ? '1' : '0'};">
            <thead><tr><th>${calcMode === 'constructors' ? 'Team' : 'Driver'}</th><th>GP Finish</th><th ${race.isSprint ? '' : 'style="display:none;"'}>Sprint Finish</th><th>Points</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <div class="calc-race-chips-row">
            <div class="calc-race-chips">${chips}</div>
            <button class="calc-reset-btn" id="calcResetScenario" title="Clear every locked race and return to the current live standings" ${hasAnyScenario ? '' : 'disabled'}>&#8635; Reset to current</button>
        </div>`;

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
    document.querySelectorAll('.calc-race-chip').forEach(chip => {
        chip.onclick = () => { calcCurrentRaceIndex = parseInt(chip.dataset.index); renderCarousel(); };
    });
    document.querySelectorAll('.scenario-table select').forEach(sel => {
        sel.onchange = () => { onScenarioChange(race, sel); };
    });
    document.getElementById('calcResetScenario').onclick = () => {
        calcState.scenario = {}; // clears every locked race for every driver, back to live standings
        renderCarousel();
        recomputeResults();
    };

    // Quick crossfade so a race/tab switch reads as a response, not a hard swap.
    if (!REDUCE_MOTION) {
        const table = section.querySelector('.scenario-table');
        requestAnimationFrame(() => requestAnimationFrame(() => { table.style.opacity = '1'; }));
    }
}

function onScenarioChange(race, changedSelect) {
    const driverId = changedSelect.dataset.driver;
    const gpSel = document.querySelector(`select[data-driver="${driverId}"][data-kind="gp"]`);
    const sprintSel = document.querySelector(`select[data-driver="${driverId}"][data-kind="sprint"]`);
    const gpPosition = gpSel.value ? parseInt(gpSel.value) : null;
    const sprintPosition = (race.isSprint && sprintSel && sprintSel.value) ? parseInt(sprintSel.value) : null;

    // Any interaction locks this race for this driver, including picking "outside points"
    // (gpPosition/sprintPosition null means 0 points, not "untouched" - a previous version
    // deleted the lock whenever both fields were blank, which silently un-locked "outside
    // points" back to simulated instead of scoring it as 0, one of the most common scenarios
    // a user would want to model).
    if (!calcState.scenario[driverId]) calcState.scenario[driverId] = {};
    calcState.scenario[driverId][race.round] = { gpPosition, sprintPosition };
    renderCarousel(); // refresh dot-lock indicators
    recomputeResults();
}

function recomputeResults() {
    const drivers = calcState.drivers;
    if (!drivers || drivers.length < 2) {
        renderResults(drivers || [], {}, {}, false, {}, null);
        return;
    }
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

    const carsPerEntity = calcMode === 'constructors' ? 2 : 1;

    const eliminated = {};
    drivers.forEach(d => {
        if (d.id === leaderId) { eliminated[d.id] = false; return; }
        eliminated[d.id] = ChampionshipCalc.checkElimination(
            pointsNow[d.id], leaderPoints, unlockedStandard(d.id), unlockedSprint(d.id), carsPerEntity
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
    updateShareUrl();
}

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
    // Uses the URL fragment (#s=...), not a query param - a fully-locked scenario
    // encodes to ~13KB, and a query param is sent to the server as part of the real
    // HTTP request line on every load (this site is served through a CDN). A hash
    // fragment never leaves the browser, so there's no request-size risk either way.
    const url = new URL(window.location.href);
    url.hash = 's=' + encodeScenario();
    window.history.replaceState(null, '', url.toString());
}

let calcExploreDriverId = null; // which top-3 entity the user picked to explore, if any

// Shapes a driver/constructor into the { currentPoints, history, races } form
// findWinningScenarios (and runMonteCarlo) expect - same shape recomputeResults
// builds for the main simulation, rebuilt locally here for just the two entities
// the explorer needs rather than threading it through from recomputeResults.
function buildSimEntity(driver, pointsNow) {
    return {
        currentPoints: pointsNow[driver.id],
        history: driver.history,
        races: calcState.remainingRaces.map(r => {
            const locked = calcState.scenario[driver.id]?.[r.round];
            return locked
                ? { locked: true, isSprint: r.isSprint, gpPosition: locked.gpPosition, sprintPosition: locked.sprintPosition }
                : { locked: false, isSprint: r.isSprint };
        })
    };
}

// Turns one simulated trial's race-by-race outcome into a plain-English summary,
// e.g. "HAM wins 3 of the remaining races and finishes on the podium 4 more times,
// finishing off the podium the other 5 times." Always exactly describes what that
// one trial actually did - no rounding/hedging, since it's one concrete draw.
function summarizeScenarioSide(code, outcome) {
    const positions = outcome.finishes.map(f => f.gpPosition);
    const wins = positions.filter(p => p === 1).length;
    const otherPodiums = positions.filter(p => p !== null && p >= 2 && p <= 3).length;
    const rest = positions.length - wins - otherPodiums;
    const parts = [];
    if (wins) parts.push(`wins ${wins} of the remaining race${wins === 1 ? '' : 's'}`);
    if (otherPodiums) parts.push(`finishes on the podium ${otherPodiums} more time${otherPodiums === 1 ? '' : 's'}`);
    if (rest) parts.push(`finishes off the podium the other ${rest} time${rest === 1 ? '' : 's'}`);
    const summary = parts.length ? parts.join(', ') : 'has no unlocked races left to simulate';
    return `<strong>${sanitizeHTML(code)}</strong> ${summary}.`;
}

// Runs the rejection-sampling search and renders up to 3 concrete example scenarios,
// or an honest "didn't find one" message rather than fabricating a path that doesn't
// exist in the model - see findWinningScenarios' own comment for why that can happen.
function renderScenarioExamples(exploreDriver, opponent, pointsNow) {
    const selEntity = buildSimEntity(exploreDriver, pointsNow);
    const oppEntity = buildSimEntity(opponent, pointsNow);
    const examples = ChampionshipCalc.findWinningScenarios(selEntity, oppEntity, 3, 4000);

    if (!examples.length) {
        return `<p class="calc-scenario-empty">No winning path turned up across 4,000 simulated seasons - ${sanitizeHTML(exploreDriver.code)}'s realistic chance is close to zero even though they're not yet mathematically eliminated.</p>`;
    }

    const items = examples.map((ex, i) => `
        <li class="calc-scenario-item">
            <span class="calc-scenario-num">${i + 1}</span>
            <div class="calc-scenario-text">
                <p>${summarizeScenarioSide(exploreDriver.code, ex.selected)}</p>
                <p>${summarizeScenarioSide(opponent.code, ex.opponent)}</p>
            </div>
        </li>`).join('');
    return `<p class="calc-scenario-heading">Example scenarios where ${sanitizeHTML(exploreDriver.code)} wins it:</p><ul class="calc-scenario-list">${items}</ul>`;
}

// Lets the user pick ANY of the top 3 (not just the auto-selected leader/rival above)
// and see that entity's own probability plus the genuine mathematical boundary: how
// many more points their closest top-3 opponent can score before they're mathematically
// done. This is deliberately the deterministic best-case/worst-case boundary, not a full
// combinatorial "every possible path" search (out of scope - see design spec).
function renderTitlePathExplorer(drivers, pointsNow, probabilities, leaderId) {
    // By points, not by simulated probability - same flicker-avoidance reasoning as the
    // required-result rival pick (probability is unseeded and reruns on every edit).
    const topByPoints = [...drivers].sort((a, b) => pointsNow[b.id] - pointsNow[a.id]).slice(0, 3);
    if (topByPoints.length < 2) return ''; // need at least two entities for "vs" math to mean anything

    if (calcExploreDriverId && !topByPoints.some(d => d.id === calcExploreDriverId)) {
        calcExploreDriverId = null; // the previously-explored entity fell out of the top 3
    }

    const chips = topByPoints.map(d =>
        `<button class="calc-explore-chip ${d.id === calcExploreDriverId ? 'active' : ''}" data-driver="${sanitizeHTML(d.id)}">${sanitizeHTML(d.code)}</button>`
    ).join('');

    const exploreDriver = topByPoints.find(d => d.id === calcExploreDriverId);
    let panel = '';
    if (exploreDriver) {
        const opponent = topByPoints
            .filter(d => d.id !== exploreDriver.id)
            .sort((a, b) => pointsNow[b.id] - pointsNow[a.id])[0];

        const remaining = calcState.remainingRaces.filter(r => !calcState.scenario[exploreDriver.id]?.[r.round]);
        const standardLeft = remaining.filter(r => !r.isSprint).length;
        const sprintLeft = remaining.filter(r => r.isSprint).length;
        const carsPerEntity = calcMode === 'constructors' ? 2 : 1;
        const boundary = ChampionshipCalc.titleBoundary(
            pointsNow[exploreDriver.id], pointsNow[opponent.id], standardLeft, sprintLeft, carsPerEntity
        );
        const pct = (probabilities[exploreDriver.id] * 100).toFixed(1);

        const boundaryLine = boundary.eliminated
            ? `<strong>${sanitizeHTML(exploreDriver.code)} is mathematically eliminated</strong> - even winning every remaining race (a maximum of ${boundary.bestCase} points) can't catch ${sanitizeHTML(opponent.code)}'s current ${pointsNow[opponent.id]} points.`
            : `<strong>${sanitizeHTML(exploreDriver.code)}</strong> is still mathematically alive: their ceiling if they win every remaining race and sprint is <strong>${boundary.bestCase} points</strong>, so <strong>${sanitizeHTML(opponent.code)}</strong> can score at most <strong>${boundary.maxOpponentAllowed} more points</strong> across the remaining season and still be caught.`;

        const scenariosHtml = boundary.eliminated ? '' : renderScenarioExamples(exploreDriver, opponent, pointsNow);

        panel = `
        <div class="calc-explore-panel">
            <div class="calc-explore-stat"><span class="calc-explore-pct">${pct}%</span><span class="calc-explore-label">${sanitizeHTML(exploreDriver.code)}'s live win probability</span></div>
            <p class="calc-explore-boundary">${boundaryLine}</p>
            ${scenariosHtml}
        </div>`;
    }

    return `
    <div class="calc-explore">
        <h3>Title Path Explorer</h3>
        <p class="calc-explore-intro">Pick any of the top 3 to see their live odds and the exact points math behind them.</p>
        <div class="calc-explore-chips">${chips}</div>
        ${panel}
    </div>`;
}

function renderResults(drivers, pointsNow, eliminated, isChampion, probabilities, leaderId) {
    const section = document.getElementById('calcResultsSection');
    section.style.display = 'block';

    if (!drivers || drivers.length < 2) {
        section.innerHTML = '<h2>Championship Win Probability</h2><p>Not enough driver data to compute a scenario.</p>';
        return;
    }

    const sorted = [...drivers].sort((a, b) => probabilities[b.id] - probabilities[a.id]);
    const rowHtml = d => {
        const pct = (probabilities[d.id] * 100).toFixed(1);
        const badge = d.id === leaderId && isChampion ? '<span class="badge badge-champ">Champion</span>'
            : eliminated[d.id] ? '<span class="badge badge-out">Eliminated</span>'
            : '<span class="badge badge-alive">Alive</span>';
        return `
        <div class="result-row">
            <div class="result-driver">${sanitizeHTML(d.code)} ${badge}</div>
            <div class="result-bar-wrap"><div class="result-bar" data-pct="${pct}"></div></div>
            <div class="result-pct">${pct}%</div>
        </div>`;
    };

    // A driver with a rounded 0.0% chance isn't wrong to show, but nine identical
    // near-zero bars in a row is pure repetition once the title fight has a clear
    // top few - collapse the long tail behind a disclosure instead of always
    // rendering every row at full visual weight.
    const SIGNIFICANT_THRESHOLD = 1;
    const significant = sorted.filter(d => probabilities[d.id] * 100 >= SIGNIFICANT_THRESHOLD);
    const tail = sorted.filter(d => probabilities[d.id] * 100 < SIGNIFICANT_THRESHOLD);
    const shown = significant.length >= 1 ? significant : sorted; // never collapse down to zero visible rows
    const hidden = shown === sorted ? [] : tail;

    const rows = shown.map(rowHtml).join('');
    const tailBlock = hidden.length
        ? `<details class="calc-tail-toggle"><summary>+${hidden.length} more, all under ${SIGNIFICANT_THRESHOLD}%</summary>${hidden.map(rowHtml).join('')}</details>`
        : '';

    // Rival for the required-result sentence is selected by POINTS, not by simulated
    // probability - probability is unseeded and reruns on every edit, so using it here
    // would make "who's the rival" flicker between edits from sampling noise alone, and
    // could name a confusing driver (e.g. a #2-by-points with no unlocked races left can
    // rank behind a #3-by-points who still has high-variance races to simulate).
    const leader = drivers.find(d => d.id === leaderId);
    // Only a driver who isn't already eliminated can meaningfully "close the gap" -
    // an eliminated rival would produce a self-contradictory sentence (telling them to
    // outscore the leader when they mathematically can't anymore).
    const contenders = drivers.filter(d => d.id !== leaderId && !eliminated[d.id]);
    const rival = (contenders.length ? contenders : drivers.filter(d => d.id !== leaderId))
        .sort((a, b) => pointsNow[b.id] - pointsNow[a.id])[0];

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
        ${tailBlock}
        <div class="required-line">${requiredLine}</div>
        ${renderTitlePathExplorer(drivers, pointsNow, probabilities, leaderId)}
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin-top:10px;">
            Model: each driver's unlocked remaining races are resampled from their own actual 2026 race-by-race results this season. First-pass estimate, not an official probability.
        </p>
        <button class="run-btn" id="calcCopyLink" style="margin-top:14px;">Copy Shareable Link</button>`;

    document.querySelectorAll('.calc-explore-chip').forEach(chip => {
        chip.onclick = () => {
            calcExploreDriverId = calcExploreDriverId === chip.dataset.driver ? null : chip.dataset.driver;
            renderResults(drivers, pointsNow, eliminated, isChampion, probabilities, leaderId);
        };
    });

    document.getElementById('calcCopyLink').onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        const btn = document.getElementById('calcCopyLink');
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy Shareable Link'; }, 1500);
    };

    // Bars are inserted at width:0 (see .result-bar's CSS default) - fill them to
    // their real value one frame later so the transition actually has something to
    // animate from, instead of the target width just appearing already-painted.
    const bars = section.querySelectorAll('.result-bar');
    if (REDUCE_MOTION) {
        bars.forEach(bar => { bar.style.width = bar.dataset.pct + '%'; });
    } else {
        requestAnimationFrame(() => requestAnimationFrame(() => {
            bars.forEach(bar => { bar.style.width = bar.dataset.pct + '%'; });
        }));
    }
}

let calcModeRequestId = 0;

async function switchCalcMode(mode) {
    calcMode = mode;
    document.getElementById('calcTabDrivers').classList.toggle('active', mode === 'drivers');
    document.getElementById('calcTabConstructors').classList.toggle('active', mode === 'constructors');

    // Guard against a rapid double-click starting a second switch before the first
    // one's fetch resolves - without this, an older, slower-resolving fetch could
    // overwrite calcState *after* a newer click already settled on the other mode,
    // leaving calcMode and calcState.drivers referring to two different modes (which
    // would silently break the carsPerEntity elimination math below).
    const myRequestId = ++calcModeRequestId;
    const data = mode === 'drivers' ? await loadChampionshipCalcData(12) : await loadConstructorCalcData(8);
    if (myRequestId !== calcModeRequestId) return; // a newer switchCalcMode call has since started - drop this stale result

    calcState = { ...data, scenario: {} };
    calcCurrentRaceIndex = 0;
    renderStandings(calcState.drivers);
    renderCarousel();
    recomputeResults();
}

async function initChampionshipCalculator() {
    try {
        const incoming = new URLSearchParams(window.location.hash.slice(1)).get('s');
        const decoded = incoming ? decodeScenario(incoming) : null;
        // Normalize rather than trust decoded.mode directly - anything other than the
        // exact literal 'constructors' must fall back to 'drivers', otherwise a typo'd
        // or hand-edited share link could load constructor data while calcMode itself
        // still held the garbage string, silently desyncing carsPerEntity/table headers
        // from what's actually on screen.
        const decodedMode = decoded?.mode === 'constructors' ? 'constructors' : 'drivers';
        await switchCalcMode(decodedMode);
        if (decoded?.scenario) {
            calcState.scenario = decoded.scenario;
            renderCarousel();
            recomputeResults();
        }
        document.getElementById('calcTabDrivers').onclick = () => switchCalcMode('drivers');
        document.getElementById('calcTabConstructors').onclick = () => switchCalcMode('constructors');
        document.getElementById('calcLoading').style.display = 'none';
        document.getElementById('calcApp').style.display = 'block';
    } catch (err) {
        document.getElementById('calcApp').style.display = 'none';
        const loading = document.getElementById('calcLoading');
        loading.style.display = 'block';
        loading.textContent = 'Failed to load live data: ' + err.message;
    }
}

document.addEventListener('DOMContentLoaded', initChampionshipCalculator);
