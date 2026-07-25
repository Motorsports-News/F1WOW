# Generate Hungarian GP 2026 Qualifying report
import re

base = open('belgian-gp-2026.html', encoding='utf-8').read()
SITE = 'https://f1wownews.com'
SLUG = 'hungarian-gp-2026-qualifying.html'
DATE = '2026-07-26'

TITLE = 'Hungarian GP 2026 Qualifying: Norris Beats Hamilton to Pole by 0.012s'
DESC = "Hungarian Grand Prix 2026 qualifying results: Lando Norris pips Lewis Hamilton to pole by just 0.012s at the Hungaroring, his first pole as world champion, on a rare off-day for Mercedes."

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
head = re.sub(r'"headline": "[^"]*"', f'"headline": "{TITLE}"', head)
head = re.sub(r'"description": "[^"]*"', '"description": "' + DESC.replace('"', '\\"') + '"', head)
head = re.sub(r'"datePublished": "[^"]*"', f'"datePublished": "{DATE}"', head)
head = re.sub(r'"dateModified": "[^"]*"', f'"dateModified": "{DATE}"', head)
head = re.sub(r'"name": "2026 Japanese Grand Prix"', '"name": "2026 Hungarian Grand Prix"', head)
head = re.sub(r'"name":"Belgian[^"]*"', '"name":"Hungarian GP 2026 Qualifying"', head)
head = re.sub(r'"name": "Belgian[^"]*"', '"name": "Hungarian GP 2026 Qualifying"', head)
head = head.replace('src="script.js"', 'src="script.js?v=20260726a"')

RADIO_CSS = '''
    <style>
        .radio-box { background: rgba(225,6,0,0.06); border: 1px solid rgba(225,6,0,0.35); border-radius: 12px; padding: 18px 22px; margin: 26px 0; }
        .radio-box-head { display: flex; align-items: center; gap: 8px; font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: var(--f1-red); font-size: 0.85rem; margin-bottom: 10px; }
        .radio-box blockquote { margin: 0; font-size: 1.2rem; line-height: 1.55; color: #fff; font-style: italic; }
        .radio-box cite { display: block; margin-top: 8px; font-style: normal; font-size: 0.8rem; color: rgba(255,255,255,0.55); letter-spacing: 0.04em; }
    </style>'''
head = head.replace('</head>', RADIO_CSS + '\n</head>')

body = '''    <main class="main" id="main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Hungarian GP 2026 Qualifying</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top">
                        <span class="article-category">Qualifying</span>
                        <span class="article-date"><time datetime="''' + DATE + '''">July 26, 2026</time></span>
                    </div>
                    <h1 class="article-title-full">Twelve Thousandths: Norris Snatches Hungary Pole from Hamilton in Qualifying Thriller</h1>
                    <p class="article-subtitle-full">Lando Norris edged Lewis Hamilton by a barely-believable 0.012s to take pole for the Hungarian Grand Prix &mdash; his first since becoming world champion &mdash; as Mercedes endured its scrappiest qualifying of the 2026 season.</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By <a href="about.html" class="author-link">F1wow Team</a></span>
                        <span class="article-read-time">4 min read</span>
                    </div>
                </div>
            </div>

            <div class="article-content">
                <div class="article-intro">
                    <p><strong>BUDAPEST</strong> &mdash; It does not get closer than this. Lando Norris produced a stunning final lap at the Hungaroring to beat Lewis Hamilton to pole position by just <strong>0.012 seconds</strong>, denying the Ferrari driver a fairytale front-row headline and claiming his first pole since he was crowned world champion. On a chaotic Q3 that featured a Max Verstappen spin and a George Russell stoppage, it was McLaren's man who kept his cool when it mattered most.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F3C6</span> The Pole Lap: 0.012s of Daylight</h2>
                    <p>Hamilton had looked set for a remarkable pole, fastest through the first and final sectors and provisionally clear of the field &mdash; the timing screens flagging that he was on course to become the oldest polesitter in more than four decades. But Norris, running one of the last laps of the session, found just enough. A 1:17.207 put him twelve-thousandths of a second ahead: the width of a visor, and the difference between P1 and P2.</p>
                    <p>Charles Leclerc completed a stellar showing for the front two rows in third, with championship leader Kimi Antonelli fourth. The drama peaked in the closing seconds as Russell stopped on track, triggering double waved yellows &mdash; but Norris had already crossed the line, his pole safe.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F4CA</span> Hungarian GP 2026 Qualifying Results (Top 10)</h2>
                    <div class="standings-container">
                        <table class="standings-table" aria-label="Hungarian Grand Prix 2026 qualifying top 10">
                            <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Gap</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>1</td><td>Lando Norris</td><td>McLaren</td><td>1:17.207</td></tr>
                                <tr class="standings-row"><td>2</td><td>Lewis Hamilton</td><td>Ferrari</td><td>+0.012</td></tr>
                                <tr class="standings-row"><td>3</td><td>Charles Leclerc</td><td>Ferrari</td><td>+0.238</td></tr>
                                <tr class="standings-row"><td>4</td><td>Kimi Antonelli</td><td>Mercedes</td><td>+0.272</td></tr>
                                <tr class="standings-row"><td>5</td><td>Oscar Piastri</td><td>McLaren</td><td>+0.477</td></tr>
                                <tr class="standings-row"><td>6</td><td>Max Verstappen</td><td>Red Bull</td><td>+0.518</td></tr>
                                <tr class="standings-row"><td>7</td><td>George Russell</td><td>Mercedes</td><td>+0.553</td></tr>
                                <tr class="standings-row"><td>8</td><td>Isack Hadjar</td><td>Red Bull</td><td>+0.649</td></tr>
                                <tr class="standings-row"><td>9</td><td>Arvid Lindblad</td><td>Racing Bulls</td><td>+1.074</td></tr>
                                <tr class="standings-row"><td>10</td><td>Nico Hulkenberg</td><td>Haas</td><td>+1.479</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p style="font-size:0.9rem; color:rgba(255,255,255,0.6);">Eliminated in Q2 (11&ndash;16): Lawson, Gasly, Colapinto, Bortoleto, Ocon, Alonso. Eliminated in Q1 (17&ndash;22): Bearman, Sainz, Albon, Stroll, Bottas, Perez. <em>Classification provisional pending stewards.</em></p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F4C9</span> Mercedes' First Off-Day</h2>
                    <p>For a team that has set the pace for much of 2026, this was a jarring result. Antonelli, who arrives in Hungary with a commanding championship lead, could manage only fourth, while Russell's session ended with his car stopped on circuit &mdash; leaving him seventh and Mercedes without a genuine crack at pole for the first time this year. On a weekend where McLaren's upgraded car finally clicked, the Silver Arrows looked, for once, beatable.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F3CE️</span> Verstappen Spin, Leclerc's Escape</h2>
                    <p>It was a session that kept everyone honest. Verstappen spun on his final effort in Q3 and had to settle for sixth, unable to string together the lap the Red Bull was capable of. Earlier, Leclerc had a heart-in-mouth Q2, dropping into the elimination zone before hauling himself back up to finish second in the segment and dodge a shock early exit &mdash; before going on to qualify a strong third.</p>
                    <p>There was reason to cheer further back, too: Fernando Alonso reached Q2 for the first time this season, a small but welcome step for Aston Martin.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F4FB</span> Star of the Underdogs: Arvid Lindblad</h2>
                    <p>The breakout name of the session was Arvid Lindblad, who dragged his Racing Bulls into the top-10 shootout and lined up ninth &mdash; a superb effort at a track that rewards commitment. His radio message on the way into Q3 summed up the mood in the garage:</p>
                    <figure class="radio-box">
                        <figcaption class="radio-box-head">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
                            Team Radio &middot; Arvid Lindblad
                        </figcaption>
                        <blockquote>"For me we seem genuinely competitive, so let's throw everything at it."</blockquote>
                        <cite>&mdash; Arvid Lindblad, on the run into Q3</cite>
                    </figure>
                    <p>Nico Hulkenberg made it two surprise names in Q3, rounding out the top 10 for Haas.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F52E</span> What It Means for Sunday</h2>
                    <p>The Hungaroring is notoriously difficult to overtake on, which makes Norris's pole hugely valuable &mdash; track position here is worth more than almost anywhere else on the calendar. But with Hamilton alongside him on the front row by a fingernail, two Ferraris in the mix, and Antonelli looking to protect his title lead, Sunday promises a tense afternoon. Follow it live on our <a href="race-hub.html">Race Hub</a>, and see how the title race stands on the <a href="championship.html">championship standings and graph</a>.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F517</span> Sources</h2>
                    <p style="color: rgba(255,255,255,0.7); font-size:0.9rem;">Live session timing and classification. Corroborating coverage: <a href="https://www.autosport.com/f1/live-text/f1-hungarian-gp-live-commentary-and-updates-qualifying-1127473/1127473/" target="_blank" rel="noopener">Autosport live</a>, <a href="https://www.planetf1.com/news/f1-results-hungarian-grand-prix-2026-qualifying" target="_blank" rel="noopener">PlanetF1</a>. Results provisional pending FIA stewards.</p>
                </div>
''' + share.rstrip() + '''
            </div>
        </article>

        <!-- Related Articles -->
        <section class="related-articles">
            <div class="container">
                <h2>Related Articles</h2>
                <div class="related-grid">
                    <a href="belgian-gp-2026.html" class="related-card">
                        <span class="related-category">Race Report</span>
                        <h4>Belgian GP 2026: Antonelli Wins at Spa as Russell Retires</h4>
                    </a>
                    <a href="championship.html" class="related-card">
                        <span class="related-category">Standings</span>
                        <h4>2026 Championship Standings &amp; Progression Graph</h4>
                    </a>
                    <a href="most-positions-gained-2026.html" class="related-card">
                        <span class="related-category">Stat Attack</span>
                        <h4>Comeback Kings of 2026: The Biggest Position Gains</h4>
                    </a>
                    <a href="race-hub.html" class="related-card">
                        <span class="related-category">Race Hub</span>
                        <h4>This Weekend's Grand Prix: Times &amp; Results</h4>
                    </a>
                </div>
            </div>
        </section>
    '''

share_url = f'{SITE}/hungarian-gp-2026-qualifying'
body = body.replace('https://f1wownews.com/belgian-gp-2026.html', share_url)
body = body.replace('text=Belgian GP 2026: Antonelli Wins at Spa as Russell Retires',
                    'text=Norris beats Hamilton to Hungary pole by 0.012s')

out = head + body + tail
open(SLUG, 'w', encoding='utf-8').write(out)
print('written', SLUG, len(out), 'bytes')
