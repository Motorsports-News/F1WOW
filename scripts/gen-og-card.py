# Generate one-off social-share cards for slugs that are not (yet) in articles.json.
# Usage: edit CARDS below (slug, category, headline) and run. Outputs og-<slug>.jpg (1200x630).
#
# For anything already in articles.json use gen-og-cards.py instead -- that one
# also rewrites the page's og:image/twitter:image meta tags. This script only
# writes the image.
#
# The drawing lives in og_card.py, shared with gen-og-cards.py and gen-og-image.py.
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import og_card

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CARDS = [
    ('dutch-gp-2026-race', 'Race Analysis', 'Norris Wins From Antonelli as Verstappen Crashes Out'),
    ('verstappen-error-free-streak-2026', 'Stat Attack', 'The 219 Races Since Verstappen Last Crashed Alone'),
]

for slug, cat, head in CARDS:
    out = og_card.render(os.path.join(ROOT, f'og-{slug}.jpg'), cat, head)
    print('wrote', os.path.basename(out))
