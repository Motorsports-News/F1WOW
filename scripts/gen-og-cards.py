# Auto-generate a per-article social-share card (headline on branded background)
# for EVERY article in articles.json, and point each article's og:image/twitter:image
# at its own card. Runs as part of `npm run publish` so new articles get one automatically.
# Also generates one static share card for the championship calculator (not an
# article, not in articles.json) - see the bottom of this file.
#
# The drawing itself lives in og_card.py, shared with gen-og-card.py and
# gen-og-image.py so the three cannot drift apart. See that file for why the
# old F1-red palette and the Windows-only font paths had to go.
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import og_card

SITE = 'https://f1wownews.com'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def render(slug, category, headline):
    return og_card.render(os.path.join(ROOT, f'og-{slug}.jpg'), category, headline)


def patch_meta(slug):
    path = os.path.join(ROOT, slug + '.html')
    if not os.path.exists(path):
        return False
    s = open(path, encoding='utf-8').read()
    card = f'{SITE}/og-{slug}.jpg'
    s = re.sub(r'(property="og:image" content=")[^"]*', r'\g<1>' + card, s)
    s = re.sub(r'(name="twitter:image" content=")[^"]*', r'\g<1>' + card, s)
    open(path, 'w', encoding='utf-8').write(s)
    return True


manifest = json.load(open(os.path.join(ROOT, 'articles.json'), encoding='utf-8'))
n = 0
for a in manifest['articles']:
    slug = a['slug'].replace('.html', '')
    headline = a.get('featuredTitle') or a['title']
    category = a.get('label', 'News')
    render(slug, category, headline)
    if patch_meta(slug):
        n += 1
print(f'Generated + wired {n} per-article OG cards')

# Championship calculator share card - not an article, generated separately so it
# never depends on / interacts with the articles.json manifest loop above. Regenerate
# this manually with fresh numbers whenever the leader/probability changes meaningfully
# (this script has no live API access of its own - the number below was read from the
# actual calculator, not fabricated).
# Note: same slug is passed to both calls deliberately - render() derives the image
# filename (og-{slug}.jpg) and patch_meta() derives the og:image URL it writes into
# {slug}.html from that same slug string, so they must match or the page ends up
# pointing at an image that doesn't exist on disk.
render('championship-calculator', 'Interactive', 'ANTONELLI: 99% TO WIN THE 2026 TITLE')
patch_meta('championship-calculator')
print('Generated championship calculator share card')
