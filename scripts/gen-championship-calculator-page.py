# Scaffold the championship calculator page shell.
# NOINDEX + not linked from anywhere yet - only Task 15 (explicitly gated) removes
# the noindex tag and wires this into nav/sitemap/articles.json.
import re

base = open('race-hub.html', encoding='utf-8').read()
SLUG = 'championship-calculator.html'

head = base[:base.find('<main')]
tail_start = base.find('<script src="script.js')
tail = base[tail_start:]

TITLE = 'F1 2026 Championship Calculator (Prototype)'
head = re.sub(r'<title>[^<]*</title>', f'<title>{TITLE}</title>', head)
head = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>Internal build in progress.', head)
# Hard-block indexing until Task 15 explicitly removes this.
head = head.replace('</head>', '    <meta name="robots" content="noindex, nofollow">\n</head>', 1)

body = '''    <main class="main" id="main">
        <div class="proto-wrap" style="max-width:980px;margin:0 auto;padding:30px 20px 60px;">
            <h1 style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:2rem;margin-bottom:6px;">F1 2026 Championship Calculator</h1>
            <p style="color:var(--text-muted);margin-bottom:30px;">Live standings, a 12-race scenario editor, and a Monte Carlo win-probability model for the rest of the 2026 season.</p>

            <div id="calcLoading" style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">Loading live standings and season data&hellip;</div>

            <div id="calcApp" style="display:none;">
                <section class="proto-section" id="calcStandingsSection"></section>
                <section class="proto-section" id="calcCarouselSection"></section>
                <section class="proto-section" id="calcResultsSection" style="display:none;"></section>
            </div>
        </div>
    </main>
'''

out = head + body + tail
open(SLUG, 'w', encoding='utf-8').write(out)
print('written', SLUG)
