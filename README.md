# F1wow News Website

A Formula 1 news and analysis website featuring live standings, race calendar, championship graphs, and in-depth race reports — all auto-updating from the official F1 API.

## 🌐 Live Site

[https://motorsports-news.github.io/F1WOW/](https://motorsports-news.github.io/F1WOW/)

## ✨ Features

- **Live Data** — Driver/constructor standings, race calendar, countdown, and championship graph all pull from the [Jolpica F1 API](https://api.jolpi.ca) automatically after each race
- **Animated Hero** — F1 car silhouette racing across a track with 3D mouse-parallax tilt
- **Race Reports** — Detailed articles for each Grand Prix with results, analysis, and expert quotes
- **Championship Graph** — Interactive SVG chart showing points progression across the season
- **Newsletter** — Email collection via [Formspree](https://formspree.io)
- **SEO Optimized** — Canonical URLs, Open Graph, Twitter Cards, structured data, XML sitemap
- **Performance** — Only 2 Google Fonts (Chakra Petch + Orbitron), optimized assets, no heavy frameworks

## 📁 Project Structure

```
├── index.html              # Homepage with hero, featured article, news grid
├── championship.html       # Live standings + championship graph
├── calendar.html           # Live race calendar with results
├── subscribe.html          # Newsletter subscription (Formspree)
├── styles.css              # Main stylesheet
├── script.js               # All JS (API fetching, countdown, search, UI)
├── sitemap.xml             # Auto-generated XML sitemap
├── favicon1.svg            # Site favicon
├── ARTICLE_TEMPLATE.html   # Template for new articles
│
├── Articles (race reports & news)
│   ├── canada-gp-2026.html
│   ├── japan-gp-2026.html
│   ├── antonelli-maiden-win.html
│   ├── lambiase-mclaren-2028.html
│   ├── wheatley-departs-audi-f1.html
│   └── ... (12 total)
│
├── images/                 # Article images
├── api/                    # Serverless function (Vercel, optional)
└── scripts/                # Build tools (sitemap generator)
```

## 🚀 Quick Start

```bash
git clone https://github.com/Motorsports-News/F1WOW.git
cd F1WOW
python -m http.server 8080
# Open http://localhost:8080
```

## 📝 Adding New Articles

1. Copy `ARTICLE_TEMPLATE.html` → `your-article.html`
2. Fill in content, meta tags, and structured data
3. Add article card to `index.html` articles grid (with `data-team` attribute for team-colored accent)
4. Regenerate sitemap: `node scripts/generate-sitemap.js`
5. Commit and push to `main`

## 🔄 Auto-Updating Data

The site fetches live data on every page load — **no manual updates needed** after races:

| Data | Source | Updates |
|------|--------|---------|
| Driver standings | Jolpica API | After each race |
| Constructor standings | Jolpica API | After each race |
| Race calendar + winners | Jolpica API | After each race |
| Next race countdown | Jolpica API | Automatic |
| Championship graph | Jolpica API (results + sprints) | After each race |

Hardcoded fallback data is included in case the API is unreachable.

## 🛠️ Tech Stack

- **HTML5 / CSS3 / Vanilla JS** — No frameworks, no build step
- **Jolpica F1 API** — Live race data (free, no auth required)
- **Formspree** — Newsletter email collection
- **GitHub Pages** — Hosting
- **Google Analytics** — Traffic tracking

## 📱 Browser Support

- Chrome / Edge / Firefox / Safari (latest)
- Mobile responsive

## 📄 License

All F1 related content belongs to their respective owners.
F1 car silhouette icon: [game-icons.net](https://game-icons.net) (CC BY 3.0).

## 🔗 Social

- **Instagram**: [@f1wow](https://instagram.com/f1wow)

---

**Built with ❤️ for F1 fans**
