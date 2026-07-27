# Generate Hungarian GP 2026 RACE report (verified from Jolpica API round 11)
import re

base = open('belgian-gp-2026.html', encoding='utf-8').read()
SITE = 'https://f1wownews.com'
SLUG = 'hungarian-gp-2026-race.html'
DATE = '2026-07-26'

TITLE = 'Hungarian GP 2026: Norris Wins from Pole - 17 Years to the Day After Hamilton\'s First Title-Winning Victory'
DESC = "Lando Norris converts pole into victory at the Hungarian Grand Prix 2026, his first win since being crowned world champion - achieved on the exact same date, July 26, that Lewis Hamilton won his first race as champion in 2009."

head = base[:base.find('<main')]
share = re.search(r'[ \t]*<!-- Share Section -->\s*<div class="article-share">[\s\S]*?</div>\s*</div>\n', base).group(0)
tail = base[base.find('</main>'):]

head = re.sub(r'<title>[^<]*</title>', f'<title>{TITLE} - F1wow News</title>', head)
head = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'belgian-gp-2026\.html', SLUG, head)
head = re.sub(r'(property="og:title" content=")[^"]*', r'\g<1>' + TITLE, head)
head = re.sub(r'(name="twitter:title" content=")[^"]*', r'\g<1>' + TITLE, head)
head = re.sub(r'(property="og:description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'(name="twitter:description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'(article:published_time" content=")[^"]*', r'\g<1>' + DATE, head)
head = re.sub(r'"headline": "[^"]*"', '"headline": "' + TITLE.replace('"', '\\"') + '"', head)
head = re.sub(r'"description": "[^"]*"', '"description": "' + DESC.replace('"', '\\"') + '"', head)
head = re.sub(r'"datePublished": "[^"]*"', f'"datePublished": "{DATE}"', head)
head = re.sub(r'"dateModified": "[^"]*"', f'"dateModified": "{DATE}"', head)
head = re.sub(r'"name": "2026 Japanese Grand Prix"', '"name": "2026 Hungarian Grand Prix"', head)
head = re.sub(r'"name":"Belgian[^"]*"', '"name":"Hungarian GP 2026 Race Report"', head)
head = re.sub(r'"name": "Belgian[^"]*"', '"name": "Hungarian GP 2026 Race Report"', head)
head = head.replace('src="script.js"', 'src="script.js?v=20260726g"')

FACTS_CSS = '''
    <style>
        .quali-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin: 24px 0; clear: both; }
        .quali-fact { background: var(--f1-dark); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; }
        .quali-fact .qf-num { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.9rem; color: var(--f1-red); line-height: 1; font-variant-numeric: tabular-nums; }
        .quali-fact .qf-label { font-size: 0.8rem; color: rgba(255, 255, 255, 0.7); margin-top: 6px; letter-spacing: 0.03em; }
    </style>'''
head = head.replace('</head>', FACTS_CSS + '\n</head>')

body = '''    <main class="main" id="main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Hungarian GP 2026 Race Report</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top">
                        <span class="article-category">Race Report</span>
                        <span class="article-date"><time datetime="''' + DATE + '''">July 26, 2026</time></span>
                    </div>
                    <h1 class="article-title-full">Norris Wins Hungarian GP From Pole &mdash; Exactly 17 Years After Hamilton's First Win as Champion</h1>
                    <p class="article-subtitle-full">Lando Norris converted pole position into his first victory since being crowned world champion, controlling the Hungaroring from lights to flag &mdash; on the same calendar date, July 26, that Lewis Hamilton won his own first race as reigning champion back in 2009.</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By <a href="about.html" class="author-link">F1wow Team</a></span>
                        <span class="article-read-time">5 min read</span>
                    </div>
                </div>
            </div>

            <div class="article-content">
                <div class="article-intro">
                    <p><strong>BUDAPEST, July 26</strong> &mdash; Lando Norris made Saturday's 0.012-second pole battle count on Sunday, leading every lap of the Hungarian Grand Prix to take his first win since becoming world champion. It is a result with a remarkable footnote: Norris's victory landed on <strong>July 26</strong> &mdash; the exact date, 17 years apart, that <strong>Lewis Hamilton</strong> won his own first race as a reigning champion, at this same circuit, back in <strong>2009</strong>.</p>
                </div>

                <div class="quali-facts" aria-label="Race key facts">
                    <div class="quali-fact"><div class="qf-num">P1&rarr;P1</div><div class="qf-label">Norris: pole to flag</div></div>
                    <div class="quali-fact"><div class="qf-num">+15.080</div><div class="qf-label">Verstappen's gap to the win</div></div>
                    <div class="quali-fact"><div class="qf-num">17 yrs</div><div class="qf-label">Since Hamilton's Hungary title-winning first win</div></div>
                    <div class="quali-fact"><div class="qf-num">219</div><div class="qf-label">Antonelli's championship points lead</div></div>
                </div>

                <div class="article-section">
                    <h2>How the Race Was Won</h2>
                    <p>Norris made a clean getaway from pole and was never seriously troubled, controlling the pace from the front through a Hungaroring afternoon where track position is everything. Max Verstappen recovered from a difficult qualifying to climb from fourth on the grid to second at the flag, 15.080 seconds behind, while Kimi Antonelli brought his Mercedes home third from seventh on the grid &mdash; a strong damage-limitation drive on a weekend where the championship leader's car lacked pole-position pace.</p>
                    <p>Charles Leclerc took fourth for Ferrari and set the race's fastest lap, with teammate Lewis Hamilton fifth after starting from fifth on the grid. It was a quiet, incident-light afternoon at the front compared to Saturday's dramatic qualifying &mdash; exactly the kind of controlled, hard-earned victory that suited a driver looking to open his season-long win account as champion.</p>
                    <p>Further back, Oscar Piastri's race ended in retirement from third on the grid &mdash; a costly blow for McLaren's other title contender on a day his teammate delivered the team's biggest result of the season.</p>
                </div>

                <div class="article-section">
                    <h2>Hungarian GP 2026: Race Results (Top 10)</h2>
                    <div class="standings-container">
                        <table class="standings-table" aria-label="Hungarian Grand Prix 2026 race results">
                            <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Time / Gap</th><th>Pts</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>1</td><td>Lando Norris</td><td>McLaren</td><td>1:39:56.180</td><td>25</td></tr>
                                <tr class="standings-row"><td>2</td><td>Max Verstappen</td><td>Red Bull</td><td>+15.080</td><td>18</td></tr>
                                <tr class="standings-row"><td>3</td><td>Kimi Antonelli</td><td>Mercedes</td><td>+18.728</td><td>15</td></tr>
                                <tr class="standings-row"><td>4</td><td>Charles Leclerc</td><td>Ferrari</td><td>+23.840</td><td>12</td></tr>
                                <tr class="standings-row"><td>5</td><td>Lewis Hamilton</td><td>Ferrari</td><td>+24.540</td><td>10</td></tr>
                                <tr class="standings-row"><td>6</td><td>Isack Hadjar</td><td>Red Bull</td><td>+55.488</td><td>8</td></tr>
                                <tr class="standings-row"><td>7</td><td>George Russell</td><td>Mercedes</td><td>+57.503</td><td>6</td></tr>
                                <tr class="standings-row"><td>8</td><td>Liam Lawson</td><td>RB</td><td>+28.033 (lapped)</td><td>4</td></tr>
                                <tr class="standings-row"><td>9</td><td>Nico H&uuml;lkenberg</td><td>Audi</td><td>+30.382 (lapped)</td><td>2</td></tr>
                                <tr class="standings-row"><td>10</td><td>Arvid Lindblad</td><td>RB</td><td>+51.050 (lapped)</td><td>1</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p style="font-size:0.9rem; color:rgba(255,255,255,0.6);">Fastest lap: Charles Leclerc (Ferrari). Retirements: Oscar Piastri (McLaren), Sergio P&eacute;rez (Cadillac), Valtteri Bottas (Cadillac).</p>
                </div>

                <div class="article-section">
                    <h2>The July 26 Connection</h2>
                    <p>The date is the story here. On <strong>July 26, 2009</strong>, Lewis Hamilton &mdash; then the reigning world champion &mdash; won the Hungarian Grand Prix for the first time since claiming his title the previous year, ending a difficult start to his championship defence. Seventeen years later to the day, at the very same circuit, <strong>Lando Norris</strong> did the same thing: his first win since being crowned champion, delivered at the Hungaroring on July 26, 2026.</p>
                    <p>Two drivers, one circuit, one calendar date, 17 years apart &mdash; both marking their first victory as a reigning world champion. It's the kind of coincidence Formula 1's numbers throw up every so often, and it was spotted and shared by <strong><a href="https://instagram.com/f1guydan" target="_blank" rel="noopener">@f1guydan</a></strong>, credited via <a href="https://instagram.com/f1wow" target="_blank" rel="noopener">@f1wow</a>.</p>
                </div>

                <div class="article-section">
                    <h2>Championship State After Hungary</h2>
                    <p>Kimi Antonelli's third place keeps him firmly in control of the title race, extending his championship lead to <strong>219 points</strong> with six wins from eleven rounds. Hamilton's fifth place is enough to hold second on 169 points, with Russell's seventh keeping him third on 160. Leclerc's fourth moves him up to 138, while Norris's win lifts him to 128 points &mdash; a timely response as the season heads into its summer break.</p>
                    <p>Follow every shift in the title fight on our <a href="championship.html">interactive championship graph</a>, and see the full grid history on the <a href="calendar.html">2026 calendar</a>.</p>
                </div>

                <div class="article-section">
                    <h2>What's Next</h2>
                    <p>Formula 1 now breaks for its traditional summer shutdown before resuming at the <strong>Dutch Grand Prix</strong> at Zandvoort (August 21&ndash;23) &mdash; a circuit where Max Verstappen's home support and McLaren's recent form should make for another compelling weekend. Check every session time on our <a href="race-hub.html">Race Hub</a> when the calendar resumes.</p>
                </div>
''' + share.rstrip() + '''
            </div>
        </article>

        <!-- Related Articles -->
        <section class="related-articles">
            <div class="container">
                <h2>Related Articles</h2>
                <div class="related-grid">
                    <a href="hungarian-gp-2026-qualifying.html" class="related-card">
                        <span class="related-category">Qualifying</span>
                        <h4>Hungarian GP 2026 Qualifying: Norris Beats Hamilton to Pole by 0.012s</h4>
                    </a>
                    <a href="hamilton-grid-penalty-hungarian-gp-2026.html" class="related-card">
                        <span class="related-category">Breaking</span>
                        <h4>Hamilton Hit With Three-Place Grid Penalty for Impeding Piastri</h4>
                    </a>
                    <a href="belgian-gp-2026.html" class="related-card">
                        <span class="related-category">Race Report</span>
                        <h4>Belgian GP 2026: Antonelli Wins at Spa as Russell Retires</h4>
                    </a>
                    <a href="championship.html" class="related-card">
                        <span class="related-category">Standings</span>
                        <h4>2026 Championship Standings &amp; Progression Graph</h4>
                    </a>
                </div>
            </div>
        </section>
    '''

share_url = f'{SITE}/hungarian-gp-2026-race'
body = body.replace('https://f1wownews.com/belgian-gp-2026.html', share_url)
body = body.replace('text=Belgian GP 2026: Antonelli Wins at Spa as Russell Retires',
                    'text=Norris wins Hungarian GP - 17 years to the day after Hamilton\'s first title-winning win')

out = head + body + tail
open(SLUG, 'w', encoding='utf-8').write(out)
print('written', SLUG, len(out), 'bytes')
