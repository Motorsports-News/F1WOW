# Generate "Most positions gained in a single race — 2026" feature article
import re

base = open('belgian-gp-2026.html', encoding='utf-8').read()
SITE = 'https://f1wownews.com'
SLUG = 'most-positions-gained-2026.html'

TITLE = 'Most Positions Gained in a Single Race: F1 2026 Comeback Kings'
DESC = "Which F1 2026 drives gained the most positions in a single race? Isack Hadjar's 15-place charge at Spa tops the list. The full 2026 comeback leaderboard, ranked."

head = base[:base.find('<main')]
# grab share + embed loader from base
share = re.search(r'[ \t]*<!-- Share Section -->\s*<div class="article-share">[\s\S]*?</div>\s*</div>\n', base).group(0)
tail = base[base.find('</main>'):]

# rewrite head metadata
head = re.sub(r'<title>[^<]*</title>', f'<title>{TITLE} - F1wow News</title>', head)
head = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'belgian-gp-2026\.html', SLUG, head)
head = re.sub(r'(property="og:title" content=")[^"]*', r'\g<1>' + TITLE, head)
head = re.sub(r'(name="twitter:title" content=")[^"]*', r'\g<1>' + TITLE, head)
head = re.sub(r'(property="og:description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'(name="twitter:description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'(article:published_time" content=")[^"]*', r'\g<1>2026-07-23', head)
head = re.sub(r'"headline": "[^"]*"', f'"headline": "{TITLE}"', head)
head = re.sub(r'"description": "[^"]*"', '"description": "' + DESC.replace('"', '\\"') + '"', head)
head = re.sub(r'"datePublished": "[^"]*"', '"datePublished": "2026-07-23"', head)
head = re.sub(r'"dateModified": "[^"]*"', '"dateModified": "2026-07-23"', head)
head = re.sub(r'"name":"Belgian[^"]*"', '"name":"Most Positions Gained 2026"', head)
head = re.sub(r'"name": "Belgian[^"]*"', '"name": "Most Positions Gained 2026"', head)

body = '''    <main class="main" id="main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Most Positions Gained 2026</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top">
                        <span class="article-category">Stat Attack</span>
                        <span class="article-date"><time datetime="2026-07-23">July 23, 2026</time></span>
                    </div>
                    <h1 class="article-title-full">Comeback Kings of 2026: The Biggest Position Gains of the Season So Far</h1>
                    <p class="article-subtitle-full">From pit lane to the points and back again &mdash; Isack Hadjar's 15-place charge at Spa leads the 2026 comeback leaderboard. Here is every driver who turned a bad Saturday into a great Sunday.</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By <a href="about.html" class="author-link">F1wow Team</a></span>
                        <span class="article-read-time">3 min read</span>
                    </div>
                </div>
            </div>

            <div class="article-content">
                <div class="article-intro">
                    <p>Qualifying sets the grid, but Sunday is where the racing happens. Some of the most thrilling drives of the 2026 season have come from the back of the pack &mdash; recovery charges that turned a disappointing Saturday into a Sunday to remember. Thanks to a stat shared by <strong>@f1guydan</strong> on our <a href="https://instagram.com/f1wow" target="_blank" rel="noopener">@f1wow</a> page, we dug into the numbers to rank the biggest single-race position gains of 2026 so far.</p>
                </div>

                <div class="article-section" style="display:flex; justify-content:center;">
                    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DbGJwvisuqM/" data-instgrm-version="14" style="max-width:540px; width:100%; background:#FFF; border-radius:8px;"></blockquote>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F451</span> Hadjar's Spa Masterclass Leads the Way</h2>
                    <p>The standout drive of the season belongs to <strong>Isack Hadjar</strong>. Starting 21st on the grid at the Belgian Grand Prix &mdash; the longest lap on the calendar &mdash; the Red Bull driver carved his way to sixth by the flag, a staggering <strong>15 positions gained</strong>. It is the single most productive Sunday of anyone in 2026, and it came at a circuit where overtaking, while possible down the Kemmel Straight, is far from guaranteed.</p>
                    <p>Just behind him sits a familiar name. <strong>Max Verstappen</strong> opened the season with a recovery of his own, climbing from 20th to sixth at the Australian Grand Prix &mdash; 14 places &mdash; proving that even the sport's benchmark can find himself deep in the field and drag a result out of it.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F4CA</span> The 2026 Comeback Leaderboard</h2>
                    <p>Ranked by net positions gained in a single race (started on the grid, classified as a finisher):</p>
                    <div class="standings-container">
                        <table class="standings-table" aria-label="Most positions gained in a single race, 2026">
                            <thead><tr><th>#</th><th>Driver</th><th>Race</th><th>Grid &rarr; Finish</th><th>Gained</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>1</td><td>Isack Hadjar</td><td>Belgian GP</td><td>P21 &rarr; P6</td><td>+15</td></tr>
                                <tr class="standings-row"><td>2</td><td>Max Verstappen</td><td>Australian GP</td><td>P20 &rarr; P6</td><td>+14</td></tr>
                                <tr class="standings-row"><td>3</td><td>Fernando Alonso</td><td>Monaco GP</td><td>P21 &rarr; P10</td><td>+11</td></tr>
                                <tr class="standings-row"><td>4</td><td>Franco Colapinto</td><td>British GP</td><td>P19 &rarr; P9</td><td>+10</td></tr>
                                <tr class="standings-row"><td>5</td><td>Arvid Lindblad</td><td>Monaco GP</td><td>P15 &rarr; P7</td><td>+8</td></tr>
                                <tr class="standings-row"><td>5</td><td>Esteban Ocon</td><td>Monaco GP</td><td>P17 &rarr; P9</td><td>+8</td></tr>
                                <tr class="standings-row"><td>7</td><td>Liam Lawson</td><td>Chinese GP</td><td>P14 &rarr; P7</td><td>+7</td></tr>
                                <tr class="standings-row"><td>8</td><td>Pierre Gasly</td><td>Monaco GP</td><td>P9 &rarr; P3</td><td>+6</td></tr>
                                <tr class="standings-row"><td>8</td><td>Lando Norris</td><td>Belgian GP</td><td>P13 &rarr; P7</td><td>+6</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p><em>Stat credit: <strong>@f1guydan</strong>, via <a href="https://instagram.com/f1wow" target="_blank" rel="noopener">@f1wow</a>. Figures compiled from official 2026 classified results; pit-lane starts excluded for a clean grid-to-flag comparison.</em></p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F3CE️</span> Monaco: The Great Equaliser</h2>
                    <p>One race dominates the list. Three of the top eight gains came at the <strong>Monaco Grand Prix</strong> &mdash; Alonso, Lindblad and Ocon all made up serious ground on the streets of Monte Carlo. That is the Monaco paradox: the hardest place on the calendar to overtake often produces the biggest climbers, because strategy gambles, safety cars and a single well-timed pit stop can leapfrog a driver up an order that is otherwise frozen solid.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F52E</span> Who's Next?</h2>
                    <p>With the <a href="calendar.html">Hungarian Grand Prix</a> up next and more than half the season still to run, this leaderboard is far from settled &mdash; one chaotic, rain-hit Sunday could rewrite the top of the table. Follow the title picture on our <a href="championship.html">interactive championship graph</a>, and keep an eye on every session via the <a href="race-hub.html">Race Hub</a>.</p>
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
                    <a href="canada-gp-2026.html" class="related-card">
                        <span class="related-category">Race Report</span>
                        <h4>Canadian GP 2026 - Antonelli Makes It Five in a Row</h4>
                    </a>
                    <a href="hamilton-ferrari-barcelona-win.html" class="related-card">
                        <span class="related-category">Race Report</span>
                        <h4>Hamilton Wins Barcelona GP for Ferrari</h4>
                    </a>
                </div>
            </div>
        </section>
    '''

# fix share links to point at this article
share_url = f'{SITE}/{SLUG}'
share_txt = 'Comeback Kings of 2026: Biggest F1 Position Gains'
body = body.replace('https://f1wownews.com/belgian-gp-2026.html', share_url)
body = re.sub(r'(share-btn twitter" title="[^"]*">)', r'\1', body)
body = body.replace('text=Belgian GP 2026: Antonelli Wins at Spa as Russell Retires', 'text=' + share_txt)

out = head + body + tail
open(SLUG, 'w', encoding='utf-8').write(out)
print('written', SLUG, len(out), 'bytes')
