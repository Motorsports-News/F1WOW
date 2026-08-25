# Generate per-article social-share cards with the headline on the branded background.
# Usage: edit CARDS below (slug, category, headline) and run. Outputs og-<slug>.jpg (1200x630).
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
RED = (225, 6, 0); WHITE = (255, 255, 255); GREY = (165, 165, 173)
FONT = 'C:/Windows/Fonts/bahnschrift.ttf'
FALLBACK = 'C:/Windows/Fonts/arialbd.ttf'

def font(px):
    try: return ImageFont.truetype(FONT, px)
    except Exception: return ImageFont.truetype(FALLBACK, px)

def kerb(d, y, h):
    x = 0
    while x < W:
        d.rectangle([x, y, x+30, y+h], fill=RED)
        d.rectangle([x+30, y, x+60, y+h], fill=(244,244,244))
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
    top, bot = (26,26,34), (8,8,12)
    for y in range(H):
        t = y/H
        d.line([(0,y),(W,y)], fill=(int(top[0]+(bot[0]-top[0])*t), int(top[1]+(bot[1]-top[1])*t), int(top[2]+(bot[2]-top[2])*t)))
    kerb(d, 0, 12); kerb(d, H-12, 12)

    MARGIN = 80; maxw = W - 2*MARGIN

    # brand mark top-left
    bm = font(46)
    x = MARGIN; y = 64
    for c in 'F1WOW ':
        d.text((x, y), c, font=bm, fill=WHITE); x += d.textlength(c, font=bm)
    for c in 'NEWS':
        d.text((x, y), c, font=bm, fill=RED); x += d.textlength(c, font=bm)

    # category chip
    cat = category.upper()
    cf = font(30)
    d.text((MARGIN, 150), cat, font=cf, fill=RED)

    # headline auto-fit
    size = 88
    while size >= 50:
        hf = font(size)
        lines = wrap(d, headline, hf, maxw)
        line_h = int(size * 1.12)
        total_h = line_h * len(lines)
        if total_h <= 300 and len(lines) <= 4:
            break
        size -= 4
    y = 210
    for ln in lines:
        d.text((MARGIN, y), ln, font=hf, fill=WHITE)
        y += line_h

    # red accent + domain
    d.rectangle([MARGIN, 548, MARGIN+120, 555], fill=RED)
    df = font(30)
    d.text((MARGIN, 566), 'f1wownews.com', font=df, fill=GREY)

    out = f'og-{slug}.jpg'
    img.save(out, 'JPEG', quality=88)
    print(out, os.path.getsize(out)//1024, 'KB', '|', len(lines), 'lines @', size, 'px')

CARDS = [
    ('dutch-gp-2026-race', 'Race Analysis', 'Norris Wins From Antonelli as Verstappen Crashes Out'),
    ('verstappen-error-free-streak-2026', 'Stat Attack', 'The 219 Races Since Verstappen Last Crashed Alone'),
]
for slug, cat, head in CARDS:
    render(slug, cat, head)
