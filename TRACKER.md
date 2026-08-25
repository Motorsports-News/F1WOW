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

- [ ] Fix `.search-section` malformed/duplicated CSS block (styles.css ~889–1078)
- [ ] Fix duplicated/broken `.category-tab` rule block (styles.css ~1138–1179)
- [ ] Delete dead keyframes (`glowPulse`, `progressGlow` if confirmed unused)
- [ ] Fix stray "Watch F1" breadcrumb bug on all `team-*.html` pages
- [ ] Swap color tokens in `:root` to new palette (`--bg-0/1/2`, `--ink*`, `--accent`, `--signal`) — keep team tokens as-is
- [ ] Swap typography: load `Unbounded` + `JetBrains Mono`, apply display/mono roles; keep `Chakra Petch` for body
- [ ] Reintroduce considered depth: tinted shadows + double-bezel card treatment for `.glass-card`, `.featured-article`, `.countdown-item`
- [ ] Consolidate `.dz-*` (race report) bespoke styles into shared `styles.css` components
- [ ] Consolidate `.cst-*` (driver stat tile) bespoke styles into shared `styles.css` components
- [ ] Add GSAP + ScrollTrigger via CDN `<script>` (no build step); add global `prefers-reduced-motion` gate
- [ ] Replace flat `IntersectionObserver` fade-in with shared staggered fade-up + blur-in scroll-reveal utility

## Phase 2 — Signature cinematic moments

- [ ] Homepage hero: layer live headline/stat typography over existing car animation; collapse 6 CTAs to 2 primary + secondary nav row
- [ ] Homepage/news article grid: real bento layout using existing `og-*.jpg` images (1 large + medium image cards + dense text tail)
- [ ] Championship graph: full-bleed showcase framing + scroll-triggered `stroke-dashoffset` line-draw + touch-friendly tooltips
- [ ] Race Hub podium: rebuild as staggered-height podium visualization with reveal animation

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

- **2026-08-25** — Phase 0 complete. Branch cut, `DESIGN.md`/`TRACKER.md`/`CLAUDE.md` added. Color/type direction locked: Ignition Amber `#FF6A1A` accent (replacing F1-red-adjacent `#E10600`), warm carbon-black neutrals, `Unbounded` + `Chakra Petch` + `JetBrains Mono` type system. Starting Phase 1 (CSS bug fixes + token/type swap) next.
