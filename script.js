// FormulaNews - F1wow Website Script

// Utility: Sanitize HTML to prevent XSS attacks
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// F1 API Endpoints - Primary and backup
const API_BASE = 'https://api.jolpi.ca/ergast/f1';
const CURRENT_YEAR = 2026;

// Cached JSON fetch — jolpica allows ~500 req/hr/IP; cache 5 min per URL in localStorage
async function cachedJson(url, ttlMs = 5 * 60 * 1000) {
    const key = 'f1wow_api_' + url;
    try {
        const hit = JSON.parse(localStorage.getItem(key));
        if (hit && Date.now() - hit.t < ttlMs) return hit.d;
    } catch (e) { /* corrupt entry — refetch */ }
    const res = await fetch(url);
    if (!res.ok) throw new Error('API request failed: ' + url);
    const data = await res.json();
    try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch (e) { /* storage full */ }
    return data;
}

// Team color mapping (2026 teams)
const teamColors = {
    'Red Bull Racing': 'team-redbull',
    'Ferrari': 'team-ferrari',
    'Mercedes': 'team-mercedes',
    'McLaren': 'team-mclaren',
    'Aston Martin': 'team-astonmartin',
    'Alpine': 'team-alpine',
    'Williams': 'team-williams',
    'RB': 'team-alphatauri',
    'Racing Bulls': 'team-alphatauri',
    'AlphaTauri': 'team-alphatauri',
    'Alfa Romeo': 'team-alfaromeo',
    'Kick Sauber': 'team-alfaromeo',
    'Sauber': 'team-alfaromeo',
    'Audi': 'team-alfaromeo',
    'Haas F1 Team': 'team-haas',
    'Haas': 'team-haas',
    'Cadillac': 'team-haas'
};

// Team logo CSS classes
const teamLogos = {
    'Red Bull Racing': 'logo-rbr',
    'Ferrari': 'logo-fer',
    'Mercedes': 'logo-mer',
    'McLaren': 'logo-mcl',
    'Aston Martin': 'logo-ast',
    'Alpine': 'logo-alp',
    'Williams': 'logo-wil',
    'RB': 'logo-rbt',
    'Racing Bulls': 'logo-rbt',
    'AlphaTauri': 'logo-rbt',
    'Sauber': 'logo-sau',
    'Audi': 'logo-aud',
    'Haas F1 Team': 'logo-haas',
    'Haas': 'logo-haas',
    'Cadillac': 'logo-cad'
};

// Team short names for display
const teamShortNames = {
    'Red Bull Racing': 'RBR',
    'Ferrari': 'FER',
    'Mercedes': 'MER',
    'McLaren': 'MCL',
    'Aston Martin': 'AST',
    'Alpine': 'ALP',
    'Williams': 'WIL',
    'RB': 'RBT',
    'Racing Bulls': 'RBT',
    'AlphaTauri': 'RBT',
    'Sauber': 'STK',
    'Audi': 'AUD',
    'Haas F1 Team': 'HAA',
    'Haas': 'HAA',
    'Cadillac': 'CAD'
};

// 2026 Race Calendar
const RACE_SCHEDULE_2026 = [
    { round: 1, name: 'Australia', location: 'Melbourne', date: 'Mar 6-8', completed: true, winner: 'George Russell', sprint: false },
    { round: 2, name: 'China', location: 'Shanghai', date: 'Mar 13-15', completed: true, winner: 'Kimi Antonelli', sprintWinner: 'George Russell' },
    { round: 3, name: 'Japan', location: 'Suzuka', date: 'Mar 27-29', completed: true, winner: 'Kimi Antonelli', sprint: false },
    { round: 4, name: 'Miami', location: 'Miami', date: 'May 1-3', completed: true, winner: 'Kimi Antonelli', sprintWinner: 'Lando Norris' },
    { round: 5, name: 'Canada', location: 'Montreal', date: 'May 22-24', completed: true, winner: 'Kimi Antonelli', sprintWinner: 'George Russell' },
    { round: 6, name: 'Monaco', location: 'Monte Carlo', date: 'Jun 5-7', completed: true, winner: 'Kimi Antonelli' },
    { round: 7, name: 'Spain', location: 'Barcelona', date: 'Jun 12-14', completed: true, winner: 'Lewis Hamilton' },
    { round: 8, name: 'Austria', location: 'Spielberg', date: 'Jun 26-28', completed: true },
    { round: 9, name: 'Great Britain', location: 'Silverstone', date: 'Jul 3-5', completed: true },
    { round: 10, name: 'Belgium', location: 'Spa', date: 'Jul 17-19', completed: false, next: true },
    { round: 11, name: 'Hungary', location: 'Budapest', date: 'Jul 24-26', completed: false },
    { round: 12, name: 'Netherlands', location: 'Zandvoort', date: 'Aug 21-23', completed: false },
    { round: 13, name: 'Italy', location: 'Monza', date: 'Sep 4-6', completed: false },
    { round: 14, name: 'Spain', location: 'Madrid', date: 'Sep 11-13', completed: false },
    { round: 15, name: 'Azerbaijan', location: 'Baku', date: 'Sep 24-26', completed: false },
    { round: 16, name: 'Malaysia', location: 'Sepang', date: 'Oct 2-4', completed: false },
    { round: 17, name: 'Singapore', location: 'Marina Bay', date: 'Oct 9-11', completed: false },
    { round: 18, name: 'United States', location: 'Austin', date: 'Oct 23-25', completed: false },
    { round: 19, name: 'Mexico', location: 'Mexico City', date: 'Oct 30 - Nov 1', completed: false },
    { round: 20, name: 'Brazil', location: 'São Paulo', date: 'Nov 6-8', completed: false },
    { round: 21, name: 'Las Vegas', location: 'Las Vegas', date: 'Nov 19-21', completed: false },
    { round: 22, name: 'Qatar', location: 'Lusail', date: 'Nov 27-29', completed: false },
    { round: 23, name: 'Abu Dhabi', location: 'Yas Marina', date: 'Dec 4-6', completed: false }
];

// 2026 Grid Helper
async function fetchDriverStandings() {
    const container = document.getElementById('driverStandings');
    if (!container) return;
    try {
        const data = await cachedJson(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`);

        const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
        if (!standings) {
            throw new Error('Invalid data structure');
        }

        displayDriverStandings(standings);
    } catch (error) {
        console.error('Error fetching driver standings:', error);
        displayFallbackStandings(container, 'driver');
    }
}

// Display driver standings
function displayDriverStandings(standings) {
    const container = document.getElementById('driverStandings');
    if (!container) return;

    const html = standings.map(driver => {
        const teamName = driver.Constructors?.[0]?.name || 'Unknown';
        const logoClass = teamLogos[teamName] || '';
        const shortName = teamShortNames[teamName] || teamName.substring(0, 3).toUpperCase();

        return `
            <a class="standing-item" href="driver-${encodeURIComponent(driver.Driver.driverId)}.html">
                <div class="standing-position">${driver.position}</div>
                <div class="team-logo ${logoClass}">${shortName}</div>
                <div class="standing-info">
                    <div>
                        <div class="standing-name">${sanitizeHTML(driver.Driver.givenName + ' ' + driver.Driver.familyName)}</div>
                        <div style="font-size: 0.75rem; color: var(--f1-light-gray);">${sanitizeHTML(teamName)}</div>
                    </div>
                </div>
                <div class="standing-points">${driver.points} pts</div>
                <svg class="standing-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            </a>
        `;
    }).join('');
    container.innerHTML = html;
}

// Fetch constructor standings
async function fetchConstructorStandings() {
    const container = document.getElementById('constructorStandings');
    if (!container) return;
    try {
        const data = await cachedJson(`${API_BASE}/${CURRENT_YEAR}/constructorstandings.json`);

        const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
        if (!standings) {
            throw new Error('Invalid data structure');
        }

        displayConstructorStandings(standings);
    } catch (error) {
        console.error('Error fetching constructor standings:', error);
        displayFallbackStandings(container, 'constructor');
    }
}

// Display constructor standings
function displayConstructorStandings(standings) {
    const container = document.getElementById('constructorStandings');
    if (!container) return;

    const html = standings.map(team => {
        const logoClass = teamLogos[team.Constructor.name] || '';
        const shortName = teamShortNames[team.Constructor.name] || team.Constructor.name.substring(0, 3).toUpperCase();

        return `
            <a class="standing-item" href="team-${encodeURIComponent(team.Constructor.constructorId)}.html">
                <div class="standing-position">${team.position}</div>
                <div class="team-logo ${logoClass}">${shortName}</div>
                <div class="standing-info">
                    <div class="standing-name">${sanitizeHTML(team.Constructor.name)}</div>
                </div>
                <div class="standing-points">${team.points} pts</div>
                <svg class="standing-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            </a>
        `;
    }).join('');
    container.innerHTML = html;
}

// Fallback standings when API fails - Official 2026 standings after Canada GP
// Australia GP Results: 1.Russell 25, 2.Antonelli 18, 3.Leclerc 15, 4.Hamilton 12, 5.Norris 10, 6.Piastri 8, 7.Verstappen 6, 8.Sainz 4, 9.Albon 2, 10.Alonso 1
// China GP Sprint Results: 1.Russell 8, 2.Antonelli 7, 3.Norris 6, 4.Leclerc 5, 5.Hamilton 4, 6.Verstappen 3, 7.Piastri 2, 8.Sainz 1
// China GP Race Results: 1.Antonelli 25, 2.Russell 18, 3.Hamilton 15, 4.Norris 10, 5.Piastri 8, 6.Leclerc 6, 7.Hulkenberg 4, 8.Ocon 2, 9.Bearman 1
// Japan GP Race Results: 1.Antonelli 25, 2.Piastri 18, 3.Leclerc 15, 4.Russell 12, 5.Norris 10, 6.Hamilton 8, 7.Gasly 6, 8.Verstappen 4, 9.Lawson 2, 10.Ocon 1
// Miami GP Sprint Results: 1.Norris 8, 2.Piastri 7, 3.Leclerc 6, 4.Russell 5, 5.Verstappen 4, 6.Antonelli 3, 7.Hamilton 2, 8.Gasly 1
// Miami GP Race Results: 1.Antonelli 25, 2.Norris 18, 3.Piastri 15, 4.Russell 12, 5.Verstappen 10, 6.Hamilton 8, 7.Colapinto 6, 8.Leclerc 4, 9.Sainz 2, 10.Albon 1
// Canada GP Sprint Results: 1.Russell 8, 2.Norris 7, 3.Antonelli 6, 4.Piastri 5, 5.Leclerc 4, 6.Hamilton 3, 7.Verstappen 2, 8.Lindblad 1
// Canada GP Race Results: 1.Antonelli 25, 2.Hamilton 18, 3.Verstappen 15, 4.Leclerc 12, 5.Hadjar 10, 6.Colapinto 8, 7.Lawson 6, 8.Gasly 4, 9.Sainz 2, 10.Bearman 1
function displayFallbackStandings(container, type) {
    if (!container) return;

    const fallbackData = {
        driver: [
            { position: 1, name: 'Kimi Antonelli', team: 'Mercedes', points: 131 },
            { position: 2, name: 'George Russell', team: 'Mercedes', points: 88 },
            { position: 3, name: 'Charles Leclerc', team: 'Ferrari', points: 75 },
            { position: 4, name: 'Lewis Hamilton', team: 'Ferrari', points: 72 },
            { position: 5, name: 'Lando Norris', team: 'McLaren', points: 58 },
            { position: 6, name: 'Oscar Piastri', team: 'McLaren', points: 48 },
            { position: 7, name: 'Max Verstappen', team: 'Red Bull Racing', points: 43 },
            { position: 8, name: 'Pierre Gasly', team: 'Alpine', points: 20 },
            { position: 9, name: 'Oliver Bearman', team: 'Haas F1 Team', points: 18 },
            { position: 10, name: 'Liam Lawson', team: 'Racing Bulls', points: 16 },
            { position: 11, name: 'Franco Colapinto', team: 'Alpine', points: 15 },
            { position: 12, name: 'Isack Hadjar', team: 'Red Bull Racing', points: 14 },
            { position: 13, name: 'Carlos Sainz', team: 'Williams', points: 6 },
            { position: 14, name: 'Arvid Lindblad', team: 'Racing Bulls', points: 5 },
            { position: 15, name: 'Gabriel Bortoleto', team: 'Audi', points: 2 },
            { position: 16, name: 'Esteban Ocon', team: 'Haas F1 Team', points: 1 },
            { position: 17, name: 'Alexander Albon', team: 'Williams', points: 1 },
            { position: 18, name: 'Nico Hulkenberg', team: 'Audi', points: 0 },
            { position: 19, name: 'Valtteri Bottas', team: 'Cadillac', points: 0 },
            { position: 20, name: 'Sergio Perez', team: 'Cadillac', points: 0 },
            { position: 21, name: 'Lance Stroll', team: 'Aston Martin', points: 0 },
            { position: 22, name: 'Fernando Alonso', team: 'Aston Martin', points: 0 }
        ],
        constructor: [
            { position: 1, name: 'Mercedes', points: 219 },
            { position: 2, name: 'Ferrari', points: 147 },
            { position: 3, name: 'McLaren', points: 106 },
            { position: 4, name: 'Red Bull Racing', points: 57 },
            { position: 5, name: 'Alpine', points: 35 },
            { position: 6, name: 'Racing Bulls', points: 21 },
            { position: 7, name: 'Haas F1 Team', points: 19 },
            { position: 8, name: 'Williams', points: 7 },
            { position: 9, name: 'Audi', points: 2 },
            { position: 10, name: 'Cadillac', points: 0 },
            { position: 11, name: 'Aston Martin', points: 0 }
        ]
    };

    const data = fallbackData[type];
    const html = data.map(item => {
        const logoClass = teamLogos[item.team] || teamLogos[item.name] || '';
        const shortName = teamShortNames[item.team] || teamShortNames[item.name] || item.name.substring(0, 3).toUpperCase();
        const displayTeam = type === 'driver' ? item.team : '';

        return `
            <div class="standing-item">
                <div class="standing-position">${item.position}</div>
                <div class="team-logo ${logoClass}">${shortName}</div>
                <div class="standing-info">
                    <div>
                        <div class="standing-name">${item.name}</div>
                        ${displayTeam ? `<div style="font-size: 0.75rem; color: var(--f1-light-gray);">${displayTeam}</div>` : ''}
                    </div>
                </div>
                <div class="standing-points">${item.points} pts</div>
            </div>
        `;
    }).join('');

    container.innerHTML = html + `
        <div style="padding: 15px 25px; font-size: 0.75rem; color: var(--f1-red); font-style: italic; text-align: center;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 5px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            Updated: After Canadian GP 2026 (includes Sprint results)
        </div>
    `;
}

// Load and display race schedule from live API
async function loadRaceSchedule() {
    const container = document.getElementById('raceSchedule');
    if (!container) return;

    try {
        // Fetch schedule and results in parallel (cached)
        const [schedData, resData] = await Promise.all([
            cachedJson(`${API_BASE}/${CURRENT_YEAR}.json`),
            cachedJson(`${API_BASE}/${CURRENT_YEAR}/results/1.json?limit=100`).catch(() => null)
        ]);
        const races = schedData?.MRData?.RaceTable?.Races || [];

        // Malaysia confirmed for 2026 at Sepang (Oct 2-4), slotting between Azerbaijan and Singapore.
        // Not yet present in the Ergast feed, so inject it and keep the list chronologically sorted.
        // (F1/FIA confirmation, July 2026; officially titled the "Gulf Air Bahrain Grand Prix".)
        if (!races.some(r => r.Circuit?.Location?.country === 'Malaysia')) {
            races.push({
                round: '16',
                raceName: 'Malaysian Grand Prix',
                date: '2026-10-04',
                time: '15:00:00Z',
                Circuit: { Location: { locality: 'Kuala Lumpur', country: 'Malaysia' } }
            });
        }
        races.sort((a, b) => new Date(a.date) - new Date(b.date));

        let resultsMap = {};
        if (resData) {
            const raceResults = resData?.MRData?.RaceTable?.Races || [];
            raceResults.forEach(r => {
                const winner = r.Results?.[0];
                if (winner) resultsMap[r.round] = winner.Driver.familyName;
            });
        }

        // Create fallback map from hardcoded schedule data for races not in API
        const fallbackMap = {};
        RACE_SCHEDULE_2026.forEach(race => {
            if (race.completed && race.winner) {
                fallbackMap[race.round] = race.winner;
            }
        });

        const now = new Date();
        let nextFound = false;

        const html = races.map((race, idx) => {
            const raceDate = new Date(race.date + 'T' + (race.time || '14:00:00Z'));
            const round = idx + 1; // chronological position (Malaysia inserted before Singapore)

            // Use API result if available, otherwise fall back to hardcoded data
            const winner = resultsMap[race.round] || fallbackMap[race.round];
            const completed = !!winner;
            const isNext = !completed && !nextFound && raceDate > now;
            if (isNext) nextFound = true;

            let statusClass = '', badgeClass = '', badgeText = '';
            if (completed) {
                statusClass = 'completed'; badgeClass = 'completed';
                badgeText = `Winner: ${sanitizeHTML(winner)}`;
            } else if (isNext) {
                statusClass = 'next-race'; badgeClass = 'next';
                badgeText = 'NEXT RACE';
            } else {
                statusClass = 'upcoming'; badgeClass = 'upcoming';
                badgeText = `Round ${round}`;
            }

            const dateStr = raceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const daysAway = isNext ? Math.max(0, Math.ceil((raceDate - now) / 86400000)) : null;

            return `
                <a class="race-card ${statusClass}" style="${!completed ? 'cursor:default;' : ''}">
                    <div class="race-round">R${round}</div>
                    <div class="race-info">
                        <div class="race-name">${sanitizeHTML(race.raceName)}</div>
                        <div class="race-date">${dateStr}${daysAway !== null ? `<span class="race-countdown">${daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `In ${daysAway} days`}</span>` : ''}</div>
                    </div>
                    <span class="race-badge ${badgeClass}">${badgeText}</span>
                </a>
            `;
        }).join('');

        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading schedule:', error);
        loadFallbackSchedule(container);
    }
}

// Fallback if API fails
function loadFallbackSchedule(container) {
    if (!container) return;
    const html = RACE_SCHEDULE_2026.map(race => {
        let statusClass = '', badgeClass = '', badgeText = '';
        if (race.cancelled) { statusClass = 'cancelled'; badgeClass = 'cancelled'; badgeText = 'CANCELLED'; }
        else if (race.completed) { statusClass = 'completed'; badgeClass = 'completed'; badgeText = race.winner ? `Winner: ${race.winner}` : 'Completed'; }
        else if (race.next) { statusClass = 'next-race'; badgeClass = 'next'; badgeText = 'NEXT RACE'; }
        else { statusClass = 'upcoming'; badgeClass = 'upcoming'; badgeText = 'Round ' + race.round; }
        return `
            <a class="race-card ${statusClass}" style="cursor:default;">
                <div class="race-round">R${race.round}</div>
                <div class="race-info"><div class="race-name">${race.name} GP</div><div class="race-date">${race.date}</div></div>
                <span class="race-badge ${badgeClass}">${badgeText}</span>
            </a>`;
    }).join('');
    container.innerHTML = html;
}

// ============================================
// UX IMPROVEMENTS
// ============================================

// Back to Top Button
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;

    // Show/hide button based on scroll position (passive + rAF-throttled = smooth scroll)
    let btTicking = false;
    window.addEventListener('scroll', () => {
        if (btTicking) return;
        btTicking = true;
        requestAnimationFrame(() => {
            backToTop.classList.toggle('visible', window.pageYOffset > 300);
            btTicking = false;
        });
    }, { passive: true });

    // Smooth scroll to top on click
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Scroll Animations — cinematic staggered fade-up via GSAP ScrollTrigger,
// with a CSS-only fallback if motion is reduced or GSAP fails to load.
// See DESIGN.md "Motion": reduced-motion is checked once, globally, gating
// every GSAP call rather than per-animation.
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.article-preview-card, .standings-card, .schedule-card, .section-header');
    if (!revealElements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gsapReady = !prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    if (!gsapReady) {
        // Original CSS-driven fade: also the reduced-motion-safe path, since the
        // sitewide prefers-reduced-motion media query already neutralizes the
        // underlying CSS transition.
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible', 'fade-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach((el, index) => {
            el.classList.add('fade-in', `stagger-${(index % 5) + 1}`);
            observer.observe(el);
        });
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    revealElements.forEach((el, index) => {
        gsap.fromTo(el,
            { opacity: 0, y: 28, filter: 'blur(6px)' },
            {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.7,
                ease: 'power2.out',
                delay: (index % 5) * 0.06,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true
                }
            }
        );
    });
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchTags = document.querySelectorAll('.search-tag');
    const searchResults = document.getElementById('searchResults');
    const articlesGrid = document.getElementById('articlesGrid');
    const searchToggle = document.getElementById('searchToggle');
    const searchFilters = document.getElementById('searchFilters');

    // Search toggle button
    if (searchToggle && searchFilters) {
        searchToggle.addEventListener('click', () => {
            searchFilters.classList.toggle('expanded');
            searchToggle.classList.toggle('active');
        });
    }

    // Store article data for search
    if (!articlesGrid) return;

    const articles = Array.from(articlesGrid.querySelectorAll('.article-preview-card')).map(card => ({
        card,
        title: card.querySelector('.article-preview-title')?.textContent.toLowerCase() || '',
        excerpt: card.querySelector('.article-preview-excerpt')?.textContent.toLowerCase() || '',
        category: card.querySelector('.preview-category')?.textContent.toLowerCase() || '',
        driver: card.querySelector('.preview-driver')?.textContent.toLowerCase() || '',
        event: card.querySelector('.preview-event')?.textContent.toLowerCase() || '',
        tags: card.querySelector('.preview-driver')?.textContent.toLowerCase() || ''
    }));

    let currentFilter = 'all';

    // Search input handler
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        searchClear.style.display = query ? 'block' : 'none';

        if (query === '') {
            showAllArticles();
            searchResults.innerHTML = '';
            return;
        }

        filterArticles(query, currentFilter);
    });

    // Clear button handler
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        showAllArticles();
        searchResults.innerHTML = '';
    });

    // Tag filter handlers
    searchTags.forEach(tag => {
        tag.addEventListener('click', () => {
            searchTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            currentFilter = tag.dataset.filter;

            const query = searchInput.value.toLowerCase().trim();
            if (query === '') {
                filterByTag(currentFilter);
            } else {
                filterArticles(query, currentFilter);
            }
        });
    });

    function showAllArticles() {
        articles.forEach(article => {
            article.card.style.display = 'flex';
        });
    }

    function filterByTag(filter) {
        if (filter === 'all') {
            showAllArticles();
        } else {
            articles.forEach(article => {
                const matches = article.category.includes(filter) ||
                    article.driver.includes(filter) ||
                    article.event.includes(filter) ||
                    article.tags.includes(filter);
                article.card.style.display = matches ? 'flex' : 'none';
            });
        }

        // Update results count
        const visibleCount = Array.from(articlesGrid.querySelectorAll('.article-preview-card'))
            .filter(card => card.style.display !== 'none').length;
        updateResultsCount(visibleCount, articles.length);
    }

    function filterArticles(query, filter) {
        let matchCount = 0;

        articles.forEach(article => {
            const searchableText = `${article.title} ${article.excerpt} ${article.category} ${article.driver} ${article.event} ${article.tags}`;
            const matchesQuery = searchableText.includes(query);
            const matchesFilter = filter === 'all' ||
                article.category.includes(filter) ||
                article.driver.includes(filter) ||
                article.event.includes(filter);

            if (matchesQuery && matchesFilter) {
                article.card.style.display = 'flex';
                matchCount++;
            } else {
                article.card.style.display = 'none';
            }
        });

        updateResultsCount(matchCount, articles.length);
    }

    function updateResultsCount(visible, total) {
        if (searchInput.value.trim() !== '' || currentFilter !== 'all') {
            searchResults.innerHTML = `
                <p style="color: var(--f1-light-gray); font-size: 0.9rem; text-align: center;">
                    Found ${visible} of ${total} articles
                </p>
            `;
        } else {
            searchResults.innerHTML = '';
        }
    }
}

// Countdown Timer for Next Race - fetches from live API
function startCountdown() {
    if (!document.getElementById('countdown')) return;
    const flags = {
        'australia': '🇦🇺', 'china': '🇨🇳', 'japan': '🇯🇵', 'bahrain': '🇧🇭',
        'saudi': '🇸🇦', 'miami': '🇺🇸', 'canada': '🇨🇦', 'monaco': '🇲🇨',
        'spain': '🇪🇸', 'austria': '🇦🇹', 'britain': '🇬🇧', 'belgium': '🇧🇪',
        'hungary': '🇭🇺', 'netherlands': '🇳🇱', 'italy': '🇮🇹', 'azerbaijan': '🇦🇿',
        'singapore': '🇸🇬', 'united states': '🇺🇸', 'mexico': '🇲🇽', 'brazil': '🇧🇷',
        'las vegas': '🇺🇸', 'qatar': '🇶🇦', 'abu dhabi': '🇦🇪', 'madrid': '🇪🇸'
    };

    function getFlag(raceName) {
        const lower = raceName.toLowerCase();
        for (const [key, flag] of Object.entries(flags)) {
            if (lower.includes(key)) return flag;
        }
        return '🏁';
    }

    let nextRaceName = null;
    let nextRaceDate = null;

    async function fetchNextRace() {
        try {
            const data = await cachedJson(`${API_BASE}/${CURRENT_YEAR}.json`);
            const races = data?.MRData?.RaceTable?.Races || [];
            const now = new Date();
            const next = races.find(r => new Date(r.date + 'T' + (r.time || '14:00:00Z')) > now);
            if (next) {
                nextRaceName = next.raceName;
                nextRaceDate = new Date(next.date + 'T' + (next.time || '14:00:00Z'));
            }
        } catch (e) {
            // Fallback to hardcoded schedule
            const next = RACE_SCHEDULE_2026.find(r => r.next && !r.cancelled);
            if (next) {
                nextRaceName = next.name + ' GP';
                const months = { 'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11 };
                const m = next.date.match(/([A-Za-z]{3})\s+(\d+)/);
                if (m) nextRaceDate = new Date(Date.UTC(2026, months[m[1]], parseInt(m[2]), 6, 0, 0));
            }
        }
    }

    function updateCountdown() {
        const raceNameEl = document.querySelector('.next-race-name');
        const countdownEl = document.getElementById('countdown');
        if (!nextRaceDate) return;

        if (raceNameEl) raceNameEl.textContent = `${getFlag(nextRaceName)} ${nextRaceName} - Next Race`;

        const distance = nextRaceDate.getTime() - Date.now();
        if (distance < 0) {
            if (countdownEl) countdownEl.innerHTML = '<div class="hero-badge">🏁 Race Weekend Underway!</div>';
            return;
        }

        const days = Math.floor(distance / 86400000);
        const hours = Math.floor((distance % 86400000) / 3600000);
        const minutes = Math.floor((distance % 3600000) / 60000);
        const seconds = Math.floor((distance % 60000) / 1000);

        const d = document.getElementById('days');
        const h = document.getElementById('hours');
        const mi = document.getElementById('minutes');
        const s = document.getElementById('seconds');
        if (!d || !h || !mi || !s) return;

        d.textContent = String(days).padStart(2, '0');
        h.textContent = String(hours).padStart(2, '0');
        mi.textContent = String(minutes).padStart(2, '0');
        s.textContent = String(seconds).padStart(2, '0');
    }

    fetchNextRace().then(() => {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    });
}

// Fetch Instagram follower count for @f1wow
// NOTE: Instagram's public API (?__a=1) is deprecated. This will use the fallback value.
// For production, implement Instagram Basic Display API with proper authentication.
const CHAMPIONSHIP_DATA_2026 = {
    driver: {
        rounds: ['Australia', 'China', 'Japan', 'Miami', 'Canada', 'Spain'],
        kimiAntonelli: { name: 'Kimi Antonelli', team: 'Mercedes', color: '#27F4D2', points: [18, 50, 80, 108, 139, 156] },
        georgeRussell: { name: 'George Russell', team: 'Mercedes', color: '#27F4D2', points: [25, 51, 66, 83, 91, 106] },
        lewisHamilton: { name: 'Lewis Hamilton', team: 'Ferrari', color: '#F91536', points: [12, 31, 50, 60, 78, 115] },
        charlesLeclerc: { name: 'Charles Leclerc', team: 'Ferrari', color: '#F91536', points: [15, 36, 56, 67, 83, 95] },
        landoNorris: { name: 'Lando Norris', team: 'McLaren', color: '#FF8700', points: [10, 26, 41, 59, 74, 82] },
        oscarPiastri: { name: 'Oscar Piastri', team: 'McLaren', color: '#FF8700', points: [8, 23, 41, 63, 73, 81] },
        maxVerstappen: { name: 'Max Verstappen', team: 'Red Bull Racing', color: '#3671C6', points: [6, 9, 13, 27, 44, 59] },
        pierreGasly: { name: 'Pierre Gasly', team: 'Alpine', color: '#FF87BC', points: [8, 13, 25, 38, 48, 55] },
        carlosSainz: { name: 'Carlos Sainz', team: 'Williams', color: '#64C4FF', points: [4, 5, 11, 19, 21, 26] },
        fernandoAlonso: { name: 'Fernando Alonso', team: 'Aston Martin', color: '#229971', points: [1, 2, 3, 4, 5, 5] },
        estebanOcon: { name: 'Esteban Ocon', team: 'Haas F1 Team', color: '#B6BABD', points: [2, 4, 6, 10, 12, 15] },
        alexAlbon: { name: 'Alexander Albon', team: 'Williams', color: '#64C4FF', points: [2, 6, 10, 14, 15, 17] },
        nicoHulkenberg: { name: 'Nico Hulkenberg', team: 'Audi', color: '#C92D4B', points: [2, 4, 6, 8, 8, 8] },
        oliverBearman: { name: 'Oliver Bearman', team: 'Haas F1 Team', color: '#B6BABD', points: [10, 17, 22, 27, 27, 30] },
        liamLawson: { name: 'Liam Lawson', team: 'Racing Bulls', color: '#5E8FAA', points: [2, 5, 7, 12, 14, 18] },
        francoColapinto: { name: 'Franco Colapinto', team: 'Alpine', color: '#FF87BC', points: [2, 6, 14, 20, 22, 24] },
        isackHadjar: { name: 'Isack Hadjar', team: 'Red Bull Racing', color: '#3671C6', points: [4, 7, 9, 14, 24, 32] },
        gabrielBortoleto: { name: 'Gabriel Bortoleto', team: 'Audi', color: '#C92D4B', points: [1, 2, 3, 4, 5, 6] }
    },
    constructor: {
        rounds: ['Australia', 'China', 'Japan', 'Miami', 'Canada', 'Spain'],
        mercedes: { name: 'Mercedes', color: '#27F4D2', points: [43, 101, 146, 191, 230, 262] },
        ferrari: { name: 'Ferrari', color: '#F91536', points: [27, 62, 106, 127, 161, 210] },
        mclaren: { name: 'McLaren', color: '#FF8700', points: [18, 44, 82, 122, 147, 163] },
        redBull: { name: 'Red Bull Racing', color: '#3671C6', points: [10, 16, 22, 41, 68, 91] },
        alpine: { name: 'Alpine', color: '#FF87BC', points: [10, 19, 39, 58, 70, 79] },
        racingBulls: { name: 'Racing Bulls', color: '#5E8FAA', points: [2, 5, 7, 12, 14, 18] },
        haas: { name: 'Haas F1 Team', color: '#B6BABD', points: [12, 21, 28, 37, 39, 45] },
        williams: { name: 'Williams', color: '#64C4FF', points: [6, 11, 21, 33, 36, 43] },
        audi: { name: 'Audi', color: '#C92D4B', points: [2, 6, 9, 12, 13, 14] },
        astonMartin: { name: 'Aston Martin', color: '#229971', points: [1, 2, 3, 4, 5, 5] }
    }
};

let currentGraphType = 'driver';
let selectedDrivers = ['kimiAntonelli', 'lewisHamilton', 'georgeRussell', 'charlesLeclerc', 'landoNorris'];
let selectedConstructors = ['mercedes', 'ferrari', 'mclaren', 'redBull', 'alpine'];

// Category Tabs Filter
function initCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const articlesGrid = document.getElementById('articlesGrid');
    const articlesCount = document.getElementById('articlesCount');

    if (!articlesGrid || categoryTabs.length === 0) return;

    // Get all article cards
    const articles = Array.from(articlesGrid.querySelectorAll('.article-preview-card'));

    // Set initial count
    if (articlesCount) {
        articlesCount.textContent = articles.length;
    }

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;

            // Update active tab and ARIA attributes
            categoryTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Filter articles
            let visibleCount = 0;

            articles.forEach(article => {
                if (category === 'all') {
                    article.style.display = 'flex';
                    visibleCount++;
                } else {
                    const categoryEl = article.querySelector('.preview-category');
                    const articleCategory = categoryEl?.textContent.toLowerCase() || '';

                    if (articleCategory.includes(category)) {
                        article.style.display = 'flex';
                        visibleCount++;
                    } else {
                        article.style.display = 'none';
                    }
                }
            });

            // Update count
            if (articlesCount) {
                articlesCount.textContent = visibleCount;
            }
        });
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    fetchDriverStandings();
    fetchConstructorStandings();
    loadRaceSchedule();
    startCountdown();
    initSearch();
    initBackToTop();
    initScrollAnimations();
    initCategoryTabs();
    initChampionshipGraph();
    initSubscribeForms();
    updateSubscriberCount();
    initReadingProgress();
    initArticleJumpNav();
    initDriverSparkline();
});

// Driver profile points-trend sparkline — reads the per-round points
// already present in the season-log table (last column of each row), so
// it works across every driver page with zero per-file markup edits.
// Uses the page's own --team custom property, already set on .profile-hero.
// See DESIGN.md Phase 3.
function initDriverSparkline() {
    const hero = document.querySelector('.profile-hero');
    const table = document.querySelector('.season-log-scroll table.standings-table');
    if (!hero || !table) return;

    const rows = table.querySelectorAll('tbody tr');
    if (rows.length < 3) return;

    const points = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        return parseFloat(cells[cells.length - 1]?.textContent) || 0;
    });
    const max = Math.max(...points, 1);
    const w = 160, h = 36, pad = 3;
    const stepX = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
    const coords = points.map((p, i) => [
        pad + i * stepX,
        h - pad - (p / max) * (h - pad * 2)
    ]);
    const pointsAttr = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const [lastX, lastY] = coords[coords.length - 1];

    const wrap = document.createElement('div');
    wrap.className = 'profile-sparkline';
    wrap.innerHTML = `<span class="profile-sparkline-label">Points per round</span>
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="${pointsAttr}" fill="none" stroke="var(--team, var(--f1-red))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
            <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="2.5" fill="var(--team, var(--f1-red))"></circle>
        </svg>`;

    const stats = hero.querySelector('.profile-stats');
    (stats || hero).insertAdjacentElement('afterend', wrap);
}

// In-page "Jump to section" nav for long articles — built from whatever
// <h2>s already exist in .article-content, so it works across every
// article without per-page markup edits. No-op on short articles or
// pages with no article body. See DESIGN.md Phase 3.
function initArticleJumpNav() {
    const content = document.querySelector('.article-content');
    if (!content) return;
    const headings = content.querySelectorAll('h2');
    if (headings.length < 4) return;

    const usedIds = new Set();
    const links = Array.from(headings).map(h => {
        if (!h.id) {
            let slug = h.textContent.trim().toLowerCase()
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
            let id = slug;
            let n = 2;
            while (usedIds.has(id) || document.getElementById(id)) { id = `${slug}-${n++}`; }
            usedIds.add(id);
            h.id = id;
        }
        return `<a href="#${h.id}">${h.textContent}</a>`;
    }).join('');

    const nav = document.createElement('details');
    nav.className = 'article-jump-nav';
    nav.innerHTML = `<summary>Jump to section</summary><nav aria-label="Article sections">${links}</nav>`;
    content.parentNode.insertBefore(nav, content);
}

// Reading Progress Bar - F1 Telemetry Style
function initReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    if (!progressBar) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = (scrollTop / docHeight) * 100;
                progressBar.style.width = progress + '%';
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

function initChampionshipGraph() {
    const typeBtns = document.querySelectorAll('.graph-type-btn');
    const championshipSelect = document.getElementById('championshipType');

    if (typeBtns.length > 0) {
        typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                typeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentGraphType = btn.dataset.type;

                // Update select dropdown to match
                if (championshipSelect) {
                    championshipSelect.value = currentGraphType;
                }

                renderGraph();
            });
        });
    }

    if (championshipSelect) {
        championshipSelect.addEventListener('change', (e) => {
            currentGraphType = e.target.value;

            // Update toggle buttons to match
            typeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === currentGraphType);
            });

            renderGraph();
        });
    }

    // Initial render if on championship page or when tab is opened
    if (document.getElementById('championshipSvg') || document.getElementById('championship-tab')) {
        renderGraph();
    }
}

function renderGraph() {
    const svg = document.getElementById('championshipSvg');
    const legend = document.getElementById('graphLegend');
    if (!svg || !legend) return;

    const data = CHAMPIONSHIP_DATA_2026[currentGraphType];
    const rounds = data.rounds;
    const selected = currentGraphType === 'driver' ? selectedDrivers : selectedConstructors;

    // Clear previous
    svg.innerHTML = '';
    legend.innerHTML = '';

    // Graph dimensions
    const width = 800;
    const height = 400;
    const padding = { top: 30, right: 30, bottom: 50, left: 60 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Find max points for scaling
    let maxPoints = 0;
    Object.keys(data).forEach(key => {
        if (key !== 'rounds') {
            data[key].points.forEach(p => {
                maxPoints = Math.max(maxPoints, p);
            });
        }
    });
    maxPoints = Math.ceil(maxPoints / 10) * 10; // Round to nearest 10
    if (maxPoints < 50) maxPoints = 50; // Minimum scale

    // Draw grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (graphHeight / gridLines) * i;
        const value = maxPoints - (maxPoints / gridLines) * i;

        // Grid line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'graph-grid-line');
        svg.appendChild(line);

        // Y-axis labels
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding.left - 10);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('class', 'graph-axis-text');
        text.textContent = Math.round(value);
        svg.appendChild(text);
    }

    // Draw X-axis labels (race names)
    rounds.forEach((round, index) => {
        const x = padding.left + (graphWidth / (rounds.length - 1)) * index;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', height - padding.bottom + 20);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', 'graph-axis-text');
        text.textContent = round;
        svg.appendChild(text);
    });

    // Draw lines and points for selected drivers/teams
    selected.forEach((key, index) => {
        if (!data[key]) return;

        const item = data[key];
        const points = item.points;
        const color = item.color;

        // Create path data
        let pathD = '';
        points.forEach((point, i) => {
            const x = padding.left + (graphWidth / (rounds.length - 1)) * i;
            const y = padding.top + graphHeight - (point / maxPoints) * graphHeight;

            if (i === 0) {
                pathD += `M ${x} ${y}`;
            } else {
                pathD += ` L ${x} ${y}`;
            }
        });

        // Draw line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('class', 'graph-line animate');
        path.setAttribute('style', `stroke: ${color}`);
        path.setAttribute('data-name', item.name);
        path.setAttribute('data-team', item.team || item.name);

        // Add hover event to line
        path.addEventListener('mouseenter', (e) => showGraphLineTooltip(e, item.name, item.team || item.name, rounds, points, color));
        path.addEventListener('mousemove', (e) => {
            const tooltip = document.getElementById('graphTooltip');
            if (tooltip && tooltip.classList.contains('visible')) {
                const container = document.getElementById('graphContainer');
                const containerRect = container.getBoundingClientRect();
                const mouseX = e.clientX - containerRect.left;
                const mouseY = e.clientY - containerRect.top;
                tooltip.style.left = (mouseX + 15) + 'px';
                tooltip.style.top = (mouseY - 40) + 'px';
            }
        });
        path.addEventListener('mouseleave', hideGraphTooltip);

        svg.appendChild(path);

        // Draw points
        points.forEach((point, i) => {
            const x = padding.left + (graphWidth / (rounds.length - 1)) * i;
            const y = padding.top + graphHeight - (point / maxPoints) * graphHeight;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 5);
            circle.setAttribute('class', 'graph-point');
            circle.setAttribute('style', `stroke: ${color}`);
            circle.setAttribute('data-race', rounds[i]);
            circle.setAttribute('data-points', point);
            circle.setAttribute('data-name', item.name);
            circle.setAttribute('data-team', item.team || item.name);

            // Add hover event
            circle.addEventListener('mouseenter', (e) => showGraphTooltip(e));
            circle.addEventListener('mouseleave', hideGraphTooltip);

            svg.appendChild(circle);
        });

        // Add legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'graph-legend-item';
        legendItem.innerHTML = `
            <div class="graph-legend-color" style="background: ${color}"></div>
            <span class="graph-legend-name">${item.name}</span>
        `;
        legendItem.addEventListener('click', () => toggleLine(key, item.name));
        legend.appendChild(legendItem);
    });
}

function showGraphTooltip(event) {
    const tooltip = document.getElementById('graphTooltip');
    if (!tooltip) return;

    const target = event.target;
    const race = target.getAttribute('data-race');
    const points = target.getAttribute('data-points');
    const name = target.getAttribute('data-name');
    const team = target.getAttribute('data-team');

    tooltip.innerHTML = `
        <div class="graph-tooltip-race">${race} GP</div>
        <div class="graph-tooltip-entries">
            <div class="graph-tooltip-entry">
                <span class="graph-tooltip-name">${name}</span>
                <span class="graph-tooltip-points">${points} pts</span>
            </div>
        </div>
    `;

    // Position tooltip
    const rect = target.getBoundingClientRect();
    const container = document.getElementById('graphContainer');
    const containerRect = container.getBoundingClientRect();

    tooltip.style.left = (rect.left - containerRect.left + rect.width / 2 - 75) + 'px';
    tooltip.style.top = (rect.top - containerRect.top - 60) + 'px';
    tooltip.classList.add('visible');
}

function showGraphLineTooltip(event, name, team, rounds, points, color) {
    const tooltip = document.getElementById('graphTooltip');
    if (!tooltip) return;

    const currentPoints = points[points.length - 1]; // Get latest points

    tooltip.innerHTML = `
        <div class="graph-tooltip-header" style="border-left: 3px solid ${color}; padding-left: 8px;">
            <div class="graph-tooltip-name" style="font-weight: 700; font-size: 14px; color: white;">${name}</div>
            <div class="graph-tooltip-team" style="font-size: 12px; opacity: 0.8; color: rgba(255,255,255,0.7);">${team}</div>
        </div>
        <div class="graph-tooltip-entries" style="margin-top: 8px;">
            <div class="graph-tooltip-entry">
                <span class="graph-tooltip-label" style="color: rgba(255,255,255,0.7);">Current Points:</span>
                <span class="graph-tooltip-points" style="font-weight: 600; color: #e10600;">${currentPoints} pts</span>
            </div>
        </div>
    `;

    // Position tooltip near mouse
    const container = document.getElementById('graphContainer');
    const containerRect = container.getBoundingClientRect();
    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;

    tooltip.style.left = (mouseX + 15) + 'px';
    tooltip.style.top = (mouseY - 40) + 'px';
    tooltip.classList.add('visible');
}

function hideGraphTooltip() {
    const tooltip = document.getElementById('graphTooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
    }
}

function toggleLine(key, name) {
    const svg = document.getElementById('championshipSvg');
    const lines = svg.querySelectorAll('.graph-line');
    const points = svg.querySelectorAll('.graph-point');

    // Check if this line is currently visible
    const line = Array.from(lines).find(l => l.getAttribute('data-name') === name);
    const isHidden = line && line.style.display === 'none';

    // Toggle visibility
    if (line) {
        line.style.display = isHidden ? '' : 'none';
    }

    // Toggle points
    points.forEach(point => {
        if (point.getAttribute('data-name') === name) {
            point.style.display = isHidden ? '' : 'none';
        }
    });

    // Toggle legend item opacity
    const legendItems = document.querySelectorAll('.graph-legend-item');
    legendItems.forEach(item => {
        const itemName = item.querySelector('.graph-legend-name').textContent;
        if (itemName === name) {
            item.classList.toggle('hidden');
        }
    });
}

// ============================================
// ARTICLE SHARE FUNCTION
// ============================================

// Copy article link to clipboard
function handleSubscribe(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = document.getElementById('subscribeEmail');
    const email = emailInput.value.trim();
    const btn = form.querySelector('.subscribe-btn');
    const btnText = btn.querySelector('.btn-text');
    const originalText = btnText.textContent;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    btnText.textContent = 'Subscribing...';
    btn.disabled = true;

    fetch('https://formspree.io/f/mzdwqjwq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email })
    }).then(res => {
        if (res.ok) {
            btnText.textContent = 'Subscribed! ✓';
            btn.style.background = '#22c55e';
            emailInput.value = '';
            showNotification('Successfully subscribed! 🏁 You\'ll receive F1 news updates.');
        } else {
            throw new Error('fail');
        }
    }).catch(() => {
        showNotification('Something went wrong. Please try again.', 'error');
        btn.disabled = false;
    }).finally(() => {
        setTimeout(() => {
            btnText.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    });
}

// Notify all subscribers about new article
// Opens pre-filled email client with all subscribers BCC'd
function notifySubscribers(articleTitle, articleUrl) {
    const subscribers = JSON.parse(localStorage.getItem('f1wow_subscribers') || '[]');

    if (subscribers.length === 0) {
        showNotification('No subscribers yet! 📧', 'info');
        return;
    }

    // Get all subscriber emails
    const emailList = subscribers.map(s => s.email).join(', ');

    // Create email body
    const subject = encodeURIComponent(`🏁 New Article: ${articleTitle}`);
    const body = encodeURIComponent(
        `Hi F1wow Fans!\n\nWe just published a new article:\n\n${articleTitle}\n\nRead here: ${articleUrl}\n\n---\nThis is an automated notification from F1wow News.\nTo unsubscribe, reply to this email.`
    );

    // Open email client with all subscribers BCC'd
    // This uses mailto: protocol which works without any backend
    window.location.href = `mailto:?bcc=${emailList}&subject=${subject}&body=${body}`;
}

// Get subscriber count
function getSubscriberCount() {
    const subscribers = JSON.parse(localStorage.getItem('f1wow_subscribers') || '[]');
    return subscribers.length;
}

// Export subscribers (for backup/management)
function exportSubscribers() {
    const subscribers = JSON.parse(localStorage.getItem('f1wow_subscribers') || '[]');

    if (subscribers.length === 0) {
        showNotification('No subscribers to export', 'info');
        return;
    }

    // Create CSV content
    const csv = 'Email,Date\n' + subscribers.map(s => `${s.email},${s.date}`).join('\n');

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `f1wow-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification(`Exported ${subscribers.length} subscribers!`, 'success');
}

// Initialize forms
function initSubscribeForms() {
    const forms = document.querySelectorAll('.subscribe-form');
    forms.forEach(form => {
        form.setAttribute('method', 'POST');
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput && !emailInput.getAttribute('name')) {
            emailInput.setAttribute('name', 'email');
        }
    });
}


// Show notification message
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existing = document.querySelector('.subscribe-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `subscribe-notification ${type}`;
    notification.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
        </svg>
        ${message}
    `;
    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('hiding');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Update subscriber count in nav
function updateSubscriberCount() {
    const subscribers = JSON.parse(localStorage.getItem('f1wow_subscribers') || '[]');
    const countEl = document.getElementById('subscriberCount');
    const totalCountEl = document.getElementById('totalSubscribers');
    if (countEl) countEl.textContent = subscribers.length;
    if (totalCountEl) totalCountEl.textContent = subscribers.length;
}

// Open admin panel
function openAdminPanel(event) {
    if (event) event.stopPropagation();
    const panel = document.getElementById('adminPanel');
    panel.classList.add('show');
    updateSubscriberCount();
}

// Close admin panel
function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    panel.classList.remove('show');
}

// Notify all subscribers (opens email client)
function notifyAllSubscribers() {
    const subscribers = JSON.parse(localStorage.getItem('f1wow_subscribers') || '[]');
    if (subscribers.length === 0) {
        showNotification('No subscribers to notify! 📧', 'info');
        return;
    }
    const title = document.getElementById('notifyArticleTitle')?.value || 'New F1wow Article Published!';
    const url = document.getElementById('notifyArticleUrl')?.value || window.location.href;
    notifySubscribers(title, url);
}

// Send custom notification with form values
function sendCustomNotification() {
    const title = document.getElementById('notifyArticleTitle').value;
    const url = document.getElementById('notifyArticleUrl').value;
    if (!title || !url) {
        showNotification('Please enter article title and URL', 'error');
        return;
    }
    notifySubscribers(title, url);
    closeAdminPanel();
}

// Clear all subscribers
function clearSubscribers() {
    if (confirm('Are you sure you want to clear all subscribers? This cannot be undone.')) {
        localStorage.removeItem('f1wow_subscribers');
        updateSubscriberCount();
        showNotification('All subscribers cleared', 'success');
        closeAdminPanel();
    }
}

// Close admin panel when clicking outside
document.addEventListener('click', (e) => {
    const panel = document.getElementById('adminPanel');
    if (panel && panel.classList.contains('show') && !panel.contains(e.target) && !e.target.closest('.subscriber-count')) {
        closeAdminPanel();
    }
});

// ============================================
// INSTAGRAM EMBED FUNCTION
// ============================================

// Load Instagram's embed script
function loadInstagramEmbedScript() {
    return new Promise((resolve) => {
        // If script already loaded, just process embeds
        if (window.instgrm) {
            window.instgrm.Embeds.process();
            resolve();
            return;
        }

        // Check if script element exists
        if (document.getElementById('instagram-embed-script')) {
            // Script exists but might not be loaded yet, wait for it
            const checkInterval = setInterval(() => {
                if (window.instgrm) {
                    clearInterval(checkInterval);
                    window.instgrm.Embeds.process();
                    resolve();
                }
            }, 100);
            return;
        }

        // Create and load the script
        const script = document.createElement('script');
        script.id = 'instagram-embed-script';
        script.async = true;
        script.src = 'https://www.instagram.com/embed.js';
        script.onload = () => {
            if (window.instgrm) {
                window.instgrm.Embeds.process();
            }
            resolve();
        };
        document.body.appendChild(script);
    });
}

// Process Instagram embeds using the official embed format
async function loadInstagramEmbed() {
    // Only run on article pages (not index, calendar, etc.)
    const articleFile = window.location.pathname.split('/').pop();
    const excludedPages = ['index.html', 'calendar.html', 'championship.html', 'news.html', '', 'index.php'];


    if (!articleFile || excludedPages.includes(articleFile)) {
        return;
    }

    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            return;
        }
        const data = await response.json();

        // Check if this article matches the latestPost
        if (data.latestPost && data.latestPost.articleLink === articleFile) {
            const embedContainer = document.getElementById('instagramEmbed');
            if (!embedContainer) return;

            const sourceLink = data.latestPost.sourceLink;

            // Extract the post ID from Instagram URL
            // URL format: https://www.instagram.com/USERNAME/p/POST_ID/
            const postIdMatch = sourceLink.match(/\/p\/([a-zA-Z0-9_-]+)/);
            if (!postIdMatch) {
                return;
            }
            const postId = postIdMatch[1];

            // Clear existing content and create Instagram embed blockquote
            embedContainer.innerHTML = `
                <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${sourceLink}" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:658px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
                    <div style="padding:16px;">
                        <a href="${sourceLink}" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
                            <div style=" display: flex; flex-direction: row; align-items: center;">
                                <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
                                <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                                    <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                                    <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
                                </div>
                            </div>
                            <div style="padding: 19% 0;"></div>
                            <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M456.87788,74.2613329 C454.479557,74.2613329 452.529207,72.3109829 452.529207,69.9126602 C452.529207,67.5143376 454.479557,65.5639876 456.87788,65.5639876 C459.276202,65.5639876 461.226552,67.5143376 461.226552,69.9126602 C461.226552,72.3109829 459.276202,74.2613329 456.87788,74.2613329 M475.993138,67.8185281 C476.321347,68.9514673 476.540775,70.4259956 476.603031,72.3974664 L476.610938,74.2667377 L476.610938,81.2333426 L476.603031,83.1026139 C476.540775,85.0740847 476.321347,86.548613 475.993138,87.6815522 C475.697984,88.6939318 475.254886,89.4497679 474.477422,90.2272323 C473.699958,91.0046967 472.944121,91.4477943 471.931742,91.7429488 C470.798803,92.0711582 469.324274,92.2905863 467.352804,92.3528422 L465.483532,92.3607491 L458.516928,92.3607491 L456.647656,92.3528422 C454.676186,92.2905863 453.201657,92.0711582 452.068718,91.7429488 C451.056339,91.4477943 450.300502,91.0046967 449.523038,90.2272323 C448.745574,89.4497679 448.302476,88.6939318 448.007322,87.6815522 C447.679112,86.548613 447.459684,85.0740847 447.397428,83.1026139 L447.389522,81.2333426 L447.389522,74.2667377 L447.397428,72.3974664 C447.459684,70.4259956 447.679112,68.9514673 448.007322,67.8185281 C448.302476,66.8061485 448.745574,66.0503124 449.523038,65.272848 C450.300502,64.4953836 451.056339,64.052286 452.068718,63.7571315 C453.201657,63.4289221 454.676186,63.209494 456.647656,63.1472381 L458.516928,63.1393312 L465.483532,63.1393312 L467.352804,63.1472381 C469.324274,63.209494 470.798803,63.4289221 471.931742,63.7571315 C472.944121,64.052286 473.699958,64.4953836 474.477422,65.272848 C475.254886,66.0503124 475.697984,66.8061485 475.993138,67.8185281 M452.068718,59.0465248 C448.064332,59.0465248 447.374563,59.0287029 445.985551,59.0697309 C443.339915,59.1491676 441.558537,59.5745665 440.007548,60.4801524 C438.530603,61.3443717 437.345533,62.5294418 436.481314,64.0063865 C435.575728,65.5573758 435.150329,67.3387536 435.070892,69.9843897 C435.029864,71.3734015 435.047686,72.0631711 435.047686,76.0675565 L435.047686,79.4325238 C435.047686,83.4369091 435.029864,84.1266788 435.070892,85.5156906 C435.150329,88.1613266 435.575728,89.9427044 436.481314,91.4936938 C437.345533,92.9706384 438.530603,94.1557086 440.007548,95.0199279 C441.558537,95.9255137 443.339915,96.3509127 445.985551,96.4303494 C447.374563,96.4713773 448.064332,96.4535555 452.068718,96.4535555 L471.931742,96.4535555 C475.936127,96.4535555 476.625897,96.4713773 478.014909,96.4303494 C480.660545,96.3509127 482.441923,95.9255137 483.992912,95.0199279 C485.469857,94.1557086 486.654927,92.9706384 487.519146,91.4936938 C488.424732,89.9427044 488.850131,88.1613266 488.929568,85.5156906 C488.970596,84.1266788 488.952774,83.4369091 488.952774,79.4325238 L488.952774,76.0675565 C488.952774,72.0631711 488.970596,71.3734015 488.929568,69.9843897 C488.850131,67.3387536 488.424732,65.5573758 487.519146,64.0063865 C486.654927,62.5294418 485.469857,61.3443717 483.992912,60.4801524 C482.441923,59.5745665 480.660545,59.1491676 478.014909,59.0697309 C476.625897,59.0287029 475.936127,59.0465248 471.931742,59.0465248 L452.068718,59.0465248 M452.068718,55.0465248 L471.931742,55.0465248 C476.094893,55.0465248 476.847936,55.0664032 478.226141,55.1069455 C481.448453,55.2009901 483.743471,55.8028866 485.78275,56.9446256 C487.777201,58.0608267 489.399449,59.683075 490.51565,61.677526 C491.657389,63.7168049 492.259285,66.0118227 492.35333,69.2341352 C492.393872,70.6123402 492.413751,71.3653827 492.413751,75.528534 L492.413751,79.9715463 C492.413751,84.1346975 492.393872,84.88774 492.35333,86.2659451 C492.259285,89.4882576 491.657389,91.7832753 490.51565,93.8225543 C489.399449,95.8170052 487.777201,97.4392536 485.78275,98.5554547 C483.743471,99.6971937 481.448453,100.29909 478.226141,100.393135 C476.847936,100.433677 476.094893,100.453556 471.931742,100.453556 L452.068718,100.453556 C447.905566,100.453556 447.152524,100.433677 445.774319,100.393135 C442.552006,100.29909 440.256989,99.6971937 438.21771,98.5554547 C436.223259,97.4392536 434.60101,95.8170052 433.484809,93.8225543 C432.34307,91.7832753 431.741174,89.4882576 431.647129,86.2659451 C431.606587,84.88774 431.586709,84.1346975 431.586709,79.9715463 L431.586709,75.528534 C431.586709,71.3653827 431.606587,70.6123402 431.647129,69.2341352 C431.741174,66.0118227 432.34307,63.7168049 433.484809,61.677526 C434.60101,59.683075 436.223259,58.0608267 438.21771,56.9446256 C440.256989,55.8028866 442.552006,55.2009901 445.774319,55.1069455 C447.152524,55.0664032 447.905566,55.0465248 452.068718,55.0465248"></path></g></g></svg></div>
                        </a>
                    </div>
                </blockquote>
            `;

            // Show the container
            embedContainer.style.display = 'block';

            // Load Instagram embed script and process embeds
            await loadInstagramEmbedScript();
        }
    } catch (error) {
    }
}

// Fallback: Direct embed for antonelli-maiden-win.html without needing data.json
function loadDirectInstagramEmbed() {
    const embedContainer = document.getElementById('instagramEmbed');
    if (!embedContainer) return;

    // Check if we're on the antonelli article
    const articleFile = window.location.pathname.split('/').pop();
    if (articleFile !== 'antonelli-maiden-win.html') return;


    const sourceLink = 'https://www.instagram.com/f1wow/p/DV8iHuhjKJH/';

    embedContainer.innerHTML = `
        <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${sourceLink}" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:658px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
            <div style="padding:16px;">
                <a href="${sourceLink}" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
                    <div style=" display: flex; flex-direction: row; align-items: center;">
                        <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
                        <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                            <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                            <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
                        </div>
                    </div>
                    <div style="padding: 19% 0;"></div>
                    <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></g></g></svg></div>
                </a>
            </div>
        </blockquote>
    `;

    embedContainer.style.display = 'block';
    loadInstagramEmbedScript();
}

// Dynamic Social Sharing
function initSocialShare() {
    // Get article metadata
    const title = document.querySelector('meta[property="og:title"]')?.content ||
                  document.title;
    const url = window.location.href;

    // Update share links with dynamic URLs
    const shareLinks = {
        twitter: document.querySelector('.share-btn.twitter'),
        facebook: document.querySelector('.share-btn.facebook'),
        linkedin: document.querySelector('.share-btn.linkedin'),
        whatsapp: document.querySelector('.share-btn.whatsapp')
    };

    if (shareLinks.twitter) {
        shareLinks.twitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    }
    if (shareLinks.facebook) {
        shareLinks.facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }
    if (shareLinks.linkedin) {
        shareLinks.linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
    if (shareLinks.whatsapp) {
        shareLinks.whatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
    }
}

// Copy Link Function (enhanced)
function copyArticleLink() {
    // Share the clean, extensionless URL (GitHub Pages serves it fine)
    const url = window.location.href.replace(/\.html(?=$|[?#])/, '').split('#')[0];
    navigator.clipboard.writeText(url).then(() => {
        const copyBtn = document.querySelector('.share-btn.copy-link');
        if (copyBtn) {
            const originalText = copyBtn.innerHTML;
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied!
            `;
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = originalText;
            }, 2000);
        }
    }).catch(() => {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close menu on window resize if open
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Call on page load
document.addEventListener('DOMContentLoaded', async () => {
    initMobileMenu();
    initSocialShare();
    await loadInstagramEmbed();

    // Fallback: If embed container is still hidden, try direct embed
    setTimeout(() => {
        const embedContainer = document.getElementById('instagramEmbed');
        if (embedContainer && embedContainer.style.display === 'none') {
            loadDirectInstagramEmbed();
        }
    }, 1000);
});

// ============================================
// COOKIE CONSENT (Google Consent Mode v2)
// ============================================
function initCookieConsent() {
    const KEY = 'f1wow_consent';
    const grantAll = () => {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
            });
        }
    };
    const stored = localStorage.getItem(KEY);
    if (stored === 'granted') { grantAll(); return; }
    if (stored === 'denied') return;

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
        <p>We use cookies for anonymous analytics to improve the site. See our <a href="privacy-policy.html">Privacy Policy</a>.</p>
        <div class="cookie-banner-actions">
            <button class="cookie-btn accept" id="cookieAccept">Accept</button>
            <button class="cookie-btn decline" id="cookieDecline">Essential only</button>
        </div>`;
    document.body.appendChild(banner);
    document.getElementById('cookieAccept').addEventListener('click', () => {
        localStorage.setItem(KEY, 'granted');
        grantAll();
        banner.remove();
    });
    document.getElementById('cookieDecline').addEventListener('click', () => {
        localStorage.setItem(KEY, 'denied');
        banner.remove();
    });
}

document.addEventListener('DOMContentLoaded', initCookieConsent);

// ============================================
// GA4 CUSTOM EVENTS (fires only after cookie consent grants analytics)
// ============================================
function initAnalyticsEvents() {
    if (typeof gtag !== 'function') return;
    const track = (name, params) => { try { gtag('event', name, params || {}); } catch (e) {} };

    // Scroll depth: 25/50/75/90, once each
    const marks = [25, 50, 75, 90];
    const fired = new Set();
    let sdTicking = false;
    const onScrollDepth = () => {
        if (sdTicking) return;
        sdTicking = true;
        requestAnimationFrame(() => {
            const h = document.documentElement;
            const pct = Math.round((h.scrollTop + window.innerHeight) / h.scrollHeight * 100);
            marks.forEach(m => {
                if (pct >= m && !fired.has(m)) { fired.add(m); track('scroll_depth', { percent: m }); }
            });
            if (fired.size === marks.length) window.removeEventListener('scroll', onScrollDepth);
            sdTicking = false;
        });
    };
    window.addEventListener('scroll', onScrollDepth, { passive: true });

    // Clicks: shares, related stories, trending
    document.addEventListener('click', (e) => {
        const share = e.target.closest('.share-btn');
        if (share) track('share_click', { network: share.className.replace(/share-btn|\s/g, '') || 'copy' });
        const rel = e.target.closest('.related-card');
        if (rel) track('related_click', { target: rel.getAttribute('href') });
        const trend = e.target.closest('.trending-item');
        if (trend) track('trending_click', { target: trend.getAttribute('href') });
    });

    // Newsletter submits
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', () => {
            if (form.querySelector('input[type="email"]')) track('newsletter_submit', { page: location.pathname });
        });
    });

    // Search usage (first keystroke per page view)
    const search = document.getElementById('searchInput');
    if (search) {
        let used = false;
        search.addEventListener('input', () => {
            if (!used) { used = true; track('search_used', {}); }
        });
    }
}

document.addEventListener('DOMContentLoaded', initAnalyticsEvents);

// ============================================
// CHAMPIONSHIP BATTLE BAND (homepage)
// ============================================
async function initChampionshipBand() {
    const band = document.getElementById('championshipBand');
    if (!band) return;
    const TEAM_HEX = {
        'Mercedes': '#27F4D2', 'Ferrari': '#F91536', 'McLaren': '#FF8700',
        'Red Bull': '#3671C6', 'Red Bull Racing': '#3671C6', 'Alpine F1 Team': '#FF87BC',
        'Alpine': '#FF87BC', 'RB F1 Team': '#5E8FAA', 'Haas F1 Team': '#B6BABD',
        'Williams': '#64C4FF', 'Audi': '#C92D4B', 'Sauber': '#C92D4B', 'Aston Martin': '#229971'
    };
    try {
        const data = await cachedJson(`${API_BASE}/${CURRENT_YEAR}/driverstandings.json`);
        const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
        if (!standings || !standings.length) throw new Error('No standings');
        const top = standings.slice(0, 3);
        const lead = parseFloat(top[0].points) || 1;
        band.innerHTML = top.map(d => {
            const team = d.Constructors?.[0]?.name || '';
            const color = TEAM_HEX[team] || '#B6BABD';
            return `
            <div class="battle-row">
                <div class="battle-pos">${sanitizeHTML(d.position)}</div>
                <div class="battle-info">
                    <div class="battle-name">${sanitizeHTML(d.Driver.givenName + ' ' + d.Driver.familyName)} <span style="color:${color}; font-size:0.8rem; font-weight:600;">${sanitizeHTML(team)}</span></div>
                    <div class="battle-bar-track"><div class="battle-bar" style="width:0; background:${color}"></div></div>
                </div>
                <div class="battle-pts">${sanitizeHTML(d.points)}<span>PTS</span></div>
            </div>`;
        }).join('');
        // animate bars in
        requestAnimationFrame(() => {
            band.querySelectorAll('.battle-bar').forEach((bar, i) => {
                bar.style.width = ((parseFloat(top[i].points) / lead) * 100).toFixed(1) + '%';
            });
        });
    } catch (e) {
        const wrap = band.closest('.battle-band');
        if (wrap) wrap.setAttribute('hidden', '');
    }
}

document.addEventListener('DOMContentLoaded', initChampionshipBand);

// ============================================
// LIVE PROFILE SEASON LOG (driver-*.html / team-*.html)
// Auto-detects the entity from the URL and replaces the static
// season-log table with freshly fetched, always-current data.
// results.json paginates at the result-entry level (not race level),
// so a single race's classified drivers can be split across two
// "race" objects sharing the same round number - must merge by round
// before aggregating, or teams get double-counted per-round rows.
// ============================================
async function fetchMergedSeasonResults() {
    const LIMIT = 100;
    // The first page is the only one that has to happen before anything else,
    // since it's the only way to learn how many total pages exist. Every page
    // after that has a known, independent offset, so they can all be fetched
    // in parallel instead of one page waiting on the last - merging by round
    // (below) doesn't care what order the pages arrive in.
    const first = await cachedJson(`${API_BASE}/${CURRENT_YEAR}/results.json?limit=${LIMIT}&offset=0`);
    const total = parseInt(first.MRData.total);
    const races = [...(first.MRData.RaceTable?.Races || [])];

    const remainingOffsets = [];
    for (let offset = LIMIT; offset < total; offset += LIMIT) remainingOffsets.push(offset);
    if (remainingOffsets.length) {
        const pages = await Promise.all(
            remainingOffsets.map(offset => cachedJson(`${API_BASE}/${CURRENT_YEAR}/results.json?limit=${LIMIT}&offset=${offset}`))
        );
        pages.forEach(data => races.push(...(data.MRData.RaceTable?.Races || [])));
    }

    const merged = new Map();
    races.forEach(r => {
        if (!merged.has(r.round)) {
            merged.set(r.round, { ...r, Results: [...r.Results] });
        } else {
            merged.get(r.round).Results.push(...r.Results);
        }
    });
    return Array.from(merged.values()).sort((a, b) => parseInt(a.round) - parseInt(b.round));
}

async function initProfileSeasonLog() {
    const path = window.location.pathname;
    const driverMatch = path.match(/driver-([a-z0-9_]+)\.html/i);
    const teamMatch = path.match(/team-([a-z0-9_]+)\.html/i);
    if (!driverMatch && !teamMatch) return;
    const tbody = document.querySelector('.season-log-scroll tbody');
    if (!tbody) return;

    try {
        const races = await fetchMergedSeasonResults();
        let rows = '';

        // Injects the Wins / Podiums / Best / DNFs chip strip above the table.
        const injectLogChips = (items) => {
            const scroll = document.querySelector('.season-log-scroll');
            if (!scroll) return;
            const prev = scroll.previousElementSibling;
            if (prev && prev.classList.contains('log-chips')) prev.remove();
            const div = document.createElement('div');
            div.className = 'log-chips';
            div.innerHTML = items.map(it => `<div class="log-chip"><b>${it.n}</b><span>${it.label}</span></div>`).join('');
            scroll.parentNode.insertBefore(div, scroll);
        };
        // Copies the per-entity team colour from the hero onto the table card
        // so the accent rail / chip stripe matches the driver's/team's livery.
        const applyProfileLogAccent = () => {
            const hero = document.querySelector('.profile-hero');
            const scroll = document.querySelector('.season-log-scroll');
            if (hero && scroll) {
                const c = getComputedStyle(hero).getPropertyValue('--team').trim();
                if (c) scroll.style.setProperty('--team-accent', c);
            }
        };

        if (driverMatch) {
            const driverId = driverMatch[1];
            let dnfs = 0;
            races.forEach(r => {
                const label = r.Circuit?.Location?.locality || r.raceName.replace(' Grand Prix', '');
                const res = r.Results.find(x => x.Driver.driverId === driverId);
                if (!res) return;
                const finished = (res.status === 'Finished' || res.status.includes('Lap'));
                const pos = parseInt(res.position);
                let cls = 'standings-row';
                if (!finished) { cls += ' is-dnf'; dnfs++; }
                else if (pos === 1) cls += ' is-win';
                else if (pos <= 3) cls += ' is-podium';
                else if (pos <= 10) cls += ' is-points';
                const result = finished ? `P${pos}` : `<abbr title="${sanitizeHTML(res.status)}">DNF</abbr>`;
                rows += `<tr class="${cls}"><td>${r.round}</td><td>${sanitizeHTML(label)}</td><td>${result}</td><td>${res.points}</td></tr>`;
            });
            // refresh the summary sentence with live stats too
            const finishes = [];
            races.forEach(r => {
                const res = r.Results.find(x => x.Driver.driverId === driverId);
                if (res && (res.status === 'Finished' || res.status.includes('Lap'))) finishes.push(parseInt(res.position));
            });
            const podiums = finishes.filter(p => p <= 3).length;
            const wins = finishes.filter(p => p === 1).length;
            const best = finishes.length ? Math.min(...finishes) : null;
            injectLogChips([
                { n: wins, label: 'Wins' },
                { n: podiums, label: 'Podiums' },
                { n: best ? 'P' + best : '—', label: 'Best' },
                { n: dnfs, label: 'DNFs' }
            ]);
            const summaryEl = document.querySelector('.profile-body > p');
            if (summaryEl && best) {
                const lastName = summaryEl.textContent.match(/^(\S+)/)?.[1] || '';
                let facts = `Across ${races.length} races in 2026, ${lastName} has taken ${podiums} podium${podiums !== 1 ? 's' : ''}`;
                if (wins) facts += ` and ${wins} win${wins !== 1 ? 's' : ''}`;
                facts += `, with a best finish of P${best}.`;
                const link = summaryEl.querySelector('a');
                if (link) {
                    summaryEl.innerHTML = summaryEl.innerHTML.split('</a>')[0] + '</a>. ' + facts;
                } else {
                    summaryEl.textContent = facts;
                }
            }
        } else if (teamMatch) {
            const teamId = teamMatch[1];
            let tWins = 0, tPodiums = 0, tBest = null, tDnf = 0;
            races.forEach(r => {
                const label = r.Circuit?.Location?.locality || r.raceName.replace(' Grand Prix', '');
                const teamResults = r.Results.filter(x => x.Constructor.constructorId === teamId);
                if (!teamResults.length) return;
                const pts = teamResults.reduce((sum, x) => sum + parseFloat(x.points), 0);
                const best = Math.min(...teamResults.map(x => parseInt(x.position)));
                const anyFinished = teamResults.some(x => x.status === 'Finished' || x.status.includes('Lap'));
                let cls = 'standings-row';
                if (!anyFinished) { cls += ' is-dnf'; tDnf++; }
                else if (best === 1) { cls += ' is-win'; tWins++; }
                else if (best <= 3) { cls += ' is-podium'; tPodiums++; }
                else if (best <= 10) cls += ' is-points';
                if (!tBest || best < tBest) tBest = best;
                rows += `<tr class="${cls}"><td>${r.round}</td><td>${sanitizeHTML(label)}</td><td>P${best}</td><td>${pts}</td></tr>`;
            });
            injectLogChips([
                { n: tWins, label: 'Wins' },
                { n: tPodiums, label: 'Podiums' },
                { n: tBest ? 'P' + tBest : '—', label: 'Best' },
                { n: tDnf, label: 'DNFs' }
            ]);
        }

        if (rows) tbody.innerHTML = rows;
        applyProfileLogAccent();
    } catch (e) {
        // static baked-in table (from last publish) remains as a fallback
    }
}

document.addEventListener('DOMContentLoaded', initProfileSeasonLog);
