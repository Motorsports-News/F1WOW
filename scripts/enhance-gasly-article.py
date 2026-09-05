# Rebuild the interactive/visual layer of the Gasly maiden-pole article.
# Idempotent: every replacement is anchored on markers this script itself writes,
# or on the original one-shot blocks. Re-running after an edit is safe.
#
# Design notes:
# - Identity preserved: F1 red on near-black, Barlow Condensed + Chakra Petch.
#   Alpine pink (--team-alpine, already a site token) is the story accent for Gasly.
# - Signature element: one tick per race entry across his whole career. Bar height
#   encodes starting position, colour encodes podium. 190 short bars then one full
#   pink one tells the entire story without a word of copy.
# - Every animated element renders at its FINAL state with no JS and no
#   IntersectionObserver. JS only replays it as an entrance.
import json, os, re, sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'gasly-maiden-pole-italian-gp-2026.html')
s = open(ART, encoding='utf-8').read()

ticks = json.load(open(os.path.join(ROOT, 'scripts/scratch-gasly-ticks.json'), encoding='utf-8'))
assert len(ticks) == 190, len(ticks)

# ---------------------------------------------------------------- career strip
def bar_height(grid):
    """Starting position -> bar height %. Grid 0 (pit lane) sits below P20."""
    g = grid if grid else 21
    return max(12, round(100 - (g - 1) * 4.4))

cells = []
for i, (yr, name, grid, pos) in enumerate(ticks):
    cls = ['tick']
    if pos == 1:
        cls.append('is-win')
    elif pos <= 3:
        cls.append('is-podium')
    start = 'pit lane' if grid == 0 else f'P{grid}'
    label = f'{yr} {name} GP - started {start}, finished P{pos}'
    focusable = pos <= 3
    attrs = (f' tabindex="0" role="listitem" aria-label="{label}"'
             if focusable else ' aria-hidden="true"')
    cells.append(
        f'<span class="{" ".join(cls)}" style="--h:{bar_height(grid)}%;--i:{i}"'
        f' data-label="{label}"{attrs}></span>')

# The 191st: Monza 2026, pole.
cells.append(
    '<span class="tick is-pole" style="--h:100%;--i:190" tabindex="0" role="listitem"'
    ' data-label="2026 Italian GP - POLE POSITION, 1:21.786"'
    ' aria-label="2026 Italian Grand Prix - pole position, 1 minute 21.786"></span>')

year_starts = {}
for i, (yr, *_ ) in enumerate(ticks):
    year_starts.setdefault(yr, i)
axis = ''.join(
    f'<span class="yr" style="--i:{i}">&rsquo;{str(y)[2:]}</span>'
    for y, i in year_starts.items())

STRIP = f'''<!-- IMP:STRIP:START -->
                <figure class="career-strip" id="careerStrip">
                    <figcaption class="cs-head">
                        <span class="cs-title">Every race of Pierre Gasly's career</span>
                        <span class="cs-sub">Bar height is his starting position &mdash; taller means further up the grid. Red marks a podium. The last bar is Monza.</span>
                    </figcaption>
                    <div class="cs-plot" role="list" aria-label="Pierre Gasly's 191 Grand Prix entries by starting position">
                        {''.join(cells)}
                    </div>
                    <div class="cs-axis" aria-hidden="true">{axis}</div>
                    <p class="cs-tip" id="csTip" role="status" aria-live="polite">Hover or focus a bar to see the race</p>
                    <div class="cs-ledger">
                        <span><b class="n" data-count="190">190</b> races without a pole</span>
                        <span><b class="n">1</b> front-row start &mdash; Qatar, 2021</span>
                        <span><b class="n">1</b> win &mdash; Monza, 2020, from P10</span>
                    </div>
                </figure>
<!-- IMP:STRIP:END -->'''

# Replace the four-card stat grid with the pole card + career strip.
POLE_CARD = '''<!-- IMP:POLE:START -->
                <div class="pole-slate">
                    <div class="ps-main">
                        <span class="ps-label">Pole position</span>
                        <span class="ps-time">1:21.786</span>
                        <span class="ps-margin">0.060s clear of Russell</span>
                    </div>
                    <dl class="ps-facts">
                        <div><dt>Career entries before it</dt><dd>190</dd></div>
                        <div><dt>Alpine races before its first</dt><dd>252</dd></div>
                        <div><dt>Since a French pole</dt><dd>29 yrs</dd></div>
                    </dl>
                </div>
<!-- IMP:POLE:END -->'''

old_facts = re.search(
    r'<div class="quali-facts".*?</div>\s*</div>\s*(?=<div class="article-section">)',
    s, re.S)
if old_facts:
    s = s[:old_facts.start()] + POLE_CARD + '\n\n                ' + STRIP + '\n\n                ' + s[old_facts.end():]
else:
    s = re.sub(r'<!-- IMP:POLE:START -->.*?<!-- IMP:POLE:END -->', POLE_CARD, s, flags=re.S)
    s = re.sub(r'<!-- IMP:STRIP:START -->.*?<!-- IMP:STRIP:END -->', STRIP, s, flags=re.S)

# ------------------------------------------------------------------- Q3 table
q3 = [
    (1, 'Pierre Gasly', 'Alpine', '1:21.786', 0.000, 'alpine'),
    (2, 'George Russell', 'Mercedes', '1:21.846', 0.060, 'mercedes'),
    (3, 'Oscar Piastri', 'McLaren', '1:21.966', 0.180, 'mclaren'),
    (4, 'Charles Leclerc', 'Ferrari', '1:22.004', 0.218, 'ferrari'),
    (5, 'Lewis Hamilton', 'Ferrari', '1:22.011', 0.225, 'ferrari'),
    (6, 'Max Verstappen', 'Red Bull', '1:22.070', 0.284, 'redbull'),
    (7, 'Kimi Antonelli', 'Mercedes', '1:22.093', 0.307, 'mercedes'),
    (8, 'Franco Colapinto', 'Alpine', '1:22.220', 0.434, 'alpine'),
    (9, 'Lando Norris', 'McLaren', '1:22.256', 0.470, 'mclaren'),
    (10, 'Arvid Lindblad', 'Racing Bulls', '1:22.286', 0.500, 'alphatauri'),
]
rows = []
for pos, drv, team, t, gap, key in q3:
    scale = round(gap / 0.500, 4) if gap else 0
    cls = ' class="is-pole"' if pos == 1 else ''
    note = ('<span class="pen" title="Starts from the back of the grid">back of grid</span>'
            if drv == 'Kimi Antonelli' else '')
    gaptxt = '&mdash;' if not gap else f'+{gap:.3f}'
    rows.append(f'''<tr{cls} style="--team:var(--team-{key})">
                                <td class="rank">{pos}</td>
                                <td class="driver">{drv}{note}</td>
                                <td class="team">{team}</td>
                                <td class="time">{t}</td>
                                <td class="gapcell"><span class="gapbar"><i style="--s:{scale}"></i></span><span class="gapnum">{gaptxt}</span></td>
                            </tr>''')

Q3TABLE = f'''<!-- IMP:Q3:START -->
                    <div class="table-wrap">
                    <table class="q3-table" id="q3Table">
                        <caption class="sr-only">Q3 classification, 2026 Italian Grand Prix</caption>
                        <thead>
                            <tr><th scope="col">Pos</th><th scope="col">Driver</th><th scope="col">Team</th><th scope="col">Q3 time</th><th scope="col">Gap to pole</th></tr>
                        </thead>
                        <tbody>
                            {''.join(rows)}
                        </tbody>
                    </table>
                    </div>
<!-- IMP:Q3:END -->'''

s = re.sub(r'<table class="q3-table">.*?</table>', Q3TABLE, s, count=1, flags=re.S)
s = re.sub(r'<!-- IMP:Q3:START -->.*?<!-- IMP:Q3:END -->', lambda m: Q3TABLE, s, flags=re.S)

# ---------------------------------------------------------------- waits chart
waits = [
    ('Sergio P&eacute;rez', 216, '2022 Saudi Arabian GP', False),
    ('Pierre Gasly', 190, '2026 Italian GP', True),
    ('Carlos Sainz', 150, '2022 British GP', False),
    ('Mark Webber', 131, '2009 German GP', False),
    ('Jarno Trulli', 118, '2004 Monaco GP', False),
    ('Nick Heidfeld', 90, '2005 European GP', False),
    ('Valtteri Bottas', 80, '2017 Bahrain GP', False),
    ('Jenson Button', 70, '2004 San Marino GP', False),
    ('Felipe Massa', 66, '2006 Turkish GP', False),
    ('Giancarlo Fisichella', 34, '1998 Austrian GP', False),
]
wrows = []
for i, (name, n, where, hl) in enumerate(waits):
    wrows.append(f'''<li class="wait-row{' is-gasly' if hl else ''}" style="--s:{round(n/216,4)};--i:{i}">
                            <span class="w-name">{name}</span>
                            <span class="w-track"><i></i><b class="w-num">{n}</b></span>
                            <span class="w-where">{where}</span>
                        </li>''')

WAITS = f'''<!-- IMP:WAITS:START -->
                    <ol class="wait-chart" id="waitChart" aria-label="Longest waits to a maiden pole position, in race entries">
                        {''.join(wrows)}
                    </ol>
                    <p class="chart-note">Race entries before a first pole position. Bar length is proportional to the wait.</p>
<!-- IMP:WAITS:END -->'''

s = re.sub(r'<table class="wait-table">.*?</table>', WAITS, s, count=1, flags=re.S)
s = re.sub(r'<!-- IMP:WAITS:START -->.*?<!-- IMP:WAITS:END -->', lambda m: WAITS, s, flags=re.S)

# ------------------------------------------------------------------- countdown
COUNTDOWN = '''<!-- IMP:CD:START -->
                    <div class="lights-out" id="lightsOut" data-start="2026-09-06T13:00:00Z">
                        <span class="lo-label">Lights out at Monza</span>
                        <span class="lo-clock" id="loClock">Sunday, September 6 &mdash; 15:00 local</span>
                        <span class="lo-grid"><b>P1</b> Gasly &middot; <b>P2</b> Russell &middot; <b>P3</b> Piastri</span>
                    </div>
<!-- IMP:CD:END -->'''

if 'IMP:CD:START' in s:
    s = re.sub(r'<!-- IMP:CD:START -->.*?<!-- IMP:CD:END -->', lambda m: COUNTDOWN, s, flags=re.S)
else:
    anchor = '<h2>🔮 What It Means for Sunday</h2>'
    s = s.replace(anchor, anchor + '\n                    ' + COUNTDOWN, 1)

# -------------------------------------------------- remove the source-note block
s = re.sub(
    r'\s*<p style="color: rgba\(255,255,255,0\.6\); font-size: 0\.9rem; font-style: italic;[^"]*">.*?</p>\n',
    '\n', s, flags=re.S)

open(ART, 'w', encoding='utf-8').write(s)
print('markup rebuilt')
print('  source note present:', 'Qualifying times and session narrative' in s)
print('  strip ticks:', s.count('class="tick'))
for marker in ('IMP:POLE', 'IMP:STRIP', 'IMP:Q3', 'IMP:WAITS', 'IMP:CD'):
    print(f'  {marker}:', s.count(marker + ':START'))
