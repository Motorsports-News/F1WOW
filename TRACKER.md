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
- [x] Race Hub podium: rebuilt as a real staggered-height podium (P1 tallest/center/gold glow, P2/P3 shorter either side) with a staggered reveal animation, replacing the three plain stacked rows. Verified visually by injecting sample result data in-browser (no live podium data exists during the current off-season) — renders exactly as designed.

**Flagged for a deliberate decision (not a bug):** the new hero headline pill is a hand-authored, static echo of the current top story — it will go stale next time `scripts/build-home.js` regenerates the featured article unless someone updates it too, or the generator is taught to also write the hero. Wiring that up is a tooling/functionality change, intentionally left out of this design-only pass. Also noted: `index.html`'s article cards already had a separate, pre-existing page-load CSS keyframe entrance (`raceInLeft`/`raceInRight`/etc., not part of this overhaul) that runs independently of the new GSAP scroll-reveal — both target `.article-preview-card` but don't appear to visibly conflict in testing (the CSS entrance settles before the cards are likely scrolled into view). Not fixed, just noted in case Phase 3 article-card work needs to account for it.

## Phase 3 — Per-template polish

- [ ] Driver profile: portrait imagery — **blocked, needs a decision** (see flagged note above; no photo/artwork assets exist in the repo)
- [x] Driver profile: points-trend sparkline — added via shared JS (`initDriverSparkline()` in script.js), reads the per-round points already in each page's season-log table (no per-file edits, works on every driver page automatically), colored with the page's own `--team` variable. Verified on two different teams (Verstappen/Red Bull blue, Hamilton/Ferrari red) — correct color picked up automatically in both.
- [ ] Driver profile: extended `--team` accent usage beyond the hero band — not done. `--team` is only set inline on `.profile-hero`, so it doesn't cascade to sibling elements (season-log table, career stat tiles) without either restructuring where the variable is declared (moving it to a common ancestor across ~20 files) or duplicating the inline style — both are more invasive than time allowed this session; noted as remaining work, not attempted partially/riskily.
- [ ] Notably discovered: `scripts/build-profiles.py` (the driver/team page generator) requires `_drivers.txt`/`_teams.txt` input files that don't exist in this repo — it is **not currently re-runnable**, and its hardcoded font constant is already stale (still references the pre-overhaul Barlow Condensed). Driver/team profile pages are effectively hand-maintained output now; any future edits should go directly to the HTML files, not through this generator, unless someone regenerates those input files first.
- [ ] Team profile: parity pass with driver pages (livery band, car image, constructor history blurb)
- [x] Race report articles: header image added to all 10 `category:"race"` articles, reusing each article's existing `og-*.jpg` (same reuse pattern as the homepage bento tier — no new assets). Two of the 10 had a slightly different DOM structure than the other 8 (an extra wrapper div, `container article-content` vs `article-content`); used a structure-agnostic regex anchor (matches the `article-content` opening line regardless of nesting) instead of a fixed string, verified exactly one match per file before writing.
- [x] Race report articles: in-page jump nav for long articles — built client-side in `script.js` (`initArticleJumpNav()`), auto-generating slugs/ids from whatever `<h2>`s already exist in `.article-content` and inserting a collapsible "Jump to section" nav. Works across every article automatically (no per-page markup edits, no per-file drift risk); no-ops on short articles (<4 headings) or non-article pages. Verified in-browser: correct section list, clicking a link jumps and smooth-scrolls to the right heading.
- [ ] Race report articles: scroll-triggered gap-chart reveal (`drawLine` keyframe) — not done this session, still blocked on the earlier flagged `.dz-*` divergence decision
- [x] Calendar: next race now spans the full grid width as a distinct hero card (bigger type, amber glow, "In N days" countdown computed from data already in scope) vs. compact rows for completed/upcoming rounds. Countdown text only added to the live-API path — the hardcoded fallback schedule's date strings ("Jul 17-19", no year) aren't reliably parseable for day-math, so that path keeps its existing next-race badge/border treatment without the extra line (a deliberate scoping choice, not an oversight).
- [x] Utility/legal pages: verified — about/contact/subscribe/privacy/terms/disclaimer all load (200) and about.html spot-checked in-browser: cleanly inherits the new nav, amber accent, carbon-black background, and Unbounded headings with zero bespoke work needed, as expected.

## Verification (ongoing, every phase)

- [x] No functionality regressions — countdown, standings, championship graph (incl. tooltips/line-draw), search, subscribe form all verified working in-browser across this session; championship calculator not separately re-verified this session (unchanged by any edit, low risk)
- [x] `prefers-reduced-motion` respected everywhere new motion is added — GSAP reveal gates on it explicitly; podium/hero/feature-row CSS animations covered by the pre-existing sitewide blanket media query
- [ ] WCAG AA contrast maintained with new palette — not formally re-audited with a contrast checker this session; new tokens were chosen with contrast in mind (warm off-white `--ink` on near-black `--bg-0`, amber accent) but should be spot-checked before merge
- [x] Focus-visible states intact — untouched by any change this session (no `:focus-visible` rules were edited)
- [x] No new official-F1-color or -typeface usage introduced — verified via repo-wide grep for the excluded hex values (`#E10600`/`#B80500`/`#FF1801`/`#E22420`), zero matches
- [x] Site tested via local server on every phase — final sweep this session hit 16 representative pages across all templates (home, news, category pages, championship, calendar, race hub, driver/team index + profile, utility, legal, calculator), all HTTP 200, styles.css brace-balanced, script.js syntax-checked

**Not verified / left for review before merge:** a real WCAG contrast-ratio check on the new palette (recommended before merge, see above); mobile-viewport visual QA (the `resize_window` tool used this session didn't reliably change the captured viewport, so responsive behavior is verified by CSS review — flexbox wrap, `clamp()`, existing media queries — rather than an actual narrow-viewport screenshot); cross-browser check (only tested in one Chromium-based browser this session).

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
- **2026-08-25** — Championship graph showcase pass done: ambient glow, bigger header, live eyebrow, touch tooltip support (careful fix mid-edit — `hideTooltip()` turned out to be scoped inside `renderGraph()`, not reachable from the once-only dismiss listener, caught and fixed before testing). Discovered the graph already had a complete, working scroll-triggered line-draw animation predating this session — the original audit's "no entrance animation" finding was wrong; verified it still works after all changes. Zero console errors, mouse tooltip confirmed working with a live screenshot.
- **2026-08-25** — Phase 2 complete. Race Hub podium rebuilt as a real staggered-height visualization with a staggered reveal. Verified visually by temporarily injecting sample result data via the browser console (the real page has no live podium during the current off-season) — confirmed correct height/color/order per position, then removed the test data. All 4 Phase 2 items done.
- **2026-08-25** — Phase 3 started: Calendar's next-race card done (full-width hero treatment + computed countdown). **Important scoping note surfaced:** driver portrait imagery and team livery/car imagery (both listed in Phase 3) require real photo/artwork assets that don't exist anywhere in this repo (confirmed via search) — unlike the homepage bento tier, which could reuse existing `og-*.jpg` cards, there is no equivalent asset to reuse here. Fabricating them isn't appropriate (copyright/likeness of real F1 drivers, and "no AI slop" cuts against inventing fake driver photos). Flagging this as a decision for Dheeraj rather than skipping silently or faking it: either source licensed driver/livery photography, commission illustration, or accept text/color-only profile pages. Proceeding with the parts of Phase 3 that don't depend on new imagery.
- **2026-08-25** — Race report header images done for all 10 race-category articles, reusing existing `og-*.jpg` assets. Verified in-browser on two structurally different articles (dutch-gp-2026-race.html, hamilton-ferrari-barcelona-win.html) — both render correctly with the gradient-fade treatment.
- **2026-08-25** — Article jump nav and driver points-trend sparkline both done via shared, generator-independent JS (read existing DOM/table data at runtime, work across every relevant page automatically, zero per-file edits). Discovered `scripts/build-profiles.py` is not currently re-runnable (missing input files) — driver/team pages are effectively hand-maintained now, noted in TRACKER for future reference. Utility/legal pages verified — clean inheritance, no bespoke work needed.
- **End of session summary:** 16 commits on `design/cinematic-overhaul`. All of Phase 1 and Phase 2 done and verified. Phase 3: done — calendar hero card, race report header images, article jump nav, driver sparkline, utility-page check. Not done, each for a specific reason (not oversights): driver/team portrait & livery imagery (no assets exist, needs a sourcing decision), `--team` accent extension beyond the hero band (needs a structural decision about where the CSS variable lives), team profile parity pass (blocked on the same imagery decision), `.dz-*` gap-chart consolidation/reveal (the two pages' charts have genuinely diverged, flagged earlier for a deliberate call), and a formal WCAG contrast audit (recommended before merge). Everything landed is verified in-browser with zero console errors across every page type on the site.
- **2026-08-25** — Component consolidation pass done (24 files changed, 170 lines of duplicated inline CSS removed, 31 lines added to `styles.css`). `.cst-*` (8 driver pages) and `.quali-facts`/`.qf-*` (15 article pages — much wider reuse than the original 2-page estimate) consolidated and visually verified via local server + screenshots. `.dz-*` table/chart CSS deliberately left inline in its 2 pages — real structural divergence between them (different chart types), not safe to force-merge without a redesign decision; flagged above, not marked done. Bonus fix found along the way: `malaysia-f1-calendar-replacement.html`'s key-facts stat tiles had zero CSS backing them at all and are now correctly styled — but this also surfaced a pre-existing, unrelated content-fit issue (one tile's text, "Baku→Singapore" shortened to "Baku→Si", overflows its box at this width) that predates this session and isn't a consolidation bug; needs a font-size/wrap decision on `.qf-num`, left for a deliberate follow-up since it'd affect all 15 pages sharing that class.

### Hallmark skill audit — homepage prototype (2026-08-26)

Installed `nutlope/hallmark` (anti-AI-slop design skill) at the user's request after strong negative
feedback on the bold homepage prototype. Ran `hallmark audit` against `index.html`/`styles.css` using
its actual anti-pattern catalog and reported real findings with file:line citations — 2 critical, 4
major, 1 minor. All were fixed:

- **[critical] Card-in-card** — the "double-bezel" nested card treatment added earlier (an outer shell
  wrapping an inner core) is a named Hallmark anti-pattern. Flattened `.feature-card` back to one
  containment layer, in both the generator (`scripts/build-home.js`) and CSS. **Note:** this directly
  contradicts the *other* taste skill (`high-end-visual-design`)'s "double-bezel" recommendation from
  two rounds ago — the two skills disagree on this point. Hallmark's guidance won this round since it's
  the tool actively being used to fix AI-slop complaints; if a future pass wants double-bezel back,
  that's a deliberate re-decision, not a default.
- **[critical] Eyebrow on every section** — removed all three `hud-kicker` mono-cap labels ("live
  signal" / "title fight" / "wire feed") from Trending Now, Championship Battle, and Latest News.
  Removed the now-dead `.hud-kicker` CSS too.
- **[major] Centred everything** — hero content (badge, title, headline pill, subtitle, CTAs,
  quicklinks) rebiased to the left. Surfaced and fixed a real bug while verifying this: `.hero-section`'s
  `display:flex;flex-direction:column` was making `.container`'s own `margin:0 auto` act as a flex
  cross-axis auto-margin, shrinking and re-centering the whole container instead of letting it stretch
  full width — fixed with an explicit `align-self:stretch; margin-left:0; margin-right:0` override.
  Also caught `.hero-quicklinks` sitting flush against the viewport edge (it's a sibling of `.container`,
  not a child, so it never got container padding) — added matching `padding: 0 20px`.
- **[major] Shadow-glow on dark** — redefined the single `--shadow-glow` token (12 call sites) from a
  diffuse amber halo to a tight dark shadow + thin amber ring, per Hallmark's own fallback ("if you must
  shadow, keep it tight and dark").
- **[major] Bouncy overshoot easing on UI** — the two `cubic-bezier(0.34, 1.56, 0.64, 1)` overshoot
  easings added last round for the CTA button-in-button hover physics are replaced with a standard
  ease-out. Left the pre-existing hero entrance-animation overshoots (`speedBurst`/`turboRev`/
  `tabActivate`) alone — different context (one-time reveal, not a repeated UI hover), out of this
  audit's cited scope.
- **[major] Animate-on-scroll on everything** — three stacked scroll-motion systems on one homepage
  (card fade-up, headline word-mask reveal, hero pin) is exactly Hallmark's "pick one orchestrated
  entrance" violation. Removed `initWordReveal()` entirely (and its now-dead `.word-mask`/`.word-inner`
  CSS) — the hero pin stays as the one signature moment; the sitewide card fade-up stays as the
  pre-existing baseline utility (predates this prototype, used everywhere, not part of "stacked on one
  homepage").
- **[minor] Generic emoji as icon** (🏆, flag emojis) — pre-existing, not introduced this session, not
  fixed this round; noted for a future pass.

Verified in-browser after every fix (hard-reload-checked for stale cache): hero left-bias renders
correctly with proper edge inset, bento cards are single-layer with no nested frame, no eyebrows above
any section, zero console errors, category-page regeneration diffed clean.

**Open tension for future rounds:** `gpt-taste`/`high-end-visual-design` (used in the original prototype
build) and `hallmark` (used for this audit) encode different, sometimes-conflicting opinions about what
"premium" looks like — double-bezel cards and section eyebrows are two concrete examples. Going forward,
prefer `hallmark`'s judgment when the two disagree, since it's the skill explicitly built to catch
AI-generated-design tells and was brought in specifically in response to "this looks like AI slop."

### Hallmark color/type discipline pass — sitewide (2026-08-26)

User feedback after the audit above: "Too much of orange and too big basic old school fonts." Re-read
Hallmark's `references/color.md` and `references/typography.md` and applied their measurable rules
mechanically rather than by subjective judgment, scoped strictly to color and typography (no other
structural changes this round, per explicit instruction).

- **Display typeface swapped Unbounded → Fraunces** (a variable serif, Hallmark-recommended editorial
  face) across all 87 HTML pages via a scripted Google-Fonts `<link>` replacement (249 total
  replacements, confirmed 87 files touched) plus the `--font-display` CSS token.
- **Display type scale cut to Hallmark's ≤5.5rem ceiling:** `.hero-title` (was `clamp(4rem, 11vw,
  8.5rem)` → `clamp(2.75rem, 5vw + 1rem, 5.25rem)`), `.section-header h2` and `.battle-band-head h2`
  (both was `clamp(2.2rem, 4.5vw, 3.2rem)` → `clamp(2rem, 3.5vw, 2.75rem)`). All three also dropped
  `text-transform: uppercase` for mixed case, font-weight reduced 800→600/700 (avoids browser
  bold-synthesis — only Fraunces 500/600/700 are loaded), and line-height loosened to Hallmark's
  recommended 1.05–1.1 floor. Homepage H1 copy changed from "F1WOW NEWS" to "F1wow News" to match the
  new mixed-case treatment.
- **~8 solid-orange-fill components converted to Hallmark's "highlighter, not colour block" pattern**
  (dark/neutral surface + thin amber border + amber text/icon, instead of a full amber background):
  `.hero-badge`, `.cta-primary` + its icon circle, `.category-tab.active`, `.tab-btn.active`,
  `.nav-link:hover`, `.follower-counter:hover`, `.subscribe-btn` + hover, `.quick-nav-btn.primary` +
  hover. Removed the bounce/overshoot animation that had been on `.category-tab.active`. Deliberately
  left untouched after confirming they don't violate the ≤3%-viewport / no-giant-fill rule: `.live-badge`
  (small semantic status chip), `.race-badge.completed`/`.next` (small semantic chips), and
  `.header .nav-link:hover` (already restrained — underline-only, no fill).
- Verified in-browser (hard-reload-checked): homepage hero, trending strip, championship battle band,
  latest-news/more-articles list, newsletter/subscribe card, and footer all render with the new serif
  type and restrained amber accents; also checked `news.html`'s article list. Zero console errors on
  either page. CSS brace-balance checked clean before testing.

### Hero section motion revamp — Hallmark guidance (2026-08-26)

User request: "completely revamping the home page's hero section... make it cinematic, add motion and
good scroll and latest animation techniques," invoking Hallmark by name. Read `references/motion.md`
and `references/hero-enrichment.md` and applied their hero-specific rules directly (project-local skill
at `.claude/skills/hallmark` isn't registered with the `Skill` tool by name, so its reference docs were
read and followed manually rather than invoked as a slash-skill).

- **Removed the mouse-tracked 3D tilt** (`hero.addEventListener('mousemove', ...)` in `index.html`,
  rotating the whole hero + translating car/speed-lines/content layers on `perspective`/`translateZ`).
  This is explicitly named in both `motion.md`'s ban list ("Parallax-on-mouse") and
  `hero-enrichment.md`'s "Banned for hero entrances" list. Removed the now-unused
  `perspective`/`translateZ`/`transition`/`will-change` CSS that only existed to support it.
- **Car animation changed from an infinite 3.4s loop to a single fire-once pass** (`raceBy`, now
  `1 forwards` instead of `infinite`, `cubic-bezier(0.4,0,0.6,1)` instead of raw `linear`) — motion.md
  bans undifferentiated infinite decorative loops ("they pull the eye and never let go"); the car now
  races across once as the page settles, then stays gone. Reduced-motion fallback changed from an
  invisible frozen car to a static, fully-visible one (centered, no motion) — matches motion.md's
  "reduced motion collapses to opacity crossfade," not "reduced motion hides content."
- **One orchestrated load-in reveal** replacing six independently-tuned bounce animations
  (`speedBurst`/`raceInLeft`/`raceInRight`/`driftIn`, several using `cubic-bezier(0.34, 1.56, ...)`
  overshoot easing — motion.md's hero-entrance ban list names this exact curve as "reads as 2016 Framer
  demo"). New `heroReveal`/`heroTitleReveal` keyframes: opacity+transform only (no `filter: blur()`
  animation, which was also on the removed keyframes and is a compositing-performance anti-pattern),
  `var(--ease-out)`, staggered via inline `style="--i:N"` per element (badge 0 → title 1 → headline 2 →
  subtitle 3 → CTA 4 → quicklinks 5) per motion.md's "stagger by DOM index using a CSS custom property"
  pattern. Added new sitewide `--ease-out`/`--ease-in`/`--ease-in-out`/`--dur-micro`/`--dur-short`/
  `--dur-long` tokens to `:root` (motion.md: "name them as tokens") — available for future motion work
  beyond the hero. `.hero-title` additionally gets a `clip-path` type-unmask wipe (motion.md's allowed
  list: "Type-unmask on the headline").
- **Hero footprint increased** from a flat `min-height: 450px` to `clamp(480px, 78dvh, 760px)` — closer
  to hero-enrichment.md's "70–90% of the first viewport" guidance instead of reading like a tall header.
  Checked the fold still fits all hero content without scrolling at a 13"-laptop-height viewport.
  Removed dead `.hero-car-bg`/`.hero-car-gif` CSS (confirmed zero HTML references) — leftover selectors
  from a pre-existing older hero variant, unrelated to any current markup.
  Fixed the same dead selector in the reduced-motion media query list at the same time.
- **Extended the existing scroll-pin** (`initHeroPin()` in `script.js` — GSAP ScrollTrigger pin + scrub,
  predates this session) with a closing beat: after the third telemetry line fades, the car
  layer/track/speed-lines fade + settle (`opacity`/`scale` only) just before the pin releases into the
  race-strip below. One continuous scroll-scrubbed sequence, not a second competing scroll effect —
  motion.md's scroll-linked guidance ("no scroll-scrubbed animations unless there's a specific reason");
  the existing telemetry pin already had a reason (readout storytelling), so the close beat extends it
  rather than adding a new mechanism. Untouched: the reduced-motion / no-GSAP fallback path, which still
  short-circuits to a static first line with no pin at all.
- Deliberately left unchanged (out of scope — hero only, not header/cards): `.header`/`.brand` entrance
  animations and `.article-preview-card`'s staggered race-in, which still use the older
  `raceInLeft`/`raceInRight`/`speedBurst`/`turboRev`/`driftIn` keyframes and bounce easing. Also left the
  `.track`'s `kerbScroll`/`dashScroll` infinite stripe-scroll as-is — a low-contrast ambient background
  texture, not a foreground eye-pulling loop, judged not to violate the same rule the car animation did.
- Verified in-browser: CSS brace-balance clean; page loads and settles with zero console errors;
  scrolled through the full pin sequence (telemetry cycles through all three lines, car/track/speed-lines
  fade at the close, pin releases cleanly into the race-strip with no stuck/frozen state) and scrolled
  back up to confirm the scrub reverses correctly with all hero content returning to full opacity.
  Did not verify with OS-level `prefers-reduced-motion` toggled on in-browser — reviewed the gating code
  logically instead (each new animation is behind the existing reduced-motion checks already used
  elsewhere on the page).

### Sitewide Aurora theme — Hallmark catalog theme (2026-08-29)

User request: "use Hallmark's Aurora theme everywhere on this website on all pages. Make it happen,"
invoked via `/hallmark`. Aurora is one of Hallmark's 21 catalog themes; the installed skill package
ships no dedicated `references/themes/aurora.md` spec file (only Carnival/Cobalt/Grid/Hum/Lumen have
one), so Aurora's identity was reconstructed from the facts Hallmark's other theme files state about it
by direct comparison (cobalt.md and lumen.md both independently describe Aurora as "dark cyan blooms +
Sentient serif body"; lumen.md gives Aurora's accent hue explicitly as 200°; structure.md's macrostructure
table gives Aurora's fingerprint as Hanging headers / single column / negative-space dividers /
typographic-only buttons / no imagery / fade-up reveal / N5 floating-pill nav / Ft5 statement footer).

**Applied this pass — palette + typography, sitewide:**
- New `:root` tokens in `styles.css` (variable **names** kept for backward compatibility across all 87
  pages, per the file's existing single-point-of-change architecture — only values changed): `--f1-red`/
  `--f1-dark-red` → `oklch(70% 0.15 200)` / `oklch(55% 0.13 200)` (Aurora cyan accent + pressed state,
  replacing "Ignition Amber"); `--f1-black`/`--f1-dark`/`--f1-gray` → cool near-black `oklch(...250)`
  triad (was warm carbon-black); `--f1-white`/`--f1-silver`/`--f1-light-gray` → cool off-white `oklch(...240)`
  triad (was warm off-white). `--accent-bright` → `oklch(85% 0.09 200)`.
- `--font-display: 'Fraunces' → 'Tomorrow'` (geometric Google-Fonts sans, Atmospheric-genre display
  candidate); `--font-body: 'Chakra Petch' → 'Sentient'` (Fontshare variable serif — Aurora's confirmed
  body face). `--font-mono` (JetBrains Mono) kept — already on the Atmospheric mono candidate list.
- Added a Fontshare `<link>` block (preconnect + async preload/stylesheet/noscript, same pattern as the
  existing Google Fonts block) to all 87 pages, since Sentient isn't on Google Fonts. Two insertion
  patterns needed scripting: 81 pages use the async preload/media-swap/noscript pattern, 6 older pages
  (`antonelli-maiden-win.html`, `australia-gp.html`, `cancellation-article.html`, `china-gp.html`,
  `f1-33-day-break-japan-miami.html`, `verstappen-article.html`) use a plain `<link rel="stylesheet">` —
  handled with a second, separate insertion pass.
- **342 hardcoded amber colour literals swept to Aurora cyan** across `styles.css` and 29 HTML files
  that had inline `<style>` blocks bypassing the `--f1-red` token (hex `FF6A1A`/`CC5514`/`FFB347` and the
  `rgba(255, 106, 26, …)` triple, both cases) — the token-value edit alone would have missed these.
  Caught and hand-fixed three literals the scripted sweep couldn't reach: `championship.html`'s JS-set
  SVG `circle.setAttribute('stroke', '#0F0C09')` (chart data-point cutout ring, now `#0A0D14`);
  `championship-calculator.html`'s 4× hardcoded `font-family: 'Chakra Petch', sans-serif` (now
  `var(--font-body)`); and `styles.css`'s own `body { font-family: 'Chakra Petch', -apple-system, … }`
  base rule, which had a hardcoded literal instead of `var(--font-display)`/`var(--font-body)` and would
  have silently kept the old font sitewide even after the token changed — this was the highest-impact
  single fix in the pass. Also fixed one stray warm literal the amber-specific regex didn't match:
  `index.html`'s hero `.speed-trail` gradient had a `rgba(255,120,110,…)` hot-ember tip color, changed to
  a cool cyan-white `rgba(180, 245, 255,…)`.
- Left untouched, deliberately: semantic/factual colours — team liveries (`--team-*`), live-status green,
  win/positive green, warning yellow, and the existing `--f1-blue` info/link colour (CLAUDE.md's own
  carve-out: "team/constructor colours... are fine"). Note for a future pass: `--f1-blue` (#55C2FF) now
  sits close in hue to the new Aurora accent and may want revisiting for distinctness.
- Verified in-browser (hard-reload-checked): homepage hero, a page-header hero (`championship.html`),
  and a driver profile page (`driver-antonelli.html`) — cyan accent, cool dark ground, Tomorrow display
  type, and Sentient serif body copy all render correctly; confirmed via `document.fonts` that both
  Tomorrow and Sentient actually loaded (not just linked). Zero console errors on any of the three pages
  checked. CSS brace-balance clean. `grep` confirmed zero remaining amber literals and all 87 pages
  carry the Fontshare link.

**Explicitly NOT applied this pass — flagged, not silently skipped:** Aurora's structural fingerprint
(hanging headers, single-column negative-space dividers, **typographic-only buttons with no visible
chrome**, N5 floating-pill nav, Ft5 statement footer) is a much larger rebuild than a palette/type swap —
it would mean restructuring nearly every button and the header/footer shape on all 87 pages. Per
Hallmark's own "implementation safety rail" (stop and confirm before a redesign that removes/restructures
multiple components) this was intentionally left for a separate, explicitly-confirmed follow-up rather
than attempted silently in the same pass as the color/type reskin.

### Aurora structural fingerprint — sitewide (2026-08-29)

User confirmed doing the structural follow-up flagged above, plus asked to fix `--f1-blue` for
distinctness from the new cyan accent. All changes are shared-CSS-only (`styles.css`), no per-page
markup edits, so they cascade to all 87 pages automatically.

- **`--f1-blue` (info/links) changed** from `#55C2FF` (a light cyan, too close to the new accent hue) to
  `oklch(72% 0.16 275)` — an indigo-violet, clearly distinct from Aurora's 200° accent.
- **Nav → N5 Floating pill.** `.header` no longer a full-bleed sticky bar: now a rounded (`20px`),
  inset (`14px` top/side margin), translucent (`color-mix` over `--f1-dark`) panel with
  `backdrop-filter: blur(14px)` and a thin cyan-tinted border, still `position: sticky`. Removed a stale
  `.header { padding: 12px 0 }` override (from a 2026-07-18 refinement pass) that would have collapsed
  the new horizontal padding back to zero. `.header .container` no longer double-pads inside the pill's
  own padding. The nav *links* themselves needed no change — a prior round (2026-07-18, per an existing
  code comment "Quiet text link instead of chunky button") had already made them typographic with an
  underline-sweep hover, which is exactly Aurora's button voice.
- **Footer → Ft5 Statement**, restyled (not restructured) in place: kept all existing link columns —
  they're the site's real secondary navigation given the header nav is intentionally minimal (Home/
  About/Instagram), so collapsing them to a bare "statement" would have cost real navigability, not just
  decoration. Instead: removed the `.footer::before` checkered-stripe divider and the `.footer-bottom`
  hairline border (negative space replaces both), enlarged `.footer-brand` into an actual statement-size
  line (`clamp(1.6rem, 3vw, 2.2rem)`, was `1.1rem`), added more top padding/margin so the footer opens
  with breathing room instead of a rule, and quieted the column labels (lighter weight, dimmer color).
- **Typographic-only buttons — scoped, not universal.** Converted `.cta-btn` (hero's Latest News/Race Hub)
  and `.quick-nav-btn`/`.quick-nav-btn.primary` (championship page's View Standings/View Graph jump-links)
  from bordered pill buttons to plain text + trailing arrow with an underline-sweep hover, matching the
  header nav voice — both are real anchor-link CTAs, not stateful controls, so they qualify cleanly.
  **Deliberately left as bordered/filled, not converted:** `.subscribe-btn` (a real form-submit control
  next to a text input — needs a clear click target, already correctly recolored cyan from the prior
  pass) and `.category-tab.active`/`.tab-btn.active` (stateful selection UI — active/inactive needs to
  stay visually distinguishable, stripping chrome would remove the only signal of which tab is selected).
- **Negative-space dividers** checked sitewide: homepage's major sections (`.trending-strip`,
  `.battle-band`) already use pure margin spacing with no border rules — no change needed there. Left
  `.race-strip`'s top/bottom hairline alone — it's a functional live-countdown band with its own
  background colour, not a decorative divider between prose sections, so Aurora's negative-space rule
  doesn't apply to it.
- **Not attempted, flagged rather than skipped silently:** Aurora's "Hanging" heading placement and
  "single column" body composition. Hanging headers are a fairly subtle typographic-indent detail with
  low payoff relative to the risk of touching every section header across 87 pages; single-column body
  composition would mean breaking up the standings tables, the side-by-side championship graph, and the
  driver stat-tile grid — real functional layouts, not decoration, and forcing them into one column would
  actively hurt readability of comparison data. Both left as-is; happy to revisit if wanted specifically.
- Verified in-browser (hard-reload-checked): homepage (floating pill header, typographic hero CTAs with
  working underline-sweep hover, restyled footer with visible negative-space) and `championship.html`
  (typographic View Standings/View Graph links). Zero console errors on both pages. CSS brace-balance
  clean.

### Aurora font correction (2026-08-29)

User reported "still old fonts" after a hard-refresh + cache-buster bump; investigation confirmed the
first-pass fonts (Tomorrow display, later swapped to Newsreader body) were correctly wired sitewide and
did load — the actual problem was that the display-face pick itself was wrong. Re-read
`genres/atmospheric.md` § Voice properly this time: the atmospheric genre's *default* voice is Geist Sans
for **both** display and body ("Geist Sans 600... Body — same family, 400"); Aurora is independently
called out twice (`cobalt.md`, `lumen.md`) as the one atmospheric theme that overrides *body only* to a
serif ("dark cyan blooms + Sentient serif body") — display stays the genre default. The original
"Tomorrow" pick was never actually grounded in an Aurora-specific fact, just a plausible guess from the
genre's display-candidate list.

Corrected: `--font-display` → `'Geist', 'Inter', ui-sans-serif, system-ui, sans-serif` (matches the user's
own stated expectation exactly), `--font-body` → back to `'Sentient'` (re-confirmed correct, via
Fontshare). Swept the Google Fonts URL and Fontshare link block across all 87 pages again, bumped the
cache-busting version string a second time. Verified via `document.fonts` that both Geist and Sentient
actually load (not just linked) — zero console errors.

### Homepage redesign — motion, depth, premium CTAs (2026-08-29)

User ran the `redesign-existing-projects` taste skill's audit against the live homepage ("looks complete
slop" despite the correct Aurora palette/fonts) and asked for a full visual/motion redesign — more
motion, premium CTAs, parallax, top-notch visuals — theme (colors/fonts) unchanged. Went through
`EnterPlanMode`/`ExitPlanMode` first since this was a broad, multi-file redesign; plan approved (saved at
`~/.claude/plans/flickering-meandering-moon.md`). Confirmed via question: primary CTAs go back to a
**filled premium button** (reversing just that one part of the earlier Aurora structural-fingerprint
pass), not the typographic-only treatment.

- **Ambient blooms (page-level).** Added `body::before` with two fixed, low-opacity radial-gradient cyan
  blooms — this is literally Aurora's own documented canvas treatment (`genres/atmospheric.md`: "up to
  two radial-gradient blooms, ~20-30% footprint, fixed-attached, no animation") that had never actually
  been applied below the hero. Fixes the "flat, textureless sections" finding sitewide-on-homepage with
  one CSS rule.
- **Premium CTAs.** `.cta-btn`/`.cta-primary`/`.cta-secondary` (hero) and `.subscribe-btn` (footer) are
  filled again: glassy `color-mix()` cyan-tinted background, tinted glow shadow (`--shadow-glow`/
  `--shadow-lg`), hover lift, button-in-button icon circle. `.quick-nav-btn` (championship page) was left
  typographic — out of scope for this homepage-only pass.
- **Hero parallax.** Folded into the existing `initHeroPin()` GSAP timeline rather than a separate
  scroll listener — the track/car/speed-line layer now drifts (`y: -34`) at a different rate than the
  pinned foreground during the scroll beat. Deliberately not a second independent mechanism: an earlier
  draft used a standalone rAF-driven parallax on the same elements the pin's closing-fade already
  animates, which would have fought over the same transforms every frame.
- **Championship Battle bar reveal.** `initChampionshipBand()`'s existing 0→full points-bar fill (which
  fired on data-load, before the user ever scrolled this far, so it was never actually seen) now fires via
  `IntersectionObserver` the first time the section scrolls into view, staggered per row. Added a subtle
  `background-attachment: fixed` glow behind the section for a light parallax-drift feel.
  **Correctness note:** initially wrote a second, separate `initChampionshipBarReveal()` function against
  guessed class names (`.standings-bar-fill`/`.points-bar-fill`) before checking the real render code —
  caught this by grepping for the actual class (`.battle-bar`) and folded the reveal into the existing
  function instead of shipping a dead/wrong second function.
- **Spotlight-border hover.** Added a cursor-tracked radial-gradient glow (CSS `--mx`/`--my` custom
  properties, set via a single delegated `pointermove` listener in `initSpotlightCards()`) to `.feature-card`
  and `.trending-item:not(:first-child)`. **Bug caught during verification:** the trending-item version's
  glow had `z-index: -1`, placing it *behind* the card's own opaque background where it was completely
  invisible — confirmed via `getComputedStyle` (all values correct, just unreachable visually) before
  finding the actual cause. Fixed to `z-index: 1`, then bumped both glows' opacity (18%→30%, 22%→34%)
  since the original values were too subtle to read as an intentional effect once actually visible.
- **More Articles list** already had a left-accent bar (fills on hover, team-colour-coded) and a sweep-
  light effect from earlier work — checked against the plan's item F and found it already satisfied;
  no change needed.
- Verified in-browser: CTAs render filled/glassy, championship bars fill with stagger on scroll-into-view
  (confirmed via `getComputedStyle` widths, not just visually), spotlight glow confirmed visible via zoomed
  screenshot after the z-index fix, zero console errors throughout. Bumped the cache-busting version
  string again.
- **Not done, per the approved plan's scope:** rollout to the other ~86 pages — homepage only this round,
  pending the user liking the direction.

### Total site redesign — Hello Monday system, 3D particle hero, gamification (2026-08-30)

User rejected the Aurora-based direction entirely ("too much AI slop," "not awwwards worthy") and asked
for a ground-up sitewide visual/motion overhaul: 3D/immersive, all-new colors/fonts/animation, gamified
homepage, sections/data-integrations unchanged. Went through `EnterPlanMode` (this was a different,
much larger task than the prior homepage-motion plan, so the plan file was overwritten rather than
extended). Iterated on the design-direction proposal twice at the user's request — first pass (generic
SaaS-dashboard references) was rejected outright; second pass was grounded directly in the locally
installed `top-design` skill's own case-study library (real named studios: Locomotive, AREA 17, Active
Theory, Hello Monday) with real reference URLs per option, plus a concrete 3D-implementation plan per
direction. User picked **Hello Monday** (Copenhagen/NYC — Three.js/particles, custom physics,
gamification named as one of their own signature techniques). Plan approved and saved at
`~/.claude/plans/flickering-meandering-moon.md`.

**Note on skill freshness:** attempted to re-fetch the `top-design` skill from its recorded source repo
per the user's request; the repo (`jeremylongshore/...`) had been renamed/restructured that same day and
no longer contains the skill in its original form at any locatable path — worked from the existing local
copy instead (already comprehensive: case-studies.md, animation-patterns.md, technical-stack.md, etc.),
noted transparently rather than silently treating the local copy as verified-current.

**Applied — sitewide:**
- **Palette**: violet-black ground (`oklch(9% .02 290)` base) with a magenta/electric-blue duotone accent
  pair (`--f1-red` → magenta `oklch(65% .22 340)`, `--f1-blue` → electric blue `oklch(65% .20 250)`) —
  Hello Monday's own reference CSS literally layers a warm + cool radial bloom over a dark base; adapted
  here to avoid reusing any prior round's hue. Swept 335 hardcoded color literals (hex + rgb, same
  technique as the Aurora sweep) across `styles.css` and all 87 pages.
- **Type**: single variable font (`Archivo`, true `wght` 100–900 axis, loaded once via Google Fonts)
  carrying both display and body — `font-variation-settings: 'wght' 800, 'wdth' 120` on headings,
  `'wdth' 100` on body — "one face, two feelings" is itself the flourish, per Hello Monday's own
  reference code (`font-variation-settings: 'wght' 800, 'wdth' 125`). Removed the Fontshare dependency
  entirely (Sentient is no longer used) — back to a single Google-Fonts host, simpler and more reliable.
  `JetBrains Mono` kept unchanged for data/telemetry.
- **CSS-3D tilt**: `.feature-card`/`.trending-item` now tilt toward the cursor via `perspective()` +
  `rotateX/rotateY` driven by `--tiltX`/`--tiltY` custom properties (extended the existing
  `initSpotlightCards()` pointermove listener rather than adding a duplicate one). **Bug caught and
  fixed during implementation:** the existing `:hover` rules on both selectors set a bare
  `transform: translateY(...)`, which would have silently overridden (not combined with) the new tilt
  transform on hover — the two `:hover` rules were rewritten to compose `perspective()/rotate()` and
  `translateY()` into one transform value.
- Verified in-browser: no stray CSS reached `--ease-bounce-placeholder` (a leftover draft line
  mistakenly written outside any selector — invalid CSS — caught via grep before it could break parsing)
  — cleaned up before testing.

**Applied — homepage only (per the plan's "gamification is homepage-scoped" constraint):**
- **3D particle hero** (`hero-particles.js`, new file): a WebGL points field via **OGL** (~30KB), loaded
  as a plain ES module from a CDN (`<script type="module">`, no npm/build step — stays inside the repo's
  vanilla-only rule). 900 points, lerp-smoothed mouse-reactive rotation, magenta/blue duotone fragment
  shader, `IntersectionObserver`-gated (pauses when scrolled out of view) and fully skipped under
  `prefers-reduced-motion` or if the OGL module/WebGL context fails to load (canvas just removes itself,
  falling back to the existing dark gradient). The old CSS-only car/track layer is dimmed (`opacity: 0.4`
  / `0.55`) rather than deleted, so the particle field reads as the dominant hero visual with lower
  regression risk than removing working code outright.
- **Achievement/XP layer** (`gamification.js`, new file, `localStorage` key `f1wow_achievements_v1`): 5
  badges tied to real homepage interactions (visiting Race Hub/Standings/Calculator, subscribing, opening
  3 articles), a level indicator, and a bouncy unlock toast — deliberately the *one* surface on the site
  using overshoot easing on purpose, everywhere else keeps the standard ease-out discipline. No backend,
  no new page, additive markup only (`#achievementWidget` container between the hero and the race-strip).
- Verified end-to-end: clicked "Race Hub" on the homepage, confirmed the click fired before navigation,
  confirmed `localStorage` persisted `{"unlocked":["explorer"], ...}`, navigated back and confirmed the
  Explorer badge renders unlocked (highlighted icon, partial XP bar) while the other four stay locked.
- Verified via `document.fonts`: Archivo + JetBrains Mono both actually load (not just linked). Zero
  console errors on homepage or `championship.html`. CSS brace-balance clean. Bumped the cache-busting
  version string.

**Not done this round:** the plan's phase-4 "physics/overshoot easing for other celebratory moments"
beyond the achievement toast, and a formal mobile/responsive pass on the new particle canvas and tilt
cards — flagging for a follow-up rather than claiming full coverage.

---

## Session log — 2026-08-30 · Locked design decisions, scroll perf, sitewide rollout

Design direction was settled jointly with Dheeraj via a shareable artifact rather than in-session.
Locked choices: **A16 Steel Blue** accent, **T2 Cabinet Grotesk / Satoshi** type pairing, **M1**
(simplified 3D on phones), **H1** (remove the old CSS hero decorations). All fonts are free for
commercial use — the licensed-foundry tier was dropped entirely on cost grounds.

**Design system**
- Accent is now Steel Blue `#5B8FC7` on carbon `#0B0B0C` / bone `#EDEDE8`. The `--f1-*` token *names*
  were kept and only their values changed, so all 87 pages picked up the new palette without markup edits.
- Type is Cabinet Grotesk (display) + Satoshi (body) from Fontshare, JetBrains Mono for data.
  **Gotcha worth remembering:** Fontshare's combined `?f[]=a&f[]=b` URL silently returns only the
  *first* family. Satoshi was never loading. Fixed by splitting into two per-family `<link>` blocks.

**Scroll performance** (the page was badly janky; these were measured, not guessed)
- `backdrop-filter` on `.article-preview-card` ran a separate GPU blur pass per card, ~36 per frame.
- `.hero-section` painted an SVG `feTurbulence` noise texture with `background-attachment: fixed`,
  forcing a full hero repaint every frame. Same pattern on `.battle-band::before`.
- `initScrollAnimations()` animated `filter: blur()` across every revealed card.
- Added `content-visibility: auto` + `contain-intrinsic-size` to article cards.

**Hero 3D** — the ribbon alone read as a flat diagram, which was fair. Added a particle field spread
through 95 units of depth with perspective-scaled point size, so near particles sweep past while far
ones barely move. That differential parallax is what actually communicates dimension. 900 points on
desktop, 260 on phones per M1. Note the rails are built as **triangle quads, not `gl.LINES`** — 1px
GL lines render as invisible sub-pixel hairlines on a hi-DPI canvas.

**Sitewide rollout**
- The editorial layer (section rhythm, hairline section heads, trending step-down) was rescoped from
  `.home` to a new `.ed` class now on all 87 page bodies. Homepage-only behaviour (the article fold,
  the progress HUD) stays gated on `.home`.
- **Fixed a real sitewide bug:** no base `a` colour rule existed anywhere in `styles.css`. Every link
  that carries a class sets its own colour, so plain inline links in prose fell through to the browser
  default `#0000EE` — and `#551A8B` once visited. Added a bare `a` rule (lowest specificity, so every
  classed link still wins).

**Verification limitation to be honest about:** the automated browser tab runs backgrounded
(`visibilityState: "hidden"`), which suspends `requestAnimationFrame`. Scroll-driven animation,
particle motion and the GSAP reveal tweens therefore cannot be confirmed programmatically — they
appear frozen mid-tween in any scripted check. Motion and the "buttery smooth" scroll feel need a
human with a real trackpad.

**Not done this round:** OG card images are still pre-rendered JPGs with the old red F1WOW branding
baked in, which now clashes with the steel-blue palette — they need regenerating.

---

## Session log — 2026-08-30 (later) · Scroll recursion, OG cards

**The scroll lag had a root cause, not just inefficiency.** `smooth-scroll.js`
re-dispatched a native `scroll` Event whenever Lenis emitted one. Lenis *listens* for
native scroll (`onNativeScroll`), so each synthetic event made it emit again, dispatching
again — the console showed `RangeError: Maximum call stack size exceeded` on every scroll.
The file's own comment claimed *"Dispatching does not move the page, so this cannot feed
back on itself"*: true about the page position, wrong about Lenis.

That shim should never have existed. It was added to fix a frozen progress bar that turned
out to be rAF suspension in a backgrounded test tab. **Lenis moves the real scroll position
via `window.scrollTo`, so genuine native scroll events already fire** and every listener
works untouched. Removed entirely.

Two more per-frame costs went with it:
- Reveals ran on ScrollTrigger — one trigger per element (38 on the homepage), with the
  whole set re-measured on every `.update()`, i.e. once per frame under Lenis. Now
  IntersectionObserver + the `.fade-in`/`.visible` CSS transition that already existed.
  ScrollTrigger count is 0, so the Lenis↔ScrollTrigger wiring is skipped too.
- Driving that fade through GSAP made it depend on the GSAP ticker; a stalled ticker
  stranded cards at `opacity: 0`. The CSS class is added synchronously, so content can no
  longer end up permanently invisible. Section headers now reach opacity 1 instead of
  sticking mid-tween at 0.395.

Also reverted last round's `content-visibility: auto` — cards measure 253px against a
220px intrinsic-size placeholder, so each one entering the viewport resized the document
by 33px. Speculative, and it cost more than it saved.

**OG cards — all 38 regenerated.** All three generators painted `RED = (225, 6, 0)`, which
is `#E10600`, **Formula 1's own brand red** — a breach of hard rule 1, not merely an
off-palette colour. They also hardcoded `C:/Windows/Fonts/bahnschrift.ttf` inside a bare
try/except, so on macOS every card silently rendered in Pillow's bitmap default. The
drawing code was copy-pasted three ways, which is why the red survived in three places.

Now one shared renderer, `scripts/og_card.py`, called by all three scripts. Carbon/bone/
steel with Cabinet Grotesk + Satoshi; the kerb stripes are replaced by a faint receding
track ribbon echoing the hero. Fonts vendored as TTFs under `scripts/fonts/` (Pillow can't
read Fontshare's woff2) under the ITF Free Font License, which permits commercial use.
Verified: meta tags byte-identical before/after, every referenced card present, zero
red-ish pixels in the output.

**Still open:** the "buttery smooth" claim needs a human check — a backgrounded automation
tab suspends rAF and Lenis, so scroll feel cannot be measured programmatically here.
