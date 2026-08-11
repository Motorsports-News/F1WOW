// Homepage "Title Fight Tracker": leader vs closest rival, live win probability
// + a season-so-far points graph. Sits below the existing Championship Battle
// standings - deliberately does NOT touch or replace that block.
// Depends on globals from script.js (cachedJson, API_BASE, CURRENT_YEAR,
// fetchMergedSeasonResults) and window.ChampionshipCalc (checkElimination,
// runMonteCarlo) from js/championship-calc-engine.js.
async function initHomepageTracker() {
    const section = document.getElementById('titleTracker');
    if (!section) return;

    // Enough mathematically-alive contenders for an honest field-wide probability -
    // matches the calculator page's own field size reasoning, not just a head-to-head coin flip.
    const FIELD_SIZE = 8;
    const TEAM_HEX = {
        'Mercedes': '#27F4D2', 'Ferrari': '#F91536', 'McLaren': '#FF8700',
        'Red Bull': '#3671C6', 'Red Bull Racing': '#3671C6', 'Alpine F1 Team': '#FF87BC',
        'Alpine': '#FF87BC', 'RB F1 Team': '#5E8FAA', 'Haas F1 Team': '#B6BABD',
        'Williams': '#64C4FF', 'Audi': '#C92D4B', 'Sauber': '#C92D4B', 'Aston Martin': '#229971'
    };

    try {
        const standingsPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`);
        const scheduleDataPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}.json?limit=30`);
        const mergedResultsPromise = fetchMergedSeasonResults();
        const sprintDataPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`);

        const [standingsData, scheduleData, mergedResults, sprintData] = await Promise.all([
            standingsPromise, scheduleDataPromise, mergedResultsPromise, sprintDataPromise
        ]);

        const list = standingsData.MRData.StandingsTable.StandingsLists[0];
        const standings = list.DriverStandings.slice(0, FIELD_SIZE);
        const completedRound = parseInt(list.round);
        const schedule = scheduleData.MRData.RaceTable.Races;
        const sprintResults = sprintData.MRData.RaceTable.Races;

        const remainingRaces = schedule
            .filter(r => parseInt(r.round) > completedRound)
            .map(r => ({ isSprint: !!r.Sprint }));

        // Need at least two drivers and at least one race left for "win probability" to mean anything.
        if (standings.length < 2 || !remainingRaces.length) {
            section.hidden = true;
            return;
        }

        const drivers = standings.map(s => {
            const id = s.Driver.driverId;
            const gpHistory = mergedResults
                .map(r => { const res = r.Results.find(x => x.Driver.driverId === id); return res ? parseFloat(res.points) : null; })
                .filter(v => v !== null);
            const sprintHistory = sprintResults
                .map(r => { const res = r.SprintResults.find(x => x.Driver.driverId === id); return res ? parseFloat(res.points) : null; })
                .filter(v => v !== null);
            return {
                id,
                code: s.Driver.code,
                name: `${s.Driver.givenName} ${s.Driver.familyName}`,
                team: s.Constructors?.[0]?.name || 'Unknown',
                currentPoints: parseFloat(s.points),
                history: { gpHistory, sprintHistory }
            };
        });

        const leader = drivers[0];
        const rival = drivers[1];
        const standardLeft = remainingRaces.filter(r => !r.isSprint).length;
        const sprintLeft = remainingRaces.filter(r => r.isSprint).length;

        const simDrivers = drivers.map(d => ({
            id: d.id,
            currentPoints: d.currentPoints,
            eliminated: d.id === leader.id ? false : ChampionshipCalc.checkElimination(
                d.currentPoints, leader.currentPoints, standardLeft, sprintLeft, 1
            ),
            history: d.history,
            races: remainingRaces.map(r => ({ locked: false, isSprint: r.isSprint }))
        }));
        const probabilities = ChampionshipCalc.runMonteCarlo(simDrivers, 3000);

        // Season-so-far cumulative points for just the two drivers shown, round by round -
        // built straight from the same real results the probability model uses, so the
        // graph's endpoint always matches currentPoints exactly.
        const rounds = [];
        const cumulative = { [leader.id]: [], [rival.id]: [] };
        const running = { [leader.id]: 0, [rival.id]: 0 };
        mergedResults.forEach(r => {
            [leader.id, rival.id].forEach(id => {
                const res = r.Results.find(x => x.Driver.driverId === id);
                if (res) running[id] += parseFloat(res.points);
            });
            const sprintRound = sprintResults.find(sr => sr.round === r.round);
            if (sprintRound) {
                [leader.id, rival.id].forEach(id => {
                    const res = sprintRound.SprintResults.find(x => x.Driver.driverId === id);
                    if (res) running[id] += parseFloat(res.points);
                });
            }
            rounds.push(r.round);
            cumulative[leader.id].push(running[leader.id]);
            cumulative[rival.id].push(running[rival.id]);
        });

        renderTracker(section, leader, rival, probabilities, cumulative, TEAM_HEX);
    } catch (e) {
        section.hidden = true;
    }
}

function renderTracker(section, leader, rival, probabilities, cumulative, TEAM_HEX) {
    const leaderColor = TEAM_HEX[leader.team] || '#E10600';
    const rivalColor = TEAM_HEX[rival.team] || '#B6BABD';

    const leaderPts = cumulative[leader.id];
    const rivalPts = cumulative[rival.id];
    const maxPoints = Math.max(...leaderPts, ...rivalPts, 1);
    const n = leaderPts.length;

    const width = 500, height = 200;
    const padding = { top: 14, right: 14, bottom: 14, left: 14 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const toPoints = arr => arr.map((pts, i) => {
        const x = padding.left + (n > 1 ? (chartW / (n - 1)) * i : chartW / 2);
        const y = padding.top + chartH - (pts / maxPoints) * chartH;
        return `${x},${y}`;
    }).join(' ');

    const leaderPct = (probabilities[leader.id] * 100).toFixed(1);
    const rivalPct = (probabilities[rival.id] * 100).toFixed(1);

    section.innerHTML = `
        <div class="title-tracker-head">
            <h3>Title Fight Tracker</h3>
            <span class="title-tracker-note">Live win probability, Monte Carlo&ndash;simulated across the remaining season</span>
        </div>
        <div class="title-tracker-body">
            <div class="title-tracker-graph">
                <svg viewBox="0 0 ${width} ${height}" class="title-tracker-svg" preserveAspectRatio="xMidYMid meet">
                    <polyline points="${toPoints(rivalPts)}" fill="none" stroke="${rivalColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                    <polyline points="${toPoints(leaderPts)}" fill="none" stroke="${leaderColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <div class="title-tracker-probs">
                <div class="title-tracker-driver" style="--tt-color:${leaderColor}">
                    <span class="title-tracker-swatch"></span>
                    <span class="title-tracker-name">${sanitizeHTML(leader.code)}</span>
                    <span class="title-tracker-pct">${leaderPct}%</span>
                </div>
                <div class="title-tracker-vs">VS</div>
                <div class="title-tracker-driver" style="--tt-color:${rivalColor}">
                    <span class="title-tracker-swatch"></span>
                    <span class="title-tracker-name">${sanitizeHTML(rival.code)}</span>
                    <span class="title-tracker-pct">${rivalPct}%</span>
                </div>
            </div>
        </div>
        <a href="championship-calculator.html" class="title-tracker-link">Explore full title scenarios &rarr;</a>
    `;
    section.hidden = false;
}

document.addEventListener('DOMContentLoaded', initHomepageTracker);
