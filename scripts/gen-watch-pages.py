# Generate "How to Watch F1 2026" guide pages (global hub + India).
# Evergreen, high-intent SEO; affiliate-ready. Verify broadcaster details each season.
import re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://f1wownews.com'

idx = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
HEADER = re.search(r'<header class="header">[\s\S]*?</header>', idx).group(0)
FOOTER = re.search(r'<footer class="footer">[\s\S]*?</footer>', idx).group(0)
GA = re.search(r'<!-- Google Analytics -->[\s\S]*?</script>', idx).group(0)
ADS = '<!-- Google AdSense -->\n    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8228873195232669" crossorigin="anonymous"></script>'
FONTS = '<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Barlow+Condensed:wght@300;600;700;800&display=swap" rel="stylesheet">'

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
    <link rel="stylesheet" href="styles.css?v=20260726d">
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
    <script src="script.js?v=20260726b"></script>
</body>
</html>
'''

# ---------- Global hub ----------
hub_body = '''        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span aria-hidden="true">/</span>
            <span aria-current="page">How to Watch F1</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top"><span class="article-category">Guide</span></div>
                    <h1 class="article-title-full">How to Watch F1 in 2026: Every Country, Channel &amp; Stream</h1>
                    <p class="article-subtitle-full">Formula 1 has gone streaming-first &mdash; and 2026 brings big broadcaster changes. Here is where to watch every Grand Prix, practice, qualifying and sprint, wherever you are.</p>
                </div>
            </div>
            <div class="article-content">
                <div class="article-intro"><p>The way we watch Formula 1 is changing fast. F1 TV is now available in more markets than ever, the United States has moved to a brand-new home, and India is firmly in the streaming era. This guide breaks down the main options for the 2026 season &mdash; and we keep it updated as deals change.</p></div>

                <div class="article-section">
                    <h2>F1 TV Pro &amp; F1 TV Premium (Global)</h2>
                    <p>Formula 1's own subscription service, <strong>F1 TV</strong>, is the closest thing to a worldwide option. <strong>F1 TV Pro</strong> offers live races with every driver's onboard camera, live timing and the full race archive; <strong>F1 TV Premium</strong> adds 4K Ultra HD/HDR, a personalised Multiview with up to 26 feeds, and multi-device streaming. Availability varies by country because of local broadcast deals &mdash; for example, F1 TV Pro is <em>not</em> available in the UK (Sky holds exclusivity) and in the US it is bundled with Apple TV. Check availability for your region at <a href="https://f1tv.formula1.com" target="_blank" rel="noopener">f1tv.formula1.com</a>.</p>
                </div>

                <div class="article-section">
                    <h2>Where to Watch by Country</h2>
                    <div class="standings-container">
                        <table class="standings-table" aria-label="F1 2026 broadcasters by country">
                            <thead><tr><th>Country</th><th>Live (Paid)</th><th>Free / Highlights</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>United Kingdom</td><td>Sky Sports F1 (Sky, Sky Go or NOW)</td><td>Channel 4 &mdash; highlights + British GP live</td></tr>
                                <tr class="standings-row"><td>United States</td><td>Apple TV (exclusive, includes F1 TV Premium)</td><td>Select races free on Apple TV (TBC)</td></tr>
                                <tr class="standings-row"><td>India</td><td>FanCode (streaming only) &mdash; <a href="how-to-watch-f1-india.html">full guide</a></td><td>None (streaming only since 2022)</td></tr>
                                <tr class="standings-row"><td>Most other regions</td><td>F1 TV Pro / Premium, or local rights-holder</td><td>Varies by market</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p><strong>UK:</strong> Sky Sports F1 carries all 24 rounds live (every session), on Sky or contract-free via NOW; Channel 4 shows free highlights plus the British Grand Prix live. Sky holds UK rights through 2034.</p>
                    <p><strong>USA (new for 2026):</strong> F1 has moved from ESPN to an exclusive <strong>Apple TV</strong> deal running through 2032. It covers all 24 Grands Prix, six Sprints and every practice and qualifying session, and includes <strong>F1 TV Premium free</strong> when you link accounts at f1tv.formula1.com. It works on virtually any device, not just Apple hardware.</p>
                    <p><strong>India:</strong> <a href="how-to-watch-f1-india.html">FanCode</a> is the exclusive home of F1 through at least 2028, streaming every session with English, Hindi and Tamil commentary.</p>
                </div>

                <div class="article-section">
                    <h2>Watching for Free</h2>
                    <p>Fully free live coverage is rare. The best free options are the UK's Channel 4 (highlights of every round plus the British GP live) and whatever select free races Apple TV chooses to open up in the US. Everywhere else, a paid subscription is generally required for live sessions.</p>
                </div>

                <div class="article-section">
                    <h2>Don't Miss Lights Out</h2>
                    <p>Whatever your setup, know when to tune in: our <a href="race-hub.html">Race Hub</a> shows every session time for the current Grand Prix in your local timezone, and the <a href="calendar.html">2026 calendar</a> has the full schedule. Follow the title fight on the <a href="championship.html">championship standings and graph</a>.</p>
                    <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; font-style: italic; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 14px; margin-top: 18px;">Broadcast rights and pricing change between seasons and sometimes mid-year. Always confirm the latest details with the official broadcaster before a race weekend. This guide is informational and not affiliated with any broadcaster.</p>
                </div>
            </div>
        </article>'''

open(os.path.join(ROOT, 'how-to-watch-f1.html'), 'w', encoding='utf-8').write(shell(
    'How to Watch F1 in 2026: Every Country, Channel & Stream',
    'Where to watch Formula 1 in 2026 by country: F1 TV, Sky Sports (UK), Apple TV (USA), FanCode (India) and more. Every Grand Prix, practice, qualifying and sprint.',
    'how-to-watch-f1', hub_body))

# ---------- India ----------
india_body = '''        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span aria-hidden="true">/</span>
            <a href="how-to-watch-f1.html">How to Watch F1</a><span aria-hidden="true">/</span>
            <span aria-current="page">India</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top"><span class="article-category">Guide</span></div>
                    <h1 class="article-title-full">How to Watch F1 in India in 2026: FanCode, Pricing &amp; Everything You Need</h1>
                    <p class="article-subtitle-full">Formula 1 in India is streaming-only &mdash; and FanCode is the exclusive home. Here is every way to watch the 2026 season, including language options and F1 TV.</p>
                </div>
            </div>
            <div class="article-content">
                <div class="article-intro"><p>If you are following Formula 1 from India, there is one name to know: <strong>FanCode</strong>. It holds the exclusive rights to stream every F1 session in India, and the deal runs through at least 2028. There is no traditional TV channel airing F1 in India &mdash; it has been streaming-only since Star Sports and Hotstar coverage ended after 2022.</p></div>

                <div class="article-section">
                    <h2>FanCode: The Exclusive Home of F1 in India</h2>
                    <p>FanCode streams <strong>every practice session, qualifying, Sprint and Grand Prix</strong> of the 2026 season live. You can watch on the FanCode website, its mobile app, and on supported smart TVs. The same rights also cover Bangladesh, Nepal and Sri Lanka, making FanCode the home of F1 across the Indian subcontinent.</p>
                </div>

                <div class="article-section">
                    <h2>Commentary in Your Language</h2>
                    <p>One of FanCode's biggest draws for Indian fans is language choice: alongside the standard English world feed, it offers <strong>regional commentary in Hindi and Tamil</strong> &mdash; a genuine step up in accessibility for the sport in India.</p>
                </div>

                <div class="article-section">
                    <h2>Pricing: What It Costs</h2>
                    <p>FanCode was introduced as an affordable alternative to subscribing to F1 TV directly. In previous seasons, single race-weekend passes started as low as around <strong>Rs 49</strong>, with an unlimited annual pass in the region of <strong>Rs 1,499</strong>. Exact 2026 pricing is confirmed on FanCode closer to the season, so check the official site for the current plans before you subscribe.</p>
                    <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; font-style: italic;">Pricing is indicative and set by FanCode; confirm current rates at fancode.com.</p>
                </div>

                <div class="article-section">
                    <h2>What About F1 TV?</h2>
                    <p>F1 TV has not gone away for Indian fans &mdash; it is now handled through FanCode. Under the current agreement, <strong>F1 TV Pro and F1 TV Premium are sold directly via FanCode</strong>. If you choose an F1 TV package, you still use the familiar F1 TV app to watch, while FanCode manages the subscription. That gets you the deeper experience: onboard cameras, live timing, and (on Premium) multi-feed viewing.</p>
                </div>

                <div class="article-section">
                    <h2>Quick Summary</h2>
                    <div class="standings-container">
                        <table class="standings-table" aria-label="How to watch F1 in India summary">
                            <thead><tr><th>Question</th><th>Answer</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>Where to watch</td><td>FanCode (streaming only) &mdash; web, app, smart TV</td></tr>
                                <tr class="standings-row"><td>What's covered</td><td>All practice, qualifying, sprints &amp; Grands Prix</td></tr>
                                <tr class="standings-row"><td>Languages</td><td>English, Hindi, Tamil</td></tr>
                                <tr class="standings-row"><td>F1 TV Pro / Premium</td><td>Available via FanCode, watched in the F1 TV app</td></tr>
                                <tr class="standings-row"><td>Traditional TV</td><td>None since 2022</td></tr>
                                <tr class="standings-row"><td>Deal runs until</td><td>At least 2028</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="article-section">
                    <h2>When to Tune In</h2>
                    <p>Race start times in India (IST) vary a lot by circuit. Our <a href="race-hub.html">Race Hub</a> automatically shows every session for the current Grand Prix in your local timezone, and the <a href="calendar.html">2026 calendar</a> lists the full schedule. Keep up with the title race on the <a href="championship.html">championship standings and graph</a>.</p>
                    <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; font-style: italic; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 14px; margin-top: 18px;">Rights and pricing can change; confirm current details on FanCode before subscribing. This guide is informational and independent, and is not affiliated with FanCode or Formula 1.</p>
                </div>
            </div>
        </article>'''

open(os.path.join(ROOT, 'how-to-watch-f1-india.html'), 'w', encoding='utf-8').write(shell(
    'How to Watch F1 in India in 2026: FanCode, Pricing & Streaming Guide',
    'How to watch Formula 1 in India in 2026: FanCode is the exclusive streaming home, with English, Hindi and Tamil commentary. Pricing, F1 TV, and every session covered.',
    'how-to-watch-f1-india', india_body))

print('Generated how-to-watch-f1.html + how-to-watch-f1-india.html')
