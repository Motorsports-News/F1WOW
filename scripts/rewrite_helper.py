# Shared generator for rewriting thin legacy articles to the current standard.
# Reuses header/footer/share block from a known-good article (hungarian-gp-2026-race.html).
import re

SITE = 'https://f1wownews.com'
BASE = open('hungarian-gp-2026-race.html', encoding='utf-8').read()
HEADER = re.search(r'<header class="header">[\s\S]*?</header>', BASE).group(0)
FOOTER = re.search(r'<footer class="footer">[\s\S]*?</footer>', BASE).group(0)
SHARE_TMPL = re.search(r'[ \t]*<!-- Share Section -->\s*<div class="article-share">[\s\S]*?</div>\s*</div>\n', BASE).group(0)
GA = re.search(r'<!-- Google Analytics -->[\s\S]*?</script>', BASE).group(0)
ADS = '<!-- Google AdSense -->\n    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8228873195232669" crossorigin="anonymous"></script>'
FONTS = '<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Barlow+Condensed:wght@300;600;700;800&display=swap" rel="stylesheet">'
CSSV = '20260729a'
JSV = '20260726g'


def share_block(slug, share_text):
    url = f'{SITE}/{slug.replace(".html", "")}'
    s = SHARE_TMPL
    s = re.sub(r'https://f1wownews\.com/[a-z0-9-]+\.html', url, s)
    s = re.sub(r'text=[^&"]*', 'text=' + share_text.replace(' ', '%20'), s)
    return s


def related_block(items):
    cards = '\n'.join(
        f'''                    <a href="{slug}" class="related-card">
                        <span class="related-category">{cat}</span>
                        <h4>{title}</h4>
                    </a>''' for slug, cat, title in items)
    return f'''
        <!-- Related Articles -->
        <section class="related-articles">
            <div class="container">
                <h2>Related Articles</h2>
                <div class="related-grid">
{cards}
                </div>
            </div>
        </section>
    '''


def gen_article(slug, title, desc, date, display_date, category, label,
                h1, subtitle, read_time, body_sections, related_items,
                share_text, driver='', event='', schema_about=None):
    ld_headline = title.replace('"', '\\"')
    ld_desc = desc.replace('"', '\\"')
    schema_about = schema_about or event or 'Formula 1'

    head = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - F1wow News</title>
    <meta name="description" content="{desc}">
    <link rel="canonical" href="{SITE}/{slug}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{SITE}/{slug}">
    <meta property="og:title" content="{title} - F1wow News">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="{SITE}/og-default.jpg">
    <meta property="og:site_name" content="F1wow News">
    <meta property="og:locale" content="en_US">
    <meta property="article:published_time" content="{date}">
    <meta property="article:section" content="F1 Racing">
    <meta property="article:tag" content="F1">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{SITE}/{slug}">
    <meta name="twitter:title" content="{title} - F1wow News">
    <meta name="twitter:description" content="{desc}">
    <meta name="twitter:image" content="{SITE}/og-default.jpg">
    <meta name="twitter:site" content="@f1wow">

    <link rel="stylesheet" href="styles.css?v={CSSV}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    {FONTS}
    {GA}
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "{ld_headline}",
      "datePublished": "{date}",
      "dateModified": "{date}",
      "author": {{ "@type": "Organization", "name": "F1wow News" }},
      "publisher": {{
        "@type": "Organization", "name": "F1wow", "url": "{SITE}",
        "logo": {{ "@type": "ImageObject", "url": "{SITE}/favicon1.svg" }}
      }},
      "description": "{ld_desc}",
      "about": [{{ "@type": "SportsEvent", "name": "{schema_about}" }}]
    }}
    </script>
    <script type="application/ld+json">{{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{{"@type": "ListItem", "position": 1, "name": "Home", "item": "{SITE}/index.html"}}, {{"@type": "ListItem", "position": 2, "name": "{title}", "item": "{SITE}/{slug}"}}]}}</script>
    {ADS}
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>
    {HEADER}
    <main class="main" id="main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{h1[:60]}</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top">
                        <span class="article-category">{label}</span>
                        <span class="article-date"><time datetime="{date}">{display_date}</time></span>
                    </div>
                    <h1 class="article-title-full">{h1}</h1>
                    <p class="article-subtitle-full">{subtitle}</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By <a href="about.html" class="author-link">F1wow Team</a></span>
                        <span class="article-read-time">{read_time} min read</span>
                    </div>
                </div>
            </div>

            <div class="article-content">
{body_sections}
{share_block(slug, share_text)}
            </div>
        </article>
{related_block(related_items)}
    </main>

    {FOOTER}

    <script src="script.js?v={JSV}"></script>
</body>
</html>
'''
    open(slug, 'w', encoding='utf-8').write(head)
    return len(head)
