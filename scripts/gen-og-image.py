# Generate the default social-share (Open Graph) image, og-default.jpg (1200x630).
#
# This is the fallback card for every page without an article-specific one --
# currently 49 pages -- so it is the most-seen image the site produces.
#
# The drawing lives in og_card.py, shared with gen-og-cards.py and gen-og-card.py.
# The previous version of this file drew its own red/white kerb stripes in
# RED = (225, 6, 0), which is Formula 1's own brand red and breaks the project's
# first hard rule, and loaded fonts from 'C:/Windows/Fonts/', so it silently
# rendered in Pillow's bitmap default on any non-Windows machine.
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import og_card

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(ROOT, 'og-default.jpg')

og_card.render_default(out)
print('og-default.jpg', os.path.getsize(out) // 1024, 'KB', f'{og_card.W}x{og_card.H}')
