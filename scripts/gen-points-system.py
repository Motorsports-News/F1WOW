# Generate "F1 2026 Points System Explained" article with an interactive,
# animated points calculator and scroll-triggered bar chart - the unique
# differentiator vs static-table explainer articles that already exist.
import re

base = open('f1-2026-silly-season-driver-market.html', encoding='utf-8').read()
SITE = 'https://f1wownews.com'
SLUG = 'f1-2026-points-system-explained.html'
DATE = '2026-08-06'

TITLE = 'F1 2026 Points System Explained: Try the Interactive Calculator'
DESC = "How F1 scoring works in 2026: Grand Prix and Sprint points, why the fastest-lap bonus point is gone, the red-flag scoring rule most guides miss, and an interactive calculator to work out any race weekend's points live."

head = base[:base.find('<main')]
share = re.search(r'[ \t]*<!-- Share Section -->\s*<div class="article-share">[\s\S]*?</div>\s*</div>\n', base).group(0)
tail = base[base.find('</main>'):]

head = re.sub(r'<title>[^<]*</title>', f'<title>{TITLE} - F1wow News</title>', head)
head = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'f1-2026-silly-season-driver-market\.html', SLUG, head)
head = re.sub(r'(property="og:title" content=")[^"]*', r'\g<1>' + TITLE, head)
head = re.sub(r'(name="twitter:title" content=")[^"]*', r'\g<1>' + TITLE, head)
head = re.sub(r'(property="og:description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'(name="twitter:description" content=")[^"]*', r'\g<1>' + DESC, head)
head = re.sub(r'(article:published_time" content=")[^"]*', r'\g<1>' + DATE, head)
head = re.sub(r'"headline": "[^"]*"', '"headline": "' + TITLE.replace('"', '\\"') + '"', head)
head = re.sub(r'"description": "[^"]*"', '"description": "' + DESC.replace('"', '\\"') + '"', head)
head = re.sub(r'"datePublished": "[^"]*"', f'"datePublished": "{DATE}"', head)
head = re.sub(r'"dateModified": "[^"]*"', f'"dateModified": "{DATE}"', head)
head = re.sub(r'"name": "2026 Formula 1 Driver Market"', '"name": "2026 Formula 1 Points System"', head)
head = re.sub(r'"name":"F1 2026 Silly Season"', '"name":"F1 2026 Points System Explained"', head)
head = re.sub(r'"name": "F1 2026 Silly Season"', '"name": "F1 2026 Points System Explained"', head)

CSS = '''
    <style>
        /* Interactive points calculator */
        .points-calc {
            background: var(--f1-dark);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 28px 24px;
            margin: 28px 0;
        }
        .pc-selector { margin-bottom: 20px; }
        .pc-selector h4 {
            font-family: 'Barlow Condensed', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            font-size: 0.9rem;
            color: rgba(255,255,255,0.65);
            margin-bottom: 10px;
        }
        .pc-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .pc-chip {
            background: rgba(255,255,255,0.06);
            border: 1px solid var(--border-color);
            color: var(--f1-white);
            border-radius: 8px;
            padding: 9px 14px;
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
            font-variant-numeric: tabular-nums;
        }
        .pc-chip:hover { border-color: var(--f1-red); transform: translateY(-1px); }
        .pc-chip.active { background: var(--f1-red); border-color: var(--f1-red); }
        .pc-result {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 18px;
            flex-wrap: wrap;
            margin-top: 24px;
            padding-top: 22px;
            border-top: 1px solid var(--border-color);
        }
        .pc-result-item { display: flex; flex-direction: column; align-items: center; min-width: 90px; }
        .pc-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.55); margin-bottom: 6px; }
        .pc-num {
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 800;
            font-size: 2.4rem;
            line-height: 1;
            color: var(--f1-white);
            font-variant-numeric: tabular-nums;
        }
        .pc-total .pc-num { color: var(--f1-red); font-size: 3rem; }
        .pc-plus, .pc-equals {
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 700;
            font-size: 1.8rem;
            color: rgba(255,255,255,0.35);
        }
        @media (max-width: 500px) {
            .pc-plus, .pc-equals { display: none; }
            .pc-result { gap: 10px; }
        }

        /* Animated scroll-reveal bar chart */
        .points-bars-wrap { margin: 26px 0; }
        .points-bars { display: flex; align-items: flex-end; gap: 8px; height: 180px; padding: 0 4px; }
        .pb-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
        .pb-bar {
            width: 100%;
            max-width: 42px;
            background: linear-gradient(180deg, var(--f1-red), #b80500);
            border-radius: 4px 4px 0 0;
            height: 0%;
            transition: height 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pb-val { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 0.95rem; margin-bottom: 6px; color: var(--f1-white); font-variant-numeric: tabular-nums; opacity: 0; transition: opacity 0.4s ease; }
        .pb-col.in-view .pb-bar { height: var(--h); }
        .pb-col.in-view .pb-val { opacity: 1; }
        .pb-pos { margin-top: 8px; font-size: 0.72rem; color: rgba(255,255,255,0.55); font-variant-numeric: tabular-nums; }
        @media (prefers-reduced-motion: reduce) {
            .pb-bar, .pb-val { transition: none; }
        }

        .ref-image-wrap { margin: 28px 0; text-align: center; }
        .ref-image-wrap img { max-width: 100%; border-radius: 12px; border: 1px solid var(--border-color); }
        .ref-image-caption { font-size: 0.85rem; color: rgba(255,255,255,0.55); margin-top: 10px; }
    </style>'''
head = head.replace('</head>', CSS + '\n</head>', 1)

body = '''    <main class="main" id="main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">F1 2026 Points System Explained</span>
        </nav>
        <article class="article-full">
            <div class="article-hero">
                <div class="article-hero-bg"></div>
                <div class="container">
                    <div class="article-meta-top">
                        <span class="article-category">Technical Explainer</span>
                        <span class="article-date"><time datetime="''' + DATE + '''">August 6, 2026</time></span>
                    </div>
                    <h1 class="article-title-full">How F1 Points Work in 2026: The Interactive Guide</h1>
                    <p class="article-subtitle-full">Grand Prix points, Sprint points, the bonus point that quietly disappeared, and the red-flag rule most guides skip entirely &mdash; plus a calculator to work out any race weekend for yourself.</p>
                    <div class="article-meta-footer">
                        <span class="article-author">By <a href="about.html" class="author-link">F1wow Team</a></span>
                        <span class="article-read-time">6 min read</span>
                    </div>
                </div>
            </div>

            <div class="article-content">
                <div class="article-intro">
                    <p>Formula 1's points system looks simple on the surface &mdash; whoever scores the most over a season wins &mdash; but the actual mechanics behind that number are easy to get wrong. Sprint weekends, the vanished fastest-lap bonus point, and a red-flag rule that most explainers never mention all change the maths in ways that matter. Here is exactly how scoring works in 2026, with a live calculator so you can work out any result for yourself.</p>
                </div>

                <div class="article-section">
                    <h2>Grand Prix Points: Top 10 Only</h2>
                    <p>Points are awarded to the top 10 classified finishers in every Grand Prix, on a fixed scale that has been the standard since 2010: 25 points for the win, down to 1 point for tenth. Finish 11th or lower, and you score nothing &mdash; no partial credit, no participation points.</p>
                    <div class="standings-container">
                        <table class="standings-table" aria-label="F1 2026 Grand Prix points scale">
                            <thead><tr><th>Finish</th><th>Points</th><th>Finish</th><th>Points</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>1st</td><td>25</td><td>6th</td><td>8</td></tr>
                                <tr class="standings-row"><td>2nd</td><td>18</td><td>7th</td><td>6</td></tr>
                                <tr class="standings-row"><td>3rd</td><td>15</td><td>8th</td><td>4</td></tr>
                                <tr class="standings-row"><td>4th</td><td>12</td><td>9th</td><td>2</td></tr>
                                <tr class="standings-row"><td>5th</td><td>10</td><td>10th</td><td>1</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="points-bars-wrap">
                    <div class="points-bars" id="gpBars" aria-label="Grand Prix points by finishing position, animated bar chart"></div>
                </div>

                <div class="article-section">
                    <h2>Sprint Points: A Second Payday, Top 8 Only</h2>
                    <p>Six weekends on the 2026 calendar &mdash; Shanghai, Miami, Montreal, Silverstone, Zandvoort and Singapore &mdash; run a Sprint race on Saturday, awarding a separate points scale to the top 8 finishers on top of whatever they score in Sunday's Grand Prix. It is a genuinely different scale from the main race, topping out at 8 points rather than 25.</p>
                    <div class="standings-container">
                        <table class="standings-table" aria-label="F1 2026 Sprint points scale">
                            <thead><tr><th>Finish</th><th>Points</th><th>Finish</th><th>Points</th></tr></thead>
                            <tbody>
                                <tr class="standings-row"><td>1st</td><td>8</td><td>5th</td><td>4</td></tr>
                                <tr class="standings-row"><td>2nd</td><td>7</td><td>6th</td><td>3</td></tr>
                                <tr class="standings-row"><td>3rd</td><td>6</td><td>7th</td><td>2</td></tr>
                                <tr class="standings-row"><td>4th</td><td>5</td><td>8th</td><td>1</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="points-bars-wrap">
                    <div class="points-bars" id="sprintBars" aria-label="Sprint points by finishing position, animated bar chart"></div>
                </div>

                <div class="article-section">
                    <h2>Try It Yourself: The Weekend Points Calculator</h2>
                    <p>Pick a Grand Prix finish and, if it's a sprint weekend, a Sprint finish too &mdash; the totals update instantly.</p>
                    <div class="points-calc">
                        <div class="pc-selector">
                            <h4>Grand Prix Finish</h4>
                            <div class="pc-chips" id="pcGpChips"></div>
                        </div>
                        <div class="pc-selector">
                            <h4>Sprint Finish (optional)</h4>
                            <div class="pc-chips" id="pcSprintChips"></div>
                        </div>
                        <div class="pc-result">
                            <div class="pc-result-item"><span class="pc-label">GP Points</span><span class="pc-num" id="pcGp">0</span></div>
                            <div class="pc-plus">+</div>
                            <div class="pc-result-item"><span class="pc-label">Sprint Points</span><span class="pc-num" id="pcSprint">0</span></div>
                            <div class="pc-equals">=</div>
                            <div class="pc-result-item pc-total"><span class="pc-label">Weekend Total</span><span class="pc-num" id="pcTotal">0</span></div>
                        </div>
                    </div>
                </div>

                <div class="article-section">
                    <h2>The Bonus Point That Quietly Disappeared</h2>
                    <p>From 2019 to 2024, the driver who set the fastest lap of the race earned an extra point &mdash; provided they finished in the top 10. It sounds harmless, but it started shaping strategy in unhealthy ways: teams with nothing left to gain in the race would pit a driver for fresh tyres purely to snatch (or deny a rival) that one bonus point, sometimes compromising their own race in the process.</p>
                    <p>The point was scrapped entirely from the 2025 season and remains gone in 2026. The maximum a driver can now score in a single Grand Prix is a clean 25 points, and a team's maximum from one race weekend is 43 (a Grand Prix one-two).</p>
                </div>

                <div class="article-section">
                    <h2>The Rule Most Guides Miss: Red-Flag Scoring</h2>
                    <p>Most explainers stop at the two tables above &mdash; but there is a third scale that only shows up when a race doesn't run to completion. Following the controversial handling of the 2021 Belgian Grand Prix, the FIA introduced a sliding scale of reduced points for races stopped early:</p>
                    <ul>
                        <li><strong>Under 25% of race distance completed:</strong> top 5 only, at a reduced scale</li>
                        <li><strong>25&ndash;50% completed:</strong> top 10 score, at a reduced scale</li>
                        <li><strong>50&ndash;75% completed:</strong> top 10 score, closer to but still below full points</li>
                        <li><strong>Over 75% completed:</strong> full points awarded as normal</li>
                    </ul>
                    <p>It is a rare scenario, but it has swung a championship before &mdash; and it is the detail that separates a genuine understanding of F1 scoring from just memorising two tables.</p>
                </div>

                <div class="article-section">
                    <h2>How the Drivers' Championship Works</h2>
                    <p>Simple in principle: every driver keeps every point they personally score across the season &mdash; Grand Prix points plus any Sprint points &mdash; and whoever has the most after the final race is champion. There is no dropping your worst results, no bonus for consistency beyond the points themselves. Check the real thing in progress on our <a href="championship.html">live championship standings and graph</a>, or see any driver's full <a href="drivers.html">season log</a>.</p>
                </div>

                <div class="article-section">
                    <h2>How the Constructors' Championship Works</h2>
                    <p>The constructors' title uses the exact same points scales, but adds together <em>both</em> drivers' scores for the team at every round. This is precisely why a team can win the Constructors' Championship even when neither of its drivers wins the Drivers' title &mdash; consistent scoring from both cars, race after race, outweighs one driver having a single standout season. It is also why a team's second driver having a strong campaign matters just as much to the constructors' fight as the lead driver's headline results. Compare how it plays out for real on any <a href="teams.html">team's points log</a>.</p>
                </div>

                <div class="article-section">
                    <h2>Quick Reference</h2>
                    <div class="ref-image-wrap">
                        <img src="images/f1-2026-points-system-reference.webp" alt="F1 2026 points system quick-reference chart: Grand Prix top 10 scale 25-18-15-12-10-8-6-4-2-1, Sprint top 8 scale 8-7-6-5-4-3-2-1, fastest lap point removed, drivers' and constructors' championship examples" loading="lazy" decoding="async">
                        <p class="ref-image-caption">A quick-reference summary of the 2026 scoring system.</p>
                    </div>
                    <p>Keep this page bookmarked for race weekends &mdash; and see every session time for the current Grand Prix on our <a href="race-hub.html">Race Hub</a>.</p>
                </div>
'''

body += share.replace('https://f1wownews.com/f1-2026-silly-season-driver-market.html', f'{SITE}/f1-2026-points-system-explained')
body = re.sub(r'text=[^&"]*', 'text=How%20F1%20Points%20Work%20in%202026%3A%20The%20Interactive%20Guide', body, count=1)

body += '''
            </div>
        </article>

        <!-- Related Articles -->
        <section class="related-articles">
            <div class="container">
                <h2>Related Articles</h2>
                <div class="related-grid">
                    <a href="championship.html" class="related-card">
                        <span class="related-category">Standings</span>
                        <h4>2026 Championship Standings &amp; Progression Graph</h4>
                    </a>
                    <a href="f1-2026-regulations-explained.html" class="related-card">
                        <span class="related-category">Technical</span>
                        <h4>F1 2026 Rules Explained: A Beginner's Guide to the New Cars</h4>
                    </a>
                    <a href="drivers.html" class="related-card">
                        <span class="related-category">Drivers</span>
                        <h4>2026 F1 Driver Standings &amp; Profiles</h4>
                    </a>
                    <a href="calendar.html" class="related-card">
                        <span class="related-category">Calendar</span>
                        <h4>2026 F1 Race Calendar &amp; Results</h4>
                    </a>
                </div>
            </div>
        </section>
    '''

SCRIPT = '''    <script>
    (function () {
        var GP_POINTS = {1:25,2:18,3:15,4:12,5:10,6:8,7:6,8:4,9:2,10:1};
        var SPRINT_POINTS = {1:8,2:7,3:6,4:5,5:4,6:3,7:2,8:1};

        function buildChips(containerId, positions, extraLabel) {
            var el = document.getElementById(containerId);
            if (!el) return;
            positions.forEach(function (pos) {
                var chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'pc-chip';
                chip.textContent = pos === 0 ? (extraLabel || 'None') : (pos + (pos===1?'st':pos===2?'nd':pos===3?'rd':'th'));
                chip.dataset.pos = pos;
                el.appendChild(chip);
            });
        }
        buildChips('pcGpChips', [1,2,3,4,5,6,7,8,9,10,11], '11th+');
        buildChips('pcSprintChips', [0,1,2,3,4,5,6,7,8], 'None');

        var gpChip = null, sprintChip = null;

        function animateNumber(el, target) {
            var start = parseInt(el.textContent) || 0;
            if (start === target) return;
            var dur = 450, t0 = performance.now();
            function step(now) {
                var p = Math.min(1, (now - t0) / dur);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(start + (target - start) * eased);
                if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        function recalc() {
            var gp = gpChip ? (GP_POINTS[gpChip] || 0) : 0;
            var sp = sprintChip ? (SPRINT_POINTS[sprintChip] || 0) : 0;
            animateNumber(document.getElementById('pcGp'), gp);
            animateNumber(document.getElementById('pcSprint'), sp);
            animateNumber(document.getElementById('pcTotal'), gp + sp);
        }

        document.getElementById('pcGpChips').addEventListener('click', function (e) {
            var btn = e.target.closest('.pc-chip');
            if (!btn) return;
            this.querySelectorAll('.pc-chip').forEach(function (c) { c.classList.remove('active'); });
            btn.classList.add('active');
            gpChip = parseInt(btn.dataset.pos);
            recalc();
        });
        document.getElementById('pcSprintChips').addEventListener('click', function (e) {
            var btn = e.target.closest('.pc-chip');
            if (!btn) return;
            this.querySelectorAll('.pc-chip').forEach(function (c) { c.classList.remove('active'); });
            btn.classList.add('active');
            sprintChip = parseInt(btn.dataset.pos);
            recalc();
        });
        // default selection
        document.querySelector('#pcGpChips .pc-chip').classList.add('active');
        gpChip = 1;
        document.querySelector('#pcSprintChips .pc-chip').classList.add('active');
        sprintChip = 0;
        recalc();

        // Animated scroll-reveal bar charts
        function buildBars(containerId, points, maxVal) {
            var el = document.getElementById(containerId);
            if (!el) return;
            Object.keys(points).forEach(function (pos) {
                var val = points[pos];
                var col = document.createElement('div');
                col.className = 'pb-col';
                col.innerHTML = '<span class="pb-val">' + val + '</span>' +
                    '<div class="pb-bar" style="--h:' + Math.round((val / maxVal) * 100) + '%"></div>' +
                    '<span class="pb-pos">' + pos + (pos==='1'?'st':pos==='2'?'nd':pos==='3'?'rd':'th') + '</span>';
                el.appendChild(col);
            });
        }
        buildBars('gpBars', GP_POINTS, 25);
        buildBars('sprintBars', SPRINT_POINTS, 8);

        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) {
                        en.target.classList.add('in-view');
                        obs.unobserve(en.target);
                    }
                });
            }, { threshold: 0.3 });
            document.querySelectorAll('.pb-col').forEach(function (c) { obs.observe(c); });
        } else {
            document.querySelectorAll('.pb-col').forEach(function (c) { c.classList.add('in-view'); });
        }
    })();
    </script>'''

out = head + body + tail.replace('</body>', SCRIPT + '\n</body>')
open(SLUG, 'w', encoding='utf-8').write(out)
print('written', SLUG, len(out), 'bytes')
