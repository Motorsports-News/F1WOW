// UI layer for the championship calculator - owns all DOM rendering and events.
// Depends on: ChampionshipCalc (championship-calc-engine.js), loadChampionshipCalcData
// (championship-calc-data.js), sanitizeHTML (script.js).

let calcState = null; // set by initChampionshipCalculator()

function renderStandings(drivers) {
    if (!drivers || !drivers.length) {
        document.getElementById('calcStandingsSection').innerHTML = '<p>No standings data available.</p>';
        return;
    }
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

function recomputeResults() {
    /* Task 9 fills this in */
}

async function initChampionshipCalculator() {
    try {
        const data = await loadChampionshipCalcData(12);
        calcState = { ...data, scenario: {} }; // scenario[driverId][round] = { gpPosition, sprintPosition }
        renderStandings(calcState.drivers);
        renderCarousel();
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
