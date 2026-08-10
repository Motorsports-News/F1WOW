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
