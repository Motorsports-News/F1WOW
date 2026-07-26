# Generate clean "How to Watch F1 2026" guide pages (global hub + India).
# Card-based, scannable. Verify broadcaster details each season.
import re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://f1wownews.com'

idx = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
HEADER = re.search(r'<header class="header">[\s\S]*?</header>', idx).group(0)
FOOTER = re.search(r'<footer class="footer">[\s\S]*?</footer>', idx).group(0)
GA = re.search(r'<!-- Google Analytics -->[\s\S]*?</script>', idx).group(0)
ADS = '<!-- Google AdSense -->\n    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8228873195232669" crossorigin="anonymous"></script>'
FONTS = '<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Barlow+Condensed:wght@300;600;700;800&display=swap" rel="stylesheet">'
CSSV = '20260726f'

def shell(title, desc, slug, body):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - F1wow News</title>
    <meta name="description" content="{desc}">
    <link rel="canonical" href="{SITE}/{slug}.html">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{SITE}/{slug}.html">
    <meta property="og:title" content="{title} - F1wow News">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="{SITE}/og-default.jpg">
    <meta property="og:site_name" content="F1wow News">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{SITE}/og-default.jpg">
    <link rel="icon" type="image/svg+xml" href="favicon1.svg">
    <link rel="stylesheet" href="styles.css?v={CSSV}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    {FONTS}
    {GA}
    {ADS}
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>
    {HEADER}
    <main class="main" id="main">
{body}
    </main>
    {FOOTER}
    <script src="script.js?v=20260726g"></script>
</body>
</html>
'''

# ---------------- Global hub ----------------
hub_body = '''        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span aria-hidden="true">/</span>
            <span aria-current="page">How to Watch F1</span>
        </nav>
        <section class="profile-hero" style="--team:var(--f1-red)">
            <div class="container">
                <span class="profile-kicker">2026 Season Guide</span>
                <h1 class="profile-name">How to Watch F1 in 2026</h1>
                <p class="watch-lead">Formula 1 has gone streaming-first &mdash; and 2026 brings big broadcaster changes. Here is where to watch every Grand Prix, practice, qualifying and sprint, wherever you are.</p>
            </div>
        </section>
        <div class="watch-wrap">
            <h2 class="watch-h2">The Global Option</h2>
            <p class="watch-sub">F1's own service is the closest thing to a worldwide option &mdash; though availability depends on local deals.</p>
            <div class="watch-cards">
                <div class="watch-card featured">
                    <div class="watch-card-head"><h3>F1 TV Pro</h3></div>
                    <div class="watch-badges"><span class="watch-badge global">Global*</span><span class="watch-badge live">Live</span></div>
                    <p>Every session live, with all 20 driver onboard cameras, live timing and the full race archive.</p>
                </div>
                <div class="watch-card featured">
                    <div class="watch-card-head"><h3>F1 TV Premium</h3></div>
                    <div class="watch-badges"><span class="watch-badge global">Global*</span><span class="watch-badge live">4K</span></div>
                    <p>Everything in Pro, plus 4K Ultra HD/HDR, a personalised Multiview with up to 26 feeds and multi-device streaming.</p>
                </div>
            </div>
            <p class="watch-note">*Availability varies by country. F1 TV Pro is not available in the UK (Sky exclusivity), and in the US it is bundled with Apple TV. Check <a href="https://f1tv.formula1.com" target="_blank" rel="noopener">f1tv.formula1.com</a> for your region.</p>

            <h2 class="watch-h2">Where to Watch by Country</h2>
            <div class="watch-cards">
                <div class="watch-card">
                    <div class="watch-card-head"><span class="watch-flag">\U0001F1EC\U0001F1E7</span><h3>United Kingdom</h3></div>
                    <div class="watch-badges"><span class="watch-badge live">Sky Sports F1</span><span class="watch-badge free">Channel 4</span></div>
                    <p>Sky Sports F1 carries all 24 rounds live &mdash; every session &mdash; on Sky or contract-free via NOW. Channel 4 shows free highlights of every race plus the British GP live.</p>
                    <div class="opt"><strong>Live:</strong> Sky / Sky Go / NOW &nbsp;&middot;&nbsp; <strong>Free:</strong> Channel 4</div>
                </div>
                <div class="watch-card">
                    <div class="watch-card-head"><span class="watch-flag">\U0001F1FA\U0001F1F8</span><h3>United States</h3></div>
                    <div class="watch-badges"><span class="watch-badge live">Apple TV</span><span class="watch-badge global">New for 2026</span></div>
                    <p>F1 has moved from ESPN to an exclusive Apple TV deal through 2032. It covers every session and includes F1 TV Premium free when you link accounts &mdash; and works on almost any device, not just Apple.</p>
                    <div class="opt"><strong>Live:</strong> Apple TV &nbsp;&middot;&nbsp; select races free (TBC)</div>
                </div>
                <div class="watch-card">
                    <div class="watch-card-head"><span class="watch-flag">\U0001F1EE\U0001F1F3</span><h3>India</h3></div>
                    <div class="watch-badges"><span class="watch-badge live">FanCode</span></div>
                    <p>FanCode is the exclusive streaming home of F1 through at least 2028 &mdash; every session, with English, Hindi and Tamil commentary.</p>
                    <div class="opt"><a href="how-to-watch-f1-india.html">Read the full India guide &rarr;</a></div>
                </div>
            </div>

            <h2 class="watch-h2">Watching for Free</h2>
            <p class="watch-sub">Fully free live coverage is rare. The best options are the UK's Channel 4 (highlights of every round, plus the British GP live) and whatever select free races Apple TV opens up in the US. Everywhere else, a paid subscription is generally needed for live sessions.</p>

            <div class="watch-cta">
                <a href="race-hub.html" class="quick-nav-btn primary">Session Times (Your Timezone)</a>
                <a href="calendar.html" class="quick-nav-btn">2026 Calendar</a>
            </div>
            <p class="watch-note">Broadcast rights and pricing change between seasons and sometimes mid-year. Always confirm the latest details with the official broadcaster before a race weekend. This guide is informational and not affiliated with any broadcaster.</p>
        </div>'''

open(os.path.join(ROOT, 'how-to-watch-f1.html'), 'w', encoding='utf-8').write(shell(
    'How to Watch F1 in 2026: Every Country, Channel & Stream',
    'Where to watch Formula 1 in 2026 by country: F1 TV, Sky Sports (UK), Apple TV (USA), FanCode (India) and more. Every Grand Prix, practice, qualifying and sprint.',
    'how-to-watch-f1', hub_body))

# ---------------- India ----------------
india_body = '''        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span aria-hidden="true">/</span>
            <a href="how-to-watch-f1.html">How to Watch F1</a><span aria-hidden="true">/</span>
            <span aria-current="page">India</span>
        </nav>
        <section class="profile-hero" style="--team:var(--f1-red)">
            <div class="container">
                <span class="profile-kicker">\U0001F1EE\U0001F1F3 India &middot; 2026 Season Guide</span>
                <h1 class="profile-name">How to Watch F1 in India</h1>
                <p class="watch-lead">Formula 1 in India is streaming-only &mdash; and FanCode is the exclusive home. Here is every way to watch the 2026 season.</p>
            </div>
        </section>
        <div class="watch-wrap">
            <div class="watch-cards">
                <div class="watch-card featured">
                    <div class="watch-card-head"><h3>FanCode</h3></div>
                    <div class="watch-badges"><span class="watch-badge live">Exclusive</span><span class="watch-badge global">Through 2028</span></div>
                    <p>The exclusive home of F1 in India. Streams every practice, qualifying, Sprint and Grand Prix live &mdash; on the FanCode website, app, and supported smart TVs. The rights also cover Bangladesh, Nepal and Sri Lanka.</p>
                </div>
            </div>

            <div class="watch-chips">
                <span class="watch-chip">All practice, quali &amp; races</span>
                <span class="watch-chip">English &middot; Hindi &middot; Tamil</span>
                <span class="watch-chip">Web &middot; App &middot; Smart TV</span>
                <span class="watch-chip">F1 TV via FanCode</span>
            </div>

            <h2 class="watch-h2">Commentary in Your Language</h2>
            <p class="watch-sub">Alongside the standard English world feed, FanCode offers regional commentary in <strong>Hindi and Tamil</strong> &mdash; a genuine step up in accessibility for the sport in India.</p>

            <h2 class="watch-h2">Pricing</h2>
            <div class="watch-cards">
                <div class="watch-card">
                    <div class="watch-badges"><span class="watch-badge global">Race Weekend</span></div>
                    <div class="watch-price"><span class="p">~&#8377;49</span><span class="l">single weekend pass (indicative)</span></div>
                </div>
                <div class="watch-card">
                    <div class="watch-badges"><span class="watch-badge live">Best Value</span></div>
                    <div class="watch-price"><span class="p">~&#8377;1,499</span><span class="l">unlimited annual pass (indicative)</span></div>
                </div>
            </div>
            <p class="watch-note">Pricing is indicative from recent seasons and set by FanCode; confirm current 2026 rates at fancode.com before subscribing.</p>

            <h2 class="watch-h2">What About F1 TV?</h2>
            <p class="watch-sub">F1 TV has not gone away for Indian fans &mdash; it is handled through FanCode. <strong>F1 TV Pro and F1 TV Premium are sold directly via FanCode</strong>, and if you choose an F1 TV package you still watch in the familiar F1 TV app while FanCode manages the subscription. That unlocks onboard cameras, live timing and (on Premium) multi-feed viewing.</p>

            <div class="watch-cta">
                <a href="race-hub.html" class="quick-nav-btn primary">Session Times in IST</a>
                <a href="calendar.html" class="quick-nav-btn">2026 Calendar</a>
                <a href="how-to-watch-f1.html" class="quick-nav-btn">Other Countries</a>
            </div>
            <p class="watch-note">Rights and pricing can change; confirm current details on FanCode before subscribing. This guide is informational and independent, and is not affiliated with FanCode or Formula 1.</p>
        </div>'''

open(os.path.join(ROOT, 'how-to-watch-f1-india.html'), 'w', encoding='utf-8').write(shell(
    'How to Watch F1 in India in 2026: FanCode, Pricing & Streaming Guide',
    'How to watch Formula 1 in India in 2026: FanCode is the exclusive streaming home, with English, Hindi and Tamil commentary. Pricing, F1 TV, and every session covered.',
    'how-to-watch-f1-india', india_body))

print('Regenerated clean watch pages')
