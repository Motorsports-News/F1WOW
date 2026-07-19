# F1WOW Article Creation Skill

## Overview
This skill guides the creation of F1 news articles for the F1WOW website following the established design, structure, and writing patterns.

---

## File Structure & Locations

**Project Directory:** `E:\Insta`

**Key Files:**
- New articles: `{article-name}.html`
- Data file: `data.json`
- Homepage: `index.html`
- Sitemap: `sitemap.xml`
- Images: `images/{article-name}-{number}.jpg`

**Live URL:** `https://f1wownews.com/`

---

## Article Structure Template

### HTML Head Section

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{SEO_TITLE} - F1wow News</title>
    <link rel="icon" type="image/svg+xml" href="favicon1.svg">
    <link rel="stylesheet" href="styles.css">
    <!-- Fonts preload -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Racing+Sans+One&family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&family=Chakra+Petch:wght@300;400;500;600;700&family=Teko:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- SEO Meta Tags -->
    <meta name="description" content="{BRIEF_DESCRIPTION_WITH_HASHTAGS}">
    <meta name="keywords" content="{COMMA_SEPARATED_KEYWORDS}">
    <meta name="author" content="F1wow News">

    <!-- Canonical URL -->
    <link rel="canonical" href="https://f1wownews.com/{ARTICLE_FILE}">

    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://f1wownews.com/{ARTICLE_FILE}">
    <meta property="og:title" content="{OG_TITLE}">
    <meta property="og:description" content="{OG_DESCRIPTION}">
    <meta property="og:image" content="https://motorsports-news.github.io/F1WOG/images/{HERO_IMAGE}">
    <meta property="og:site_name" content="F1wow News">
    <meta property="article:published_time" content="{YYYY-MM-DD}">
    <meta property="article:section" content="F1 Racing">
    <meta property="article:tag" content="{TAG1}">
    <meta property="article:tag" content="{TAG2}">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://f1wownews.com/{ARTICLE_FILE}">
    <meta name="twitter:title" content="{TWITTER_TITLE}">
    <meta name="twitter:description" content="{TWITTER_DESC}">
    <meta name="twitter:image" content="https://f1wownews.com/images/{HERO_IMAGE}">
    <meta name="twitter:site" content="@f1wow">
</head>
```

### JSON-LD Structured Data

```html
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
    "url": "https://f1wownews.com"
  },
  "description": "{ARTICLE_DESCRIPTION}",
  "about": [
    {
      "@type": "SportsEvent",
      "name": "{EVENT_NAME}"
    },
    {
      "@type": "SportsTeam",
      "name": "{TEAM_NAME}"
    }
  ]
}
</script>
```

### Article Hero Section

```html
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
```

### Article Content Sections

```html
<!-- Introduction -->
<div class="article-section">
    <p class="article-intro">
        {LEAD_PARAGRAPH - Crisp opening, gets straight to the point}
    </p>
    <p class="source-credit" style="text-align: center; color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-top: -15px; margin-bottom: 30px;">
        Source: <a href="{SOURCE_URL}" target="_blank" style="color: #e10600;">{SOURCE_HANDLE}</a> | Images courtesy of {TEAM/ORG}
    </p>
</div>

<!-- Image Gallery -->
<div class="article-section">
    <div class="image-gallery">
        <img src="images/{IMAGE_1}" alt="{DESC_1}" class="article-image-full">
        <img src="images/{IMAGE_2}" alt="{DESC_2}" class="article-image-full">
        <img src="images/{IMAGE_3}" alt="{DESC_3}" class="article-image-full">
        <img src="images/{IMAGE_4}" alt="{DESC_4}" class="article-image-full">
    </div>
    <p class="image-caption" style="text-align: center; color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-top: 10px;">
        {GALLERY_CAPTION}
    </p>
</div>

<!-- Content Sections with Icons -->
<div class="article-section">
    <div class="section-header-article">
        <div class="section-icon">{EMOJI_ICON}</div>
        <h2>{SECTION_TITLE}</h2>
    </div>
    <p>{FACTUAL_PARAGRAPH_1}</p>
    <p>{FACTUAL_PARAGRAPH_2}</p>
    <p>{FACTUAL_PARAGRAPH_3}</p>
</div>
```

---

## Writing Style Guidelines

### Core Principles

1. **Crisp & Factual** - No storytelling fluff, get straight to the point
2. **Paragraph Length** - 2-3 paragraphs per section, each 2-4 sentences
3. **No Elaboration** - Avoid flowery descriptions, stick to facts
4. **Direct Opening** - Introduction should hook with key fact/quote immediately

### Style Examples

**✅ GOOD:**
> "Cherry-picked just for you." That's how Visa Cash App Racing Bulls F1 Team introduced their special Spring Edition livery for the Japanese Grand Prix 2026. The new design, featuring cherry blossom pink accents throughout the RB22, pays tribute to Japan's sakura season as Formula 1 heads to Suzuka Circuit.

**❌ BAD:**
> In a world where Formula 1 teams are constantly seeking new ways to engage with their passionate fanbase, Visa Cash App Racing Bulls F1 Team has made a decision that will resonate deeply with enthusiasts across the globe. The team has unveiled...

### Section Pattern

Each section follows this structure:
1. **Section header** with emoji icon
2. **3 paragraphs** maximum:
   - Para 1: What happened (facts)
   - Para 2: Context/why it matters
   - Para 3: Additional detail or implication

### Common Section Icons

| Topic | Icon |
|-------|------|
| Announcement/Breaking | 📢 |
| Design/Livery | 🎨 |
| Team/Driver Info | 🏎️ |
| Circuit/Track | 🇯🇵 / 🇬🇧 etc |
| Fan Reaction | 💬 |
| Race Weekend | 🏁 |
| Regulations | ⚙️ |
| Quotes | 💬 |

---

## Design & Theme

### Colors

- **Primary Red:** `#e10600` (F1 red)
- **Background:** Dark/navy `rgba(21, 21, 30, 0.9)`
- **Text:** White with varying opacity
  - Full: `#ffffff`
  - Body: `rgba(255,255,255,0.7)`
  - Muted: `rgba(255,255,255,0.5)`

### Typography

- **Headings:** `Orbitron` font family
- **Body:** System fonts / Roboto
- **Font Weights:** 900 (headings), 400-700 (body)

### Component Classes

```css
.article-hero { /* Hero section with gradient */ }
.article-intro { /* Left border red accent box */ }
.section-header-article { /* Icon + heading flex */ }
.article-image-full { /* Full width with rounded corners */ }
.article-share { /* Social sharing buttons */ }
.subscribe-section { /* Email signup */ }
```

---

## File Naming Convention

**Pattern:** `{topic-keywords}.html`

**Examples:**
- `wheatley-departs-audi-f1.html`
- `rb-spring-edition-japanese-gp.html`
- `antonelli-maiden-win.html`

**Rules:**
- Lowercase
- Hyphens between words
- Include year if needed for clarity
- Keep it descriptive but concise

---

## Image Handling

### Image Naming

**Pattern:** `{article-name}-{number}.jpg`

**Example:** `rb-spring-livery-1.jpg`, `rb-spring-livery-2.jpg`

### Downloading Images from Social Media

**From X/Twitter:**
1. Use FXTwitter API: `https://api.fxtwitter.com/status/{TWEET_ID}`
2. Extract image URLs from response
3. Download using curl

```bash
curl -s "https://api.fxtwitter.com/status/{TWEET_ID}" | grep -o '"url":"https://pbs.twimg.com/[^"]*"' | sed 's/"url":"//g' | sed 's/"//g'
```

### Image Credits

**Always include:**
```html
<p class="source-credit">
    Source: <a href="{SOURCE_URL}" target="_blank">@{HANDLE}</a> | Images courtesy of {TEAM}
</p>
```

---

## Required File Updates

### 1. data.json

Update the `latestPost` object:

```json
{
  "latestPost": {
    "title": "{ARTICLE_TITLE}",
    "quote": "{TWEET_POST_OR_KEY_QUOTE}",
    "driver": "{DRIVER_OR_TEAM}",
    "source": "@{SOURCE_HANDLE}",
    "sourceLink": "{FULL_SOCIAL_POST_URL}",
    "image": "images/{HERO_IMAGE}",
    "date": "{MONTH_NAME} {DAY}, {YEAR}",
    "event": "{EVENT_NAME}",
    "articleLink": "{ARTICLE_FILE}",
    "tags": ["f1", "f12026", "formula1", "{TAG1}", "{TAG2}", "{TAG3}"]
  }
}
```

### 2. index.html

**A. Update Featured Article (after line ~210):**

```html
<a href="{ARTICLE_FILE}" class="featured-article">
    <div class="featured-badge">
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        {BADGE_TEXT}
    </div>
    <div class="featured-content">
        <span class="featured-category">{CATEGORY_ICON} {CATEGORY}</span>
        <h2 class="featured-title">{ARTICLE_TITLE}</h2>
        <p class="featured-excerpt">{EXCERPT}...</p>
        <div class="featured-meta">
            <span class="featured-date">{DATE}</span>
            <span class="featured-divider">•</span>
            <span class="featured-event">{EVENT}</span>
            <span class="featured-divider">•</span>
            <span class="featured-driver">{DRIVER/TEAM}</span>
        </div>
    </div>
</a>
```

**B. Add to Articles Grid (after `articles-grid` div):**

```html
<a href="{ARTICLE_FILE}" class="article-preview-card" data-category="news">
    <div class="article-preview-content">
        <div class="article-preview-meta">
            <span class="preview-category">{CATEGORY}</span>
            <span class="preview-date">{DATE}</span>
        </div>
        <h3 class="article-preview-title">{ARTICLE_TITLE}</h3>
        <p class="article-preview-excerpt">{EXCERPT}...</p>
        <div class="article-preview-footer">
            <span class="preview-driver">{DRIVER/TEAM}</span>
            <span class="preview-event">{EVENT}</span>
        </div>
    </div>
</a>
```

### 3. sitemap.xml

Add entry after index.html entry:

```xml
<url>
  <loc>https://f1wownews.com/{ARTICLE_FILE}</loc>
  <lastmod>{YYYY-MM-DD}</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>
```

Also update index.html lastmod date.

---

## Article Categories

Use these consistent category labels:

| Category | Label | Icon |
|----------|-------|------|
| Breaking News | Breaking News | 📢 |
| Team Announcement | Team Announcement | 🏎️ |
| Race Report | Race Report | 🏁 |
| Race Preview | Race Preview | 🏁 |
| Technical Analysis | Technical Analysis | ⚙️ |
| News | News | 📢 |
| Driver News | Driver News | 👤 |
| Livery | Special Livery | 🎨 |

---

## Current F1 Context (2026 Season)

### Key Driver Lineups (2026)

| Team | Driver 1 | Driver 2 |
|------|----------|----------|
| Red Bull Racing | Max Verstappen | ??? |
| Ferrari | Charles Leclerc | Lewis Hamilton |
| Mercedes | Kimi Antonelli | ??? |
| McLaren | Oscar Piastri | ??? |
| Aston Martin | Fernando Alonso | Lance Stroll |
| **VCARB (Racing Bulls)** | **Liam Lawson** | **Arvid Lindblad** |
| Audi | Nico Hulkenberg | Gabriel Bortoleto |
| Alpine | Pierre Gasly | ??? |
| Williams | Alex Albon | ??? |
| Haas | ??? | ??? |

### Key People
- **Audi F1 Team:** Mattia Binotto (Team Principal)
- **VCARB:** Laurent Mekies (Team Principal)

### 2026 Calendar Highlights
- Japanese GP at Suzuka (March/April)
- 33-day break between Japan and Miami
- New regulations in effect

---

## Git Workflow

```bash
# Check status
cd "E:/Insta" && git status

# Stage files
git add {article}.html images/*.jpg data.json index.html sitemap.xml

# Commit
git commit -m "Add article: {TITLE}"

# Push
git push origin main
```

---

## Article Quality Checklist

- [ ] Title is descriptive and SEO-friendly
- [ ] Meta description includes key hashtags
- [ ] All images have proper alt text
- [ ] Source credit included with link
- [ ] Writing is crisp, not storytelling
- [ ] 3 paragraphs max per section
- [ ] Read time is accurate (4-5 min typical)
- [ ] data.json updated
- [ ] index.html featured section updated
- [ ] index.html grid section updated
- [ ] sitemap.xml updated
- [ ] Images downloaded and named correctly
- [ ] Open Graph tags complete
- [ ] JSON-LD structured data included
- [ ] Driver names are CURRENT (verify!)

---

## Common Mistakes to Avoid

1. ❌ **Wrong driver info** - Always verify current lineups
2. ❌ **Storytelling fluff** - Get straight to facts
3. ❌ **Long paragraphs** - Keep to 2-4 sentences
4. ❌ **Missing image credits** - Always attribute source
5. ❌ **Wrong date format** - Use "March 21, 2026" format
6. ❌ **Forgetting to update all files** - Check data.json, index.html, sitemap.xml
7. ❌ **Inconsistent categories** - Use established category labels
