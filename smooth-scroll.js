/* Sitewide smooth (inertia) scrolling via Lenis.
 *
 * Loaded as an ES module from a CDN -- no npm, no build step, consistent with
 * the rest of this repo. Skipped entirely when the visitor asks for reduced
 * motion, and fails silently to native scrolling if the module can't load.
 *
 * Lenis is kept in sync with GSAP ScrollTrigger only when triggers actually
 * exist; the card reveals run on IntersectionObserver, so usually none do.
 */
(function () {
    /* There is deliberately NO synthetic scroll-event shim here.
     *
     * A previous version polled window.scrollY and re-dispatched a native
     * 'scroll' Event, and Lenis re-dispatched one too, on the theory that
     * Lenis drives its own loop and listeners would otherwise freeze. Both
     * halves of that were wrong and the combination was actively harmful:
     *
     *  - Lenis moves the REAL scroll position (it calls window.scrollTo), so
     *    the browser already fires a genuine native 'scroll' event. Every
     *    listener on this site works untouched without any help.
     *  - Lenis itself LISTENS for native scroll (onNativeScroll). Dispatching
     *    a synthetic one made it emit 'scroll', which dispatched another
     *    synthetic one, which... The console showed
     *    "RangeError: Maximum call stack size exceeded" on every single
     *    scroll. That recursion was the scroll stutter users reported.
     *
     * The symptom that originally prompted the shim -- a frozen progress bar
     * -- was an artefact of testing in a backgrounded tab, where the browser
     * suspends requestAnimationFrame. It was never a Lenis problem.
     */

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

            if (window.ScrollTrigger) {
                // Only wire ScrollTrigger up if something actually registered
                // a trigger. The card reveals now run on IntersectionObserver,
                // so on most pages this set is empty and calling .update() every
                // frame would be pure overhead.
                if (window.ScrollTrigger.getAll().length) {
                    lenis.on('scroll', window.ScrollTrigger.update);
                }
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
