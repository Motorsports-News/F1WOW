# One-off: insert the Ferrari Monza upgrade article at the top of articles.json.
# Written as a script (not a heredoc) per the project's Git Bash heredoc caveat.
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(ROOT, 'articles.json')

entry = {
    "slug": "ferrari-monza-upgrade-2026-italian-gp.html",
    "title": "Ferrari Monza Upgrade 2026: The Floor, Not the Wing",
    "excerpt": "A Monza-specific single-element floor, a stripped-back rear wing and the second ADUO engine - why Ferrari's home-race package hides under the car.",
    "date": "2026-09-04",
    "category": "technical",
    "label": "Technical Analysis",
    "badge": "Home Race Push",
    "driver": "Charles Leclerc",
    "event": "Italian GP 2026",
    "featuredTitle": "Ferrari Goes All Out at Monza - And the Biggest Change Is Under the Car"
}

manifest = json.load(open(path, encoding='utf-8'))
manifest['articles'] = [a for a in manifest['articles'] if a['slug'] != entry['slug']]
manifest['articles'].insert(0, entry)
json.dump(manifest, open(path, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('articles.json now has', len(manifest['articles']), 'entries; lead =', manifest['articles'][0]['slug'])
