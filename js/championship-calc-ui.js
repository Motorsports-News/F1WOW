// UI layer for the championship calculator - owns all DOM rendering and events.
// Depends on: ChampionshipCalc (championship-calc-engine.js), loadChampionshipCalcData
// (championship-calc-data.js), sanitizeHTML (script.js).

let calcState = null; // set by initChampionshipCalculator()
let calcMode = 'drivers';

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
    const rows = drivers.map(d => `
        <tr class="standings-row">
            <td>${sanitizeHTML(d.code)}</td>
            ${isConstructors ? '' : `<td>${sanitizeHTML(d.team)}</td>`}
            <td>${d.currentPoints}</td>
            <td>${d.currentPoints === leaderPoints ? '—' : '-' + (leaderPoints - d.currentPoints)}</td>
        </tr>`).join('');

    document.getElementById('calcStandingsSection').innerHTML = `
        <h2>Current Standings</h2>
        <div class="standings-container">
            <table class="standings-table" aria-label="Current ${isConstructors ? 'constructor' : 'driver'} standings">
                <thead><tr><th>${isConstructors ? 'Team' : 'Driver'}</th>${isConstructors ? '' : '<th>Team</th>'}<th>Points</th><th>Gap to Leader</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

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

    const rows = calcState.drivers.map(d => `
        <tr>
            <td>${sanitizeHTML(d.code)}</td>
            <td><select data-driver="${sanitizeHTML(d.id)}" data-kind="gp">${positionOptions(10)}</select></td>
            <td ${race.isSprint ? '' : 'style="display:none;"'}><select data-driver="${sanitizeHTML(d.id)}" data-kind="sprint">${positionOptions(8)}</select></td>
        </tr>`).join('');

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
            <thead><tr><th>${calcMode === 'constructors' ? 'Team' : 'Driver'}</th><th>GP Finish</th><th ${race.isSprint ? '' : 'style="display:none;"'}>Sprint Finish</th></tr></thead>
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

function renderResults(drivers, pointsNow, eliminated, isChampion, probabilities, leaderId) {
    const section = document.getElementById('calcResultsSection');
    section.style.display = 'block';

    if (!drivers || drivers.length < 2) {
        section.innerHTML = '<h2>Championship Win Probability</h2><p>Not enough driver data to compute a scenario.</p>';
        return;
    }

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
        <div class="required-line">${requiredLine}</div>
        <p style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin-top:10px;">
            Model: each driver's unlocked remaining races are resampled from their own actual 2026 race-by-race results this season. First-pass estimate, not an official probability.
        </p>
        <button class="run-btn" id="calcCopyLink" style="margin-top:14px;">Copy Shareable Link</button>`;

    document.getElementById('calcCopyLink').onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        const btn = document.getElementById('calcCopyLink');
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy Shareable Link'; }, 1500);
    };
}

let calcModeRequestId = 0;

async function switchCalcMode(mode) {
    calcMode = mode;
    document.getElementById('calcTabDrivers').style.opacity = mode === 'drivers' ? '1' : '0.5';
    document.getElementById('calcTabConstructors').style.opacity = mode === 'constructors' ? '1' : '0.5';

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
