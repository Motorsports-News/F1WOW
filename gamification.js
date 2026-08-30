/* Homepage progress layer + article-index collapse.
 *
 * Two homepage-only behaviours, both purely presentational and additive:
 *
 *  1. A persistent HUD (bottom-left) showing reading progress through the
 *     page and which achievements are unlocked. Replaces the old strip that
 *     sat under the hero.
 *  2. Folding the long article index down to a preview, with a button to
 *     reveal the rest.
 *
 * Achievements are localStorage only -- no backend, no accounts, no new
 * functionality beyond what the page already does.
 *
 * IMPORTANT (search/filter interop): initSearch() and initCategoryTabs() in
 * script.js show and hide cards by setting `card.style.display` inline. An
 * inline style beats a class, so folded cards are revealed correctly by a
 * matching search. When a search is cleared those functions set every card
 * back to `display:flex` inline, which would defeat the fold -- so the fold
 * is re-applied on input/clear/tab events below.
 */
(function () {
    'use strict';

    // ---------- achievements -------------------------------------------------
    var KEY = 'f1wow_achievements_v1';
    var BADGES = [
        { id: 'explorer',   label: 'Explorer',     sel: 'a[href="race-hub.html"]' },
        { id: 'analyst',    label: 'Analyst',      sel: 'a[href="championship.html"]' },
        { id: 'strategist', label: 'Strategist',   sel: 'a[href="championship-calculator.html"]' },
        { id: 'reader',     label: 'Speed Reader', sel: null },
        { id: 'subscriber', label: 'Subscriber',   sel: null }
    ];

    function load() {
        try {
            var raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : { unlocked: [], articlesOpened: 0 };
        } catch (e) { return { unlocked: [], articlesOpened: 0 }; }
    }
    function save(s) {
        try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode / quota */ }
    }
    var state = load();

    // ---------- HUD ----------------------------------------------------------
    var hud, ring, lvlEl, dots = [];
    var CIRC = 2 * Math.PI * 11;   // r = 11

    function buildHud() {
        hud = document.createElement('div');
        hud.className = 'progress-hud';
        hud.setAttribute('aria-hidden', 'true');   // decorative mirror of page state
        hud.innerHTML =
            '<svg class="progress-hud-ring" viewBox="0 0 26 26">' +
              '<circle class="bg" cx="13" cy="13" r="11"></circle>' +
              '<circle class="fg" cx="13" cy="13" r="11" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"></circle>' +
            '</svg>' +
            '<span class="progress-hud-lvl">Lvl 1</span>' +
            '<span class="progress-hud-badges">' +
              BADGES.map(function (b) { return '<span class="progress-hud-dot" data-b="' + b.id + '"></span>'; }).join('') +
            '</span>';
        document.body.appendChild(hud);
        ring = hud.querySelector('.fg');
        lvlEl = hud.querySelector('.progress-hud-lvl');
        dots = [].slice.call(hud.querySelectorAll('.progress-hud-dot'));
        paintBadges();
    }

    function paintBadges() {
        var lvl = Math.floor(state.unlocked.length * 20 / 40) + 1;
        if (lvlEl) lvlEl.textContent = 'Lvl ' + lvl;
        dots.forEach(function (d) {
            d.classList.toggle('on', state.unlocked.indexOf(d.dataset.b) !== -1);
        });
    }

    function unlock(id) {
        if (state.unlocked.indexOf(id) !== -1) return;
        state.unlocked.push(id);
        save(state);
        paintBadges();
        toast(id);
    }

    function toast(id) {
        var b = BADGES.filter(function (x) { return x.id === id; })[0];
        if (!b) return;
        var t = document.createElement('div');
        t.className = 'achievement-toast';
        t.innerHTML = '<span class="achievement-toast-icon">&#9679;</span><span><strong>' + b.label + '</strong> unlocked</span>';
        document.body.appendChild(t);
        requestAnimationFrame(function () { t.classList.add('is-visible'); });
        setTimeout(function () {
            t.classList.remove('is-visible');
            setTimeout(function () { t.remove(); }, 400);
        }, 3000);
    }

    // ---------- scroll progress ---------------------------------------------
    function initProgress() {
        var ticking = false;
        function update() {
            var doc = document.documentElement;
            var max = doc.scrollHeight - window.innerHeight;
            var p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
            if (ring) ring.style.strokeDashoffset = String(CIRC * (1 - p));
            if (hud) hud.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.6);
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    // ---------- article index fold ------------------------------------------
    var VISIBLE = 8;
    var folded = true;

    function applyFold(grid) {
        var cards = [].slice.call(grid.querySelectorAll(':scope > .article-preview-card'));
        cards.forEach(function (c, i) {
            var hide = folded && i >= VISIBLE;
            c.classList.toggle('is-folded', hide);
            // clear any inline display the search/filter code left behind, so
            // the class is what decides visibility again
            if (hide) c.style.removeProperty('display');
        });
        return cards.length;
    }

    function initFold() {
        var grid = document.getElementById('articlesGrid');
        if (!grid) return;
        var total = grid.querySelectorAll(':scope > .article-preview-card').length;
        if (total <= VISIBLE) return;

        applyFold(grid);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'index-more';
        btn.setAttribute('aria-expanded', 'false');
        function label() {
            btn.innerHTML = folded
                ? 'Show all articles <span class="count">' + total + '</span>'
                : 'Show fewer <span class="count">' + VISIBLE + ' of ' + total + '</span>';
            btn.setAttribute('aria-expanded', folded ? 'false' : 'true');
        }
        label();
        btn.addEventListener('click', function () {
            folded = !folded;
            applyFold(grid);
            label();
        });
        grid.parentNode.insertBefore(btn, grid.nextSibling);

        // Search and category tabs rewrite inline display on every card. Let
        // their handlers run first, then reconcile with the fold.
        //
        // The rule: whenever a search or category filter is ACTIVE, the fold
        // must get out of the way entirely, or the filter would only ever
        // surface matches that happen to fall in the first 8 cards. The fold
        // only re-applies once the view is unfiltered again.
        function unfold() {
            [].slice.call(grid.querySelectorAll('.article-preview-card.is-folded'))
                .forEach(function (c) { c.classList.remove('is-folded'); });
        }
        function reFold() { if (folded) setTimeout(function () { applyFold(grid); }, 0); }

        function filterActive() {
            var input = document.getElementById('searchInput');
            if (input && input.value.trim() !== '') return true;
            var tab = document.querySelector('.category-tab.active');
            if (tab && tab.dataset.category && tab.dataset.category !== 'all') return true;
            var tag = document.querySelector('.search-tag.active');
            if (tag && tag.dataset.filter && tag.dataset.filter !== 'all') return true;
            return false;
        }
        function reconcile() {
            setTimeout(function () { filterActive() ? unfold() : (folded && applyFold(grid)); }, 0);
        }

        var input = document.getElementById('searchInput');
        var clear = document.getElementById('searchClear');
        if (input) input.addEventListener('input', reconcile);
        if (clear) clear.addEventListener('click', reFold);
        [].slice.call(document.querySelectorAll('.category-tab, .search-tag'))
            .forEach(function (t) { t.addEventListener('click', reconcile); });
    }

    // ---------- triggers -----------------------------------------------------
    function wire() {
        BADGES.forEach(function (b) {
            if (!b.sel) return;
            [].slice.call(document.querySelectorAll(b.sel))
                .forEach(function (a) { a.addEventListener('click', function () { unlock(b.id); }); });
        });
        [].slice.call(document.querySelectorAll('.subscribe-form, form[id*="subscribe" i]'))
            .forEach(function (f) { f.addEventListener('submit', function () { unlock('subscriber'); }); });
        [].slice.call(document.querySelectorAll('.feature-card, .trending-item, .article-preview-card'))
            .forEach(function (a) {
                a.addEventListener('click', function () {
                    state.articlesOpened = (state.articlesOpened || 0) + 1;
                    save(state);
                    if (state.articlesOpened >= 3) unlock('reader');
                });
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!document.body.classList.contains('home')) return;
        buildHud();
        initProgress();
        initFold();
        wire();
    });
})();
