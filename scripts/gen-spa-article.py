# Generate Belgian GP 2026 race report from japan-gp-2026.html skeleton
import re

s = open('japan-gp-2026.html', encoding='utf-8').read()
SITE = 'https://f1wownews.com'
SLUG = 'belgian-gp-2026'

TITLE = 'Belgian GP 2026 Results: Antonelli Wins at Spa as Russell Retires'
DESC = 'Belgian Grand Prix 2026 results: Kimi Antonelli wins at Spa-Francorchamps from pole, Leclerc and Verstappen complete the podium, and Russell\'s retirement hands Hamilton P2 in the championship.'

head = s[:s.find('<main')]
tail = s[s.find('</main>'):]

# --- rewrite head metadata ---
head = re.sub(r'<title>[^<]*</title>', f'<title>{TITLE} - F1wow News</title>', head)
head = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'japan-gp-2026\.html', SLUG + '.html', head)
head = re.sub(r'(property="og:title" content=")[^"]*', r'\g<1>' + TITLE, head)
head = re.sub(r'(name="twitter:title" content=")[^"]*', r'\g<1>' + TITLE, head)
head = re.sub(r'(property="og:description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'(name="twitter:description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'(article:published_time" content=")[^"]*', r'\g<1>2026-07-19', head)
# JSON-LD block: replace headline/description/dates/url inside it
head = re.sub(r'"headline": "[^"]*"', f'"headline": "{TITLE}"', head)
head = re.sub(r'"description": "[^"]*"', '"description": "' + DESC.replace('"', '\\"') + '"', head)
head = re.sub(r'"datePublished": "[^"]*"', '"datePublished": "2026-07-19"', head)
head = re.sub(r'"dateModified": "[^"]*"', '"dateModified": "2026-07-19"', head)

body = '''    <main class="main" id="main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Belgian GP 2026 Results</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top">
                        <span class="article-category">Race Report</span>
                        <span class="article-date"><time datetime="2026-07-19">July 19, 2026</time></span>
                    </div>
                    <h1 class="article-title-full">Antonelli Conquers Spa: Sixth Win of 2026 as Russell Retirement Reshapes Title Fight</h1>
                    <p class="article-subtitle-full">Belgian Grand Prix 2026: Kimi Antonelli converts pole into a controlled victory at Spa-Francorchamps, Charles Leclerc and Max Verstappen join him on the podium — and George Russell's retirement hands Lewis Hamilton second in the championship.</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By <a href="about.html" class="author-link">F1wow Team</a></span>
                        <span class="article-read-time">4 min read</span>
                    </div>
                </div>
            </div>

            <div class="article-content">
                <div class="article-intro">
                    <p><strong>SPA-FRANCORCHAMPS, July 19</strong> — Kimi Antonelli extended his championship lead with a commanding lights-to-flag victory in the 2026 Belgian Grand Prix, his sixth win of the season. But the result that may matter most happened behind him: George Russell, who started third, retired — and with Lewis Hamilton finishing fourth, the Ferrari driver now sits second in the <a href="championship.html">drivers' championship</a> at the halfway mark of the season.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">🏁</span> How the Race Was Won</h2>
                    <p>Starting from pole, Antonelli controlled the opening stint through Eau Rouge and Raidillon, managing the gap to Verstappen behind. Leclerc, who started fourth, produced the decisive move of the afternoon on the Kemmel Straight, clearing Verstappen for second and setting off after the Mercedes — but Antonelli always had the answer, taking the flag 1.9 seconds clear after 1 hour, 24 minutes and 42 seconds of racing.</p>
                    <p>Verstappen held on to third for Red Bull, his fourth podium of the season, while Hamilton recovered from fifth on the grid to fourth — a result that looks modest until you check the <a href="championship.html">championship table</a>.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">📊</span> Belgian GP 2026: Race Results</h2>
                    <div class="standings-container">
                        <table class="standings-table results-full" aria-label="Belgian Grand Prix 2026 race results">
                            <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Time / Status</th><th>Pts</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>1</td><td>Kimi Antonelli</td><td>Mercedes</td><td>1:24:42.479</td><td>25</td></tr>
                                <tr class="standings-row"><td>2</td><td>Charles Leclerc</td><td>Ferrari</td><td>+1.952</td><td>18</td></tr>
                                <tr class="standings-row"><td>3</td><td>Max Verstappen</td><td>Red Bull</td><td>+11.586</td><td>15</td></tr>
                                <tr class="standings-row"><td>4</td><td>Lewis Hamilton</td><td>Ferrari</td><td>+17.245</td><td>12</td></tr>
                                <tr class="standings-row"><td>5</td><td>Oscar Piastri</td><td>McLaren</td><td>+18.988</td><td>10</td></tr>
                                <tr class="standings-row"><td>6</td><td>Isack Hadjar</td><td>Red Bull</td><td>+23.307</td><td>8</td></tr>
                                <tr class="standings-row"><td>7</td><td>Lando Norris</td><td>McLaren</td><td>+24.014</td><td>6</td></tr>
                                <tr class="standings-row"><td>8</td><td>Gabriel Bortoleto</td><td>Audi</td><td>+49.140</td><td>4</td></tr>
                                <tr class="standings-row"><td>9</td><td>Arvid Lindblad</td><td>RB</td><td>+50.406</td><td>2</td></tr>
                                <tr class="standings-row"><td>10</td><td>Franco Colapinto</td><td>Alpine</td><td>+1:16.037</td><td>1</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p>Fastest lap: Lando Norris, 1:48.890. Retirements: George Russell (Mercedes), Lance Stroll (Aston Martin), Sergio Pérez (Cadillac).</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">💥</span> Russell's Nightmare, Hamilton's Gain</h2>
                    <p>The defining moment of the championship battle came not at the front but in the Mercedes garage. Russell, running comfortably in the podium fight from third on the grid, was forced to retire the car — his first non-score since Monaco. The retirement is doubly painful: teammate Antonelli added another 25 points to his tally, and Hamilton's fourth place was enough to leapfrog Russell into second overall, 159 points to 154.</p>
                    <p>Antonelli now leads the standings on 204 points — a 45-point cushion at the season's halfway point, with six wins from ten rounds.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">🚀</span> Drive of the Day: Hadjar From 21st to 6th</h2>
                    <p>Isack Hadjar delivered the recovery drive of the season so far, carving from 21st on the grid to sixth at the flag for Red Bull — 15 places gained around the longest lap on the calendar. Lando Norris also made quiet progress, climbing from 13th to seventh and banking the fastest lap late on fresh softs.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">📈</span> Championship Standings After Round 10</h2>
                    <div class="standings-container">
                        <table class="standings-table" aria-label="Drivers championship standings after Belgian GP">
                            <thead><tr><th>Pos</th><th>Driver</th><th>Points</th><th>Wins</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>1</td><td>Kimi Antonelli</td><td>204</td><td>6</td></tr>
                                <tr class="standings-row"><td>2</td><td>Lewis Hamilton</td><td>159</td><td>1</td></tr>
                                <tr class="standings-row"><td>3</td><td>George Russell</td><td>154</td><td>2</td></tr>
                                <tr class="standings-row"><td>4</td><td>Charles Leclerc</td><td>126</td><td>1</td></tr>
                                <tr class="standings-row"><td>5</td><td>Lando Norris</td><td>103</td><td>0</td></tr>
                                <tr class="standings-row"><td>6</td><td>Oscar Piastri</td><td>92</td><td>0</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p>Explore the full battle on our <a href="championship.html">interactive championship graph</a>, and see every session time for the next round on the <a href="race-hub.html">Race Hub</a>.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">🔮</span> What's Next: Hungary</h2>
                    <p>The season continues next weekend at the Hungaroring for the Hungarian Grand Prix (July 24–26) — a maximum-downforce circuit that should suit Mercedes and McLaren. Russell arrives with a point to prove; Hamilton arrives with second in the championship to defend. Check the <a href="calendar.html">full 2026 calendar</a> for every remaining round.</p>
                </div>
            </div>
        </article>

        <!-- Related Articles -->
        <section class="related-articles">
            <div class="container">
                <h2>Related Articles</h2>
                <div class="related-grid">
                    <a href="hamilton-ferrari-barcelona-win.html" class="related-card">
                        <span class="related-category">Race Report</span>
                        <h4>Hamilton Wins Barcelona GP for Ferrari</h4>
                    </a>
                    <a href="canada-gp-2026.html" class="related-card">
                        <span class="related-category">Race Report</span>
                        <h4>Canadian GP 2026 - Antonelli Makes It Five in a Row</h4>
                    </a>
                    <a href="antonelli-maiden-win.html" class="related-card">
                        <span class="related-category">Race Report</span>
                        <h4>Kimi Antonelli Takes Maiden F1 Win in China</h4>
                    </a>
                    <a href="regulations-2026-article.html" class="related-card">
                        <span class="related-category">Technical</span>
                        <h4>F1 2026 vs 2025 Regulations: Complete Guide</h4>
                    </a>
                </div>
            </div>
        </section>
    '''

out = head + body + tail
# breadcrumb JSON-LD name fix (copied file may carry japan breadcrumb schema)
out = re.sub(r'"name":"Japanese[^"]*"', '"name":"Belgian GP 2026 Results"', out)
out = re.sub(r'"name": "Japanese[^"]*"', '"name": "Belgian GP 2026 Results"', out)
open(SLUG + '.html', 'w', encoding='utf-8').write(out)
print('written', SLUG + '.html', len(out), 'bytes')
