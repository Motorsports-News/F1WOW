# Generate F1 calendar-replacement news article (Malaysia frontrunner)
import re

base = open('belgian-gp-2026.html', encoding='utf-8').read()
SITE = 'https://f1wownews.com'
SLUG = 'malaysia-f1-calendar-replacement.html'
DATE = '2026-07-26'

TITLE = 'Malaysia Emerges as Frontrunner to Replace Dropped F1 Race'
DESC = "Malaysia's Sepang circuit is a leading candidate to replace a Middle Eastern round that cannot be held, according to The Race, with Turkey and Portimao also in contention."

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
head = re.sub(r'"name":"Belgian[^"]*"', '"name":"Malaysia F1 Calendar News"', head)
head = re.sub(r'"name": "Belgian[^"]*"', '"name": "Malaysia F1 Calendar News"', head)

body = '''    <main class="main" id="main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Malaysia F1 Calendar News</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top">
                        <span class="article-category">News</span>
                        <span class="article-date"><time datetime="''' + DATE + '''">July 26, 2026</time></span>
                    </div>
                    <h1 class="article-title-full">Malaysia Emerges as Frontrunner to Replace Dropped F1 Round</h1>
                    <p class="article-subtitle-full">With one of the season's Middle Eastern races unable to go ahead, Malaysia's Sepang circuit has become a leading candidate to fill the slot &mdash; with Turkey and Portimao also in the frame, according to The Race.</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By <a href="about.html" class="author-link">F1wow Team</a></span>
                        <span class="article-read-time">3 min read</span>
                    </div>
                </div>
            </div>

            <div class="article-content">
                <div class="article-intro">
                    <p>Formula 1 could be heading back to Southeast Asia. With one of the calendar's Middle Eastern rounds unable to be held, <strong>Malaysia has emerged as one of the main candidates to step in</strong>, according to a report from <a href="https://www.the-race.com" target="_blank" rel="noopener">The Race</a>. Turkey and Portugal's Portimao circuit are understood to be the other names in contention for the vacant slot.</p>
                </div>

                <div class="article-section" style="display:flex; justify-content:center;">
                    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DbIsC87sNO5/" data-instgrm-version="14" style="max-width:540px; width:100%; background:#FFF; border-radius:8px;"></blockquote>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F1F2\U0001F1FE</span> Why Malaysia Leads the Race</h2>
                    <p>The Sepang International Circuit is no stranger to Formula 1. It hosted the Malaysian Grand Prix every year from 1999 to 2017 &mdash; a fixture of the calendar for nearly two decades before dropping off after the 2017 season. The Hermann Tilke-designed track, with its long straights and sweeping high-speed corners, remains a favourite among drivers and is more than capable of meeting modern F1 standards, which makes it an obvious ready-made option when a slot opens up at short notice.</p>
                    <p>A return would mark one of the sport's most anticipated comebacks and reconnect F1 with a passionate Southeast Asian fanbase that has grown considerably since Sepang last held a round.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F3C1</span> The Alternatives: Turkey and Portimao</h2>
                    <p>Malaysia is not the only contender. Two circuits that impressed during their most recent F1 outings are also reportedly on the shortlist:</p>
                    <ul>
                        <li><strong>Istanbul Park (Turkey)</strong> &mdash; a track universally praised by drivers, home to the Turkish Grand Prix across 2005&ndash;2011 and again in 2020 and 2021. Its flowing layout and the famous quadruple-apex Turn 8 make it one of the most respected circuits F1 has visited this century.</li>
                        <li><strong>Algarve International Circuit, Portimao (Portugal)</strong> &mdash; the rollercoaster-like Portuguese venue that stepped in during the 2020 and 2021 calendar reshuffles, known for its dramatic elevation changes and blind crests.</li>
                    </ul>
                    <p>All three share one crucial advantage: they are proven, F1-ready venues that could slot into the schedule with minimal lead time &mdash; exactly what is needed when a replacement is required mid-cycle.</p>
                </div>

                <div class="article-section">
                    <h2><span class="section-icon">\U0001F4DD</span> Nothing Official Yet</h2>
                    <p>It is important to stress that no decision has been confirmed. As it stands, this is a shortlist of candidates rather than a done deal, and Formula 1 has not made any official announcement about which circuit &mdash; if any &mdash; will fill the vacant slot. We will update this story as the situation develops.</p>
                    <p>For the current schedule and every confirmed round, check our <a href="calendar.html">2026 race calendar</a>, and follow the title fight on the <a href="championship.html">championship standings and graph</a>.</p>
                </div>

                <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; font-style: italic; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">Source: <strong>The Race</strong>. Shared via <a href="https://instagram.com/f1wow" target="_blank" rel="noopener">@f1wow</a>. This report concerns candidates under consideration; nothing has been officially confirmed by Formula 1.</p>
''' + share.rstrip() + '''
            </div>
        </article>

        <!-- Related Articles -->
        <section class="related-articles">
            <div class="container">
                <h2>Related Articles</h2>
                <div class="related-grid">
                    <a href="belgian-gp-2026.html" class="related-card">
                        <span class="related-category">Race Report</span>
                        <h4>Belgian GP 2026: Antonelli Wins at Spa as Russell Retires</h4>
                    </a>
                    <a href="most-positions-gained-2026.html" class="related-card">
                        <span class="related-category">Stat Attack</span>
                        <h4>Comeback Kings of 2026: The Biggest Position Gains</h4>
                    </a>
                    <a href="cancellation-article.html" class="related-card">
                        <span class="related-category">News</span>
                        <h4>F1 Announces Cancellation of Bahrain and Saudi Arabian GPs</h4>
                    </a>
                    <a href="calendar.html" class="related-card">
                        <span class="related-category">Calendar</span>
                        <h4>2026 F1 Race Calendar &amp; Results</h4>
                    </a>
                </div>
            </div>
        </section>
    '''

share_url = f'{SITE}/malaysia-f1-calendar-replacement'
body = body.replace('https://f1wownews.com/belgian-gp-2026.html', share_url)
body = body.replace('text=Belgian GP 2026: Antonelli Wins at Spa as Russell Retires',
                    'text=Malaysia frontrunner to replace dropped F1 race')

out = head + body + tail
open(SLUG, 'w', encoding='utf-8').write(out)
print('written', SLUG, len(out), 'bytes')
