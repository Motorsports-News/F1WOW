# Generate Hamilton grid-penalty news article (Hungarian GP 2026)
import re

base = open('belgian-gp-2026.html', encoding='utf-8').read()
SITE = 'https://f1wownews.com'
SLUG = 'hamilton-grid-penalty-hungarian-gp-2026.html'
DATE = '2026-07-26'

TITLE = 'Hamilton Handed Three-Place Grid Penalty for Impeding Piastri'
DESC = "Lewis Hamilton has been given a three-place grid penalty for impeding Oscar Piastri in Hungarian GP qualifying, dropping the Ferrari from second to fifth and promoting Leclerc to the front row."

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
head = re.sub(r'"name":"Belgian[^"]*"', '"name":"Hamilton Grid Penalty"', head)
head = re.sub(r'"name": "Belgian[^"]*"', '"name": "Hamilton Grid Penalty"', head)
head = head.replace('src="script.js"', 'src="script.js?v=20260726a"')

QUOTE_CSS = '''
    <style>
        .quote-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.14); border-left-width: 1px; border-radius: 12px; padding: 18px 22px; margin: 24px 0; }
        .quote-box-head { display: flex; align-items: center; gap: 8px; font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: var(--f1-red); font-size: 0.85rem; margin-bottom: 10px; }
        .quote-box blockquote { margin: 0; font-size: 1.2rem; line-height: 1.55; color: #fff; font-style: italic; }
        .quote-box cite { display: block; margin-top: 8px; font-style: normal; font-size: 0.8rem; color: rgba(255,255,255,0.55); letter-spacing: 0.04em; }
    </style>'''
head = head.replace('</head>', QUOTE_CSS + '\n</head>')

body = '''    <main class="main" id="main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Hamilton Grid Penalty</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top">
                        <span class="article-category">Breaking</span>
                        <span class="article-date"><time datetime="''' + DATE + '''">July 26, 2026</time></span>
                    </div>
                    <h1 class="article-title-full">Hamilton Hit With Three-Place Grid Penalty for Impeding Piastri</h1>
                    <p class="article-subtitle-full">Lewis Hamilton's front-row start is gone. The Ferrari driver has been handed a three-place grid drop for blocking Oscar Piastri in Q3 &mdash; promoting Charles Leclerc to the front row alongside pole-sitter Lando Norris.</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By <a href="about.html" class="author-link">F1wow Team</a></span>
                        <span class="article-read-time">4 min read</span>
                    </div>
                </div>
            </div>

            <div class="article-content">
                <div class="article-intro">
                    <p><strong>BUDAPEST</strong> &mdash; Lewis Hamilton's stunning qualifying effort has been undone by the stewards. Having lined up second on the grid &mdash; just 0.012s off Lando Norris's pole &mdash; the Ferrari driver has been handed a <strong>three-place grid penalty</strong> for impeding Oscar Piastri during the final runs of Q3 at the Hungaroring. Hamilton drops from second to fifth, reshaping the front of the grid for Sunday's Hungarian Grand Prix.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F6A9</span> What Happened at Turn 1</h2>
                    <p>Hamilton was the first car out on the road for the decisive final runs and, having completed his own lap without improving, was still on the racing line at Turn 1 &mdash; Piquet Corner &mdash; as Piastri arrived on a flying lap. The McLaren driver, running fifth at that point, was forced to lock up and run wide to avoid the slow Ferrari, ruining his final attempt. The stewards ruled that Hamilton had unnecessarily impeded Piastri, applying the standard three-place sanction.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F5E3️</span> Piastri: "It Was Lewis Not Looking in His Mirrors"</h2>
                    <p>Piastri, who was ultimately classified fifth in qualifying, made no secret of his frustration in the media pen, rejecting any suggestion that the yellow flags from Max Verstappen's spin were to blame for his compromised lap.</p>
                    <div class="quote-box">
                        <div class="quote-box-head">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Oscar Piastri
                        </div>
                        <blockquote>"The yellow flag didn't cost me. It was Lewis not looking in his mirrors. I saw him from the start line and kind of watched him, expecting him to get out of the way &mdash; and I watched him basically all the way up until I nearly hit him."</blockquote>
                        <cite>&mdash; Oscar Piastri, speaking to reporters after qualifying</cite>
                    </div>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F3CE️</span> Hamilton: "I Had No Idea He Was Coming"</h2>
                    <p>Hamilton, for his part, said he was simply unaware of the McLaren behind him, explaining that the warning from his Ferrari race engineer Carlo Santi arrived too late &mdash; his radio traffic dominated by news of Verstappen's spin and the resulting yellow flags.</p>
                    <div class="quote-box">
                        <div class="quote-box-head">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Lewis Hamilton
                        </div>
                        <blockquote>"I was told literally when he was at the apex behind me, so I had no idea he was coming. I thought everyone came out behind me. I was the first out, so I thought everyone had finished their lap."</blockquote>
                        <cite>&mdash; Lewis Hamilton, as quoted by ESPN and Yahoo Sports</cite>
                    </div>
                    <p>The seven-time champion also questioned Ferrari's decision to send him out first: "I don't know why we went first and that was a bit of a shock to me," he said. "I definitely wouldn't have chosen to go first, but it is what it is." The incident had been widely anticipated to draw a sanction &mdash; Sky F1's Martin Brundle had said during the broadcast that he was "damn sure he'll get one," noting Hamilton's recent history with similar impeding penalties.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F4CA</span> Revised Hungarian GP Starting Grid (Top 10)</h2>
                    <div class="standings-container">
                        <table class="standings-table" aria-label="Revised Hungarian Grand Prix 2026 grid after Hamilton penalty">
                            <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Note</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>1</td><td>Lando Norris</td><td>McLaren</td><td>Pole</td></tr>
                                <tr class="standings-row"><td>2</td><td>Charles Leclerc</td><td>Ferrari</td><td>Promoted</td></tr>
                                <tr class="standings-row"><td>3</td><td>Kimi Antonelli</td><td>Mercedes</td><td>Promoted</td></tr>
                                <tr class="standings-row"><td>4</td><td>Oscar Piastri</td><td>McLaren</td><td>Promoted</td></tr>
                                <tr class="standings-row"><td>5</td><td>Lewis Hamilton</td><td>Ferrari</td><td>&minus;3 places</td></tr>
                                <tr class="standings-row"><td>6</td><td>Max Verstappen</td><td>Red Bull</td><td>&mdash;</td></tr>
                                <tr class="standings-row"><td>7</td><td>George Russell</td><td>Mercedes</td><td>&mdash;</td></tr>
                                <tr class="standings-row"><td>8</td><td>Isack Hadjar</td><td>Red Bull</td><td>&mdash;</td></tr>
                                <tr class="standings-row"><td>9</td><td>Arvid Lindblad</td><td>Racing Bulls</td><td>&mdash;</td></tr>
                                <tr class="standings-row"><td>10</td><td>Nico Hulkenberg</td><td>Haas</td><td>&mdash;</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p style="font-size:0.9rem; color:rgba(255,255,255,0.6);">Grid subject to any further stewards' decisions and race-day changes.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F52E</span> What It Means for Sunday</h2>
                    <p>The penalty transforms the complexion of the race. Norris keeps his hard-won pole, but now has Charles Leclerc's Ferrari alongside him on the front row rather than Hamilton &mdash; and championship leader Kimi Antonelli is promoted to third, a useful boost on a day Mercedes struggled for pace. Piastri, the aggrieved party, at least gains a spot to fourth.</p>
                    <p>For Hamilton, fifth on a track where overtaking is famously difficult makes Sunday an uphill battle. Recovering to the podium from there would rank among his better drives of a mixed first season and a half in red. For the full picture, see our <a href="hungarian-gp-2026-qualifying.html">Hungarian GP qualifying report</a>, track the title fight on the <a href="championship.html">championship standings and graph</a>, and follow the race live on the <a href="race-hub.html">Race Hub</a>.</p>
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
                    <a href="belgian-gp-2026.html" class="related-card">
                        <span class="related-category">Race Report</span>
                        <h4>Belgian GP 2026: Antonelli Wins at Spa as Russell Retires</h4>
                    </a>
                    <a href="championship.html" class="related-card">
                        <span class="related-category">Standings</span>
                        <h4>2026 Championship Standings &amp; Progression Graph</h4>
                    </a>
                    <a href="race-hub.html" class="related-card">
                        <span class="related-category">Race Hub</span>
                        <h4>This Weekend's Grand Prix: Times &amp; Results</h4>
                    </a>
                </div>
            </div>
        </section>
    '''

share_url = f'{SITE}/hamilton-grid-penalty-hungarian-gp-2026'
body = body.replace('https://f1wownews.com/belgian-gp-2026.html', share_url)
body = body.replace('text=Belgian GP 2026: Antonelli Wins at Spa as Russell Retires',
                    'text=Hamilton hit with 3-place grid penalty for impeding Piastri')

out = head + body + tail
open(SLUG, 'w', encoding='utf-8').write(out)
print('written', SLUG, len(out), 'bytes')
