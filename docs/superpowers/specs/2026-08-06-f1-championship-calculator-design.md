# F1 2026 Championship Calculator — Design Spec

Status: approved for planning (2026-08-06). Not yet implemented in production.

## Problem / Opportunity

Every existing F1 championship calculator (RaceMate, AlbertMaster, Formula1Points, f1pointscalculator, F1Calculator.com) is a deterministic "what-if" scenario builder — drag a driver into a position, see updated points. None of them offer a probability estimate, a plain-English "what must X do to win" narrative, or anything shareable. That combination is the gap and the bet: F1WOW's calculator should feel like a probability model with editorial narration, not a spreadsheet.

Full competitive research, method comparison (deterministic vs Monte Carlo vs Elo vs Bayesian vs ML), persona analysis, and the 25+ unique-feature brainstorm live in the conversation this spec was derived from (2026-08-06 session) — this doc captures the decisions made from it, not the full exploration.

## Decisions Locked

1. **Scope of scenario editing**: all 12 remaining races (Rounds 12–23 of the 2026 season), not just the next one.
2. **Editable driver pool**: top 10–12 contenders by current standings. Everyone outside that group defaults to scoring outside the points for the remainder of the season (not zero — see Open Question 1). Can be widened later if a longshot driver becomes mathematically relevant.
3. **Probability method**: Monte Carlo simulation (3,000+ runs), each driver's remaining points drawn from a normal distribution centered on their actual 2026 points-per-race average and standard deviation (computed from real season results), separately for GP and sprint points. Validated against live data in a throwaway prototype — see "Prototype Validation" below.
4. **Locked vs simulated races**: any race the user has filled in for a driver is treated as fixed; any race left blank is simulated. Leaving everything blank is the default "current odds" view; filling in all 12 collapses to a fully deterministic outcome (probability naturally resolves to 0%/100%).
5. **Elimination test**: deterministic best-case/worst-case comparison (driver's current points + max possible remaining points, vs. leader's current points assuming they score zero the rest of the way), including the 2026 sprint-weekend point values (33 max per sprint weekend vs 25 for a standard race).
6. **Constructors' mode**: ships together with drivers' mode, not as a fast-follow — same engine, both drivers' scores combined per team, correlated sampling (a team's bad weekend affects both cars, not independent draws).
7. **UI shape for the 12-race grid**: race-by-race carousel/accordion (one round expanded, navigate between rounds), not a single dense table — a 10-driver × 12-race grid is too dense for one view, especially on mobile.
8. **Required-results output**: v1 ships the deterministic pace-gap version ("X needs to outscore Y by N points/race across the remaining M rounds"). The fuller "if X wins next race, Y's odds drop to Z%" sensitivity narrative (re-running the model under single-race what-ifs) is a v1.x feature, not MVP — it depends on the base model being trusted first.
9. **Architecture**: fully client-side, no backend, no build step change. Reuses existing `cachedJson()` (5-min localStorage cache) and `fetchMergedSeasonResults()` (round-merge-safe pagination) from `script.js`. Scenario state is a plain JS object, serialized to a URL query param for shareable links, mirrored to `localStorage` so an in-progress edit survives a refresh.
10. **Sharing**: URL-encoded scenario link (no backend needed) + a static share-card image, extending the existing `scripts/gen-og-cards.py` branded-card pattern rather than building new image infrastructure.

## Prototype Validation (already done, informs the plan — not to be repeated)

A throwaway prototype (`championship-calculator-prototype.html`, untracked, unlinked, never committed) proved the core math end-to-end against live data:
- Pace computation (mean/stddev of points-per-race, GP and sprint separately) from real 2026 results via `fetchMergedSeasonResults()` + `sprint.json`.
- Deterministic elimination test.
- Monte Carlo engine (Box-Muller normal sampling, clamped to valid point ranges, tie-handling via split credit).
- Sanity checks: merge-by-round produces exactly one row per completed round; simulated win probabilities sum to ~1.0; probability moves in the correct direction under a real what-if scenario (Hamilton wins, Antonelli finishes P8 → Antonelli's title probability drops slightly, from ~99.6% to ~97.7%, correctly reflecting that his season-long pace advantage matters more than any single race).

This validates the *engine* is sound. The real build's job is: (a) extend it from "next race only" to "any of the 12 remaining races," (b) build the real UI (carousel, not a bare prototype page), (c) add constructors' mode, (d) add sharing, (e) integrate it as a real, linked, published site page.

## Explicitly Out of Scope for v1

- Weather, safety-car probability, mechanical-reliability modeling (no real data source to ground these — see research doc's "brutal critique").
- ML-based prediction (no telemetry/qualifying-gap data available from Jolpica).
- Elo ratings, Bayesian updating (both are real v2+ refinements, not needed to prove the core bet).
- Sensitivity narrative generator ("if X happens, odds move to Y") — v1.x, after the base model is trusted.
- Push notifications, saved user accounts, community leaderboards (all need a backend the static site doesn't have).
- Full 20-22 driver grid (top 10-12 only per Decision 2).

## Open Questions for the Implementation Plan to Resolve

1. **What does "outside the points" mean numerically for non-editable drivers in the simulation?** Zero for every remaining race, or their own season pace (excluded from the *editable* grid but still simulated at their real pace so they can't accidentally win via a modeling gap)? Recommendation: still simulate them at their own real pace — they're excluded from *editing*, not from the *math* — otherwise a fast-improving lower-ranked driver could be invisibly mis-modeled.
2. **Where does this page live?** Standalone new page (e.g. `championship-calculator.html`) vs. a major new section inside the existing `championship.html`. Affects nav/sitemap/SEO decisions in Phase 1.
3. **Launch timing relative to Zandvoort (Aug 23)** — is that the target, and does it constrain phase scope?
4. **Tone for the required-results line** — dry/statistical vs editorial/dramatic (brand-voice call, not technical).
