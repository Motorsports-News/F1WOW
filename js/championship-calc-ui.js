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

// Team colors for the drag chips - same palette the standings/graph pages use.
const CALC_TEAM_HEX = {
    'Mercedes': '#27F4D2', 'Ferrari': '#F91536', 'McLaren': '#FF8700',
    'Red Bull': '#3671C6', 'Red Bull Racing': '#3671C6', 'Alpine F1 Team': '#FF87BC',
    'Alpine': '#FF87BC', 'RB F1 Team': '#5E8FAA', 'Haas F1 Team': '#B6BABD',
    'Williams': '#64C4FF', 'Audi': '#C92D4B', 'Sauber': '#C92D4B', 'Aston Martin': '#229971'
};

// One board per kind of result. A sprint weekend renders both boards; a standard
// weekend renders only the GP board.
const BOARD_META = {
    gp: { key: 'gpPosition', slots: 10, label: 'Grand Prix', pointsFor: p => ChampionshipCalc.gpPointsFor(p) },
    sprint: { key: 'sprintPosition', slots: 8, label: 'Sprint', pointsFor: p => ChampionshipCalc.sprintPointsFor(p) }
};

const REDUCE_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Scenario state helpers -------------------------------------------------
// A lock entry for one round is { gpPosition?, sprintPosition? }: a present number
// = locked at that finishing position, null = locked at P11+/DNF (0 pts), and an
// ABSENT key = that side is still open (simulated). The entry disappears entirely
// once no side is set - the round goes back to fully simulated for that driver.

function boardEntry(driverId, round) {
    return calcState.scenario[driverId] ? calcState.scenario[driverId][round] : undefined;
}

function setBoardValue(driverId, round, kind, value) {
    const key = BOARD_META[kind].key;
    if (!calcState.scenario[driverId]) calcState.scenario[driverId] = {};
    const perDriver = calcState.scenario[driverId];
    if (value === undefined) {
        if (perDriver[round]) {
            delete perDriver[round][key];
            if (!Object.keys(perDriver[round]).length) delete perDriver[round];
        }
    } else {
        if (!perDriver[round]) perDriver[round] = {};
        perDriver[round][key] = value;
    }
    if (!Object.keys(perDriver).length) delete calcState.scenario[driverId];
}

function driverAtPosition(race, kind, pos) {
    const key = BOARD_META[kind].key;
    return calcState.drivers.find(d => {
        const entry = boardEntry(d.id, race.round);
        return entry && entry[key] === pos;
    }) || null;
}

function driversInDnfZone(race, kind) {
    const key = BOARD_META[kind].key;
    return calcState.drivers.filter(d => {
        const entry = boardEntry(d.id, race.round);
        return entry && entry[key] === null;
    });
}

function unplacedDrivers(race, kind) {
    const key = BOARD_META[kind].key;
    return calcState.drivers.filter(d => {
        const entry = boardEntry(d.id, race.round);
        return !entry || entry[key] === undefined;
    });
}

function chipLabel(d) {
    return calcMode === 'constructors' ? d.team : d.code;
}

function chipHtml(driver, kind, loc, pos) {
    const color = CALC_TEAM_HEX[driver.team] || '#B6BABD';
    const state = loc === 'slot' ? `, currently P${pos}` : loc === 'dnf' ? ', locked at 0 points' : '';
    return `<button type="button" class="calc-chip" data-driver="${sanitizeHTML(driver.id)}" data-kind="${kind}" data-loc="${loc}"${pos ? ` data-pos="${pos}"` : ''} aria-label="${sanitizeHTML(chipLabel(driver))}${state} - press Enter to move">` +
        `<span class="calc-chip-bar" style="background:${color}"></span>${sanitizeHTML(chipLabel(driver))}</button>`;
}

function boardHtml(race, kind) {
    const meta = BOARD_META[kind];
    let slots = '';
    for (let pos = 1; pos <= meta.slots; pos++) {
        const occupant = driverAtPosition(race, kind, pos);
        slots += `
        <div class="calc-slot" data-kind="${kind}" data-pos="${pos}">
            <span class="calc-slot-pos">P${pos}</span>
            <span class="calc-slot-pts">${meta.pointsFor(pos)}</span>
            ${occupant ? chipHtml(occupant, kind, 'slot', pos) : '<span class="calc-slot-empty">drag here</span>'}
        </div>`;
    }
    const dnfChips = driversInDnfZone(race, kind).map(d => chipHtml(d, kind, 'dnf')).join('');
    const poolChips = unplacedDrivers(race, kind).map(d => chipHtml(d, kind, 'pool')).join('');
    return `
    <div class="calc-board" data-board="${kind}">
        <div class="calc-board-head">
            <span class="calc-board-title">${meta.label}</span>
            <span class="calc-board-hint">P1 pays ${meta.pointsFor(1)} pts &middot; down to P${meta.slots}</span>
        </div>
        <div class="calc-slots">${slots}</div>
        <div class="calc-dnf" data-kind="${kind}">
            <span class="calc-dnf-label">P${meta.slots + 1}+ / DNF &middot; 0 pts</span>
            <div class="calc-dnf-chips">${dnfChips || '<span class="calc-slot-empty">drop here to lock a zero</span>'}</div>
        </div>
        <div class="calc-pool" data-kind="${kind}">
            <span class="calc-pool-label">Simulated by the model</span>
            <div class="calc-pool-chips">${poolChips}</div>
        </div>
    </div>`;
}

function renderCarousel() {
    const race = calcState.remainingRaces[calcCurrentRaceIndex];
    const total = calcState.remainingRaces.length;

    const boards = (race.isSprint ? ['sprint', 'gp'] : ['gp'])
        .map(kind => boardHtml(race, kind)).join('');

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
            <span class="calc-race-label">Round ${race.round} — ${sanitizeHTML(race.name)}${race.isSprint ? ' (Sprint weekend)' : ''}</span>
            <button id="calcNextRace" ${calcCurrentRaceIndex === total - 1 ? 'disabled' : ''}>Next &rsaquo;</button>
        </div>
        <div class="calc-boards ${race.isSprint ? 'calc-boards-split' : ''}" style="opacity:${REDUCE_MOTION ? '1' : '0'};">${boards}</div>
        <p class="calc-drag-help">Drag a driver into a position — or tap a driver to drop them into the first free spot. Tap a placed driver to send them back to the pool, or drop them on the zero-points zone to lock a DNF.</p>
        <div class="calc-race-chips-row">
            <div class="calc-race-chips">${chips}</div>
            <button class="calc-reset-btn" id="calcResetScenario" title="Clear every locked race and return to the current live standings" ${hasAnyScenario ? '' : 'disabled'}>&#8635; Reset to current</button>
        </div>`;

    document.getElementById('calcPrevRace').onclick = () => { calcCurrentRaceIndex--; renderCarousel(); };
    document.getElementById('calcNextRace').onclick = () => { calcCurrentRaceIndex++; renderCarousel(); };
    document.querySelectorAll('.calc-race-chip').forEach(chip => {
        chip.onclick = () => { calcCurrentRaceIndex = parseInt(chip.dataset.index); renderCarousel(); };
    });
    document.getElementById('calcResetScenario').onclick = () => {
        calcState.scenario = {}; // clears every locked race for every driver, back to live standings
        renderCarousel();
        recomputeResults();
    };

    wireBoardDrag(section);

    // Quick crossfade so a race/tab switch reads as a response, not a hard swap.
    if (!REDUCE_MOTION) {
        const boardsEl = section.querySelector('.calc-boards');
        requestAnimationFrame(() => requestAnimationFrame(() => { boardsEl.style.opacity = '1'; }));
    }
}

// --- Pointer drag + tap interaction -----------------------------------------
// Pointer events (not HTML5 drag-and-drop) so the same code path works for mouse
// and touch. A gesture under DRAG_THRESHOLD_PX counts as a tap instead.

const DRAG_THRESHOLD_PX = 6;
let calcDrag = null;

function wireBoardDrag(section) {
    if (section.dataset.dragWired) return; // section element is static; only wire once
    section.dataset.dragWired = '1';

    section.addEventListener('pointerdown', e => {
        if (e.button !== undefined && e.button !== 0) return;
        if (calcDrag) return; // a second finger mid-drag just gets ignored
        const chip = e.target.closest('.calc-chip');
        if (!chip) return;
        e.preventDefault();
        calcDrag = {
            pointerId: e.pointerId,
            chipEl: chip,
            driverId: chip.dataset.driver,
            fromKind: chip.dataset.kind,
            fromLoc: chip.dataset.loc,
            fromPos: chip.dataset.pos ? parseInt(chip.dataset.pos, 10) : null,
            startX: e.clientX,
            startY: e.clientY,
            moved: false,
            ghost: null,
            hotTarget: null
        };
        try { chip.setPointerCapture(e.pointerId); } catch (err) { /* capture is best-effort */ }
    });

    section.addEventListener('pointermove', e => {
        if (!calcDrag || e.pointerId !== calcDrag.pointerId) return;
        if (!calcDrag.moved) {
            if (Math.hypot(e.clientX - calcDrag.startX, e.clientY - calcDrag.startY) < DRAG_THRESHOLD_PX) return;
            calcDrag.moved = true;
            startGhost(e);
        }
        moveGhost(e.clientX, e.clientY);
        highlightTarget(e.clientX, e.clientY);
    });

    section.addEventListener('pointerup', e => {
        if (!calcDrag || e.pointerId !== calcDrag.pointerId) return;
        const drag = calcDrag;
        calcDrag = null;
        cleanupDragVisuals(drag);
        if (!drag.moved) { handleChipTap(drag); return; }
        const target = dropTargetAt(e.clientX, e.clientY);
        if (!target) { renderCarousel(); return; } // dropped nowhere useful - snap back cleanly
        applyDrop(drag, target);
    });

    section.addEventListener('pointercancel', e => {
        if (!calcDrag || e.pointerId !== calcDrag.pointerId) return;
        const drag = calcDrag;
        calcDrag = null;
        cleanupDragVisuals(drag);
        renderCarousel();
    });

    // Long-press on touch would otherwise open the context menu mid-drag.
    section.addEventListener('contextmenu', e => {
        if (e.target.closest('.calc-chip')) e.preventDefault();
    });

    // Keyboard equivalents: Enter/Space = tap-to-place/remove; arrows nudge a
    // placed driver one slot up/down (swapping with whoever sits there).
    section.addEventListener('keydown', e => {
        const chip = e.target.closest('.calc-chip');
        if (!chip) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleChipTap({ driverId: chip.dataset.driver, fromKind: chip.dataset.kind, fromLoc: chip.dataset.loc });
            return;
        }
        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && chip.dataset.loc === 'slot') {
            e.preventDefault();
            const pos = parseInt(chip.dataset.pos, 10);
            const kind = chip.dataset.kind;
            const to = e.key === 'ArrowUp' ? pos - 1 : pos + 1;
            if (to >= 1 && to <= BOARD_META[kind].slots) {
                const target = section.querySelector(`.calc-slot[data-kind="${kind}"][data-pos="${to}"]`);
                if (target) applyDrop({ driverId: chip.dataset.driver, fromKind: kind, fromLoc: 'slot', fromPos: pos }, target);
            }
        }
    });
}

function startGhost(e) {
    const src = calcDrag.chipEl;
    const rect = src.getBoundingClientRect();
    const ghost = src.cloneNode(true);
    ghost.classList.add('calc-chip-ghost');
    ghost.style.width = rect.width + 'px';
    document.body.appendChild(ghost);
    src.classList.add('calc-chip-lifted');
    document.body.classList.add('calc-dragging');
    calcDrag.ghost = ghost;
    calcDrag.grabDX = e.clientX - rect.left;
    calcDrag.grabDY = e.clientY - rect.top;
    moveGhost(e.clientX, e.clientY);
}

function moveGhost(x, y) {
    calcDrag.ghost.style.left = (x - calcDrag.grabDX) + 'px';
    calcDrag.ghost.style.top = (y - calcDrag.grabDY) + 'px';
}

function dropTargetAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el && el.closest ? el.closest('.calc-slot, .calc-dnf, .calc-pool') : null;
}

function highlightTarget(x, y) {
    const target = dropTargetAt(x, y);
    if (target === calcDrag.hotTarget) return;
    if (calcDrag.hotTarget) calcDrag.hotTarget.classList.remove('drop-hot');
    calcDrag.hotTarget = target;
    if (target) target.classList.add('drop-hot');
}

function cleanupDragVisuals(drag) {
    if (drag.ghost) drag.ghost.remove();
    if (drag.hotTarget) drag.hotTarget.classList.remove('drop-hot');
    drag.chipEl.classList.remove('calc-chip-lifted');
    document.body.classList.remove('calc-dragging');
}

// Tap (no drag): a pool chip goes to the first free slot on its board (or the
// zero-points zone if every slot is taken); a placed chip goes back to the pool.
function handleChipTap(drag) {
    const race = calcState.remainingRaces[calcCurrentRaceIndex];
    const kind = drag.fromKind;
    if (drag.fromLoc === 'pool') {
        const meta = BOARD_META[kind];
        let freeSlot = null;
        for (let pos = 1; pos <= meta.slots; pos++) {
            if (!driverAtPosition(race, kind, pos)) { freeSlot = pos; break; }
        }
        setBoardValue(drag.driverId, race.round, kind, freeSlot !== null ? freeSlot : null);
    } else {
        setBoardValue(drag.driverId, race.round, kind, undefined);
    }
    renderCarousel();
    recomputeResults();
}

// Resolves a completed drop. An empty slot takes the driver; an occupied slot
// swaps (same board) or displaces the occupant back to the pool (the dragged
// driver came from the pool, the DNF zone, or the other board). The zero-points
// zone accepts any number of drivers; dropping on a pool clears that board.
function applyDrop(drag, target) {
    const race = calcState.remainingRaces[calcCurrentRaceIndex];
    const toKind = target.dataset.kind;
    const isSlot = target.classList.contains('calc-slot');
    const isDnf = target.classList.contains('calc-dnf');
    const toPos = isSlot ? parseInt(target.dataset.pos, 10) : null;

    const sameOrigin = drag.fromKind === toKind && (
        (isSlot && drag.fromLoc === 'slot' && drag.fromPos === toPos) ||
        (isDnf && drag.fromLoc === 'dnf') ||
        (!isSlot && !isDnf && drag.fromLoc === 'pool'));
    const occupant = isSlot ? driverAtPosition(race, toKind, toPos) : null;
    if (sameOrigin || (occupant && occupant.id === drag.driverId)) { renderCarousel(); return; }

    if (drag.fromLoc !== 'pool') setBoardValue(drag.driverId, race.round, drag.fromKind, undefined);

    if (isSlot) {
        if (occupant) {
            if (drag.fromLoc === 'slot' && drag.fromKind === toKind) {
                setBoardValue(occupant.id, race.round, toKind, drag.fromPos); // straight swap
            } else {
                setBoardValue(occupant.id, race.round, toKind, undefined); // displaced back to the pool
            }
        }
        setBoardValue(drag.driverId, race.round, toKind, toPos);
    } else if (isDnf) {
        setBoardValue(drag.driverId, race.round, toKind, null);
    } else { // pool strip
        setBoardValue(drag.driverId, race.round, toKind, undefined);
    }

    renderCarousel();
    recomputeResults();
}

function recomputeResults() {
    const drivers = calcState.drivers;
    if (!drivers || drivers.length < 2) {
        renderResults(drivers || [], {}, {}, false, {}, null);
        return;
    }
    const remaining = calcState.remainingRaces;

    // Points after applying every locked result for every driver. Lock entries can
    // be partial on sprint weekends (only the side the user actually set on a board),
    // so each key is checked for presence: absent = that side is simulated, null =
    // locked at zero points.
    const pointsNow = {};
    drivers.forEach(d => {
        let pts = d.currentPoints;
        remaining.forEach(r => {
            const locked = calcState.scenario[d.id]?.[r.round];
            if (!locked) return;
            if ('gpPosition' in locked) pts += ChampionshipCalc.gpPointsFor(locked.gpPosition);
            if (r.isSprint && 'sprintPosition' in locked) pts += ChampionshipCalc.sprintPointsFor(locked.sprintPosition);
        });
        pointsNow[d.id] = pts;
    });

    const leaderId = drivers.reduce((a, b) => (pointsNow[a.id] >= pointsNow[b.id] ? a : b)).id;
    const leaderPoints = pointsNow[leaderId];

    // Elimination asks "even a perfect run can't catch the leader?" against only the
    // points still on the table for that driver. Partial locks leave one side of a
    // sprint weekend open, so availability is computed per race, not per race count.
    const carsPerEntity = calcMode === 'constructors' ? 2 : 1;

    const eliminated = {};
    drivers.forEach(d => {
        if (d.id === leaderId) { eliminated[d.id] = false; return; }
        const availableMax = ChampionshipCalc.availablePointsRemaining(remaining, calcState.scenario[d.id], carsPerEntity);
        eliminated[d.id] = ChampionshipCalc.checkEliminationFromAvailable(pointsNow[d.id], leaderPoints, availableMax);
    });
    const isChampion = leaderId && drivers.every(d => d.id === leaderId || eliminated[d.id]);

    // Monte Carlo only simulates each driver's still-open sides: a board position
    // locks that side at an exact result, anything left in the pool is resampled.
    const simDrivers = drivers.map(d => ({
        id: d.id,
        currentPoints: pointsNow[d.id],
        eliminated: eliminated[d.id],
        history: d.history,
        races: remaining.map(r => {
            const locked = calcState.scenario[d.id]?.[r.round];
            const gpLocked = !!locked && 'gpPosition' in locked;
            const sprintLocked = !!locked && r.isSprint && 'sprintPosition' in locked;
            return {
                isSprint: r.isSprint,
                gpLocked,
                gpPosition: gpLocked ? locked.gpPosition : undefined,
                sprintLocked,
                sprintPosition: sprintLocked ? locked.sprintPosition : undefined
            };
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
            const gpLocked = !!locked && 'gpPosition' in locked;
            const sprintLocked = !!locked && r.isSprint && 'sprintPosition' in locked;
            return {
                isSprint: r.isSprint,
                gpLocked,
                gpPosition: gpLocked ? locked.gpPosition : undefined,
                sprintLocked,
                sprintPosition: sprintLocked ? locked.sprintPosition : undefined
            };
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

        // Availability is computed per race (not per count) so partially-locked sprint
        // weekends contribute only the side the user left open.
        const carsPerEntity = calcMode === 'constructors' ? 2 : 1;
        const ceiling = ChampionshipCalc.availablePointsRemaining(
            calcState.remainingRaces, calcState.scenario[exploreDriver.id], carsPerEntity);
        const boundary = ChampionshipCalc.titleBoundaryFromAvailable(
            pointsNow[exploreDriver.id], pointsNow[opponent.id], ceiling
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

    // A round where the rival locked every board still open for points doesn't
    // count toward "rounds still open" for the required-result sentence.
    const remainingRaceCount = calcState.remainingRaces.filter(r =>
        ChampionshipCalc.raceMaxAvailable(r.isSprint, calcState.scenario[rival.id]?.[r.round]) > 0).length;
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

// Reveals the app shell and renders standings the moment they're ready, with a
// placeholder for the carousel/results sections (which need the slower
// schedule/full-season-results/sprint fetches too) instead of waiting for
// everything before showing anything real.
function showStandingsEarly(quickDrivers) {
    document.getElementById('calcLoading').style.display = 'none';
    document.getElementById('calcApp').style.display = 'block';
    renderStandings(quickDrivers);
    const carouselSection = document.getElementById('calcCarouselSection');
    if (!carouselSection.dataset.ready) {
        carouselSection.innerHTML = '<p style="color:rgba(255,255,255,0.5);padding:10px 0;">Loading the remaining race calendar…</p>';
    }
}

async function switchCalcMode(mode) {
    calcMode = mode;
    document.getElementById('calcTabDrivers').classList.toggle('active', mode === 'drivers');
    document.getElementById('calcTabConstructors').classList.toggle('active', mode === 'constructors');
    document.getElementById('calcCarouselSection').removeAttribute('data-ready');

    // Guard against a rapid double-click starting a second switch before the first
    // one's fetch resolves - without this, an older, slower-resolving fetch could
    // overwrite calcState *after* a newer click already settled on the other mode,
    // leaving calcMode and calcState.drivers referring to two different modes (which
    // would silently break the carsPerEntity elimination math below).
    const myRequestId = ++calcModeRequestId;
    const onStandingsReady = (quickDrivers) => {
        if (myRequestId !== calcModeRequestId) return; // a newer switch has since started
        showStandingsEarly(quickDrivers);
    };
    const data = mode === 'drivers'
        ? await loadChampionshipCalcData(12, onStandingsReady)
        : await loadConstructorCalcData(8, onStandingsReady);
    if (myRequestId !== calcModeRequestId) return; // a newer switchCalcMode call has since started - drop this stale result

    calcState = { ...data, scenario: {} };
    calcCurrentRaceIndex = 0;
    document.getElementById('calcCarouselSection').dataset.ready = 'true';
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
        // Standings-ready already revealed calcApp/hid calcLoading in the common case -
        // these two lines only do anything on the rare path where the whole load
        // finished so fast the early callback and the final render landed together,
        // or (more importantly) they're harmless no-ops otherwise since both elements
        // are already in their target state by the time we get here.
        document.getElementById('calcLoading').style.display = 'none';
        document.getElementById('calcApp').style.display = 'block';
    } catch (err) {
        const loading = document.getElementById('calcLoading');
        // If standings already rendered successfully before the slower fetches failed,
        // don't tear the whole app back down to a bare error screen - the standings
        // the user can already see are still real and correct, only the carousel/
        // results (which need the rest of the data) never arrived.
        if (document.getElementById('calcApp').style.display === 'block') {
            document.getElementById('calcCarouselSection').innerHTML =
                `<p style="color:#ff6b6b;padding:10px 0;">Couldn't load the race calendar/results data: ${sanitizeHTML(err.message)}. Standings above are still live.</p>`;
        } else {
            document.getElementById('calcApp').style.display = 'none';
            loading.style.display = 'block';
            loading.textContent = 'Failed to load live data: ' + err.message;
        }
    }
}

document.addEventListener('DOMContentLoaded', initChampionshipCalculator);
