# Shared renderer for F1WOW social-share (Open Graph) cards, 1200x630.
#
# This module is the single source of truth for what a share card looks like.
# gen-og-cards.py, gen-og-card.py and gen-og-image.py all call render() rather
# than drawing their own, so the three cannot drift apart again.
#
# Two things the previous per-script implementations got wrong, both fixed here:
#
#  1. They painted RED = (225, 6, 0) -- #E10600, Formula 1's own brand red --
#     across the kerb stripes, the brand mark and the category label. That
#     breaks the project's first hard rule (see CLAUDE.md: no official F1
#     branding). The palette below is the site's own: carbon, bone, steel blue.
#  2. They hardcoded 'C:/Windows/Fonts/bahnschrift.ttf', so on any non-Windows
#     machine every card silently fell back to Pillow's bitmap default. Fonts
#     are now vendored under scripts/fonts/ (see the README there for licence).
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630

# Site palette -- keep in sync with :root in styles.css
CARBON      = (11, 11, 12)      # #0B0B0C  ground
CARBON_LIFT = (26, 26, 29)      # #1A1A1D  top of the gradient
BONE        = (237, 237, 232)   # #EDEDE8  ink
STEEL       = (91, 143, 199)    # #5B8FC7  accent
STEEL_DIM   = (58, 92, 128)     # accent at rest, for the ribbon
MUTED       = (139, 139, 134)   # #8B8B86  secondary text

FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonts')
DISPLAY  = os.path.join(FONT_DIR, 'CabinetGrotesk-Extrabold.ttf')
BRAND    = os.path.join(FONT_DIR, 'CabinetGrotesk-Bold.ttf')
BODY     = os.path.join(FONT_DIR, 'Satoshi-Medium.ttf')

MARGIN = 84


def _font(path, px):
    """Load a vendored face. A missing font is a hard error on purpose --
    silently falling back to Pillow's bitmap default is how the old scripts
    shipped unreadable cards without anyone noticing."""
    if not os.path.exists(path):
        raise FileNotFoundError(
            f'Missing vendored font: {path}\n'
            'See scripts/fonts/README.md for how to re-download it.'
        )
    return ImageFont.truetype(path, px)


def _gradient(d):
    """Vertical carbon gradient, lighter at the top."""
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(
            int(CARBON_LIFT[i] + (CARBON[i] - CARBON_LIFT[i]) * t) for i in range(3)
        ))


def _ribbon(img):
    """A faint track ribbon receding to a vanishing point on the right.

    This is the still-frame echo of the WebGL ribbon in the site's hero, and it
    replaces the old red-and-white kerb stripes -- which read as F1's own
    trackside branding. Drawn at 4x and downsampled so the converging edges
    stay smooth without needing antialiased line support.
    """
    S = 4
    layer = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)

    # Both rails converge on one vanishing point. They enter at the bottom
    # edge, well apart, and recede up and to the right -- so the wedge reads
    # as a road while staying clear of the headline block on the left.
    vx, vy = W * 0.99, H * 0.34
    left_near, right_near = W * 0.42, W * 1.02
    y_near = H * 1.34

    def rail_point(nx, t):
        return (nx + (vx - nx) * t) * S, (y_near + (vy - y_near) * t) * S

    segments = 20
    for i in range(segments):
        t0 = i / segments
        t1 = (i + 0.5) / segments              # dashed: half mark, half gap
        fade = int(90 * (1 - t0) ** 1.5)       # dimmer toward the horizon
        if fade < 4:
            continue
        width = max(int((1 - t0) * 8 * S), S)
        for nx in (left_near, right_near):
            ld.line([rail_point(nx, t0), rail_point(nx, t1)],
                    fill=STEEL + (fade,), width=width)
        # cross-rung every third segment: what makes it read as track, not
        # as two unrelated diagonal lines.
        if i % 3 == 0:
            ld.line([rail_point(left_near, t0), rail_point(right_near, t0)],
                    fill=STEEL + (int(fade * 0.5),), width=max(width // 2, S))

    img.alpha_composite(layer.resize((W, H), Image.LANCZOS))


def _wrap(d, text, fnt, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if d.textlength(test, font=fnt) <= maxw:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def _tracked(d, xy, text, fnt, fill, tracking):
    """Draw text with letter-spacing. Pillow has no tracking option, so the
    uppercase labels are stepped glyph by glyph."""
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=fnt, fill=fill)
        x += d.textlength(ch, font=fnt) + tracking
    return x


def render(out_path, category, headline, domain='f1wownews.com'):
    """Render one 1200x630 share card and save it as JPEG."""
    img = Image.new('RGBA', (W, H), CARBON + (255,))
    d = ImageDraw.Draw(img)
    _gradient(d)
    _ribbon(img)
    d = ImageDraw.Draw(img)

    maxw = W - 2 * MARGIN

    # Brand mark: bone "F1WOW", steel "NEWS" -- mirrors the site header.
    bm = _font(BRAND, 42)
    x = MARGIN
    for ch in 'F1WOW ':
        d.text((x, 56), ch, font=bm, fill=BONE)
        x += d.textlength(ch, font=bm)
    for ch in 'NEWS':
        d.text((x, 56), ch, font=bm, fill=STEEL)
        x += d.textlength(ch, font=bm)

    # Category label, uppercase and tracked out.
    _tracked(d, (MARGIN, 142), category.upper(), _font(BODY, 24), STEEL, 2.6)

    # Headline, auto-fitted from 92px down to 44px across at most 5 lines.
    size, lines, hf, line_h = 92, [], None, 0
    while size >= 44:
        hf = _font(DISPLAY, size)
        lines = _wrap(d, headline, hf, maxw)
        line_h = int(size * 1.1)
        if len(lines) <= 5 and line_h * len(lines) <= 330:
            break
        size -= 3

    y = 206
    for ln in lines:
        d.text((MARGIN, y), ln, font=hf, fill=BONE)
        y += line_h

    # Footer: accent rule over the domain.
    d.rectangle([MARGIN, 546, MARGIN + 96, 551], fill=STEEL)
    d.text((MARGIN, 566), domain, font=_font(BODY, 26), fill=MUTED)

    img.convert('RGB').save(out_path, 'JPEG', quality=90)
    return out_path


def _centred(d, text, fnt, y, fill, tracking=0):
    """Draw one tracked line centred on the card. Returns its width."""
    widths = [d.textlength(ch, font=fnt) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = (W - total) / 2
    for ch, w in zip(text, widths):
        d.text((x, y), ch, font=fnt, fill=fill)
        x += w + tracking
    return total


def render_default(out_path, domain='f1wownews.com'):
    """The fallback card used by every page without its own (og-default.jpg).

    Same visual language as render(), but centred and wordmark-led since there
    is no headline to carry it.
    """
    img = Image.new('RGBA', (W, H), CARBON + (255,))
    d = ImageDraw.Draw(img)
    _gradient(d)
    _ribbon(img)
    d = ImageDraw.Draw(img)

    # Wordmark, centred as one line: bone "F1WOW", steel "NEWS".
    big = _font(DISPLAY, 132)
    f1, news, tr = 'F1WOW ', 'NEWS', 4
    w1 = sum(d.textlength(c, font=big) for c in f1) + tr * (len(f1) - 1)
    w2 = sum(d.textlength(c, font=big) for c in news) + tr * (len(news) - 1)
    x, y = (W - (w1 + w2)) / 2, 214
    for c in f1:
        d.text((x, y), c, font=big, fill=BONE)
        x += d.textlength(c, font=big) + tr
    for c in news:
        d.text((x, y), c, font=big, fill=STEEL)
        x += d.textlength(c, font=big) + tr

    # Accent rule under the wordmark.
    d.rectangle([(W - 150) / 2, 384, (W + 150) / 2, 389], fill=STEEL)

    _centred(d, 'RACE RESULTS · CHAMPIONSHIP MATHS · ANALYSIS',
             _font(BODY, 26), 418, MUTED, tracking=3.4)
    _centred(d, domain, _font(BODY, 30), 496, BONE, tracking=1.6)

    img.convert('RGB').save(out_path, 'JPEG', quality=90)
    return out_path
