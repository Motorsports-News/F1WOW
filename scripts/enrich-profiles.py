# Enrich driver/team profile pages with genuine per-round season data,
# replacing the single templated boilerplate sentence with real, unique
# content per page. Fixes thin-content AND duplicate-content risk
# (all 33 pages previously shared one identical sentence template).
#
# IMPORTANT: reads full_season_results_fixed.json (races merged by round -
# the raw API paginates at the result-entry level, so a single race's 22
# classified drivers can arrive split across two "race" objects sharing
# the same round number; those must be merged before aggregating team
# points per round, or a team gets double-counted per-round rows).
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

data = json.load(open('full_season_results_fixed.json', encoding='utf-8'))
races = sorted(data['races'], key=lambda r: int(r['round']))

CSS_ADD = '''
    <style>
        .season-log-scroll { max-height: 420px; overflow-y: auto; border-radius: 10px; margin: 18px 0; }
        .season-log-scroll table { margin: 0; }
        .season-log-scroll thead th { position: sticky; top: 0; background: var(--f1-dark); z-index: 1; }
    </style>'''


def ensure_css(s):
    if 'season-log-scroll' not in s.split('</head>')[0]:
        s = s.replace('</head>', CSS_ADD + '\n</head>', 1)
    return s


# ---- Build per-driver round logs (one row per round, guaranteed unique) ----
driver_log = {}
driver_meta = {}
for r in races:
    label = r['Circuit']['Location']['locality'] or r['raceName'].replace(' Grand Prix', '')
    for res in r['Results']:
        did = res['Driver']['driverId']
        driver_log.setdefault(did, []).append({
            'round': r['round'], 'label': label,
            'pos': res['position'], 'pts': res['points'], 'status': res['status']
        })
        driver_meta[did] = {
            'name': res['Driver']['givenName'] + ' ' + res['Driver']['familyName'],
            'team': res['Constructor']['name'], 'teamId': res['Constructor']['constructorId']
        }

# ---- Build per-constructor round logs (both cars summed, one row per round) ----
team_log = {}
for r in races:
    label = r['Circuit']['Location']['locality'] or r['raceName'].replace(' Grand Prix', '')
    round_pts, round_best = {}, {}
    for res in r['Results']:
        cid = res['Constructor']['constructorId']
        round_pts[cid] = round_pts.get(cid, 0) + float(res['points'])
        pos = int(res['position'])
        if cid not in round_best or pos < round_best[cid]:
            round_best[cid] = pos
    for cid, pts in round_pts.items():
        team_log.setdefault(cid, []).append({'round': r['round'], 'label': label, 'pts': pts, 'best': round_best[cid]})

# sanity: exactly N rows per driver/team, one per round (never more)
for did, log in driver_log.items():
    assert len(log) == len(races), f'{did}: {len(log)} rows, expected {len(races)}'
for cid, log in team_log.items():
    assert len(log) <= len(races), f'{cid}: {len(log)} rows, more than {len(races)} rounds'
print(f'Sanity check passed: {len(races)} rounds, {len(driver_log)} drivers, {len(team_log)} teams, all row counts consistent')


def stats_for_driver(log):
    finishes = [int(x['pos']) for x in log if x['status'] == 'Finished' or 'Lap' in x['status']]
    podiums = sum(1 for p in finishes if p <= 3)
    wins = sum(1 for p in finishes if p == 1)
    best = min(finishes) if finishes else None
    return podiums, wins, best, len(log)


def driver_rows(log):
    out = []
    for x in log:
        result = f"P{x['pos']}" if (x['status'] == 'Finished' or 'Lap' in x['status']) else x['status']
        out.append(f'<tr class="standings-row"><td>{x["round"]}</td><td>{x["label"]}</td><td>{result}</td><td>{x["pts"]}</td></tr>')
    return '\n'.join(out)


def team_rows(log):
    return '\n'.join(
        f'<tr class="standings-row"><td>{x["round"]}</td><td>{x["label"]}</td><td>P{x["best"]}</td><td>{x["pts"]:g}</td></tr>'
        for x in log)


n_drivers = n_teams = 0
for did, log in driver_log.items():
    fname = f'driver-{did}.html'
    if not os.path.exists(fname):
        continue
    s = open(fname, encoding='utf-8').read()
    if '2026 Season Log' in s:
        continue
    meta = driver_meta[did]
    podiums, wins, best, starts = stats_for_driver(log)
    facts = f"Across {starts} races in 2026, {meta['name'].split()[-1]} has taken {podiums} podium{'s' if podiums != 1 else ''}"
    if wins:
        facts += f" and {wins} win{'s' if wins != 1 else ''}"
    if best:
        facts += f", with a best finish of P{best}."
    else:
        facts += "."

    old_p_start = s.find(f'<p>{meta["name"]} is a')
    if old_p_start == -1:
        print('SKIP (paragraph not found):', fname)
        continue
    old_p_end = s.find('</p>', old_p_start) + len('</p>')
    new_p = f'<p>{meta["name"]} is a racing driver competing in the 2026 FIA Formula 1 World Championship for <a href="team-{meta["teamId"]}.html">{meta["team"]}</a>. {facts}</p>'

    table = f'''<h2 class="profile-subhead">2026 Season Log</h2>
            <div class="standings-container season-log-scroll">
                <table class="standings-table" aria-label="{meta["name"]} 2026 season results">
                    <thead><tr><th>Rd</th><th>Race</th><th>Result</th><th>Pts</th></tr></thead>
                    <tbody>
{driver_rows(log)}
                    </tbody>
                </table>
            </div>
            <div class="profile-links">'''
    s = s[:old_p_start] + new_p + s[old_p_end:]
    s = s.replace('<div class="profile-links">', table, 1)
    s = ensure_css(s)
    open(fname, 'w', encoding='utf-8').write(s)
    n_drivers += 1

for cid, log in team_log.items():
    fname = f'team-{cid}.html'
    if not os.path.exists(fname):
        continue
    s = open(fname, encoding='utf-8').read()
    if '2026 Points Log' in s:
        continue
    total_pts = sum(x['pts'] for x in log)
    best_finish = min(x['best'] for x in log)
    facts = f"Across {len(log)} rounds so far in 2026, the team has scored {total_pts:g} points with a best single-race result of P{best_finish}."
    marker = '<h2 class="profile-subhead">2026 Driver Line-up</h2>'
    if marker not in s:
        print('SKIP (marker not found):', fname)
        continue
    block = f'''<p style="color: var(--text-muted); line-height: 1.7; margin-bottom: 24px;">{facts}</p>
            <h2 class="profile-subhead">2026 Points Log</h2>
            <div class="standings-container season-log-scroll">
                <table class="standings-table" aria-label="{cid} 2026 season points log">
                    <thead><tr><th>Rd</th><th>Race</th><th>Best Car</th><th>Pts</th></tr></thead>
                    <tbody>
{team_rows(log)}
                    </tbody>
                </table>
            </div>
            {marker}'''
    s = s.replace(marker, block, 1)
    s = ensure_css(s)
    open(fname, 'w', encoding='utf-8').write(s)
    n_teams += 1

print(f'Enriched {n_drivers} driver pages, {n_teams} team pages')
