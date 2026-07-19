# One-off generator for the self-updating Race Hub page
import re

s = open('championship.html', encoding='utf-8').read()  # header WITH Home link
header = re.search(r'<header class="header">[\s\S]*?</header>', s).group(0)
footer = re.search(r'<footer class="footer">[\s\S]*?</footer>', s).group(0)
GA = re.search(r'<!-- Google Analytics -->[\s\S]*?</script>', s).group(0)
SITE = 'https://motorsports-news.github.io/F1WOW'

script = r'''
    <script>
    (function () {
        const API = 'https://api.jolpi.ca/ergast/f1/2026';
        const FLAGS = { 'australian':'\u{1F1E6}\u{1F1FA}','chinese':'\u{1F1E8}\u{1F1F3}','japanese':'\u{1F1EF}\u{1F1F5}','miami':'\u{1F1FA}\u{1F1F8}','canadian':'\u{1F1E8}\u{1F1E6}','monaco':'\u{1F1F2}\u{1F1E8}','spanish':'\u{1F1EA}\u{1F1F8}','austrian':'\u{1F1E6}\u{1F1F9}','british':'\u{1F1EC}\u{1F1E7}','belgian':'\u{1F1E7}\u{1F1EA}','hungarian':'\u{1F1ED}\u{1F1FA}','dutch':'\u{1F1F3}\u{1F1F1}','italian':'\u{1F1EE}\u{1F1F9}','madrid':'\u{1F1EA}\u{1F1F8}','azerbaijan':'\u{1F1E6}\u{1F1FF}','singapore':'\u{1F1F8}\u{1F1EC}','united states':'\u{1F1FA}\u{1F1F8}','mexico':'\u{1F1F2}\u{1F1FD}','brazilian':'\u{1F1E7}\u{1F1F7}','las vegas':'\u{1F1FA}\u{1F1F8}','qatar':'\u{1F1F6}\u{1F1E6}','abu dhabi':'\u{1F1E6}\u{1F1EA}' };
        const flag = n => { n = n.toLowerCase(); for (const k in FLAGS) if (n.includes(k)) return FLAGS[k]; return '\u{1F3C1}'; };
        const fmt = (d, t) => new Date(d + 'T' + (t || '12:00:00Z')).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

        function sessionRow(label, date, time, now, isRace) {
            const past = new Date(date + 'T' + (time || '12:00:00Z')).getTime() < now;
            return '<div class="hub-session' + (isRace ? ' hub-session-race' : '') + (past ? ' done' : '') + '">' +
                '<span class="hub-session-name">' + label + '</span>' +
                '<span class="hub-session-time">' + fmt(date, time) + '</span>' +
                (past ? '<span class="hub-session-done">Completed</span>' : '') + '</div>';
        }

        async function initHub() {
            try {
                const data = await cachedJson(API + '.json');
                const races = data?.MRData?.RaceTable?.Races || [];
                if (!races.length) return;
                const now = Date.now();
                // current weekend counts until 24h after lights-out; else next upcoming; else finale
                const race = races.find(r => new Date(r.date + 'T' + (r.time || '14:00:00Z')).getTime() + 86400000 > now) || races[races.length - 1];

                document.getElementById('hubRound').textContent = 'Round ' + race.round + ' · 2026';
                document.getElementById('hubTitle').textContent = flag(race.raceName) + ' ' + race.raceName;
                document.getElementById('hubCircuit').textContent = race.Circuit.circuitName + ' — ' + race.Circuit.Location.locality + ', ' + race.Circuit.Location.country;
                document.getElementById('hubTz').textContent = 'All times shown in your local timezone (' + Intl.DateTimeFormat().resolvedOptions().timeZone + ')';

                const S = [['FirstPractice', 'Practice 1'], ['SecondPractice', 'Practice 2'], ['ThirdPractice', 'Practice 3'], ['SprintQualifying', 'Sprint Qualifying'], ['Sprint', 'Sprint'], ['Qualifying', 'Qualifying']];
                let html = '';
                S.forEach(([k, label]) => { if (race[k]) html += sessionRow(label, race[k].date, race[k].time, now); });
                html += sessionRow('Race', race.date, race.time, now, true);
                document.getElementById('hubSessions').innerHTML = html;

                // Results appear automatically once the API has them
                try {
                    const res = await cachedJson(API + '/' + race.round + '/results.json?limit=3');
                    const podium = res?.MRData?.RaceTable?.Races?.[0]?.Results || [];
                    if (podium.length) {
                        document.getElementById('hubResultsSection').hidden = false;
                        document.getElementById('hubPodium').innerHTML = podium.map(p =>
                            '<div class="hub-podium-item pos-' + p.position + '">' +
                            '<span class="hub-podium-pos">P' + p.position + '</span>' +
                            '<span class="hub-podium-name">' + sanitizeHTML(p.Driver.givenName + ' ' + p.Driver.familyName) + '</span>' +
                            '<span class="hub-podium-team">' + sanitizeHTML(p.Constructor.name) + '</span></div>').join('');
                    }
                } catch (e) { /* no results yet */ }
            } catch (e) {
                document.getElementById('hubSessions').innerHTML = '<p style="color: rgba(255,255,255,0.65)">Could not load live data. Check the <a href="calendar.html">calendar</a>.</p>';
            }
        }

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHub);
        else initHub();
    })();
    </script>
'''

page = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Race Hub - This Weekend's Grand Prix - F1wow News</title>
    <meta name="description" content="Everything for the current F1 race weekend: session times in your timezone, countdown, results and standings - updated automatically.">
    <link rel="canonical" href="{SITE}/race-hub.html">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{SITE}/race-hub.html">
    <meta property="og:title" content="F1 Race Hub - This Weekend's Grand Prix">
    <meta property="og:description" content="Session times, countdown, results and standings for the current F1 race weekend.">
    <meta property="og:image" content="{SITE}/f1-car-hero.webp">
    <meta property="og:site_name" content="F1wow News">
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
    {GA}
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>

    {header}

    <main class="main" id="main">
        <div class="container">
            <section class="hero-section" style="min-height: 220px;">
                <div class="hero-content" style="text-align: center;">
                    <span class="hero-badge" id="hubRound">Race Weekend</span>
                    <h1 class="hero-title" id="hubTitle">Race Hub</h1>
                    <p class="hero-subtitle next-race-name" id="hubCircuit">Loading this weekend's Grand Prix...</p>
                    <div class="countdown-container" id="countdown" style="justify-content: center;">
                        <div class="countdown-item"><span class="countdown-number" id="days">00</span><span class="countdown-label">Days</span></div>
                        <div class="countdown-item"><span class="countdown-number" id="hours">00</span><span class="countdown-label">Hours</span></div>
                        <div class="countdown-item"><span class="countdown-number" id="minutes">00</span><span class="countdown-label">Minutes</span></div>
                        <div class="countdown-item"><span class="countdown-number" id="seconds">00</span><span class="countdown-label">Seconds</span></div>
                    </div>
                </div>
            </section>

            <section class="hub-section">
                <div class="section-header"><h2>Weekend Schedule</h2></div>
                <p class="hub-tz-note" id="hubTz"></p>
                <div class="hub-sessions" id="hubSessions"><div class="loading">Loading sessions...</div></div>
            </section>

            <section class="hub-section" id="hubResultsSection" hidden>
                <div class="section-header"><h2>Race Result</h2></div>
                <div class="hub-podium" id="hubPodium"></div>
            </section>

            <section class="hub-section">
                <div class="section-header"><h2>Keep Exploring</h2></div>
                <div class="hub-links">
                    <a href="championship.html" class="quick-nav-btn primary">Championship Standings</a>
                    <a href="calendar.html" class="quick-nav-btn">Full Calendar</a>
                    <a href="race-reports.html" class="quick-nav-btn">Race Reports</a>
                </div>
            </section>
        </div>
    </main>

    {footer}

    <script src="script.js?v=20260718b"></script>
{script}
</body>
</html>
'''
open('race-hub.html', 'w', encoding='utf-8').write(page)
print('race-hub.html created')
