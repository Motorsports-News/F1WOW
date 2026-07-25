# Generate branded default social-share (Open Graph) image, 1200x630
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
img = Image.new('RGB', (W, H), '#15151E')
d = ImageDraw.Draw(img)

# vertical dark gradient
top = (26, 26, 34); bot = (8, 8, 12)
for y in range(H):
    t = y / H
    d.line([(0, y), (W, y)], fill=(
        int(top[0] + (bot[0]-top[0])*t),
        int(top[1] + (bot[1]-top[1])*t),
        int(top[2] + (bot[2]-top[2])*t)))

RED = (225, 6, 0)
WHITE = (255, 255, 255)
GREY = (170, 170, 178)

# kerb stripe (red/white) top and bottom
def kerb(y, h):
    x = 0
    while x < W:
        d.rectangle([x, y, x+30, y+h], fill=RED)
        d.rectangle([x+30, y, x+60, y+h], fill=(244, 244, 244))
        x += 60
kerb(0, 12)
kerb(H-12, 12)

def font(px, bold=True):
    try:
        return ImageFont.truetype('C:/Windows/Fonts/bahnschrift.ttf', px)
    except Exception:
        return ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', px)

def center_text(draw, text, fnt, y, fill, spacing=0):
    # measure with letter spacing
    widths = [draw.textbbox((0,0), ch, font=fnt)[2] for ch in text]
    total = sum(widths) + spacing*(len(text)-1)
    x = (W - total)//2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += w + spacing
    return total

# Wordmark: F1WOW (white) + NEWS (red), centered as one line
big = font(150)
f1 = "F1WOW "
news = "NEWS"
w1 = sum(d.textbbox((0,0),c,font=big)[2] for c in f1) + 6*(len(f1)-1)
w2 = sum(d.textbbox((0,0),c,font=big)[2] for c in news) + 6*(len(news)-1)
total = w1 + w2
x = (W - total)//2
y = 200
for c in f1:
    d.text((x, y), c, font=big, fill=WHITE); x += d.textbbox((0,0),c,font=big)[2] + 6
for c in news:
    d.text((x, y), c, font=big, fill=RED); x += d.textbbox((0,0),c,font=big)[2] + 6

# red accent bar under wordmark
d.rectangle([(W-160)//2, 380, (W+160)//2, 388], fill=RED)

# tagline
tag = font(40, bold=False)
center_text(d, "MOTORSPORTS NEWS  •  RESULTS  •  ANALYSIS", tag, 410, GREY, spacing=4)

# domain
dom = font(34)
center_text(d, "f1wownews.com", dom, 500, WHITE, spacing=2)

img.save('og-default.jpg', 'JPEG', quality=88)
import os
print('og-default.jpg', os.path.getsize('og-default.jpg')//1024, 'KB', img.size)
