# F1wow News — PRODUCT.md

## Register
brand — a content/media site; the visitor's impression of the masthead, articles and data pages IS the product.

## What it is
Independent motorsports (Formula 1) news & analysis website, grown from the @f1wow Instagram community. Static HTML/CSS/JS on GitHub Pages; live race data from the Jolpica/Ergast F1 API.

## Target users
F1 fans (mobile-heavy, race-weekend traffic spikes) who want fast race reports, live standings, and the championship battle at a glance.

## Product goals
Become a monetizable F1 media site (AdSense, affiliates, sponsored content). Roadmap and priorities live in PRODUCTION_AUDIT_2026-07-18.md — the working source of truth.

## Brand personality
Fast, fan-first, race-night energy. Dark "circuit at night" theme with F1-red signal color. Confident but not corporate; a fan brand, not a broadcaster.

## Visual identity (committed — preserve)
- Colors: F1 red `#E10600` on near-black `#15151E` → `#1F1F2B`; team colors for data viz (tokens in styles.css `:root`)
- Type: Orbitron (display/masthead) + Chakra Petch (body)
- Dark-only theme; animated hero with live race countdown
- Signature element: interactive championship progression graph (live data)

## Anti-references
- Generic SaaS landing-page aesthetics; cream/beige editorial looks
- "Gamer RGB" excess — pure #00FF00 / #FFD700 accents are being phased out
- Formula1.com corporate polish is NOT the voice; The Race / RacingNews365 restraint is closer

## Constraints
- Static hosting (GitHub Pages today), no build step yet (SSG migration planned)
- One shared styles.css / script.js across ~25 hand-maintained pages — prefer CSS-only changes that cascade site-wide
- Accessibility: keep WCAG AA contrast (≥4.5:1), focus-visible, reduced-motion support
