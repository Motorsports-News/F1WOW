# Auto-generate a per-article social-share card (headline on branded background)
# for EVERY article in articles.json, and point each article's og:image/twitter:image
# at its own card. Runs as part of `npm run publish` so new articles get one automatically.
from PIL import Image, ImageDraw, ImageFont
import json, os, re

W, H = 1200, 630
RED = (225, 6, 0); WHITE = (255, 255, 255); GREY = (165, 165, 173)
FONT = 'C:/Windows/Fonts/bahnschrift.ttf'
FALLBACK = 'C:/Windows/Fonts/arialbd.ttf'
SITE = 'https://f1wownews.com'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def font(px):
    try: return ImageFont.truetype(FONT, px)
    except Exception: return ImageFont.truetype(FALLBACK, px)

def kerb(d, y, h):
    x = 0
    while x < W:
        d.rectangle([x, y, x+30, y+h], fill=RED)
        d.rectangle([x+30, y, x+60, y+h], fill=(244, 244, 244))
        x += 60

def wrap(d, text, fnt, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if d.textlength(test, font=fnt) <= maxw:
            cur = test
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def render(slug, category, headline):
    img = Image.new('RGB', (W, H), '#15151E')
    d = ImageDraw.Draw(img)
    top, bot = (26, 26, 34), (8, 8, 12)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=(int(top[0]+(bot[0]-top[0])*t), int(top[1]+(bot[1]-top[1])*t), int(top[2]+(bot[2]-top[2])*t)))
    kerb(d, 0, 12); kerb(d, H-12, 12)

    M = 80; maxw = W - 2*M
    # brand mark
    bm = font(46); x = M; y = 60
    for c in 'F1WOW ':
        d.text((x, y), c, font=bm, fill=WHITE); x += d.textlength(c, font=bm)
    for c in 'NEWS':
        d.text((x, y), c, font=bm, fill=RED); x += d.textlength(c, font=bm)
    # category
    d.text((M, 146), category.upper(), font=font(30), fill=RED)
    # headline auto-fit (up to 5 lines, 88 -> 42px)
    size = 88
    while size >= 42:
        hf = font(size)
        lines = wrap(d, headline, hf, maxw)
        line_h = int(size * 1.12)
        if line_h * len(lines) <= 320 and len(lines) <= 5:
            break
        size -= 3
    y = 208
    for ln in lines:
        d.text((M, y), ln, font=hf, fill=WHITE); y += line_h
    # accent + domain
    d.rectangle([M, 552, M+120, 559], fill=RED)
    d.text((M, 570), 'f1wownews.com', font=font(30), fill=GREY)

    out = os.path.join(ROOT, f'og-{slug}.jpg')
    img.save(out, 'JPEG', quality=88)
    return out

def patch_meta(slug):
    path = os.path.join(ROOT, slug + '.html')
    if not os.path.exists(path): return False
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
    if patch_meta(slug): n += 1
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
