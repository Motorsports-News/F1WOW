# Cinematic Overhaul — Task Tracker

Branch: `design/cinematic-overhaul` · Plan: `DESIGN.md` · Findings this is based on: `UI_AUDIT.md`

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

Update this file at the end of every work session/task — it's the single place to check "what's done, what's left."

---

## Phase 0 — Foundation & docs

- [x] Research official F1 colors/typeface to explicitly avoid
- [x] Cut branch `design/cinematic-overhaul` from `main`
- [x] `DESIGN.md` — new color/type/motion system, documented exclusions
- [x] `TRACKER.md` — this file
- [x] `CLAUDE.md` — repo working agreement for agents

## Phase 1 — Sitewide foundation (cascades to all ~130 pages)

- [x] Fix `.search-section` malformed/duplicated CSS block (styles.css ~889–1078) — deleted the dead, never-validly-closed duplicate; kept the one correct block
- [x] Fix duplicated/broken `.category-tab` rule block — merged orphaned `font-weight`/`text-transform`/`letter-spacing` declarations back into the base rule
- [x] Fix stray unmatched `}` after `.f1wow-logo` (styles.css ~line 244)
- [x] Fix `.nav-link` padding override that had escaped its `@media (max-width: 768px)` block and was applying globally — moved back inside the media query
- [x] Delete dead keyframes (`glowPulse`, `progressGlow` — confirmed zero usages beyond their own definitions)
- [x] Fix stray "Watch F1" breadcrumb bug on all 11 `team-*.html` pages (generator template was already correct; bug was hand-inserted into output files only — fixed output files directly, restored the breadcrumb separator)
- [x] Swap color tokens in `:root` to new palette (kept `--f1-*` variable names for compatibility, changed all values) — plus a sitewide literal-color migration (hardcoded hex/rgba that bypassed variables in the `.dz-*`/`.cst-*` inline blocks) so nothing was left half old-red/half new-amber
- [x] Swap typography: load `Unbounded` + `JetBrains Mono` (new Google Fonts URL across all 87 pages), added `--font-display`/`--font-body`/`--font-mono` tokens, replaced all 76+ `Barlow Condensed` declarations in styles.css and all inline `<style>` blocks across pages with `var(--font-display)`; kept `Chakra Petch` for body
- [x] Reintroduce considered depth: added a `--shadow-sm/md/lg/glow` tinted-shadow scale to `:root` and applied it to all 25 `box-shadow: none` spots left by the old "Stage 3: calm the page" pass (nav, buttons, cards, badges, back-to-top, search focus state) — found and fixed a *second*, later "Calm the surfaces" override block that was silently re-flattening `.article-preview-card`/`.race-card`/etc. hover states via cascade order, canceling the Stage-3-era depth that did still exist elsewhere. Left 3 spots intentionally flat (a "quiet text link" nav variant, a mobile nav container reset, and the dense text-only list-row article variant — all legitimate flat-by-design, not oversights). Also found and fixed 3 more stray bright-red literals (`#ff1a1a`/`#ff3333`/`#ff1e1e`) competing with the new amber accent, mapped to a new `--accent-bright` token.
- [x] Consolidate `.cst-*` (driver stat tile) bespoke styles into shared `styles.css` components — all 8 driver pages had a byte-identical block (2 were missing a mobile media-query rule the other 6 had; now fixed for those 2 as a side effect of consolidating to the fuller version)
- [x] Consolidate `.quali-facts`/`.qf-*` (article key-stats tile grid) bespoke styles into shared `styles.css` components — found this was duplicated across **15 pages**, not just the 2 `.dz-*` race reports originally scoped; 14 were byte-identical, 1 had a harmless hardcoded-vs-token border color drift, and 1 page (`malaysia-f1-calendar-replacement.html`) used the class with **no CSS definition at all** — its stat tiles were completely unstyled before this fix, now correctly styled as a side effect
- [~] Consolidate `.dz-*` (race report table/chart) bespoke styles — investigated, **deliberately left inline**. Only 2 pages use `.dz-*` (`dutch-gp-2026-race.html`, `verstappen-error-free-streak-2026.html`), and their table/chart CSS has genuinely diverged, not just drifted: the newer page (verstappen) added zebra-striping, rounded table corners, and a completely different chart type (`.dz-matrix`/`.dz-bar` bar-and-matrix chart) versus the older page's `.dz-line` line chart, penalty list, quote cards, and timeline. Force-merging these would either change one page's appearance or require a much bigger "table/chart variant" system — out of scope for a zero-visual-change consolidation. Left as a flagged finding for a future deliberate decision, not treated as done.
- [x] Add GSAP + ScrollTrigger via CDN `<script>` (cdnjs, pinned version 3.12.5, no build step) — inserted before the `script.js` include on all 86 pages that load it; `subscribe.html` doesn't load `script.js` and was left alone (no motion needs, matches its Phase 3 scope)
- [x] Replace flat `IntersectionObserver` fade-in with shared staggered fade-up + blur-in scroll-reveal utility — `initScrollAnimations()` in `script.js` now checks `prefers-reduced-motion` and GSAP/ScrollTrigger availability *once*, globally; if either is false it falls back to the exact original CSS-driven fade (itself already reduced-motion-safe via the sitewide blanket media query), otherwise uses `gsap.fromTo` + `ScrollTrigger` for a staggered opacity/translateY/blur reveal on the same element set as before (no scope expansion)

## Phase 2 — Signature cinematic moments

- [x] Homepage hero: added a clickable "Now trending" headline pill (hand-synced to the current top story — not wired to `scripts/build-home.js` yet, see note below) below the wordmark; collapsed 6 CTAs to 2 primary (Latest News, Race Hub) + a new quiet-text `.hero-quicklinks` row for Standings/Calendar/Watch F1/Calculator (same destinations, no functionality removed, just visually demoted)
- [x] Homepage article grid: real bento layout using existing `og-*.jpg` images — added a new `.feature-row` tier of 3 image-backed cards (articles #2-4) between the existing featured hero card and the dense text-only list. Done properly through the generator (`scripts/build-home.js`'s new `featureRow()`/`ogImage()` functions + a `BUILD:FEATURE_ROW` marker in `index.html`), not hand-edited — the grid is machine-generated and a hand-edit would've been silently wiped on the next `node scripts/build-home.js` run. Scoped to the homepage only (news.html/race-reports.html/technical.html keep their existing dense-list-only treatment, which was already fine per the audit) — a deliberate scoping choice, not an oversight.
- [x] Championship graph: full-bleed showcase framing (ambient amber radial glow, bigger header type, new "LIVE · updates after every session" eyebrow) + touch-friendly tooltips (`touchstart` per data-point, tap-elsewhere-to-dismiss). **Note:** the scroll-triggered `stroke-dashoffset` line-draw was already fully implemented (`playGraphAnimation()`/`armGraphAnimation()` in championship.html, wired to an `IntersectionObserver`, with its own `prefers-reduced-motion` check) — UI_AUDIT.md's claim that the graph "renders fully-drawn with no entrance animation" was incorrect; verified working in-browser, left untouched.
- [ ] Race Hub podium: rebuild as staggered-height podium visualization with reveal animation

**Flagged for a deliberate decision (not a bug):** the new hero headline pill is a hand-authored, static echo of the current top story — it will go stale next time `scripts/build-home.js` regenerates the featured article unless someone updates it too, or the generator is taught to also write the hero. Wiring that up is a tooling/functionality change, intentionally left out of this design-only pass. Also noted: `index.html`'s article cards already had a separate, pre-existing page-load CSS keyframe entrance (`raceInLeft`/`raceInRight`/etc., not part of this overhaul) that runs independently of the new GSAP scroll-reveal — both target `.article-preview-card` but don't appear to visibly conflict in testing (the CSS entrance settles before the cards are likely scrolled into view). Not fixed, just noted in case Phase 3 article-card work needs to account for it.

## Phase 3 — Per-template polish

- [ ] Driver profile: portrait imagery, extended `--team` accent usage beyond hero band, points-trend sparkline
- [ ] Team profile: parity pass with driver pages (livery band, car image, constructor history blurb)
- [ ] Race report articles: header image per article, in-page jump nav for long articles, scroll-triggered gap-chart reveal (`drawLine` keyframe)
- [ ] Calendar: distinct "next race" hero card vs. compact completed rows
- [ ] Utility/legal pages: verify inheritance of Phase 1 typography/component fixes, no bespoke work needed

## Verification (ongoing, every phase)

- [ ] No functionality regressions — countdown, standings, championship graph, search, subscribe form, calculator all still work
- [ ] `prefers-reduced-motion` respected everywhere new motion is added
- [ ] WCAG AA contrast maintained with new palette (verify `--accent` on `--bg-0`/`--bg-1`, `--ink-dim` on backgrounds)
- [ ] Focus-visible states intact after CSS changes
- [ ] No new official-F1-color or -typeface usage introduced
- [ ] Site tested via local server (`python -m http.server` per README) on representative pages after each phase

---

### Session log

- **2026-08-25** — Phase 0 complete. Branch cut, `DESIGN.md`/`TRACKER.md`/`CLAUDE.md` added. Color/type direction locked: Ignition Amber `#FF6A1A` accent (replacing F1-red-adjacent `#E10600`), warm carbon-black neutrals, `Unbounded` + `Chakra Petch` + `JetBrains Mono` type system.
- **2026-08-25** — Phase 1 CSS/HTML bug fixes done (4 real defects found and fixed, one more than the original audit's 3 — the `.nav-link` media-query escape was newly found while verifying brace balance). `styles.css` brace-balanced and verified. All 11 team pages' breadcrumbs verified byte-for-byte consistent. Local server smoke test passed (index/team/styles.css all 200). No visual/functional regressions — these were pure bug fixes, not the token/type/motion swap yet.
- **2026-08-25** — Color/type token swap done and visually verified in-browser (homepage, driver profile, race report — including the bespoke `.dz-*`/`.cst-*` inline blocks). New palette: Ignition Amber `#FF6A1A` on warm carbon-black; Unbounded display font. Verified: no official-F1-red/black literals remain anywhere (checked both hex and rgba-decimal forms), team-color theming (Red Bull blue on Verstappen's page, Mercedes teal/Ferrari red in standings) still renders correctly since those are separate `--team-*` tokens, live data (countdown, standings) still working.
- **2026-08-25** — Depth reintroduction done and visually verified (hover states on hero CTA pills now show a soft amber-tinted lift shadow instead of nothing).
- **2026-08-25** — `.cst-*`/`.quali-facts` component consolidation done (25 files touched, 172 lines of duplicated inline CSS removed, 35 lines added to styles.css; surfaced and fixed a page with completely unstyled stat tiles as a bonus). `.dz-*` deliberately left inline — genuinely diverged content, not drift; flagged for a future decision, not a bug.
- **2026-08-25** — Phase 1 complete. GSAP + ScrollTrigger added via CDN to all 86 pages that load `script.js`; the flat fade-in replaced with a staggered blur-in scroll-reveal, gated once globally on `prefers-reduced-motion` with a full CSS fallback. Verified in-browser on news.html and index.html: zero console errors, cards reveal correctly, countdown/live data unaffected. Every Phase 1 sitewide-foundation item is now done except the flagged `.dz-*` decision.
- **2026-08-25** — Phase 2 started: homepage hero redone (trending-headline pill, 2 primary CTAs + quiet quicklinks row). Verified in-browser at desktop width: renders correctly, live countdown unaffected, hover states work. Flagged the hero-headline/build-script sync question for a future decision rather than silently wiring it up.
- **2026-08-25** — Homepage article grid bento tier done, through the generator (not hand-edited HTML). Verified: `node scripts/build-home.js` re-run produced only the intended new `.feature-row` block in index.html plus a clean no-op regeneration of news.html/race-reports.html/technical.html (diffed to confirm no unintended changes there). Verified in-browser: 3 image cards render correctly with real imagery (the site's own branded OG cards), hover lift + image zoom work.
- **2026-08-25** — Championship graph showcase pass done: ambient glow, bigger header, live eyebrow, touch tooltip support (careful fix mid-edit — `hideTooltip()` turned out to be scoped inside `renderGraph()`, not reachable from the once-only dismiss listener, caught and fixed before testing). Discovered the graph already had a complete, working scroll-triggered line-draw animation predating this session — the original audit's "no entrance animation" finding was wrong; verified it still works after all changes. Zero console errors, mouse tooltip confirmed working with a live screenshot. Next: Race Hub podium (last Phase 2 item).
- **2026-08-25** — Component consolidation pass done (24 files changed, 170 lines of duplicated inline CSS removed, 31 lines added to `styles.css`). `.cst-*` (8 driver pages) and `.quali-facts`/`.qf-*` (15 article pages — much wider reuse than the original 2-page estimate) consolidated and visually verified via local server + screenshots. `.dz-*` table/chart CSS deliberately left inline in its 2 pages — real structural divergence between them (different chart types), not safe to force-merge without a redesign decision; flagged above, not marked done. Bonus fix found along the way: `malaysia-f1-calendar-replacement.html`'s key-facts stat tiles had zero CSS backing them at all and are now correctly styled — but this also surfaced a pre-existing, unrelated content-fit issue (one tile's text, "Baku→Singapore" shortened to "Baku→Si", overflows its box at this width) that predates this session and isn't a consolidation bug; needs a font-size/wrap decision on `.qf-num`, left for a deliberate follow-up since it'd affect all 15 pages sharing that class.
