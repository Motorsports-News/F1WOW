# Generate FMSCI national sports federation recognition news article (long, sourced)
import re

base = open('belgian-gp-2026.html', encoding='utf-8').read()
SITE = 'https://f1wownews.com'
SLUG = 'fmsci-national-sports-federation-recognition.html'
DATE = '2026-07-26'

TITLE = 'India Recognises FMSCI as National Sports Federation in F1 Push'
DESC = "India's Sports Ministry has provisionally recognised the FMSCI as a National Sports Federation, formally establishing it as the country's motorsport governing body amid a renewed push to bring Formula 1 back by 2028."

head = base[:base.find('<main')]
share = re.search(r'[ \t]*<!-- Share Section -->\s*<div class="article-share">[\s\S]*?</div>\s*</div>\n', base).group(0)
tail = base[base.find('</main>'):]

head = re.sub(r'<title>[^<]*</title>', f'<title>{TITLE} - F1wow News</title>', head)
head = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'belgian-gp-2026\.html', SLUG, head)
head = re.sub(r'(property="og:title" content=")[^"]*', r'\g<1>' + TITLE, head)
head = re.sub(r'(name="twitter:title" content=")[^"]*', r'\g<1>' + TITLE, head)
head = re.sub(r'(property="og:description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'(name="twitter:description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'(article:published_time" content=")[^"]*', r'\g<1>' + DATE, head)
head = re.sub(r'"headline": "[^"]*"', f'"headline": "{TITLE}"', head)
head = re.sub(r'"description": "[^"]*"', '"description": "' + DESC.replace('"', '\\"') + '"', head)
head = re.sub(r'"datePublished": "[^"]*"', f'"datePublished": "{DATE}"', head)
head = re.sub(r'"dateModified": "[^"]*"', f'"dateModified": "{DATE}"', head)
head = re.sub(r'"name": "2026 Japanese Grand Prix"', '"name": "Federation of Motor Sports Clubs of India"', head)
head = re.sub(r'"name":"Belgian[^"]*"', '"name":"FMSCI Recognition News"', head)
head = re.sub(r'"name": "Belgian[^"]*"', '"name": "FMSCI Recognition News"', head)
head = head.replace('src="script.js"', 'src="script.js?v=20260726a"')

body = '''    <main class="main" id="main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">FMSCI Recognition News</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top">
                        <span class="article-category">News</span>
                        <span class="article-date"><time datetime="''' + DATE + '''">July 26, 2026</time></span>
                    </div>
                    <h1 class="article-title-full">India Recognises FMSCI as National Sports Federation in Major Motorsport Push</h1>
                    <p class="article-subtitle-full">The Ministry of Youth Affairs and Sports has provisionally granted National Sports Federation status to the Federation of Motor Sports Clubs of India &mdash; a landmark step that formalises motorsport's governance as the country chases a Formula 1 return by 2028.</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By <a href="about.html" class="author-link">F1wow Team</a></span>
                        <span class="article-read-time">5 min read</span>
                    </div>
                </div>
            </div>

            <div class="article-content">
                <div class="article-intro">
                    <p><strong>NEW DELHI</strong> &mdash; Indian motorsport has taken one of the most significant governance steps in its history. The Government of India, through the <strong>Ministry of Youth Affairs and Sports</strong>, has <strong>provisionally recognised the Federation of Motor Sports Clubs of India (FMSCI) as a National Sports Federation (NSF)</strong>. The recognition formally establishes the FMSCI as the country's governing body for motorsport, strengthening its role in promoting and developing the sport nationwide &mdash; and it lands amid a renewed effort to attract Formula 1, MotoGP and other international championships to India.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F3DB️</span> What the Recognition Means</h2>
                    <p>National Sports Federation status is the formal stamp that connects a sport's governing body to the central government &mdash; unlocking closer coordination, potential funding pathways, and official standing when dealing with international bodies. For the FMSCI, which has served as India's motorsport authority since its founding in 1971 and is affiliated to the FIA, it is recognition long sought after.</p>
                    <p>The listing appeared on the Ministry's official website as the "Provisional Recognition of Federation of Motor Sports Clubs of India (FMSCI)," reflecting the government's decision to "grant a major role to the FMSCI for promotion and development of the sport of motor sports in India."</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F4CB</span> The Conditions Attached</h2>
                    <p>The recognition is provisional, and comes with compliance requirements. The Chennai-based federation, headed by Arindam Ghosh, has been asked to amend its constitution and Memorandum of Association to conform with the provisions of the <strong>National Sports Governance Act, 2025</strong> within stipulated timelines.</p>
                    <p>The government relaxed some norms &mdash; notably around the minimum number of affiliated state units required &mdash; to enable the recognition. But safeguards remain: the Ministry has stated it will revoke the status if the body fails to comply with guidelines on financial probity, anti-doping, governance structure, or if it misrepresents facts.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F3CE️</span> The Real Prize: Formula 1's Return by 2028</h2>
                    <p>The recognition is inseparable from India's Formula 1 ambitions. The FMSCI has been in regular talks with the Ministry not only about NSF status but also to chart a path back for a World Championship round &mdash; India last held a Grand Prix in 2013 at the Buddh International Circuit in Greater Noida, after debuting on the calendar in 2011.</p>
                    <p>Sports Minister Dr Mansukh Mandaviya has been explicit about the target. "The idea is to have a Formula One race in India by 2028 and for that a necessary framework would be put in place by next year. Special emphasis will be placed on encouraging and supporting regional and grassroots motorsport centres," he said, as reported by Business Standard. He added that motorsport would be positioned as "an important component of the Government's 'Play in India' initiative."</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F6E0️</span> A Dedicated Task Force</h2>
                    <p>To turn ambition into a plan, the Ministry is setting up a dedicated four-to-five member Task Force to assess India's motorsport ecosystem. According to reports, it will draw representation from the FMSCI, the Sports Ministry, the Uttar Pradesh state government (home to the Buddh circuit) and the facility owners, and will be given three months to submit its report.</p>
                    <p>Its brief is broad but pointed: examine the challenges affecting the revival and growth of motorsport in India &mdash; including Formula 1 &mdash; with a specific focus on taxation issues, regulatory hurdles, infrastructure and policy interventions. Taxation, long cited as a key obstacle to a viable Indian Grand Prix, is expected to feature high on the agenda. The stakeholder consultations that led here reportedly included Formula 1 officials, the Buddh circuit owners, the Adani Group, the FMSCI, and young Indian racers.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F4DC</span> Why This Is a Turning Point</h2>
                    <p>There is history here worth understanding. The FMSCI was actually taken off the NSF list back in 2011 &mdash; the very year Formula 1 first arrived in India &mdash; and spent years working its way back, with 2019 marking a milestone in the recognition of Indian motorsport. This provisional NSF status is the clearest signal yet that the government now views motorsport as a serious pillar of its sporting and economic strategy, rather than a niche pursuit.</p>
                    <p>For Indian fans who have waited more than a decade since cars last raced at Buddh, it is the most concrete sign in years that a home Grand Prix &mdash; and a properly structured national motorsport pathway &mdash; may finally be moving from wishful thinking toward policy.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F517</span> Sources</h2>
                    <ul>
                        <li><a href="https://www.deccanchronicle.com/sports/f1-push-sports-ministry-grants-nsf-status-to-motor-sport-body-fmsci-1973507" target="_blank" rel="noopener">Deccan Chronicle &mdash; Sports Ministry grants NSF status to FMSCI</a></li>
                        <li><a href="https://www.sportskeeda.com/motorsports/motorsports-brought-under-sports-ministry" target="_blank" rel="noopener">Sportskeeda &mdash; Motorsports given official NSF status</a></li>
                        <li><a href="https://www.business-standard.com/sports/other-sports-news/task-force-to-be-set-up-for-f1-s-india-return-sports-minister-mandaviya-126062000394_1.html" target="_blank" rel="noopener">Business Standard &mdash; Task force for F1's India return (Mandaviya)</a></li>
                        <li><a href="https://www.outlookindia.com/sports/formula-1/f1-race-possible-india-return-sports-minister-mansukh-mandaviya-fmsci-meet" target="_blank" rel="noopener">Outlook India &mdash; Mandaviya meets FMSCI to push for F1's return</a></li>
                        <li><a href="https://yas.gov.in/" target="_blank" rel="noopener">Ministry of Youth Affairs and Sports, Government of India</a></li>
                    </ul>
                    <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; font-style: italic;">Reporting compiled from the sources above. Quotes attributed to Sports Minister Mansukh Mandaviya are as reported by Business Standard.</p>
                </div>
''' + share.rstrip() + '''
            </div>
        </article>

        <!-- Related Articles -->
        <section class="related-articles">
            <div class="container">
                <h2>Related Articles</h2>
                <div class="related-grid">
                    <a href="malaysia-f1-calendar-replacement.html" class="related-card">
                        <span class="related-category">News</span>
                        <h4>Malaysia Frontrunner to Replace Dropped F1 Round</h4>
                    </a>
                    <a href="belgian-gp-2026.html" class="related-card">
                        <span class="related-category">Race Report</span>
                        <h4>Belgian GP 2026: Antonelli Wins at Spa as Russell Retires</h4>
                    </a>
                    <a href="most-positions-gained-2026.html" class="related-card">
                        <span class="related-category">Stat Attack</span>
                        <h4>Comeback Kings of 2026: The Biggest Position Gains</h4>
                    </a>
                    <a href="championship.html" class="related-card">
                        <span class="related-category">Standings</span>
                        <h4>2026 Championship Standings &amp; Graph</h4>
                    </a>
                </div>
            </div>
        </section>
    '''

share_url = f'{SITE}/fmsci-national-sports-federation-recognition'
body = body.replace('https://f1wownews.com/belgian-gp-2026.html', share_url)
body = body.replace('text=Belgian GP 2026: Antonelli Wins at Spa as Russell Retires',
                    'text=India recognises FMSCI as National Sports Federation in F1 push')

out = head + body + tail
open(SLUG, 'w', encoding='utf-8').write(out)
print('written', SLUG, len(out), 'bytes')
