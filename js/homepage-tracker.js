// Homepage "Title Fight Tracker": leader vs closest rival, season-so-far points
// graph. Sits below the existing Championship Battle standings - deliberately
// does NOT touch or replace that block.
// Depends on globals from script.js: cachedJson, API_BASE, CURRENT_YEAR,
// fetchMergedSeasonResults, sanitizeHTML.
async function initHomepageTracker() {
    const section = document.getElementById('titleTracker');
    if (!section) return;

    const TEAM_HEX = {
        'Mercedes': '#27F4D2', 'Ferrari': '#F91536', 'McLaren': '#FF8700',
        'Red Bull': '#3671C6', 'Red Bull Racing': '#3671C6', 'Alpine F1 Team': '#FF87BC',
        'Alpine': '#FF87BC', 'RB F1 Team': '#5E8FAA', 'Haas F1 Team': '#B6BABD',
        'Williams': '#64C4FF', 'Audi': '#C92D4B', 'Sauber': '#C92D4B', 'Aston Martin': '#229971'
    };

    try {
        const standingsPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`);
        const mergedResultsPromise = fetchMergedSeasonResults();
        const sprintDataPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`);

        const [standingsData, mergedResults, sprintData] = await Promise.all([
            standingsPromise, mergedResultsPromise, sprintDataPromise
        ]);

        const list = standingsData.MRData.StandingsTable.StandingsLists[0];
        const standings = list.DriverStandings.slice(0, 2);
        const sprintResults = sprintData.MRData.RaceTable.Races;

        if (standings.length < 2 || !mergedResults.length) {
            section.hidden = true;
            return;
        }

        const [leaderStanding, rivalStanding] = standings;
        const shape = s => ({
            id: s.Driver.driverId,
            code: s.Driver.code,
            name: `${s.Driver.givenName} ${s.Driver.familyName}`,
            team: s.Constructors?.[0]?.name || 'Unknown',
            currentPoints: parseFloat(s.points)
        });
        const leader = shape(leaderStanding);
        const rival = shape(rivalStanding);

        // Season-so-far cumulative points for just the two drivers shown, round by round.
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
            cumulative[leader.id].push(running[leader.id]);
            cumulative[rival.id].push(running[rival.id]);
        });

        renderTracker(section, leader, rival, cumulative, TEAM_HEX);
    } catch (e) {
        section.hidden = true;
    }
}

function renderTracker(section, leader, rival, cumulative, TEAM_HEX) {
    const leaderColor = TEAM_HEX[leader.team] || '#E10600';
    const rivalColor = TEAM_HEX[rival.team] || '#B6BABD';

    const leaderPts = cumulative[leader.id];
    const rivalPts = cumulative[rival.id];
    const maxPoints = Math.max(...leaderPts, ...rivalPts, 1);
    const n = leaderPts.length;

    const width = 500, height = 130;
    // Extra right margin reserves room for the endpoint code+points labels.
    const padding = { top: 14, right: 84, bottom: 14, left: 10 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const coordsFor = arr => arr.map((pts, i) => ({
        x: padding.left + (n > 1 ? (chartW / (n - 1)) * i : chartW / 2),
        y: padding.top + chartH - (pts / maxPoints) * chartH
    }));
    const leaderCoords = coordsFor(leaderPts);
    const rivalCoords = coordsFor(rivalPts);
    const toPointsAttr = coords => coords.map(c => `${c.x},${c.y}`).join(' ');
    const dotsFor = (coords, color) => coords.map(c =>
        `<circle cx="${c.x}" cy="${c.y}" r="2.5" fill="${color}" />`
    ).join('');

    // Endpoint labels sit at the real data y-position, nudged apart only when
    // the two lines finish close enough together to overlap the text.
    let leaderLabelY = leaderCoords[leaderCoords.length - 1].y;
    let rivalLabelY = rivalCoords[rivalCoords.length - 1].y;
    const lastX = leaderCoords[leaderCoords.length - 1].x;
    const MIN_GAP = 16;
    if (Math.abs(rivalLabelY - leaderLabelY) < MIN_GAP) {
        const mid = (leaderLabelY + rivalLabelY) / 2;
        const half = MIN_GAP / 2;
        if (leaderLabelY <= rivalLabelY) { leaderLabelY = mid - half; rivalLabelY = mid + half; }
        else { leaderLabelY = mid + half; rivalLabelY = mid - half; }
    }
    leaderLabelY = Math.min(Math.max(leaderLabelY, padding.top + 4), height - padding.bottom - 4);
    rivalLabelY = Math.min(Math.max(rivalLabelY, padding.top + 4), height - padding.bottom - 4);

    section.innerHTML = `
        <div class="title-tracker-head">
            <h3>Title Fight Tracker</h3>
            <span class="title-tracker-note">How the top two title contenders have scored, race by race</span>
        </div>
        <div class="title-tracker-graph">
            <svg viewBox="0 0 ${width} ${height}" class="title-tracker-svg" preserveAspectRatio="xMidYMid meet">
                <polyline points="${toPointsAttr(rivalCoords)}" fill="none" stroke="${rivalColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                <polyline points="${toPointsAttr(leaderCoords)}" fill="none" stroke="${leaderColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                ${dotsFor(rivalCoords, rivalColor)}
                ${dotsFor(leaderCoords, leaderColor)}
                <text x="${lastX + 8}" y="${leaderLabelY + 4}" class="title-tracker-label" fill="${leaderColor}">${sanitizeHTML(leader.code)} ${leader.currentPoints}</text>
                <text x="${lastX + 8}" y="${rivalLabelY + 4}" class="title-tracker-label" fill="${rivalColor}">${sanitizeHTML(rival.code)} ${rival.currentPoints}</text>
            </svg>
        </div>
        <a href="championship-calculator.html" class="title-tracker-link">Explore full title scenarios &rarr;</a>
    `;
    section.hidden = false;
}

document.addEventListener('DOMContentLoaded', initHomepageTracker);
