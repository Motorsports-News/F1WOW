# Generate driver & team profile pages + hubs from the live-fetched roster
# (_drivers.txt / _teams.txt) and articles.json. Re-runnable.
import json, os, re, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://f1wownews.com'

TEAM_HEX = {
    'mercedes':'#27F4D2','ferrari':'#F91536','mclaren':'#FF8700','red_bull':'#3671C6',
    'alpine':'#FF87BC','rb':'#5E8FAA','haas':'#B6BABD','williams':'#64C4FF',
    'audi':'#C92D4B','aston_martin':'#229971','cadillac':'#D4AF37'
}
FLAG = {
    'Italian':'\U0001F1EE\U0001F1F9','British':'\U0001F1EC\U0001F1E7','Dutch':'\U0001F1F3\U0001F1F1',
    'Spanish':'\U0001F1EA\U0001F1F8','French':'\U0001F1EB\U0001F1F7','German':'\U0001F1E9\U0001F1EA',
    'Australian':'\U0001F1E6\U0001F1FA','Mexican':'\U0001F1F2\U0001F1FD','Canadian':'\U0001F1E8\U0001F1E6',
    'Monegasque':'\U0001F1F2\U0001F1E8','Finnish':'\U0001F1EB\U0001F1EE','Thai':'\U0001F1F9\U0001F1ED',
    'Japanese':'\U0001F1EF\U0001F1F5','American':'\U0001F1FA\U0001F1F8','Brazilian':'\U0001F1E7\U0001F1F7',
    'Argentine':'\U0001F1E6\U0001F1F7','New Zealander':'\U0001F1F3\U0001F1FF','Austrian':'\U0001F1E6\U0001F1F9'
}

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

idx = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
HEADER = re.search(r'<header class="header">[\s\S]*?</header>', idx).group(0)
FOOTER = re.search(r'<footer class="footer">[\s\S]*?</footer>', idx).group(0)
GA = re.search(r'<!-- Google Analytics -->[\s\S]*?</script>', idx).group(0)
ADS = '<!-- Google AdSense -->\n    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8228873195232669" crossorigin="anonymous"></script>'
FONTS = '<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Barlow+Condensed:wght@300;600;700;800&display=swap" rel="stylesheet">'

drivers = []
for line in open(os.path.join(ROOT, '_drivers.txt'), encoding='utf-8'):
    line = line.strip()
    if '|' not in line or line.startswith('round') or line == '...': continue
    p = line.split('|')
    if len(p) < 10: continue
    drivers.append(dict(pos=p[0], id=p[1], name=p[2], num=p[3], code=p[4], nat=p[5],
                        teamId=p[6], team=p[7], points=p[8], wins=p[9]))
teams = []
for line in open(os.path.join(ROOT, '_teams.txt'), encoding='utf-8'):
    line = line.strip()
    if '|' not in line: continue
    p = line.split('|')
    if len(p) < 6: continue
    teams.append(dict(pos=p[0], id=p[1], name=p[2], nat=p[3], points=p[4], wins=p[5]))

articles = json.load(open(os.path.join(ROOT, 'articles.json'), encoding='utf-8'))['articles']

def matching_articles(*keywords):
    kws = [strip_accents(k).lower() for k in keywords if k]
    out = []
    for a in articles:
        hay = strip_accents(' '.join([a.get('title',''), a.get('featuredTitle',''), a.get('excerpt',''), a.get('driver','')])).lower()
        if any(k in hay for k in kws):
            out.append(a)
    return out[:4]

def related_html(arts):
    if not arts:
        return ''
    cards = '\n'.join(
        f'''                    <a href="{a['slug']}" class="related-card">
                        <span class="related-category">{a['label']}</span>
                        <h4>{a.get('featuredTitle') or a['title']}</h4>
                    </a>''' for a in arts)
    return f'''
        <section class="related-articles">
            <div class="container">
                <h2>Latest Coverage</h2>
                <div class="related-grid">
{cards}
                </div>
            </div>
        </section>'''

def page_shell(title, desc, slug, body, extra_script=''):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - F1wow News</title>
    <meta name="description" content="{desc}">
    <link rel="canonical" href="{SITE}/{slug}.html">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{SITE}/{slug}.html">
    <meta property="og:title" content="{title} - F1wow News">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="{SITE}/og-default.jpg">
    <meta property="og:site_name" content="F1wow News">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{SITE}/og-default.jpg">
    <link rel="icon" type="image/svg+xml" href="favicon1.svg">
    <link rel="stylesheet" href="styles.css?v=20260726c">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    {FONTS}
    {GA}
    {ADS}
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>
    {HEADER}
    <main class="main" id="main">
{body}
    </main>
    {FOOTER}
    <script src="script.js?v=20260726b"></script>
{extra_script}
</body>
</html>
'''

def stat_tiles(pos, pts, wins):
    return f'''                <div class="profile-stats">
                    <div class="profile-stat"><span class="ps-num" id="statPos">P{pos}</span><span class="ps-label">Championship</span></div>
                    <div class="profile-stat"><span class="ps-num" id="statPts">{pts}</span><span class="ps-label">Points</span></div>
                    <div class="profile-stat"><span class="ps-num" id="statWins">{wins}</span><span class="ps-label">Wins</span></div>
                </div>'''

# ---- driver pages ----
for d in drivers:
    color = TEAM_HEX.get(d['teamId'], '#B6BABD')
    flag = FLAG.get(d['nat'], '\U0001F3C1')
    arts = matching_articles(d['name'].split()[-1], d.get('driver'))
    title = f"{d['name']} - F1 2026 Profile, Stats & News"
    desc = f"{d['name']} 2026 Formula 1 profile: championship position, points, wins and the latest news. {d['name']} races for {d['team']}, car number {d['num']}."
    body = f'''        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span aria-hidden="true">/</span>
            <a href="drivers.html">Drivers</a><span aria-hidden="true">/</span>
            <span aria-current="page">{d['name']}</span>
        </nav>
        <section class="profile-hero" style="--team:{color}">
            <div class="container">
                <div class="profile-num">{d['num']}</div>
                <span class="profile-kicker">{flag} {d['nat']} &middot; <a href="team-{d['teamId']}.html">{d['team']}</a></span>
                <h1 class="profile-name">{d['name']}</h1>
{stat_tiles(d['pos'], d['points'], d['wins'])}
            </div>
        </section>
        <div class="container profile-body">
            <p>{d['name']} is a {d['nat']} racing driver competing in the 2026 FIA Formula 1 World Championship for <a href="team-{d['teamId']}.html">{d['team']}</a>, carrying car number {d['num']}. Below is the latest F1wow coverage featuring {d['name'].split()[-1]}, plus live championship data.</p>
            <div class="profile-links">
                <a href="championship.html" class="quick-nav-btn primary">Full Standings &amp; Graph</a>
                <a href="calendar.html" class="quick-nav-btn">Race Calendar</a>
                <a href="drivers.html" class="quick-nav-btn">All Drivers</a>
            </div>
        </div>
{related_html(arts)}'''
    script = f'''    <script>
    (function(){{
        if(typeof cachedJson!=='function')return;
        cachedJson('https://api.jolpi.ca/ergast/f1/2026/driverstandings.json').then(function(data){{
            var l=data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
            var me=l.filter(function(x){{return x.Driver.driverId==='{d['id']}';}})[0];
            if(!me)return;
            set('statPos','P'+me.position);set('statPts',me.points);set('statWins',me.wins);
        }}).catch(function(){{}});
        function set(id,v){{var e=document.getElementById(id);if(e)e.textContent=v;}}
    }})();
    </script>'''
    open(os.path.join(ROOT, f"driver-{d['id']}.html"), 'w', encoding='utf-8').write(
        page_shell(title, desc, f"driver-{d['id']}", body, script))

# ---- team pages ----
for t in teams:
    color = TEAM_HEX.get(t['id'], '#B6BABD')
    flag = FLAG.get(t['nat'], '\U0001F3C1')
    line_drivers = [d for d in drivers if d['teamId'] == t['id']]
    arts = matching_articles(t['name'].split()[0], *[d['name'].split()[-1] for d in line_drivers])
    title = f"{t['name']} - F1 2026 Team Profile, Stats & News"
    desc = f"{t['name']} 2026 Formula 1 team profile: constructors' championship position, points, wins, drivers and the latest news."
    driver_cards = '\n'.join(
        f'''                    <a href="driver-{d['id']}.html" class="lineup-card"><span class="lineup-num">{d['num']}</span><span class="lineup-name">{d['name']}</span><span class="lineup-pts">{d['points']} pts</span></a>''' for d in line_drivers)
    body = f'''        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span aria-hidden="true">/</span>
            <a href="teams.html">Teams</a><span aria-hidden="true">/</span>
            <span aria-current="page">{t['name']}</span>
        </nav>
        <section class="profile-hero" style="--team:{color}">
            <div class="container">
                <span class="profile-kicker">{flag} {t['nat']} &middot; Constructor</span>
                <h1 class="profile-name">{t['name']}</h1>
{stat_tiles(t['pos'], t['points'], t['wins'])}
            </div>
        </section>
        <div class="container profile-body">
            <h2 class="profile-subhead">2026 Driver Line-up</h2>
            <div class="lineup-grid">
{driver_cards}
            </div>
            <div class="profile-links">
                <a href="championship.html" class="quick-nav-btn primary">Constructors' Standings</a>
                <a href="teams.html" class="quick-nav-btn">All Teams</a>
            </div>
        </div>
{related_html(arts)}'''
    script = f'''    <script>
    (function(){{
        if(typeof cachedJson!=='function')return;
        cachedJson('https://api.jolpi.ca/ergast/f1/2026/constructorstandings.json').then(function(data){{
            var l=data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
            var me=l.filter(function(x){{return x.Constructor.constructorId==='{t['id']}';}})[0];
            if(!me)return;
            set('statPos','P'+me.position);set('statPts',me.points);set('statWins',me.wins);
        }}).catch(function(){{}});
        function set(id,v){{var e=document.getElementById(id);if(e)e.textContent=v;}}
    }})();
    </script>'''
    open(os.path.join(ROOT, f"team-{t['id']}.html"), 'w', encoding='utf-8').write(
        page_shell(title, desc, f"team-{t['id']}", body, script))

# ---- hubs ----
def driver_card(d):
    color = TEAM_HEX.get(d['teamId'], '#B6BABD')
    return f'''                <a href="driver-{d['id']}.html" class="roster-card" style="--team:{color}">
                    <span class="roster-pos">{d['pos']}</span>
                    <span class="roster-num">{d['num']}</span>
                    <span class="roster-name">{d['name']}</span>
                    <span class="roster-team">{d['team']}</span>
                    <span class="roster-pts">{d['points']}<small>pts</small></span>
                </a>'''
drivers_body = f'''        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Drivers</span>
        </nav>
        <div class="container">
            <div class="section-header"><h1 class="hub-title">2026 F1 Drivers</h1></div>
            <div class="roster-grid">
{chr(10).join(driver_card(d) for d in drivers)}
            </div>
        </div>'''
open(os.path.join(ROOT, 'drivers.html'), 'w', encoding='utf-8').write(
    page_shell('2026 F1 Drivers - Profiles, Standings & Stats',
               'Every 2026 Formula 1 driver: championship standings, points, teams and profiles. The complete F1 2026 grid.',
               'drivers', drivers_body))

def team_card(t):
    color = TEAM_HEX.get(t['id'], '#B6BABD')
    return f'''                <a href="team-{t['id']}.html" class="roster-card" style="--team:{color}">
                    <span class="roster-pos">{t['pos']}</span>
                    <span class="roster-name">{t['name']}</span>
                    <span class="roster-pts">{t['points']}<small>pts</small></span>
                </a>'''
teams_body = f'''        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Teams</span>
        </nav>
        <div class="container">
            <div class="section-header"><h1 class="hub-title">2026 F1 Teams</h1></div>
            <div class="roster-grid">
{chr(10).join(team_card(t) for t in teams)}
            </div>
        </div>'''
open(os.path.join(ROOT, 'teams.html'), 'w', encoding='utf-8').write(
    page_shell('2026 F1 Teams - Constructor Profiles & Standings',
               'Every 2026 Formula 1 team: constructors championship standings, points, drivers and profiles.',
               'teams', teams_body))

print(f'Generated {len(drivers)} driver pages, {len(teams)} team pages, 2 hubs')
