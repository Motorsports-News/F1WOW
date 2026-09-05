# Replace the Gasly article's scoped <style> block and inject its interaction layer.
# Idempotent: both targets are anchored on markers.
import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'gasly-maiden-pole-italian-gp-2026.html')
s = open(ART, encoding='utf-8').read()

CSS = """<style>/* IMP:CSS:START */
        /* Story-scoped tokens. Alpine pink is already a site token; here it is the
           narrative accent for Gasly, with F1 red kept as the brand signal. */
        .article-full {
            --gas: var(--team-alpine);
            --gas-soft: rgba(255, 135, 188, 0.16);
            --gas-line: rgba(255, 135, 188, 0.42);
            --rule: rgba(255, 255, 255, 0.10);
            --ink-2: rgba(255, 255, 255, 0.72);
            --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
            --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
        }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

        /* ---------------------------------------------------------- pole slate */
        .pole-slate {
            display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px;
            padding: clamp(20px, 4vw, 32px); margin: 28px 0;
            background:
                radial-gradient(120% 140% at 0% 0%, rgba(255, 135, 188, 0.13), transparent 60%),
                var(--f1-dark);
            border: 1px solid var(--gas-line); border-radius: 14px;
        }
        @media (min-width: 720px) { .pole-slate { grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: clamp(24px, 5vw, 52px); } }
        .ps-main { display: flex; flex-direction: column; gap: 4px; }
        .ps-label {
            font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
            font-size: 0.82rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gas);
        }
        .ps-time {
            font-family: 'Barlow Condensed', sans-serif; font-weight: 800;
            font-size: clamp(3.1rem, 11vw, 4.6rem); line-height: 0.92; color: var(--f1-white);
            font-variant-numeric: tabular-nums; letter-spacing: -0.02em;
        }
        .ps-margin { color: var(--ink-2); font-size: 0.95rem; margin-top: 6px; }
        .ps-facts { display: grid; gap: 0; margin: 0; }
        .ps-facts > div {
            display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
            padding: 11px 0; border-top: 1px solid var(--rule);
        }
        .ps-facts > div:first-child { border-top: 0; }
        @media (min-width: 720px) { .ps-facts > div:first-child { border-top: 1px solid var(--rule); } }
        .ps-facts dt { color: var(--ink-2); font-size: 0.9rem; }
        .ps-facts dd {
            margin: 0; font-family: 'Barlow Condensed', sans-serif; font-weight: 800;
            font-size: 1.5rem; color: var(--f1-white); font-variant-numeric: tabular-nums; white-space: nowrap;
        }

        /* -------------------------------------------------------- career strip */
        .career-strip { margin: 36px 0; padding: 0; }
        .cs-head { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; padding: 0; }
        .cs-title {
            font-family: 'Barlow Condensed', sans-serif; font-weight: 800; text-transform: uppercase;
            font-size: clamp(1.15rem, 3.4vw, 1.5rem); color: var(--f1-white); letter-spacing: 0.01em;
        }
        .cs-sub { color: var(--ink-2); font-size: 0.9rem; line-height: 1.6; max-width: 62ch; }
        .cs-plot {
            display: flex; align-items: flex-end; gap: clamp(0.5px, 0.22vw, 2px);
            height: clamp(96px, 22vw, 150px); padding: 0 0 2px;
            border-bottom: 1px solid var(--rule);
        }
        .tick {
            flex: 1 1 0; min-width: 1px; height: var(--h);
            background: rgba(255, 255, 255, 0.20); border-radius: 1px 1px 0 0;
            transition: background 160ms var(--ease-out-quart);
        }
        .tick.is-podium { background: rgba(225, 6, 0, 0.85); }
        .tick.is-win { background: var(--f1-red); box-shadow: 0 0 12px rgba(225, 6, 0, 0.55); }
        .tick.is-pole {
            background: var(--gas); box-shadow: 0 0 18px rgba(255, 135, 188, 0.75);
            min-width: 3px; border-radius: 2px 2px 0 0;
        }
        .cs-plot:hover .tick { background: rgba(255, 255, 255, 0.12); }
        .cs-plot:hover .tick.is-podium { background: rgba(225, 6, 0, 0.45); }
        .cs-plot:hover .tick.is-pole { background: rgba(255, 135, 188, 0.55); }
        .cs-plot .tick:hover, .cs-plot .tick:focus-visible {
            background: var(--f1-white) !important; outline: none; min-width: 2px;
        }
        .tick:focus-visible { outline: 2px solid var(--gas); outline-offset: 3px; }
        .cs-axis {
            position: relative; display: flex; gap: clamp(0.5px, 0.22vw, 2px);
            margin-top: 7px; font-size: 0.68rem; color: rgba(255, 255, 255, 0.45);
            font-variant-numeric: tabular-nums;
        }
        .cs-axis .yr { flex: 1 1 0; min-width: 0; }
        .cs-axis .yr:not(:first-child) { border-left: 1px solid var(--rule); padding-left: 3px; }
        .cs-tip {
            margin: 14px 0 0; min-height: 1.5em; font-size: 0.88rem; color: var(--ink-2);
            font-variant-numeric: tabular-nums;
        }
        .cs-tip.is-live { color: var(--f1-white); }
        .cs-ledger {
            display: flex; flex-wrap: wrap; gap: 10px 28px; margin-top: 16px;
            padding-top: 16px; border-top: 1px solid var(--rule);
            font-size: 0.9rem; color: var(--ink-2);
        }
        .cs-ledger .n {
            font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.35rem;
            color: var(--f1-white); font-variant-numeric: tabular-nums; margin-right: 5px;
        }

        /* ------------------------------------------------------------ Q3 table */
        .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .q3-table { width: 100%; border-collapse: collapse; min-width: 520px; }
        .q3-table th, .q3-table td {
            padding: 12px 14px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            vertical-align: middle;
        }
        .q3-table thead th {
            color: var(--f1-white); font-weight: 700; text-transform: uppercase; font-size: 0.72rem;
            letter-spacing: 0.09em; border-bottom: 2px solid rgba(225, 6, 0, 0.35);
        }
        .q3-table tbody tr:last-child td { border-bottom: none; }
        .q3-table .rank { color: rgba(255, 255, 255, 0.45); font-weight: 600; font-variant-numeric: tabular-nums; width: 38px; }
        .q3-table .driver { color: var(--f1-white); font-weight: 500; white-space: nowrap; }
        .q3-table .team { color: var(--ink-2); white-space: nowrap; }
        .q3-table .team::before {
            content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 50%;
            background: var(--team, var(--f1-gray)); margin-right: 8px; vertical-align: baseline;
        }
        .q3-table .time {
            font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.2rem;
            color: var(--f1-white); font-variant-numeric: tabular-nums; white-space: nowrap;
        }
        .q3-table .gapcell { display: flex; align-items: center; gap: 10px; min-width: 150px; }
        .gapbar { flex: 1 1 auto; height: 6px; background: rgba(255, 255, 255, 0.07); border-radius: 3px; overflow: hidden; }
        .gapbar i {
            display: block; height: 100%; width: 100%; border-radius: 3px;
            background: var(--team, var(--f1-gray)); opacity: 0.9;
            transform: scaleX(var(--s, 0)); transform-origin: left;
        }
        .gapnum { color: var(--ink-2); font-variant-numeric: tabular-nums; font-size: 0.86rem; min-width: 52px; text-align: right; }
        .q3-table tbody tr { transition: background 160ms var(--ease-out-quart); }
        .q3-table tbody tr:hover td { background: rgba(255, 255, 255, 0.035); }
        .q3-table tr.is-pole td { background: var(--gas-soft); }
        .q3-table tr.is-pole .time { color: var(--gas); }
        .q3-table tr.is-pole:hover td { background: rgba(255, 135, 188, 0.22); }
        .q3-table .pen {
            display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 999px;
            background: rgba(232, 200, 77, 0.14); color: var(--f1-yellow);
            font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700;
            vertical-align: middle; white-space: nowrap;
        }

        /* --------------------------------------------------------- waits chart */
        .wait-chart { list-style: none; margin: 24px 0 10px; padding: 0; display: grid; gap: 2px; }
        .wait-row {
            display: grid; grid-template-columns: minmax(96px, 1.1fr) minmax(0, 2.6fr) minmax(0, 1.4fr);
            align-items: center; gap: 14px; padding: 9px 10px; border-radius: 8px;
            transition: background 160ms var(--ease-out-quart);
        }
        .wait-row:hover { background: rgba(255, 255, 255, 0.035); }
        .wait-row.is-gasly { background: var(--gas-soft); }
        .wait-row.is-gasly:hover { background: rgba(255, 135, 188, 0.22); }
        .w-name { color: var(--f1-white); font-size: 0.92rem; }
        .wait-row.is-gasly .w-name { font-weight: 700; }
        .w-track { position: relative; display: flex; align-items: center; height: 22px; }
        .w-track i {
            display: block; height: 10px; width: 100%; border-radius: 5px;
            background: rgba(255, 255, 255, 0.22);
            transform: scaleX(var(--s)); transform-origin: left;
        }
        .wait-row.is-gasly .w-track i { background: var(--gas); box-shadow: 0 0 14px rgba(255, 135, 188, 0.4); }
        .w-num {
            position: absolute; left: calc(var(--s) * 100%); transform: translateX(10px);
            font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.05rem;
            color: var(--f1-white); font-variant-numeric: tabular-nums; white-space: nowrap;
        }
        .wait-row.is-gasly .w-num { color: var(--gas); }
        .w-where { color: rgba(255, 255, 255, 0.62); font-size: 0.82rem; text-align: right; }
        .chart-note { color: rgba(255, 255, 255, 0.55); font-size: 0.82rem; margin: 6px 0 0; }
        @media (max-width: 640px) {
            .wait-row { grid-template-columns: minmax(84px, 1fr) minmax(0, 1.8fr); row-gap: 2px; }
            .w-where { grid-column: 1 / -1; text-align: left; }
            .w-num { font-size: 0.95rem; }
        }

        /* ------------------------------------------------------------ lights out */
        .lights-out {
            display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 20px;
            padding: 18px 22px; margin: 4px 0 24px; border-radius: 12px;
            background: var(--f1-dark); border: 1px solid var(--rule);
        }
        .lo-label {
            font-family: 'Barlow Condensed', sans-serif; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.14em; font-size: 0.76rem; color: var(--f1-red);
        }
        .lo-clock {
            font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.5rem;
            color: var(--f1-white); font-variant-numeric: tabular-nums;
        }
        .lo-grid { color: var(--ink-2); font-size: 0.86rem; }
        .lo-grid b { color: var(--gas); font-weight: 700; }

        /* ---------------------------------------------------------------- motion
           Every element above renders at its final state by default. These rules
           only replay it as an entrance once JS marks the block in view, so the
           page is complete with JS off, on a hidden tab, or in a headless render. */
        .in-view .gapbar i { animation: growX 820ms var(--ease-out-expo) both; animation-delay: calc(var(--row, 0) * 45ms); }
        .in-view .w-track i { animation: growX 760ms var(--ease-out-expo) both; animation-delay: calc(var(--i) * 55ms); }
        .in-view .w-num { animation: fadeUp 500ms var(--ease-out-quart) both; animation-delay: calc(var(--i) * 55ms + 220ms); }
        .in-view .tick { animation: tickUp 620ms var(--ease-out-expo) both; animation-delay: calc(var(--i) * 3ms); }
        @keyframes growX { from { transform: scaleX(0); } to { transform: scaleX(var(--s)); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateX(10px) translateY(4px); } to { opacity: 1; transform: translateX(10px) translateY(0); } }
        @keyframes tickUp { from { height: 0; opacity: 0; } to { height: var(--h); opacity: 1; } }

        @media (prefers-reduced-motion: reduce) {
            .in-view .gapbar i, .in-view .w-track i, .in-view .w-num, .in-view .tick { animation: none; }
            .tick, .q3-table tbody tr, .wait-row { transition: none; }
        }
/* IMP:CSS:END */</style>"""

# Swap the scoped style block (matched on either the original content or the marker).
if 'IMP:CSS:START' in s:
    s = re.sub(r'<style>/\* IMP:CSS:START \*/.*?/\* IMP:CSS:END \*/</style>', lambda m: CSS, s, flags=re.S)
else:
    s = re.sub(r'<style>\s*\.quali-facts.*?</style>', lambda m: CSS, s, count=1, flags=re.S)

JS = """<script>/* IMP:JS:START */
    (function () {
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

        /* Entrance replay. Content is already at its final state; this only
           re-runs it as an animation when the block scrolls into view. */
        var blocks = [document.getElementById('careerStrip'),
                      document.getElementById('q3Table'),
                      document.getElementById('waitChart')].filter(Boolean);
        document.querySelectorAll('#q3Table tbody tr').forEach(function (tr, i) {
            tr.style.setProperty('--row', i);
        });
        if (!reduce.matches && 'IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (!e.isIntersecting) return;
                    e.target.classList.add('in-view');
                    io.unobserve(e.target);
                    if (e.target.id === 'careerStrip') countUp(e.target);
                });
            }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
            blocks.forEach(function (b) { io.observe(b); });
        }

        /* Count-up on the headline stat only. Falls back to the printed number. */
        function countUp(scope) {
            var el = scope.querySelector('.n[data-count]');
            if (!el) return;
            var target = parseInt(el.getAttribute('data-count'), 10);
            if (!target) return;
            var t0 = null, dur = 1100;
            function step(ts) {
                if (t0 === null) t0 = ts;
                var p = Math.min((ts - t0) / dur, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
                if (p < 1) requestAnimationFrame(step);
                else el.textContent = target;
            }
            requestAnimationFrame(step);
        }

        /* Career strip readout. Pointer and keyboard both drive the same live region. */
        var plot = document.querySelector('.cs-plot');
        var tip = document.getElementById('csTip');
        if (plot && tip) {
            var idle = tip.textContent;
            var show = function (t) {
                if (!t || !t.dataset || !t.dataset.label) return;
                tip.textContent = t.dataset.label;
                tip.classList.add('is-live');
            };
            var clear = function () { tip.textContent = idle; tip.classList.remove('is-live'); };
            plot.addEventListener('pointerover', function (e) { show(e.target.closest('.tick')); });
            plot.addEventListener('pointerleave', clear);
            plot.addEventListener('focusin', function (e) { show(e.target.closest('.tick')); });
            plot.addEventListener('focusout', clear);
        }

        /* Countdown to lights out. The static local time stays as the fallback. */
        var lo = document.getElementById('lightsOut');
        var clock = document.getElementById('loClock');
        if (lo && clock) {
            var start = new Date(lo.getAttribute('data-start')).getTime();
            if (!isNaN(start)) {
                var tick = function () {
                    var d = start - Date.now();
                    if (d <= 0) {
                        clock.textContent = d > -2 * 3600 * 1000 ? 'Race under way' : 'Race finished';
                        return;
                    }
                    var h = Math.floor(d / 3600000),
                        m = Math.floor(d / 60000) % 60,
                        sec = Math.floor(d / 1000) % 60;
                    clock.textContent = (h > 24)
                        ? Math.floor(h / 24) + 'd ' + (h % 24) + 'h to lights out'
                        : h + 'h ' + ('0' + m).slice(-2) + 'm ' + ('0' + sec).slice(-2) + 's to lights out';
                    setTimeout(tick, 1000);
                };
                tick();
            }
        }
    })();
/* IMP:JS:END */</script>"""

if 'IMP:JS:START' in s:
    s = re.sub(r'<script>/\* IMP:JS:START \*/.*?/\* IMP:JS:END \*/</script>', lambda m: JS, s, flags=re.S)
else:
    s = s.replace('</body>', '    ' + JS + '\n</body>', 1)

open(ART, 'w', encoding='utf-8').write(s)
print('styles + interaction layer written')
print('  CSS block:', s.count('IMP:CSS:START'))
print('  JS block:', s.count('IMP:JS:START'))
print('  reduced-motion guards:', s.count('prefers-reduced-motion'))
