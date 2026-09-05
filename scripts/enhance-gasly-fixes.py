# Fixes found in browser review of the Gasly article:
#  1. Year axis was evenly spaced, so labels did not line up with the data.
#     Each year now grows in proportion to that season's race count.
#  2. The pole bar sat hard against the right edge and its glow was clipped;
#     it now has room plus an annotation so the payoff bar is legible.
#  3. The strip overflowed its container at 390px.
#  4. This article has no Instagram embed, so drop the embed.js loader.
import json, os, re, sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'gasly-maiden-pole-italian-gp-2026.html')
s = open(ART, encoding='utf-8').read()

ticks = json.load(open(os.path.join(ROOT, 'scripts/scratch-gasly-ticks.json'), encoding='utf-8'))
counts = Counter(t[0] for t in ticks)
counts[2026] += 1  # the Monza entry itself
total = sum(counts.values())
assert total == 191, total

axis = ''.join(
    f'<span class="yr" style="--n:{counts[y]}">&rsquo;{str(y)[2:]}</span>'
    for y in sorted(counts))
s = re.sub(r'<div class="cs-axis" aria-hidden="true">.*?</div>',
           f'<div class="cs-axis" aria-hidden="true">{axis}</div>', s, flags=re.S)

# Annotation above the strip, sitting over the final bar.
FLAG = ('<p class="cs-flag"><span>Monza &rsquo;26 &mdash; first pole '
        '<span aria-hidden="true">&darr;</span></span></p>')
if 'cs-flag' not in s:
    s = s.replace('<div class="cs-plot" role="list"', FLAG + '\n                    <div class="cs-plot" role="list"', 1)

# List semantics survive list-style:none in Safari only with an explicit role.
s = s.replace('<ol class="wait-chart" id="waitChart"',
              '<ol class="wait-chart" id="waitChart" role="list"', 1)

# No Instagram embed on this article - don't pay for embed.js.
s = re.sub(r'\s*<script>/\* Defer Instagram embed loader until idle \*/.*?</script>',
           '', s, flags=re.S)

EXTRA = """
        /* --- browser-review fixes --- */
        .cs-axis .yr { flex: var(--n, 1) 1 0; }
        .cs-plot { padding-right: 3px; }
        .cs-flag {
            display: flex; justify-content: flex-end; margin: 0 0 6px;
            font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
            font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase;
            color: var(--gas);
        }
        @media (max-width: 640px) {
            .cs-plot { gap: 0; }
            .cs-axis { gap: 0; }
            .tick { min-width: 0; }
            .tick.is-pole { min-width: 2px; }
            .cs-flag { font-size: 0.72rem; }
        }
"""
s = s.replace('\n/* IMP:CSS:END */</style>', EXTRA + '/* IMP:CSS:END */</style>')

open(ART, 'w', encoding='utf-8').write(s)
print('fixes applied')
print('  axis years:', len(counts), '| total ticks accounted:', total)
print('  cs-flag:', s.count('cs-flag'), '| embed.js refs:', s.count('instagram.com/embed.js'))
