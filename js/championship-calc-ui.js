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

async function initChampionshipCalculator() {
    try {
        const data = await loadChampionshipCalcData(12);
        calcState = { ...data, scenario: {} }; // scenario[driverId][round] = { gpPosition, sprintPosition }
        renderStandings(calcState.drivers);
        renderCarousel();
        recomputeResults();
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
