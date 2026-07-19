// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SITE_URL = 'https://f1wownews.com';
const OUTPUT_FILE = path.join(__dirname, '..', 'sitemap.xml');

// Priority mapping
const priorities = {
    'index.html': 1.0,
    'calendar.html': 0.7,
    'championship.html': 0.7,
    'predictor.html': 0.7,
    'subscribe.html': 0.6
};

const changeFreq = {
    'index.html': 'daily',
    'calendar.html': 'weekly',
    'championship.html': 'weekly'
};

async function generateSitemap() {
    // Get all HTML files except in node_modules
    const files = glob.sync('*.html', {
        cwd: __dirname + '/..',
        ignore: ['node_modules/**', 'test-*.html', 'debug-*.html', '*-demo.html', 'ARTICLE_TEMPLATE.html']
    });

    const urls = files.map(file => {
        const url = `${SITE_URL}/${file}`;
        const priority = priorities[file] || (file.includes('-') ? 0.9 : 0.7);
        const changefreq = changeFreq[file] || 'monthly';

        // Get file modification time
        const stats = fs.statSync(path.join(__dirname, '..', file));
        const lastmod = stats.mtime.toISOString().split('T')[0];

        return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    fs.writeFileSync(OUTPUT_FILE, sitemap);
    console.log(`✅ Sitemap generated: ${OUTPUT_FILE}`);
    console.log(`   Total URLs: ${files.length}`);
}

generateSitemap().catch(console.error);
