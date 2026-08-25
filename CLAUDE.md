# CLAUDE.md

Working agreement for AI agents (Claude Code or otherwise) making changes in this repo.

## What this repo is

F1WOW News (`f1wownews.com`) — an independent, fan-run Formula 1 news site. Static HTML/CSS/JS, no framework, no build step, hosted on GitHub Pages. ~130 hand-authored pages sharing one `styles.css` and one `script.js`. Live data (standings, calendar, championship graph) comes from the free Jolpica F1 API, fetched client-side. See `README.md` for the quick-start and `PRODUCT.md` for product intent.

## Active work: cinematic design overhaul

There is an in-progress visual/motion redesign on branch `design/cinematic-overhaul`:

- **`DESIGN.md`** is the design system spec (color, type, motion principles) — read it before touching CSS or visual markup.
- **`TRACKER.md`** is the phased task list for this overhaul — check it for current status, and update it after finishing any task from it.
- **`UI_AUDIT.md`** is the original audit the overhaul is based on — historical reference, don't edit it.

This overhaul is **design/motion only**: no new features, no functionality changes, no framework or build-step migration, no changes to the Jolpica API integration or the Formspree subscribe flow. If a task seems to require a functionality change, stop and flag it rather than making it.

## Hard rules

1. **No official Formula 1 branding.** No F1's red (`#FF1801` / `#E22420`), no F1's bespoke broadcast typeface or its dafont/1001fonts lookalikes. See `DESIGN.md` for the full rationale. Team/constructor colors used for standings/graphs are fine — those are factual liveries, not F1's own brand.
2. **Stay vanilla.** No React/Vue/Svelte, no bundler, no npm build step. Plain HTML/CSS/JS only, matching the existing stack.
3. **Pages are often script-generated.** Check `scripts/gen-*.py` before hand-editing a page that looks templated (driver/team/race-report pages) — edit the generator, not just one output file, or the fix won't survive the next regeneration and won't apply to sibling pages.
4. **Shared files cascade.** `styles.css` and `script.js` are shared across nearly every page — a change there affects the whole site. Prefer fixing something once in the shared file over patching individual pages.
5. **Don't break what works.** Live data fetching, the countdown, search, the championship calculator, and the subscribe form must keep working exactly as before. Test changes against a local server (`python -m http.server`, per README) before considering a task done.
6. **Accessibility is a committed feature, not optional.** Keep WCAG AA contrast, `focus-visible` states, and `prefers-reduced-motion` support on every new animation.

## Before starting any task from `TRACKER.md`

1. Re-read `DESIGN.md` for the relevant section (color/type/motion/components).
2. Check `git status` / `git log` to see what's already landed on this branch.
3. Make the change.
4. Update `TRACKER.md` — check off the task, add a one-line session-log note if it's a meaningful chunk of work.
