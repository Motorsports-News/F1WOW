// Homepage "Title Fight Tracker": top 3 drivers' season-so-far points graph,
// sitting beside (not below) the existing Championship Battle standings.
// Same race-by-race draw-in animation as championship.html's progression
// graph, click a dot to see that race's cumulative points.
// Depends on globals from script.js: cachedJson, API_BASE, CURRENT_YEAR,
// fetchMergedSeasonResults, sanitizeHTML.
const TRACKER_SECONDS_PER_RACE = 0.35;
const trackerPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let trackerInView = false;
let trackerAnimated = false;

async function initHomepageTracker() {
    const section = document.getElementById('titleTracker');
    if (!section) return;

    // By finishing position, not by team - two of the top 3 are often
    // teammates (same team color), which would make their lines indistinguishable.
    const POSITION_COLORS = ['#E10600', '#27F4D2', '#FFB800'];

    try {
        const standingsPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`);
        const mergedResultsPromise = fetchMergedSeasonResults();
        const sprintDataPromise = cachedJson(`${API_BASE}/${CURRENT_YEAR}/sprint.json?limit=200`);

        const [standingsData, mergedResults, sprintData] = await Promise.all([
            standingsPromise, mergedResultsPromise, sprintDataPromise
        ]);

        const list = standingsData.MRData.StandingsTable.StandingsLists[0];
        const standings = list.DriverStandings.slice(0, 3);
        const sprintResults = sprintData.MRData.RaceTable.Races;

        if (standings.length < 2 || !mergedResults.length) {
            section.hidden = true;
            return;
        }

        const drivers = standings.map((s, i) => ({
            id: s.Driver.driverId,
            code: s.Driver.code,
            name: `${s.Driver.givenName} ${s.Driver.familyName}`,
            team: s.Constructors?.[0]?.name || 'Unknown',
            currentPoints: parseFloat(s.points),
            color: POSITION_COLORS[i] || '#B6BABD'
        }));

        // Season-so-far cumulative points for each driver shown, round by round.
        const roundLabels = [];
        const cumulative = {};
        const running = {};
        drivers.forEach(d => { cumulative[d.id] = []; running[d.id] = 0; });
        mergedResults.forEach(r => {
            drivers.forEach(d => {
                const res = r.Results.find(x => x.Driver.driverId === d.id);
                if (res) running[d.id] += parseFloat(res.points);
            });
            const sprintRound = sprintResults.find(sr => sr.round === r.round);
            if (sprintRound) {
                drivers.forEach(d => {
                    const res = sprintRound.SprintResults.find(x => x.Driver.driverId === d.id);
                    if (res) running[d.id] += parseFloat(res.points);
                });
            }
            roundLabels.push(r.Circuit?.Location?.locality || r.raceName.replace(' Grand Prix', ''));
            drivers.forEach(d => cumulative[d.id].push(running[d.id]));
        });

        renderTracker(section, drivers, cumulative, roundLabels);
    } catch (e) {
        section.hidden = true;
    }
}

// Pushes label y-positions apart just enough to stay readable when two or
// more drivers' lines finish close together, same idea as championship.html's
// tooltip clamping but for N labels instead of a single cursor-following box.
function declutterLabels(items, minGap, top, bottom) {
    const sorted = [...items].sort((a, b) => a.y - b.y);
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].y - sorted[i - 1].y < minGap) sorted[i].y = sorted[i - 1].y + minGap;
    }
    const overflow = sorted[sorted.length - 1].y - bottom;
    if (overflow > 0) sorted.forEach(item => { item.y -= overflow; });
    if (sorted[0].y < top) {
        const under = top - sorted[0].y;
        sorted.forEach(item => { item.y += under; });
    }
    return sorted;
}

function renderTracker(section, drivers, cumulative, roundLabels) {
    const n = roundLabels.length;
    const maxPoints = Math.max(...drivers.map(d => Math.max(...cumulative[d.id])), 1);

    const width = 500, height = 65;
    const padding = { top: 6, right: 66, bottom: 6, left: 6 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const coordsFor = arr => arr.map((pts, i) => ({
        x: padding.left + (n > 1 ? (chartW / (n - 1)) * i : chartW / 2),
        y: padding.top + chartH - (pts / maxPoints) * chartH
    }));

    const perDriver = drivers.map(d => ({ driver: d, coords: coordsFor(cumulative[d.id]) }));

    const lines = perDriver.map(({ driver, coords }) =>
        `<polyline class="title-tracker-line" points="${coords.map(c => `${c.x},${c.y}`).join(' ')}" fill="none" stroke="${driver.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`
    ).join('');

    const dots = perDriver.map(({ driver, coords }) => coords.map((c, i) => `
        <circle class="title-tracker-dot" cx="${c.x}" cy="${c.y}" r="3" fill="${driver.color}" stroke="#15151E" stroke-width="1.5" data-i="${i}"></circle>
        <circle class="title-tracker-dot-hit" cx="${c.x}" cy="${c.y}" r="9" fill="transparent"
            onclick="showTrackerPoint(event, '${sanitizeHTML(roundLabels[i]).replace(/'/g, "\\'")}', ${cumulative[driver.id][i]}, '${driver.color}', '${sanitizeHTML(driver.code)}')"></circle>
    `).join('')).join('');

    const rawLabels = perDriver.map(({ driver, coords }) => ({
        y: coords[coords.length - 1].y, driver
    }));
    const declutteredLabels = declutterLabels(rawLabels, 15, padding.top + 4, height - padding.bottom - 4);
    const lastX = perDriver[0].coords[perDriver[0].coords.length - 1].x;
    const labelsHtml = declutteredLabels.map(({ y, driver }) =>
        `<text x="${lastX + 8}" y="${y + 4}" class="title-tracker-label" fill="${driver.color}">${sanitizeHTML(driver.code)} ${driver.currentPoints}</text>`
    ).join('');

    section.innerHTML = `
        <div class="title-tracker-head">
            <h3>Title Fight Tracker</h3>
            <span class="title-tracker-note">Season points so far &ndash; click a dot for that race's total</span>
        </div>
        <div class="title-tracker-graph">
            <svg viewBox="0 0 ${width} ${height}" class="title-tracker-svg" preserveAspectRatio="xMidYMid meet">
                ${lines}
                ${dots}
                ${labelsHtml}
            </svg>
        </div>
        <a href="championship-calculator.html" class="title-tracker-link">Explore full title scenarios &rarr;</a>
    `;
    section.hidden = false;

    const graph = section.querySelector('.title-tracker-graph');
    const lineEls = graph.querySelectorAll('.title-tracker-line');
    lineEls.forEach(p => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
    });
    if (!trackerPrefersReducedMotion) {
        graph.querySelectorAll('.title-tracker-dot').forEach(d => { d.style.opacity = '0'; });
    }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            entries.forEach(en => {
                if (en.isIntersecting && !trackerInView) {
                    trackerInView = true;
                    playTrackerAnimation(graph, n);
                }
            });
        }, { threshold: 0.25 }).observe(graph);
    } else {
        playTrackerAnimation(graph, n);
    }
}

// Same technique as championship.html's playGraphAnimation(): draw each line
// in race-by-race via stroke-dashoffset, fading each dot in as the line
// reaches it, then strip the inline styles once done so nothing else
// (a future re-render, browser zoom) is left fighting leftover transitions.
function playTrackerAnimation(graph, roundCount) {
    if (trackerAnimated) return;
    trackerAnimated = true;
    const lines = graph.querySelectorAll('.title-tracker-line');
    const dots = graph.querySelectorAll('.title-tracker-dot');
    if (trackerPrefersReducedMotion) {
        lines.forEach(p => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
        dots.forEach(d => { d.style.opacity = ''; });
        return;
    }
    const total = Math.max(1, roundCount - 1) * TRACKER_SECONDS_PER_RACE;
    lines.forEach(p => {
        p.style.transition = `stroke-dashoffset ${total}s linear`;
        requestAnimationFrame(() => { p.style.strokeDashoffset = '0'; });
    });
    dots.forEach(d => {
        const i = parseInt(d.dataset.i || '0', 10);
        d.style.transition = `opacity 0.25s ease ${(i * TRACKER_SECONDS_PER_RACE).toFixed(2)}s`;
        requestAnimationFrame(() => { d.style.opacity = '1'; });
    });
    setTimeout(() => {
        lines.forEach(p => { p.style.transition = ''; p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
        dots.forEach(d => { d.style.transition = ''; d.style.opacity = ''; });
    }, (total + 0.5) * 1000);
}

// Click-a-dot tooltip - deliberately simpler than championship.html's hover
// tooltip (no logo/position, just the one number the click was asking for),
// since this widget's tap targets are small hit-circles, not full data points.
function showTrackerPoint(evt, label, points, color, code) {
    evt.stopPropagation();
    const graph = evt.currentTarget.closest('.title-tracker-graph');
    let tip = graph.querySelector('.title-tracker-tooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.className = 'title-tracker-tooltip';
        graph.appendChild(tip);
    }
    tip.style.borderColor = color;
    tip.innerHTML = `<strong style="color:${color}">${code}</strong> &middot; ${label}: <strong>${points} pts</strong>`;
    tip.classList.add('visible'); // show first so it's measurable, then clamp inside the graph card

    const graphRect = graph.getBoundingClientRect();
    const circleRect = evt.currentTarget.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let left = circleRect.left - graphRect.left + circleRect.width / 2;
    let top = circleRect.top - graphRect.top;
    left = Math.min(Math.max(left, tw / 2 + 4), graphRect.width - tw / 2 - 4);
    top = Math.max(top, th + 4);
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.title-tracker-dot-hit')) {
        document.querySelectorAll('.title-tracker-tooltip.visible').forEach(t => t.classList.remove('visible'));
    }
});

document.addEventListener('DOMContentLoaded', initHomepageTracker);
