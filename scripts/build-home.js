// build-home.js — regenerates homepage featured/grid/trending, category pages,
// and data.json from articles.json (single source of truth).
//
// Publish workflow:
//   1. Add the article HTML file
//   2. Add one entry to articles.json
//   3. node scripts/build-home.js && node scripts/generate-sitemap.js
//   4. commit + push
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtDate = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${MONTHS[m - 1]} ${d}, ${y}`;
};

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'articles.json'), 'utf8'));
const articles = manifest.articles.slice().sort((a, b) => b.date.localeCompare(a.date));
const newest = articles[0];

// sanity: every slug must exist as a file
for (const a of articles) {
    if (!fs.existsSync(path.join(root, a.slug))) {
        console.error(`ERROR: articles.json references missing file: ${a.slug}`);
        process.exit(1);
    }
}

const esc = s => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function gridCard(a, indent) {
    const breaking = a.slug === newest.slug ? ' breaking' : '';
    return `${indent}<a href="${a.slug}" class="article-preview-card" data-category="${a.category}">
${indent}    <div class="article-preview-content">
${indent}        <div class="article-preview-meta">
${indent}            <span class="preview-category${breaking}">${esc(a.label)}</span>
${indent}            <span class="preview-date">${fmtDate(a.date)}</span>
${indent}        </div>
${indent}        <h3 class="article-preview-title">${esc(a.title)}</h3>
${indent}        <p class="article-preview-excerpt">${esc(a.excerpt)}</p>
${indent}    </div>
${indent}</a>`;
}

function featuredBlock(a) {
    const metaBits = [`<span class="featured-date">${fmtDate(a.date)}</span>`];
    if (a.event) metaBits.push(`<span class="featured-divider">•</span>\n                            <span class="featured-event">${esc(a.event)}</span>`);
    if (a.driver) metaBits.push(`<span class="featured-divider">•</span>\n                            <span class="featured-driver">${esc(a.driver)}</span>`);
    return `<a href="${a.slug}" class="featured-article">
                    <div class="featured-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        ${esc(a.badge || a.label)}
                    </div>
                    <div class="featured-content">
                        <span class="featured-category">\u{1F3C6} ${esc(a.label)}</span>
                        <h2 class="featured-title">${esc(a.featuredTitle || a.title)}</h2>
                        <p class="featured-excerpt">${esc(a.excerpt)}</p>
                        <div class="featured-meta">
                            ${metaBits.join('\n                            ')}
                        </div>
                    </div>
                    <div class="featured-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>`;
}

function trendingItems() {
    const top3 = articles.slice(0, 3);
    const items = top3.map((a, i) =>
        `<a href="${a.slug}" class="trending-item"><span class="trending-rank">${i + 1}</span><h3>${esc(a.featuredTitle || a.title)}</h3></a>`);
    items.push(`<a href="race-hub.html" class="trending-item"><span class="trending-rank">4</span><h3>Race Hub: This Weekend's Session Times &amp; Results</h3></a>`);
    return items.join('\n                    ');
}

function splice(content, tag, replacement) {
    const start = `<!-- BUILD:${tag}:START -->`;
    const end = `<!-- BUILD:${tag}:END -->`;
    const i = content.indexOf(start);
    const j = content.indexOf(end);
    if (i === -1 || j === -1) { console.error(`ERROR: markers ${tag} not found`); process.exit(1); }
    return content.slice(0, i + start.length) + '\n' + replacement + '\n                ' + content.slice(j);
}

// ---- index.html ----
let idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
idx = splice(idx, 'FEATURED', featuredBlock(newest));
idx = splice(idx, 'GRID', articles.map(a => gridCard(a, '                    ')).join('\n'));
idx = splice(idx, 'TRENDING', '                    ' + trendingItems());
fs.writeFileSync(path.join(root, 'index.html'), idx);
console.log(`index.html: featured=${newest.slug}, grid=${articles.length} cards, trending top3`);

// ---- category pages ----
const CATS = { 'race-reports.html': 'race', 'news.html': 'news', 'technical.html': 'technical' };
for (const [file, cat] of Object.entries(CATS)) {
    let c = fs.readFileSync(path.join(root, file), 'utf8');
    const list = articles.filter(a => a.category === cat);
    c = splice(c, 'GRID', list.map(a => gridCard(a, '                    ')).join('\n'));
    fs.writeFileSync(path.join(root, file), c);
    console.log(`${file}: ${list.length} cards`);
}

// ---- data.json ----
const dataJson = {
    latestPost: {
        title: newest.featuredTitle || newest.title,
        quote: newest.excerpt,
        driver: newest.driver || '',
        source: '@f1wow',
        sourceLink: 'https://www.instagram.com/f1wow/',
        image: 'f1-car-hero.webp',
        date: fmtDate(newest.date),
        event: newest.event || '',
        articleLink: newest.slug,
        tags: ['f1', 'f12026', 'formula1']
    }
};
fs.writeFileSync(path.join(root, 'data.json'), JSON.stringify(dataJson, null, 2));
console.log('data.json: latestPost =', newest.slug);
