/* Homepage achievement/XP layer — localStorage only, no backend, no new
 * page. Tracks a handful of real homepage interactions (visiting Race Hub,
 * Standings, the Calculator; subscribing; opening 3+ articles) and renders
 * unlockable badges + a level indicator, per the site's approved redesign
 * plan (gamification is homepage-scoped). Unlock toasts use a playful
 * overshoot easing on purpose — this is the one place on the site where
 * that's the intended feel, unlike structural reveals elsewhere.
 */
(function () {
    const STORAGE_KEY = 'f1wow_achievements_v1';
    const BADGES = [
        { id: 'explorer', label: 'Explorer', desc: 'Visit the Race Hub', icon: '🏁' },
        { id: 'analyst', label: 'Analyst', desc: 'Check the Standings', icon: '📊' },
        { id: 'strategist', label: 'Strategist', desc: 'Try the Calculator', icon: '🧮' },
        { id: 'reader', label: 'Speed Reader', desc: 'Open 3 articles', icon: '📰' },
        { id: 'subscriber', label: 'Subscriber', desc: 'Join the newsletter', icon: '✉️' }
    ];
    const XP_PER_BADGE = 20;

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : { unlocked: [], articlesOpened: 0 };
        } catch (e) {
            return { unlocked: [], articlesOpened: 0 };
        }
    }
    function saveState(state) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore quota/private-mode errors */ }
    }

    let state = loadState();

    function unlock(id) {
        if (state.unlocked.includes(id)) return;
        state.unlocked.push(id);
        saveState(state);
        render();
        showToast(id);
    }

    function xp() { return state.unlocked.length * XP_PER_BADGE; }
    function level() { return Math.floor(xp() / 40) + 1; }

    function showToast(id) {
        const badge = BADGES.find(b => b.id === id);
        if (!badge) return;
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `<span class="achievement-toast-icon">${badge.icon}</span><span><strong>${badge.label}</strong> unlocked</span>`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('is-visible'));
        setTimeout(() => {
            toast.classList.remove('is-visible');
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }

    function render() {
        const widget = document.getElementById('achievementWidget');
        if (!widget) return;
        const currentXp = xp();
        const currentLevel = level();
        const xpIntoLevel = currentXp % 40;
        widget.innerHTML = `
            <div class="achievement-level">
                <span class="achievement-level-num">Lvl ${currentLevel}</span>
                <div class="achievement-xp-track"><div class="achievement-xp-fill" style="width:${(xpIntoLevel / 40) * 100}%"></div></div>
            </div>
            <div class="achievement-badges">
                ${BADGES.map(b => `
                    <div class="achievement-badge ${state.unlocked.includes(b.id) ? 'is-unlocked' : ''}" title="${b.desc}">
                        <span class="achievement-badge-icon">${b.icon}</span>
                        <span class="achievement-badge-label">${b.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function wireTriggers() {
        document.querySelectorAll('a[href="race-hub.html"]').forEach(a => a.addEventListener('click', () => unlock('explorer')));
        document.querySelectorAll('a[href="championship.html"]').forEach(a => a.addEventListener('click', () => unlock('analyst')));
        document.querySelectorAll('a[href="championship-calculator.html"]').forEach(a => a.addEventListener('click', () => unlock('strategist')));

        document.querySelectorAll('.subscribe-form, form[id*="subscribe" i]').forEach(f => {
            f.addEventListener('submit', () => unlock('subscriber'));
        });

        const articleSelectors = '.feature-card, .trending-item, .article-preview-card';
        document.querySelectorAll(articleSelectors).forEach(a => {
            a.addEventListener('click', () => {
                state.articlesOpened = (state.articlesOpened || 0) + 1;
                saveState(state);
                if (state.articlesOpened >= 3) unlock('reader');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('achievementWidget')) return;
        wireTriggers();
        render();
    });
})();
