# Generate Hungarian GP 2026 Qualifying report (v2: wider layout, embed, more depth)
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

EXTRA_CSS = '''
    <style>
        /* Qualifying report — wider layout so content fills the page */
        .article-full .article-content { max-width: 1080px; }
        .article-full .article-section p,
        .article-full .article-intro p { font-size: 1.05rem; }
        /* Team radio box */
        .radio-box { background: rgba(225,6,0,0.06); border: 1px solid rgba(225,6,0,0.35); border-radius: 12px; padding: 18px 22px; margin: 26px 0; clear: both; }
        .radio-box-head { display: flex; align-items: center; gap: 8px; font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: var(--f1-red); font-size: 0.85rem; margin-bottom: 10px; }
        .radio-box blockquote { margin: 0; font-size: 1.2rem; line-height: 1.55; color: #fff; font-style: italic; }
        .radio-box cite { display: block; margin-top: 8px; font-style: normal; font-size: 0.8rem; color: rgba(255,255,255,0.55); letter-spacing: 0.04em; }
        /* Inline Instagram embed, medium size, floated so text wraps and fills width */
        .ig-embed-float { float: right; width: 340px; max-width: 100%; margin: 4px 0 18px 30px; }
        .ig-embed-float .instagram-media { min-width: 0 !important; width: 100% !important; margin: 0 auto !important; }
        .ig-embed-caption { font-size: 0.78rem; color: rgba(255,255,255,0.5); text-align: center; margin-top: 6px; }
        .article-full .article-section h2 { clear: both; }
        @media (max-width: 768px) {
            .ig-embed-float { float: none; width: 100%; max-width: 460px; margin: 20px auto; }
        }
        /* Key-facts strip */
        .quali-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin: 24px 0; clear: both; }
        .quali-fact { background: var(--f1-dark); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 16px; }
        .quali-fact .qf-num { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.9rem; color: var(--f1-red); line-height: 1; font-variant-numeric: tabular-nums; }
        .quali-fact .qf-label { font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-top: 6px; letter-spacing: 0.03em; }
    </style>'''
head = head.replace('</head>', EXTRA_CSS + '\n</head>')

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
                    <h1 class="article-title-full">Twelve Thousandths: Norris Denies Hamilton Hungary Pole in a Qualifying Classic</h1>
                    <p class="article-subtitle-full">One-hundredth of a heartbeat separated glory from agony. Lando Norris beat Lewis Hamilton to pole at the Hungaroring by 0.012 seconds &mdash; his first as world champion &mdash; as Ferrari surged, Mercedes stumbled and Verstappen spun.</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By <a href="about.html" class="author-link">F1wow Team</a></span>
                        <span class="article-read-time">6 min read</span>
                    </div>
                </div>
            </div>

            <div class="article-content">
                <div class="article-intro">
                    <p><strong>BUDAPEST</strong> &mdash; It does not get closer than this. Lando Norris produced a stunning final lap at the Hungaroring to snatch pole position for the Hungarian Grand Prix from Lewis Hamilton by just <strong>0.012 seconds</strong> &mdash; the width of a visor, the blink of an eye, the difference between the front of the grid and the frustration of second. It is Norris's first pole since he was crowned world champion, and it arrived on an afternoon of pure theatre: a Verstappen spin, a Russell stoppage, a Ferrari revival and, most strikingly, the first genuinely off-colour qualifying of the season for runaway championship leaders Mercedes.</p>
                </div>

                <div class="quali-facts" aria-label="Qualifying key facts">
                    <div class="quali-fact"><div class="qf-num">0.012s</div><div class="qf-label">Norris's pole margin over Hamilton</div></div>
                    <div class="quali-fact"><div class="qf-num">1:17.207</div><div class="qf-label">Pole lap time</div></div>
                    <div class="quali-fact"><div class="qf-num">~50&deg;C</div><div class="qf-label">Track temperature</div></div>
                    <div class="quali-fact"><div class="qf-num">4th</div><div class="qf-label">Best Mercedes (Antonelli)</div></div>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F5D3️</span> A Ferrari Friday That Became a McLaren Saturday</h2>
                    <div class="ig-embed-float">
                        <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DbOFrxXCMbm/" data-instgrm-version="14" style="background:#FFF; border-radius:8px; width:100%;"></blockquote>
                        <p class="ig-embed-caption">Qualifying reaction &mdash; via <a href="https://instagram.com/f1wow" target="_blank" rel="noopener">@f1wow</a></p>
                    </div>
                    <p>For much of the weekend, this looked like Ferrari's to lose. It was a "Ferrari Friday" in Budapest: Charles Leclerc topped opening practice before Hamilton led the way in FP2, and many in the paddock &mdash; McLaren team principal Andrea Stella among them, as reported &mdash; had installed the Scuderia as weekend favourites.</p>
                    <p>Then Saturday flipped the script. Norris hauled McLaren's upgraded car to the top of final practice, edging Hamilton and Antonelli, and suddenly the question was whether he could convert that pace into the team's first non-Mercedes pole of 2026. He could. In brutal conditions &mdash; around 26&deg;C in the air and a searing track temperature approaching 50&deg;C that left tyres screaming by the final corner &mdash; Norris found two-hundredths where it counted.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F3C6</span> The Pole Lap: 0.012s of Daylight</h2>
                    <p>Hamilton looked, for a few electric minutes, to be on course for a fairytale. Fastest through the opening and final sectors, he held provisional pole after the first Q3 runs &mdash; the timing graphics noting he was on the verge of becoming the oldest polesitter in more than four decades, and in the famous number 44. But Norris was the only driver who managed to improve on his final flying lap. A 1:17.207 nudged him ahead by twelve-thousandths of a second, and pole was gone from Hamilton's grasp.</p>
                    <p>Behind them, Leclerc capped Ferrari's recovery with third, and championship leader Kimi Antonelli could only manage fourth. The tension peaked in the dying seconds as George Russell stopped on track, bringing out double waved yellows &mdash; but Norris had already banked his lap, and his pole was safe.</p>
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
                    <p style="font-size:0.9rem; color:rgba(255,255,255,0.6);">Eliminated in Q2 (11&ndash;16): Lawson, Gasly, Colapinto, Bortoleto, Ocon, Alonso. Eliminated in Q1 (17&ndash;22): Bearman, Sainz, Albon, Stroll, Bottas, Perez. <em>Classification provisional pending FIA stewards.</em></p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F4C9</span> Mercedes' First Real Off-Day</h2>
                    <p>For a team that has dominated the 2026 season, this was a genuine jolt. Antonelli, who arrives in Hungary with a commanding lead in the drivers' standings, could extract only fourth from a car that has routinely fought for pole. Team-mate Russell, meanwhile, saw his session end prematurely with his car stopped on circuit, leaving him seventh on the grid. It is the first weekend all year that the Silver Arrows have been locked out of the front-row conversation &mdash; and it could hardly have come at a more overtaking-averse venue.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F3CE️</span> Verstappen's Spin and Leclerc's Great Escape</h2>
                    <p>Max Verstappen will rue what might have been. The Red Bull driver spun on his final Q3 attempt and had to settle for sixth, unable to deliver the lap his car looked capable of on a knife-edge afternoon. Earlier, Leclerc had produced a scare and a save of his own: he slipped into the Q2 drop zone before dragging himself back to finish second in the segment, dodging a shock early exit that would have been unthinkable given where he ended up on the grid.</p>
                    <p>There was encouragement further down the order, too. Fernando Alonso reached Q2 for the first time this season &mdash; a modest but meaningful sign of progress for Aston Martin.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F4FB</span> Star of the Underdogs: Arvid Lindblad</h2>
                    <p>The breakout performer of the session was Arvid Lindblad. The Racing Bulls rookie hustled his car into the top-10 shootout and lined up a superb ninth &mdash; exactly the kind of committed, fearless lap the Hungaroring rewards. His radio message on the way into Q3 captured the belief in the garage:</p>
                    <figure class="radio-box">
                        <figcaption class="radio-box-head">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
                            Team Radio &middot; Arvid Lindblad
                        </figcaption>
                        <blockquote>"For me we seem genuinely competitive, so let's throw everything at it."</blockquote>
                        <cite>&mdash; Arvid Lindblad, on the run into Q3</cite>
                    </figure>
                    <p>He was not the only surprise name in the pole shootout: Nico Hulkenberg dragged his Haas into Q3 as well, rounding out the top 10 and underlining a scrappy, unpredictable session up and down the field.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F52E</span> What It Means for Sunday</h2>
                    <p>Pole at the Hungaroring is worth its weight in gold. This is one of the hardest circuits on the calendar to overtake around &mdash; track position is everything, and clean air off the line can decide the race. That makes Norris's front-row lockout with Hamilton a tantalising prospect: a McLaren and a Ferrari, separated by twelve-thousandths, leading the field into Turn 1.</p>
                    <p>With two Ferraris in the top three, a wounded Mercedes looking to salvage the weekend, and Antonelli determined to protect his title lead, Sunday has all the ingredients of a classic. Follow it live on our <a href="race-hub.html">Race Hub</a>, track the fight for the crown on the <a href="championship.html">championship standings and graph</a>, and see the full schedule on our <a href="calendar.html">2026 calendar</a>.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F517</span> Sources</h2>
                    <p style="color: rgba(255,255,255,0.7); font-size:0.9rem;">Live session timing and classification, with corroborating coverage from <a href="https://www.autosport.com/f1/live-text/f1-hungarian-gp-live-commentary-and-updates-qualifying-1127473/1127473/" target="_blank" rel="noopener">Autosport</a>, <a href="https://racingnews365.com/live-2026-f1-hungarian-grand-prix-budapest-qualifying" target="_blank" rel="noopener">RacingNews365</a> and <a href="https://www.planetf1.com/news/f1-live-2026-hungarian-grand-prix-qualifying-updates" target="_blank" rel="noopener">PlanetF1</a>. Results provisional pending FIA stewards.</p>
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
# ensure embed.js loader present
if 'instagram.com/embed.js' not in out:
    out = out.replace('</body>', '    <script async src="https://www.instagram.com/embed.js"></script>\n</body>')
open(SLUG, 'w', encoding='utf-8').write(out)
print('written', SLUG, len(out), 'bytes')
