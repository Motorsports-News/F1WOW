# One-off generator for trust/legal pages (about, contact, privacy, terms, disclaimer)
import re

SITE = "https://motorsports-news.github.io/F1WOW"
idx = open('index.html', encoding='utf-8').read()
header = re.search(r'<header class="header">[\s\S]*?</header>', idx).group(0)
footer = re.search(r'<footer class="footer">[\s\S]*?</footer>', idx).group(0)

def page(slug, title, desc, body):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - F1wow News</title>
    <meta name="description" content="{desc}">
    <link rel="canonical" href="{SITE}/{slug}.html">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{SITE}/{slug}.html">
    <meta property="og:title" content="{title} - F1wow News">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="{SITE}/f1-car-hero.webp">
    <meta property="og:site_name" content="F1wow News">
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-HWLHEWCYP2"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('consent', 'default', {{
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'wait_for_update': 500
      }});
      gtag('js', new Date());
      gtag('config', 'G-HWLHEWCYP2');
    </script>
</head>
<body>

    {header}

    <main class="main" id="main">
        <div class="container">
            <article class="legal-content">
                <h1>{title}</h1>
                <p class="legal-updated">Last updated: July 18, 2026</p>
{body}
            </article>
        </div>
    </main>

    {footer}

    <script src="script.js?v=20260718"></script>
</body>
</html>
'''

pages = {}

pages['about'] = ("About Us", "Who is behind F1wow News - an independent Formula 1 news and analysis website powered by the @f1wow community.", '''
                <p><strong>F1wow News</strong> is an independent Formula 1 news and analysis website, born from the <a href="https://instagram.com/f1wow" target="_blank" rel="noopener">@f1wow Instagram community</a>. We cover race weekends, championship standings, driver and team news, and the stories that matter to F1 fans.</p>
                <h2>What we do</h2>
                <ul>
                    <li><strong>Race coverage</strong> — reports and results from every Grand Prix weekend</li>
                    <li><strong>Live standings</strong> — driver and constructor championship tables and an interactive points progression graph, updated automatically after every race</li>
                    <li><strong>News &amp; analysis</strong> — driver moves, team developments and technical regulation changes</li>
                </ul>
                <h2>Who we are</h2>
                <p>F1wow News is run by the F1wow editorial team, a group of Formula 1 enthusiasts who have been covering the sport for the F1wow social community. We are fans first: everything on this site is written for supporters who want fast, clear and accurate F1 information.</p>
                <h2>Independence</h2>
                <p>F1wow News is an unofficial fan publication. We are not affiliated with, endorsed by, or connected to Formula One Group, the FIA, or any Formula 1 team. See our <a href="disclaimer.html">Disclaimer</a> for details.</p>
                <h2>Corrections</h2>
                <p>We aim for accuracy. If you spot an error in any article, please <a href="contact.html">contact us</a> and we will review and correct it promptly.</p>
''')

pages['contact'] = ("Contact Us", "Get in touch with the F1wow News team - questions, corrections, feedback or partnership enquiries.", '''
                <p>Questions, corrections, feedback or partnership enquiries — we would like to hear from you.</p>
                <h2>Send us a message</h2>
                <form class="contact-form" action="https://formspree.io/f/mzdwqjwq" method="POST">
                    <label for="cf-email">Your email</label>
                    <input type="email" id="cf-email" name="email" required placeholder="you@example.com">
                    <label for="cf-subject">Subject</label>
                    <select id="cf-subject" name="subject">
                        <option>General question</option>
                        <option>Correction request</option>
                        <option>Feedback</option>
                        <option>Partnership / advertising</option>
                    </select>
                    <label for="cf-message">Message</label>
                    <textarea id="cf-message" name="message" rows="6" required placeholder="How can we help?"></textarea>
                    <button type="submit" class="cta-button">Send Message</button>
                </form>
                <h2>Social</h2>
                <p>You can also reach us by direct message on Instagram: <a href="https://instagram.com/f1wow" target="_blank" rel="noopener">@f1wow</a>.</p>
                <p>We aim to respond within 2-3 working days.</p>
''')

pages['privacy-policy'] = ("Privacy Policy", "How F1wow News collects, uses and protects your data - cookies, analytics, newsletter and your rights.", '''
                <p>This Privacy Policy explains what data F1wow News ("we", "us") collects when you visit this website, how we use it, and the choices you have.</p>
                <h2>1. Data we collect</h2>
                <ul>
                    <li><strong>Analytics data</strong> — we use Google Analytics 4 to understand how visitors use the site (pages viewed, approximate location, device type). Analytics cookies are only set <strong>after you give consent</strong> via our cookie banner. You can decline and the site works fully without them.</li>
                    <li><strong>Newsletter &amp; contact data</strong> — if you subscribe to our newsletter or use the contact form, your email address and message are processed by <a href="https://formspree.io" target="_blank" rel="noopener">Formspree</a> on our behalf, solely to deliver the newsletter or respond to you. We never sell or share your email address.</li>
                    <li><strong>Local preferences</strong> — your cookie-consent choice is stored in your browser's local storage so we don't ask again.</li>
                </ul>
                <h2>2. Cookies</h2>
                <p>We use one category of optional cookies: Google Analytics measurement cookies (<code>_ga</code>, <code>_ga_*</code>). These are set only after consent. Essential local storage (your consent choice) does not track you.</p>
                <h2>3. Third-party services</h2>
                <ul>
                    <li><strong>Google Analytics</strong> (Google Ireland Ltd / Google LLC) — site measurement, consent-gated</li>
                    <li><strong>Formspree Inc.</strong> — form processing for newsletter and contact</li>
                    <li><strong>Google Fonts</strong> — font delivery (your IP is sent to Google when fonts load)</li>
                    <li><strong>Instagram embeds</strong> (Meta Platforms) — some articles embed Instagram posts; Meta may set cookies if you interact with an embed</li>
                    <li><strong>Jolpica F1 API</strong> — race results and standings data; no personal data is sent</li>
                </ul>
                <h2>4. Your rights</h2>
                <p>Depending on where you live (e.g. under GDPR or CCPA), you may have the right to access, correct, delete, or object to the processing of your personal data. To exercise any right — including unsubscribing from the newsletter or withdrawing analytics consent — <a href="contact.html">contact us</a>. You can change your cookie choice at any time by clearing this site's data in your browser.</p>
                <h2>5. Data retention</h2>
                <p>Analytics data is retained per Google Analytics' standard retention settings (14 months). Newsletter addresses are kept until you unsubscribe. Contact messages are deleted once resolved.</p>
                <h2>6. Children</h2>
                <p>This site is not directed at children under 16 and we do not knowingly collect their data.</p>
                <h2>7. Changes</h2>
                <p>We will update this policy as the site evolves (for example, if advertising is introduced) and revise the date at the top of this page.</p>
''')

pages['terms'] = ("Terms of Use", "The terms and conditions governing your use of the F1wow News website.", '''
                <p>By using F1wow News you agree to these terms. If you do not agree, please do not use the site.</p>
                <h2>1. Content</h2>
                <p>All content is provided for general information and entertainment purposes only. While we strive for accuracy, motorsport news changes fast and we make no warranties that content is complete, accurate or current. See our <a href="disclaimer.html">Disclaimer</a>.</p>
                <h2>2. Intellectual property</h2>
                <p>Original text and graphics on this site are &copy; F1wow News. You may share links to our articles freely. You may not republish substantial portions of our content without permission. Formula 1 trademarks and race imagery belong to their respective owners and are used for editorial/informational purposes only.</p>
                <h2>3. Acceptable use</h2>
                <p>You agree not to misuse the site — including attempting to disrupt it, scraping it at abusive volumes, or using it for unlawful purposes.</p>
                <h2>4. Third-party links</h2>
                <p>Links to third-party websites (including Instagram) are provided for convenience. We are not responsible for their content or privacy practices.</p>
                <h2>5. Limitation of liability</h2>
                <p>To the maximum extent permitted by law, F1wow News shall not be liable for any loss or damage arising from your use of, or reliance on, this website.</p>
                <h2>6. Changes</h2>
                <p>We may update these terms at any time; continued use of the site constitutes acceptance of the revised terms.</p>
''')

pages['disclaimer'] = ("Disclaimer", "F1wow News is an unofficial, independent Formula 1 fan website - full disclaimer and trademark notice.", '''
                <h2>Unofficial fan website</h2>
                <p>F1wow News is an <strong>unofficial, independent fan website</strong>. It is not associated in any way with the Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trademarks of Formula One Licensing B.V. We are also not affiliated with the FIA or any Formula 1 team or driver.</p>
                <h2>Accuracy of information</h2>
                <p>Race results, standings and schedules are sourced from publicly available data (including the Jolpica/Ergast F1 API) and our own reporting. Motorsport information changes quickly; we cannot guarantee that every article reflects the latest developments. Official information is always available at <a href="https://www.formula1.com" target="_blank" rel="noopener">formula1.com</a> and <a href="https://www.fia.com" target="_blank" rel="noopener">fia.com</a>.</p>
                <h2>Media and attribution</h2>
                <p>Images and embedded social media content belong to their respective owners and are used for editorial and informational purposes. If you are a rights holder and want content credited differently or removed, please <a href="contact.html">contact us</a> and we will act promptly.</p>
                <h2>Advertising &amp; affiliate disclosure</h2>
                <p>If this site displays advertising or affiliate links in the future, sponsored content will be clearly labelled and affiliate links disclosed on the pages where they appear, in line with FTC guidance.</p>
''')

for slug, (title, desc, body) in pages.items():
    open(slug + '.html', 'w', encoding='utf-8').write(page(slug, title, desc, body))
    print("created", slug + ".html")
