/* Sitewide smooth (inertia) scrolling via Lenis.
 *
 * Loaded as an ES module from a CDN -- no npm, no build step, consistent with
 * the rest of this repo. Skipped entirely when the visitor asks for reduced
 * motion, and fails silently to native scrolling if the module can't load.
 *
 * Lenis is kept in sync with GSAP ScrollTrigger where ScrollTrigger is present,
 * otherwise scroll-triggered reveals would fire against stale positions.
 */
(function () {
    /* Scroll-change notifier.
     *
     * Everything on this site that reacts to scrolling (reading-progress bar,
     * back-to-top, hero camera, progress HUD) listens for the native window
     * 'scroll' event. Several scroll sources do not reliably emit one --
     * Lenis drives its own loop, and scrollIntoView / programmatic jumps can
     * move the page without notifying those listeners. Polling the real
     * position and emitting only on change keeps them all working no matter
     * how the scroll was produced. Dispatching does not move the page, so
     * this cannot feed back on itself.
     *
     * Runs regardless of reduced-motion, since it is synchronisation rather
     * than animation.
     */
    var lastY = -1;
    (function watch() {
        var y = window.scrollY;
        if (y !== lastY) {
            lastY = y;
            window.dispatchEvent(new Event('scroll'));
        }
        requestAnimationFrame(watch);
    })();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    import('https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.mjs')
        .then(function (mod) {
            const Lenis = mod.default || mod.Lenis;
            if (!Lenis) return;

            const lenis = new Lenis({
                duration: 1.05,
                easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
                smoothWheel: true,
                // Native scrolling on touch: inertia on top of a phone's own
                // momentum scrolling fights the platform and feels broken.
                smoothTouch: false
            });

            // Anchor links (#articles etc.) must still work with Lenis driving.
            document.addEventListener('click', function (e) {
                const a = e.target.closest('a[href^="#"]');
                if (!a) return;
                const id = a.getAttribute('href');
                if (!id || id === '#') return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                lenis.scrollTo(target, { offset: -80 });
            });

            // Lenis drives scrolling itself and does NOT emit the native
            // window 'scroll' event. Everything on this site that reacts to
            // scrolling listens for that event -- the reading-progress bar,
            // the back-to-top button, the hero camera and the progress HUD --
            // so without this shim they all silently freeze. Re-dispatching
            // keeps every existing listener working untouched.
            lenis.on('scroll', function () {
                window.dispatchEvent(new Event('scroll'));
            });

            if (window.ScrollTrigger) {
                lenis.on('scroll', window.ScrollTrigger.update);
                if (window.gsap) {
                    window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
                    window.gsap.ticker.lagSmoothing(0);
                    return;
                }
            }
            // No GSAP available: drive Lenis from its own rAF loop instead.
            function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
        })
        .catch(function () { /* native scrolling is a fine fallback */ });
})();
