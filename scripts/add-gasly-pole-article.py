# One-off: insert the Gasly maiden-pole article at the top of articles.json.
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(ROOT, 'articles.json')

entry = {
    "slug": "gasly-maiden-pole-italian-gp-2026.html",
    "title": "Italian GP 2026 Qualifying: Gasly Takes Shock Maiden Pole",
    "excerpt": "Pierre Gasly beat George Russell by 0.060s at Monza for the first pole of his career - in his 191st race, Alpine's first ever, and France's first since 1997.",
    "date": "2026-09-05",
    "category": "race",
    "label": "Qualifying",
    "badge": "Maiden Pole",
    "driver": "Pierre Gasly",
    "event": "Italian GP 2026",
    "featuredTitle": "190 Races: Pierre Gasly Takes His First F1 Pole at Monza"
}

manifest = json.load(open(path, encoding='utf-8'))
manifest['articles'] = [a for a in manifest['articles'] if a['slug'] != entry['slug']]
manifest['articles'].insert(0, entry)
json.dump(manifest, open(path, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('articles.json now has', len(manifest['articles']), 'entries; lead =', manifest['articles'][0]['slug'])
