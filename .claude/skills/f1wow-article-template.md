# F1WOW Article Template

## Use this template for all future articles
Based on the format from `alonso-vibrations-retirement.html`

---

## HTML Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{ARTICLE_TITLE} - F1wow News</title>
    <link rel="icon" type="image/svg+xml" href="favicon1.svg">
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Racing+Sans+Onefamily=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700family=Chakra+Petch:wght@300;400;500;600;700family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700family=Orbitron:wght@400;700;900family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700family=Teko:wght@400;500;600;700&display=swap" rel="stylesheet">
    <meta name="description" content="{SEO_DESCRIPTION}">

    <!-- Canonical URL -->
    <link rel="canonical" href="https://motorsports-news.github.io/F1WOW/{ARTICLE_FILE}">

    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://motorsports-news.github.io/F1WOW/{ARTICLE_FILE}">
    <meta property="og:title" content="{ARTICLE_TITLE} - F1wow News">
    <meta property="og:description" content="{OG_DESCRIPTION}">
    <meta property="og:image" content="https://motorsports-news.github.io/F1WOW/f1-car-hero.webp">
    <meta property="og:site_name" content="F1wow News">
    <meta property="og:locale" content="en_US">
    <meta property="article:published_time" content="{YYYY-MM-DD}">
    <meta property="article:section" content="F1 Racing">
    <meta property="article:tag" content="F1">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://motorsports-news.github.io/F1WOW/{ARTICLE_FILE}">
    <meta name="twitter:title" content="{ARTICLE_TITLE} - F1wow News">
    <meta name="twitter:description" content="{TWITTER_DESC}">
    <meta name="twitter:image" content="https://motorsports-news.github.io/F1WOW/f1-car-hero.webp">
    <meta name="twitter:site" content="@f1wow">

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "{ARTICLE_HEADLINE}",
      "datePublished": "{YYYY-MM-DD}",
      "author": {
        "@type": "Organization",
        "name": "F1wow News"
      },
      "publisher": {
        "@type": "Organization",
        "name": "F1wow",
        "url": "https://f1wow.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://f1wow.com/favicon1.svg"
        }
      },
      "description": "{ARTICLE_DESCRIPTION}",
      "about": [
        {
          "@type": "Person",
          "name": "{PERSON_OR_TEAM_NAME}"
        }
      ]
    }
    </script>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="brand">
                <h1>F1wow News</h1>
                <span class="subtitle">Powered by F1wow</span>
            </div>
            <nav class="nav">
                <div class="follower-counter">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color: var(--f1-red);">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <span id="followerCount" class="follower-count">Loading...</span>
                    <span class="follower-label">Followers</span>
                </div>
                <a href="index.html" class="nav-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    Back to Home
                </a>
            </nav>
        </div>
    </header>

    <main class="main">
        <article class="article-full">
            <!-- Article Hero -->
            <div class="article-hero">
                <div class="article-hero-bg">
                    <div class="hero-gradient"></div>
                </div>
                <div class="container">
                    <div class="article-meta-top">
                        <span class="article-category">{CATEGORY}</span>
                        <span class="article-date">{MONTH_NAME} {DAY}, {YEAR}</span>
                    </div>
                    <h1 class="article-title-full">{ARTICLE_TITLE}</h1>
                    <p class="article-subtitle-full">{ARTICLE_SUBTITLE}</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By F1wow Team</span>
                        <span class="article-read-time">{X} min read</span>
                    </div>
                </div>
            </div>

            <div class="container article-content">
                <!-- Introduction -->
                <div class="article-section">
                    <p class="article-intro">
                        {LEAD_PARAGRAPH - Starts with quote if available, gets straight to the point}
                    </p>
                </div>

                <!-- Instagram Post Embed (IF APPLICABLE) -->
                <div class="instagram-embed-container">
                    <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="{INSTAGRAM_URL}?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:658px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
                        <div style="padding:16px;">
                            <a href="{INSTAGRAM_URL}?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%; target:_blank;" rel="noopener noreferrer">
                                <div style=" display: flex; flex-direction: row; align-items: center;">
                                    <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
                                    <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                                        <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                                        <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
                                    </div>
                                </div>
                                <div style="padding: 19% 0;"></div>
                                <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
                                    <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-868.000000, -560.000000)" fill="#000000"><path d="M897,566 C889.268013,566 883,572.268013 883,580 C883,587.731987 889.268013,594 897,594 C904.731987,594 911,587.731987 911,580 C911,572.268013 904.731987,566 897,566 Z M897,588.5 C892.30558,588.5 888.5,584.69442 888.5,580 C888.5,575.30558 892.30558,571.5 897,571.5 C901.69442,571.5 905.5,575.30558 905.5,580 C905.5,584.69442 901.69442,588.5 897,588.5 Z"></path></g></g></svg>
                                </div>
                                <div style="padding-top: 8px;">
                                    <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div>
                                </div>
                                <div style="padding: 12.5% 0;"></div>
                                <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;">
                                    <div>
                                        <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(1px);"></div>
                                        <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(1px);"></div>
                                        <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(18px) translateY(1px);"></div>
                                    </div>
                                    <div style="padding-left: 8px;">
                                        <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div>
                                    </div>
                                    <div style="padding-left: 8px;">
                                        <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </blockquote>
                </div>

                <!-- Content Sections -->
                <div class="article-section">
                    <div class="section-header-article">
                        <div class="section-icon">{EMOJI_ICON}</div>
                        <h2>{SECTION_TITLE}</h2>
                    </div>

                    <p>{PARAGRAPH_1}</p>

                    <p>{PARAGRAPH_2}</p>

                    <p>{PARAGRAPH_3}</p>
                </div>

                <!-- Expert Analysis (OPTIONAL) -->
                <div class="article-section">
                    <div class="section-header-article">
                        <div class="section-icon">🎙️</div>
                        <h2>Expert Analysis</h2>
                    </div>

                    <p>{INTRO_TO_QUOTES}</p>

                    <blockquote class="article-quote">
                        <p class="quote-text">"{QUOTE_TEXT}"</p>
                        <cite class="quote-attribution">— {NAME}, {OUTLET}</cite>
                    </blockquote>

                    <blockquote class="article-quote">
                        <p class="quote-text">"{QUOTE_TEXT}"</p>
                        <cite class="quote-attribution">— {NAME}, {OUTLET}</cite>
                    </blockquote>
                </div>

                <!-- Share Section -->
                <div class="article-share">
                    <h3>Share this Article</h3>
                    <div class="share-buttons">
                        <button class="share-btn copy-link" onclick="copyArticleLink()" title="Copy Link">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                            Copy Link
                        </button>
                        <a href="https://api.whatsapp.com/send?text=Check out this article: {HEADLINE}! https://instagram.com/f1wow" target="_blank" class="share-btn whatsapp" title="Share on WhatsApp">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=https://instagram.com/f1wow" target="_blank" class="share-btn facebook" title="Share on Facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                        </a>
                        <a href="https://instagram.com/f1wow" target="_blank" class="share-btn instagram" title="Follow @f1wow">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            Follow @f1wow
                        </a>
                    </div>
                </div>

                <!-- Subscribe Section -->
                <div class="subscribe-section">
                    <div class="subscribe-content">
                        <div class="subscribe-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </div>
                        <h3>Never Miss a Race Update</h3>
                        <p>Get the latest F1 news, race results, and analysis delivered to your inbox. Join thousands of F1 fans!</p>
                        <form class="subscribe-form" onsubmit="handleSubscribe(event)">
                            <div class="subscribe-input-group">
                                <input type="email" id="subscribeEmail" placeholder="Enter your email" required class="subscribe-input">
                                <button type="submit" class="subscribe-btn">
                                    <span class="btn-text">Subscribe</span>
                                    <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                        <polyline points="12 5 19 12 12 19"/>
                                    </svg>
                                </button>
                            </div>
                            <p class="subscribe-note">🔒 No spam, unsubscribe anytime. Follow us on Instagram for daily updates!</p>
                        </form>
                        <div class="subscribe-social">
                            <a href="https://instagram.com/f1wow" target="_blank" class="social-link instagram">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                                @f1wow
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </article>

        <!-- Related Articles -->
        <section class="related-articles">
            <div class="container">
                <h2>Related Articles</h2>
                <div class="related-grid">
                    <a href="{RELATED_ARTICLE_1}" class="related-card">
                        <span class="related-category">{CATEGORY_1}</span>
                        <h4>{TITLE_1}</h4>
                    </a>
                    <a href="{RELATED_ARTICLE_2}" class="related-card">
                        <span class="related-category">{CATEGORY_2}</span>
                        <h4>{TITLE_2}</h4>
                    </a>
                    <a href="{RELATED_ARTICLE_3}" class="related-card">
                        <span class="related-category">{CATEGORY_3}</span>
                        <h4>{TITLE_3}</h4>
                    </a>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 F1wow News. All F1 related content belongs to their respective owners.</p>
            <p class="footer-links">
                <a href="https://instagram.com/f1wow" target="_blank">Follow on Instagram</a>
            </p>
        </div>
    </footer>

    <script src="script.js"></script>

    <!-- Article-specific styles (INCLUDED IN FULL TEMPLATE) -->
    <style>
        /* ... all the CSS styles from alonso-vibrations-retirement.html ... */
    </style>

    <script>
        // Copy article link
        function copyArticleLink() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showNotification('Link copied to clipboard!');
            });
        }

        // Subscribe form handler
        function handleSubscribe(event) {
            event.preventDefault();
            const email = document.getElementById('subscribeEmail').value;
            const btn = event.target.querySelector('.subscribe-btn');
            const btnText = btn.querySelector('.btn-text');
            const originalText = btnText.textContent;

            btnText.textContent = 'Subscribing...';
            btn.disabled = true;

            setTimeout(() => {
                const subscribers = JSON.parse(localStorage.getItem('f1wow_subscribers') || '[]');
                if (!subscribers.includes(email)) {
                    subscribers.push(email);
                    localStorage.setItem('f1wow_subscribers', JSON.stringify(subscribers));
                }

                btnText.textContent = 'Subscribed! ✓';
                btn.style.background = '#22c55e';
                document.getElementById('subscribeEmail').value = '';
                showNotification('Thanks for subscribing! Check your inbox for confirmation.');

                setTimeout(() => {
                    btnText.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1000);
        }

        function showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'subscribe-notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    </script>
    <script async src="https://www.instagram.com/embed.js"></script>
</body>
</html>
```

---

## Key Features of This Template

### 1. **Simpler Structure**
- Uses `styles.css` (not `styles.min.css`)
- Script tag at end of body (not in head)
- No Google Analytics in head
- Simpler JSON-LD schema

### 2. **Instagram Embed**
- Wrapped in `.instagram-embed-container`
- Use the standard embed code from Instagram
- Script: `<script async src="https://www.instagram.com/embed.js"></script>`

### 3. **Share Buttons**
- Copy Link (with JavaScript function)
- WhatsApp
- Facebook
- Follow @f1wow (Instagram)

### 4. **Subscribe Section**
- Full subscribe form with email input
- JavaScript handler for form submission
- Social link to @f1wow
- Uses localStorage for subscriber storage

### 5. **Related Articles**
- Section outside main article
- 3 related articles with category badges

### 6. **Simple Footer**
- Copyright text
- Instagram link only

---

## File Updates Checklist

When creating a new article, update these files:

1. ✅ **Create `{article-name}.html`** - Using this template
2. ✅ **Update `data.json`** - Latest post object
3. ✅ **Update `index.html`** - Featured article + articles grid
4. ✅ **Update `sitemap.xml`** - Add article URL + update index.html lastmod

---

## Common Icons for Sections

| Topic | Icon |
|-------|------|
| Breaking/News | 📢 |
| Design/Livery | 🎨 |
| Team/Driver | 🏎️ |
| Circuit | 🇯🇵 / 🇬🇧 etc |
| Analysis | 🎙️ |
| Race | 🏁 |
| Technical | 🔧 |
| Time/Schedule | 📅 |
| Impact | 🔥 |
| What's Next | 🗓️ |

---

## Article Categories

- Breaking News
- Team Announcement
- Race Report
- Race Preview
- Special Livery
- Technical Analysis
- News
- Driver News

---

**Reference file:** `alonso-vibrations-retirement.html`
