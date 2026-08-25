# F1WOW News — Design System (Cinematic Overhaul)

Status: **active overhaul** — branch `design/cinematic-overhaul`. This document is the source of truth for the visual/motion redesign. `PRODUCT.md` still describes the product's audience and function; this file supersedes its "Visual identity" section.

## Why this exists

The pre-overhaul site (see `UI_AUDIT.md`) was functionally solid but visually generic: no motion beyond a single opacity fade, depth stripped out in a prior "calm the page" pass, ~40 pages each reinventing bespoke CSS, zero imagery on the highest-traffic surfaces, and a palette/type pairing indistinguishable from any other fan site. The brief: make it Awwwards-tier, cinematic, motion-rich — while changing **zero functionality** (no new features, no behavior changes, no framework, no build step). This is a pure design and motion layer overhaul on top of the existing static HTML/CSS/JS.

## Hard constraint: not official F1 branding

F1WOW is an independent fan site with no affiliation to Formula 1 / FOM / Liberty Media. It must not reproduce the official F1 brand:

- **Avoid F1's red**: `#FF1801` (current F1 logo red) and `#E22420` (older F1 logo red). The site's *previous* accent, `#E10600`, sits close enough in this exact family to be a problem and was replaced (see Color, below).
- **Avoid F1's bespoke display typeface** (the Wieden+Kennedy-designed "Formula1" typeface used in F1's own broadcast graphics/wordmark) and any of its dafont/1001fonts lookalike clones (sold as "F1 Regular / F1 Turbo / F1 Torque" etc.). None of those are used here.
- Team/constructor colors (Ferrari red, McLaren papaya, etc.) are kept **only** as data-viz tokens for standings/graphs — that's descriptive fact (a team's own livery), not F1WOW borrowing F1's brand.

## Color

One accent, used deliberately, not several competing ones (see `redesign-existing-projects` skill). The direction: a night pit-lane under sodium floodlights — warm carbon-black, not F1's cool blue-black; ignition amber, not F1's red.

| Token | Hex | Use |
|---|---|---|
| `--bg-0` | `#0F0C09` | Page base — warm near-black (carbon/asphalt, not blue-black) |
| `--bg-1` | `#17130E` | Elevated surface (cards) |
| `--bg-2` | `#211B14` | Second elevation (nested/hover) |
| `--ink` | `#F5EFE6` | Primary text — warm off-white, not pure white |
| `--ink-dim` | `#B8AFA0` | Secondary text |
| `--ink-faint` | `#786E5F` | Tertiary / meta text |
| `--accent` | `#FF6A1A` | Primary accent — "Ignition Amber". CTAs, links, live indicators, hero motion |
| `--accent-dim` | `#CC5514` | Accent pressed/hover-darken state |
| `--signal` | `#FFC940` | Secondary highlight — "Marshal Yellow". Warnings, secondary emphasis only |
| `--good` | `#4ADE80` | Semantic positive (P1, gains) — unrelated to accent |
| `--info` | `#55C2FF` | Semantic info/links inside body copy |
| Team tokens | *(unchanged)* | Kept from current `styles.css` `:root` — factual constructor liveries for standings/graphs only, never used as site chrome |

Rules: no pure `#000`. No gradients that read as generic "AI purple/blue." Shadows are tinted toward `--bg-0`/`--accent`, never flat black. Grain/noise overlay allowed at very low opacity for the "floodlit asphalt" texture — must stay `pointer-events: none` and fixed-position only (perf).

## Typography

Two families, both real Google Fonts, neither the current Barlow Condensed/Orbitron racing-cliché pairing:

- **Display — `Unbounded`** (weights 700/800/900). Geometric, bold, slightly industrial — used for H1/H2, hero type, stat callouts. Big, condensed-tracking, `text-wrap: balance`. Never more than 3 lines in a hero.
- **Body — `Chakra Petch`** (weights 400/500/600) — kept from the current site. Technical without being a racing-font cliché, already properly licensed and loaded, good readability at body sizes.
- **Data / mono — `JetBrains Mono`** (weights 400/500) — new. Lap deltas, timestamps, tabular stat blocks. Always paired with `font-variant-numeric: tabular-nums`.

Scale is fluid (`clamp()`), not fixed pixel steps. Body measure capped near 65ch. Sentence case throughout — no `ALL-CAPS SUBHEADS` as a default (reserve caps for short eyebrow labels with real letter-spacing, used sparingly).

## Motion

The single biggest gap identified in the audit. GSAP + ScrollTrigger is added as a plain `<script>` include (CDN, no build step, no bundler) — purely additive, zero functionality change.

Principles:
1. **Every animation respects `prefers-reduced-motion`** — checked once, globally, via a JS flag gating all GSAP calls, not per-animation ad hoc.
2. Animate `transform`/`opacity` only. Never `top`/`left`/`width`/`height`.
3. Cinematic means *orchestrated*, not busy — one strong entrance choreography per section, not five competing effects.
4. The championship graph's line-draw and the homepage hero are the two "signature moments" — they get bespoke treatment. Everything else uses a shared, reusable scroll-reveal utility (staggered fade-up + slight blur-in) so 40+ content pages get consistent motion from one function, not one-off code per page.
5. Preserve the existing pre-paint hero-pause LCP pattern — do not regress performance for motion.

## Components

- Consolidate the repeated bespoke per-article/per-profile CSS (`.dz-*`, `.cst-*`) into named, reusable classes in `styles.css` before restyling them — one definition, applied everywhere, per `UI_AUDIT.md` §Sitewide Finding 4.
- Cards get considered depth back (tinted shadow, hairline inner highlight — "double-bezel" nested treatment) replacing the flat `box-shadow: none` left by the old "Stage 3: calm the page" pass. Depth is restrained, not the loud glow that Stage 3 originally reacted against.
- Buttons: one primary style (filled, `--accent`), one secondary (outline/ghost) — no more than 2 CTAs of equal visual weight in any single view.
- Imagery: existing OG images (`og-*.jpg`) get surfaced on the homepage grid and used as article/driver hero art — this was previously unused, zero-cost inventory.

## Non-goals (explicitly out of scope)

- No new features, no new pages, no data/API changes, no copy rewrites beyond what a template restyle requires.
- No framework or build-step migration — stays plain HTML/CSS/JS, hand-authored + the existing `scripts/gen-*.py` generators.
- No change to the Jolpica API integration, Formspree subscribe flow, or any JS business logic — motion/visual layers only.
- No use of official F1/FOM colors, wordmark, or typeface, per the hard constraint above.

## Working notes

- `TRACKER.md` in repo root tracks phase/task status for this overhaul — update it after every completed task.
- `UI_AUDIT.md` is the original findings document this plan is based on — kept as historical reference, not edited going forward.
