# F1WOW News — UI/Design Audit

Audit date: 2026-08-25
Scope: full static site (`styles.css` 5,688 lines / `script.js` 1,825 lines shared across ~130 hand-authored HTML pages). Read in full: `styles.css`, key parts of `script.js` (hero/parallax, countdown, search, championship graph, scroll animation, mobile menu). Read end-to-end: `index.html`, `dutch-gp-2026-race.html` (long-form race report), `championship.html`, `calendar.html`, `race-hub.html`, `driver-max_verstappen.html`, `team-ferrari.html`. Skimmed structurally: `drivers.html`, `teams.html`, `news.html`, `about.html`, `contact.html`, `subscribe.html`, `championship-calculator.html`, `antonelli-maiden-win.html`, `privacy-policy.html`.

Brand constraints from `PRODUCT.md` (committed, preserve): F1 red `#E10600` on near-black `#15151E → #1F1F2B`; team colors for data viz; Orbitron/Barlow-Condensed display + Chakra Petch body *(note: code actually uses **Barlow Condensed**, not Orbitron — PRODUCT.md is stale on this point, see Sitewide §1)*; dark-only theme; animated hero with countdown; interactive championship graph as signature element. Anti-references: generic SaaS, Formula1.com corporate polish, gamer-RGB excess.

---

## Sitewide Design System (from `styles.css` / `script.js`)

**Tokens** (`:root`, lines 1–42): `--f1-red #E10600`, `--f1-dark-red #B80500`, `--f1-black #15151E`, `--f1-dark #1F1F2B`, `--f1-gray #38383F`, team colors for all 10 constructors, plus `--f1-yellow #E8C84D`, `--f1-green #3BD66A`, `--f1-blue #00AEEF`. Body background is a fixed 135° gradient across black→dark→`#181824`.

**Typography**: body font is `'Chakra Petch'` (weight 500 base); display font is `'Barlow Condensed'` (used for h1/h2, stat numbers, nav brand) — Orbitron is not actually loaded anywhere (`grep` confirms no `Orbitron` in the codebase). Google Fonts request only pulls Chakra Petch + Barlow Condensed weights.

**Motion inventory** — what exists:
- CSS `@keyframes`: `speedLine`, `glowPulse` (unused — see below), `shimmer` (defined twice, `duplicate @keyframes shimmer removed` comments show mid-cleanup), `tabActivate`, `livePulse`/`liveDot`, `slideInRight`/`slideOutRight` (toast notifications), `fadeIn`, `drawLine`/`raceInLeft`/`raceInRight`/`speedBurst`/`raceInDiagonal`/`turboRev`/`driftIn` (article entrance animations, largely unused in the pages read), `skeletonSweep`, `liveDotPulse`.
- JS: `IntersectionObserver`-driven fade-in (`initScrollAnimations`, script.js:426) applied only to `.article-preview-card, .standings-card, .schedule-card, .section-header` — adds `.visible.fade-in` + a `stagger-N` class (N = index%5+1). No transform/blur entrance, just opacity+translate presumably in CSS.
- Hero: a single looping "car races across the screen" animation (`raceBy`, 3.4s linear infinite) plus scrolling kerb/dash-line track backgrounds (`kerbScroll`, `dashScroll`) and 3 diagonal `speed-line` streaks. A small mouse-driven parallax on `.hero-speed-lines`/`.hero-content`/`.car-layer` via inline `<style>` in `index.html` (transform on `transition: transform 0.15s ease-out`, but no JS listener for `mousemove` found wired to it in the read portion — worth verifying it's actually connected).
- **No GSAP, no ScrollTrigger, no scroll-scrubbed animation, no pinning, no horizontal scroll, no parallax-on-scroll, no text-reveal-on-scroll anywhere in the codebase.** All "motion" is either infinite CSS loops (hero) or a single opacity fade-in on scroll-into-view. This is the single biggest gap relative to the "cinematic, motion-rich" goal.
- A large fraction of shadow/glow effects have been **manually stripped**: `box-shadow: none;` appears with an adjacent `/* animation retired (Stage 3): calm the page */` comment repeatedly (hero glow, cards, buttons, search bar, category tabs, featured article, glass-card, etc.) A prior editing pass ("Stage 3") deliberately flattened the site's depth and glow — the codebase's own comments document this decision. Any modernization plan is fighting this prior calming pass, not starting from zero.

**Layout**: `.container { max-width: 1440px; padding: 0 clamp(20px,3vw,48px) }`. Article grids are uniform `repeat(auto-fit, minmax(400px, 1fr))` — every card is visually identical weight (no bento/masonry variance anywhere on the site, despite 30+ articles on the homepage). `.featured-article` is the only card given elevated treatment (gradient bg, 2px accent border, hover racing-stripe wipe).

**Components**:
- Buttons (`.cta-btn`, `.quick-nav-btn`, `.category-tab`) are all `border-radius: 25px` full pills, 2px border, hover = `translateY(-2px)` + background fill. Consistent but flat — no button-in-button icon treatment, no magnetic/spring physics (gpt-taste §6, high-end-visual-design §4B).
- Cards (`.glass-card`, `.countdown-item`, `.article-preview-card`) use `background: rgba(255,255,255,0.03–0.1)` + `backdrop-filter: blur(10–20px)` + 1px hairline border — genuine glassmorphism is present, but shallow (no inner highlight/inset shadow — the "true glassmorphism" upgrade from redesign-existing-projects §Surface Upgrades is not applied).
- Nav (`.header`) is a full-width sticky bar with 3px red bottom border — not the "floating glass pill" pattern gpt-taste/high-end-visual-design recommend, but that's a stylistic choice, not necessarily wrong for a news masthead.

**Accessibility** (PRODUCT.md commits to WCAG AA + focus-visible + reduced-motion — verified in code):
- `*:focus-visible { outline: 2px solid var(--f1-red) }` — present and consistently applied to interactive elements. ✅
- `@media (prefers-reduced-motion: reduce)` blocks exist for the hero car/track/speed-lines (index.html inline `<style>`) and separately in styles.css (lines 4270, 4502, 4798, 4866, 5081) — reduced-motion is taken seriously in several places, but is NOT applied to the `speedLine`, `glowPulse`, `shimmer`, `livePulse`/`liveDot`, `tabActivate` keyframes used elsewhere, so it's inconsistent, not sitewide.
- Skip-link (`<a class="skip-link" href="#main">`) present on every page read. ✅
- 44px minimum touch targets are explicitly enforced (`min-height: 44px` on nav-link, mobile-menu-toggle, category-tab, search-toggle) — good, deliberate a11y decision, worth preserving.

**Bugs found in `styles.css`** (not stylistic, actual defects):
1. **Malformed nesting / dead rule block, lines 889–1078.** `.search-section {` opens at line 890 and is never validly closed before `.search-container`, `.search-icon`, `.search-input`, `.search-clear`, `.search-tags`, `.search-tag`, `.search-results`, `.search-no-results` are declared *inside* it — vanilla CSS doesn't nest selectors this way (no CSS-nesting `&`), so browsers parse this as broken/ignored rules or reinterpret unpredictably. The same `.search-container`/`.search-input`/etc. block is then **repeated verbatim again at lines 982–1077** as a properly top-level ruleset, followed by an orphan closing `}` at line 1078. This looks like a copy-paste-during-refactor artifact that was never cleaned up. Net effect: dead weight in the stylesheet and a real risk of unpredictable cascade behavior in older/stricter parsers.
2. **`.category-tab` declared twice with conflicting rule sets** (~1138–1154 and ~1174–1179), the second block missing selector context (`font-weight`, `cursor`, `transition`... floating without a preceding selector — reads as a continuation of the first block that should have been merged). Same root cause as #1: incomplete refactor.
3. Stray unmatched `}` at line 244 in the header section (right after `.f1wow-logo`) — cosmetic only (doesn't break parsing since CSS tolerates a stray `}` as an empty rule terminator) but signals the same "half-edited during a redesign pass" pattern seen elsewhere.
4. `@keyframes glowPulse` (line 548) and `@keyframes progressGlow` (line 186) are both defined but their host declarations have been commented out ("animation retired") — dead CSS, safe to delete once superseded.

**Net read**: this is a well-intentioned, accessibility-conscious codebase that has been through at least one deliberate "calm it down" editing pass (stripping shadows/glows, described in its own comments as "Stage 3"). That pass appears to have been a reaction to an overly loud earlier version rather than a move toward cinematic restraint — the result now reads as flat rather than either loud or premium. A redesign should treat this as "add considered depth back in", not "start from a blank slate."

---

## Page-by-Page Audit

### 1. Homepage (`index.html`)

**Structure**: Sticky header → animated hero (looping race car + track + speed lines, headline "F1WOW NEWS", 6 CTA pills) → broadcast strip (live countdown to next race) → compact search bar → Trending Now (4-item text list) → Championship Battle band (live standings teaser) → Latest News: 1 featured article (large card) + category tabs (All/Race/News/Technical) + a **~35-card uniform grid** of `article-preview-card`s → subscribe section → footer.

**Taste-skill violations**:
- **Hero fails the "2-3 line iron rule" in spirit but not letter** — `F1WOW NEWS` is short, so line-count isn't the issue; the issue is the hero communicates almost nothing distinctive. It's a looping car GIF-style animation + a generic site name + subtitle. There's no "attention" hook (no headline story, no stat, no motion tied to actual content) — for a content site whose homepage exists to sell *today's news*, the hero doesn't reference a single current headline.
- **6 CTA buttons of equal visual weight in the hero** (Latest News / Race Hub / Standings / Calendar / Watch F1 / Calculator) — this is exactly the kind of undifferentiated button row the "Nested CTA" and "Button-in-Button" guidance warns against; there is no primary/secondary hierarchy beyond one color difference, and 6 competing CTAs dilute the AIDA "Action" clarity.
- **Zero bento variance in the articles grid.** 35 cards, every one `minmax(400px,1fr)`, same height, same layout (image-less — text-only preview cards). This is the single most generic pattern on the page: a wall of same-size cards is the #1 anti-pattern gpt-taste's Bento rule (§4) and redesign-existing-projects' Layout section explicitly call out ("three equal columns... most generic AI layout" — here it's worse, an unbounded repeat of one card type with no featured/large variants beyond the single "featured-article" at the top).
- **Cards are text-only — no imagery.** `article-preview-card` has no `<img>`; despite the repo having 30+ dedicated OG images (`og-*.jpg`) per article, none are surfaced on the homepage grid. For a "cinematic, motion-rich" visual overhaul this is the biggest missed asset: real photography/renders exist and aren't used in the primary browsing surface.
- **Trending Now is plain text list**, no imagery, no rank styling beyond a number — reads like a sitemap, not a "trending" moment.
- No entrance choreography beyond a flat opacity fade — cards, hero, and championship band all just "appear."

**What's working / preserve**:
- The car-racing-across-hero animation is genuinely on-brand and distinctive — it's a real signature motif, not a generic template hero. It should be *elevated*, not replaced.
- Live data integration (countdown, standings band) is real functionality worth foregrounding more, not less.
- Category tab filtering + compact search + reading-progress bar are functional, accessible UI already in place.
- LCP discipline: the hero explicitly pauses animation before first paint (`hero-paused` class removed next frame) — a deliberate, sophisticated performance decision. Any redesign must preserve this pattern for new animations.

**Recommendations** (priority order):
1. Turn the hero into an actual AIDA "Attention" moment: overlay the day's biggest headline/stat on top of the existing car animation (e.g., large kinetic-type treatment of the current featured article's number stat — "219 RACES WITHOUT A CRASH" — instead of the static "F1WOW NEWS" wordmark). Keep the car/track animation, add content-driven typography on top.
2. Collapse the 6 hero CTAs to 2 (one primary "Read Latest", one secondary "This Weekend" → race-hub) and move the other 4 into a slim in-page nav below the hero, not inside the hero itself.
3. Rebuild the articles grid as an actual bento: 1 large `col-span-2 row-span-2` hero card for the top story with full-bleed image, 2–3 medium cards with images, then a denser text-only list for the long tail — using the OG images that already exist per article.
4. Add real scroll-entrance choreography (stagger + translateY + subtle blur-in) to replace the flat opacity fade, respecting the existing `prefers-reduced-motion` pattern.
5. Give Trending Now a visual identity distinct from the articles grid (numbered oversized type + one thumbnail per item), so it doesn't read as a second identical list immediately above the real grid.

### 2. Long-form Race Report (`dutch-gp-2026-race.html`, 927 lines — representative of ~20 similar race-report pages)

**Structure**: standard header → long-form article body with heavy custom inline `<style>` block (`.dz-*` prefixed classes, "self-contained... do not reuse elsewhere" per its own comment) containing: stat tiles (`.quali-facts`), a results table (`.dz-table`), pull-quotes (`.dz-quote`), penalty list (`.dz-pen`), radio-message cards (`.dz-radio`) with a fake audio-waveform (`.dz-wave`, CSS bars of fixed heights — not real audio), a lap-one timeline (`.dz-tl`), a hand-built SVG line chart for grid-to-finish positions (`.dz-chart`), paddock quote cards (`.dz-voices`), and `<details>`-based expandable sections.

**Taste-skill violations**:
- **Every long-form article reinvents its own component CSS from scratch**, explicitly marked "do not reuse elsewhere." This is the opposite of a design system — 20+ race reports each carry their own bespoke `<style>` block of near-identical patterns (stat tile, quote card, timeline) with slightly different class names and slightly different values each time. This is a maintainability and consistency problem as much as a design one: the "gap chart," "radio messages," and "penalty list" patterns are clearly a recurring content need but have never been promoted to `styles.css` as reusable components.
- The SVG line chart (`.dz-chart`) is well executed (hover-to-highlight-line, tabular-nums, dashed lines for DNFs) but is entirely mouse/hover-dependent — no scroll-triggered reveal, no draw-on animation, despite `@keyframes drawLine` already existing (unused) elsewhere in styles.css.
- Long-form article body has no reading aids beyond the sitewide reading-progress bar — no in-page table of contents/jump-nav for a 900-line article with 8+ distinct content sections.
- No hero image for the article itself in the parts read (the OG image exists as a meta tag asset but isn't rendered in the page body) — a race report about a crash-strewn Grand Prix has zero photography on the actual page.

**What's working / preserve**:
- Content depth and structured data (NewsArticle + BreadcrumbList JSON-LD) is genuinely excellent for SEO and for readers — don't lose this in a redesign.
- The radio-message cards, penalty list, and quali-facts stat tiles are good *content* patterns — the problem is packaging (bespoke per-article CSS), not the underlying idea.
- Tabular-nums, `overflow-x: auto` on tables for mobile, and the `<details>` progressive disclosure pattern are all correct, accessible technique choices.

**Recommendations**:
1. Extract the 6–8 recurring `.dz-*` patterns (stat tile, quote card, radio card, timeline, gap chart, pull-quote) into `styles.css` as a proper "article components" library with stable class names (`.article-stat-tile`, `.article-radio-card`, etc.), then retrofit existing articles via find/replace. This alone would let future motion/visual upgrades apply to every race report at once instead of 20 one-off style blocks.
2. Animate the SVG gap chart's lines to draw in on scroll-into-view (the unused `drawLine` keyframe already exists — wire it to an `IntersectionObserver`).
3. Add a real header image/video-still for each race report using the article's own OG asset, with a cinematic gradient-mask treatment consistent with the homepage hero.
4. Add an in-page sticky mini table-of-contents for articles over ~150 lines (Qualifying / Race / Penalties / Standings jump links) — most of this content already exists as clear section breaks.

### 3. Shorter News Article (`antonelli-maiden-win.html`, 261 lines)

**Structure**: much lighter than the race reports — standard article body, no bespoke component CSS block. Presumably uses only sitewide typography/prose styles.

**Violations / recommendations**: Because this template carries almost no custom styling, it will automatically inherit any sitewide typography and spacing improvements made to `styles.css` prose rules — this is the highest-leverage template to get right first, since fixing shared `article-body`/prose styles here cascades to every short news post without per-file work. Recommend defining a proper `.prose` scale (heading sizes, paragraph max-width ~65ch, blockquote treatment, image captions) once, centrally.

### 4. Championship Standings (`championship.html`) — the signature live-data page

**Structure**: header → compact hero ("Championship Standings") with 2 quick-nav jump buttons → Standings section (2-column driver/constructor tables, populated live via `cachedJson` from the Jolpica API) → Championship Progression Graph section: hand-built SVG (`#championshipSvg`, `viewBox="0 0 1000 450"`) rendered client-side in `script.js` (`initChampionshipGraph`/`renderGraph`, lines 796–986) with per-driver toggle lines, tooltips on hover/mousemove, and a driver/constructor type toggle.

**Taste-skill violations**:
- This is explicitly PRODUCT.md's "signature element" but on the page itself it's visually no different from any other content section — same card chrome, same spacing, no special framing that signals "this is the flagship interactive feature of the site." A cinematic redesign should give this graph its own dramatic full-bleed treatment, not a `.championship-graph-card` box identical in weight to a standings table.
- Graph interactivity is mouse-only (`mousemove` tooltips) — no touch-friendly tap-to-inspect state described in the read code, which matters given PRODUCT.md calls out "mobile-heavy" traffic.
- No entrance animation for the graph — it just renders fully-drawn. A line-drawing reveal (stroke-dasharray animate-in) tied to scroll would be a strong, on-brand "cinematic" moment for the actual differentiator feature of the site.
- Standings rows are plain list rows with a chevron icon (`standing-chevron`) — no driver headshot, no team-color-coded accent bar beyond whatever CSS is applied via team CSS variables (not visible in the head of the file read, but no `<img>` for driver photos in the standings list).

**What's working / preserve**:
- The graph itself is functionally rich (per-line toggle, tooltips, driver vs constructor switch, live API data with fallback) — genuinely more sophisticated than most fan sites. Worth treating as the site's hero interactive, not hiding it in a standard card.
- `cachedJson` pattern for API calls (seen reused across driver/team/race-hub pages) is a sensible shared utility.

**Recommendations**:
1. Give the championship graph section a distinct visual register from the rest of the site — full-bleed dark canvas, larger type for the section header, maybe a subtle animated gradient/glow behind the SVG — so it reads as the site's showcase feature, matching PRODUCT.md's stated intent.
2. Animate line paths in on load/scroll via `stroke-dasharray`/`stroke-dashoffset` transition (cinematic "drawing the season" effect) — high impact, uses existing SVG structure, no new library needed.
3. Add tap-and-hold or tap-to-toggle tooltip support for touch devices alongside the existing mousemove handler.
4. Add small team-color accent bars and, if available, driver headshots to the standings list rows to break up the plain-text list.

### 5. Race Calendar (`calendar.html`)

**Structure**: compact hero → intro paragraph → `#raceSchedule` grid populated live from the API (loading skeleton shown initially).

**Violations**: Very thin static shell — almost all content is JS-rendered into `.schedule-grid`, which wasn't inspected in `script.js` beyond `loadFallbackSchedule` (line 378). Given the page is essentially a single grid of 23 round cards, this is a good candidate for genuine bento variance (next/live race gets a large highlighted card, completed rounds shrink to compact rows) rather than 23 uniform cards — but this needs to be verified against the actual `renderSchedule`-equivalent function before redesigning (not fully read in this pass).

**Recommendations**: Give the *next upcoming* race a visually distinct, larger "hero" card in the schedule grid (countdown, circuit render) versus a compact row treatment for completed rounds — turns a flat list into a page with a clear focal point, consistent with AIDA's "attention" principle even on a utility page.

### 6. Race Hub (`race-hub.html`)

**Structure**: compact hero with dynamic countdown → weekend session-time list (`#hubSessions`, populated by inline script using `cachedJson`) → podium result section (hidden until API has results) → "Keep Exploring" links.

**Violations**: Entirely plain-list session times and a barebones podium block (`.hub-podium-item.pos-N`) — for a "this weekend live" page, there's no urgency/live visual signal beyond the site's shared `.live-dot` pulse. The three-tier podium especially is an opportunity for a genuinely cinematic moment (podium-height bars, medal colors, driver imagery) that's currently just three stacked text rows per the classes present.

**Recommendations**: Redesign the podium block as an actual visual podium (staggered height blocks, gold/silver/bronze accent, entrance animation on reveal) rather than plain stacked rows — this is a small, contained component change with outsized visual payoff since it's the "reward" moment of the page.

### 7. Drivers Index / Driver Profile (`drivers.html`, `driver-max_verstappen.html`)

**Structure** (profile page): breadcrumb → `.profile-hero` (team-color CSS variable `--team`, car number as giant background numeral `.profile-num`, driver name, 3 stat pills) → prose bio → season log table → career stat tiles (bespoke inline `<style>` again, `.cst-*` classes — same "reinvent CSS per page" pattern as race reports) → related articles grid.

**Violations**:
- Same bespoke-inline-CSS-per-page problem as race reports (`.cst-tiles`/`.cst-tile` defined inline in this specific file only) — 20 driver pages × near-identical stat-tile CSS repeated with drift (colors are hardcoded hex `#e10600`/`#111318` here instead of the shared CSS variables used elsewhere — a consistency risk if the palette ever shifts).
- `.profile-hero` uses only a giant faint background numeral for visual interest — no driver photo/portrait anywhere on the page despite this being exactly the kind of page where a driver photo is the obvious hero asset.
- Stat pills (P6 / 109 / 0) are plain text — no data-viz treatment (e.g., no visual progress toward next position, no sparkline of recent-race trend) despite the season-log table right below containing exactly the data needed for one.

**What's working**: the team-color CSS variable (`--team:#3671C6`) piped into the hero is a nice, lightweight per-driver theming mechanism — worth extending (e.g., driving accent colors throughout the whole page, not just the hero band).

**Recommendations**:
1. Add driver portraits to `.profile-hero` (even simple studio-style cutouts) — the giant background numeral is a reasonable base layer but needs a photographic subject on top to feel premium.
2. Move `.cst-tile` styles into `styles.css` as a shared component and reference the CSS custom properties instead of hardcoded hex.
3. Add a small inline sparkline (reusing the SVG technique already proven in the championship graph) showing points-per-round trend directly in the profile hero or stats block.
4. Use the `--team` variable more aggressively — tint card borders, links, and the season-log table's header row with it, not just the hero background.

### 8. Teams Index / Team Profile (`teams.html`, `team-ferrari.html`)

**Structure**: nearly identical scaffold to driver profiles (`.profile-hero`, points log table, `.lineup-grid` of the 2 drivers, related articles). Notably simpler than driver pages — no career-stat-tiles block, no long prose bio, just one short paragraph.

**Violations**: Same missing-imagery issue (no team livery/car photo, only the color-tinted hero band + giant would-be numeral, though this file doesn't even show a `.profile-num` for teams). Team pages read as noticeably thinner/less cared-for than driver pages — worth deciding whether that's acceptable or whether team pages deserve the same investment (constructor history, car livery imagery, technical stats).
Found a **content bug** worth flagging regardless of redesign: the breadcrumb in `team-ferrari.html` reads `Home / Teams / Watch F1 / Ferrari` — an extraneous "Watch F1" breadcrumb link has been inserted incorrectly between Teams and Ferrari (line 60), likely a template copy-paste error propagated across all team pages.

**Recommendations**:
1. Fix the stray "Watch F1" breadcrumb link across all `team-*.html` pages (quick, mechanical fix — check whether it's baked into each file or comes from a shared partial/generator script in `scripts/`).
2. Bring team pages up to parity with driver pages: livery-colored full-width band behind the hero, car image, brief constructor history blurb.
3. Give `.lineup-grid` driver cards more presence (currently just number/name/points in a plain 2-item grid) — small driver headshot + team-accent bar would match the level of polish elsewhere.

### 9. News Index (`news.html`)

Not read line-by-line, but structurally this is very likely the same `articles-grid`/`article-preview-card` pattern as the homepage (shared classes). Any grid redesign done for the homepage (§1, recommendation 3) should be built as a reusable pattern applied here too, not a homepage-only special case.

### 10. About / Contact / Subscribe / Legal pages (`about.html`, `contact.html`, `subscribe.html`, `privacy-policy.html`)

These are short (130–235 lines), low-traffic utility pages. Not fully read, but given the shared header/footer/prose system, they'll inherit whatever sitewide typography and component fixes are made. Lowest priority for bespoke redesign work — the main win here is simply making sure the sitewide prose/typography pass (recommended in §3 and Roadmap Phase 1) reaches them too, so they don't look abandoned relative to a redesigned homepage/article template.

### 11. Championship Calculator (`championship-calculator.html`)

Not read in full — flagged as a template worth a dedicated follow-up pass given it's likely the most form/interaction-heavy page on the site (What-if scenario inputs), which makes it a strong candidate for the "Interest" bento-grid and micro-interaction guidance once the core visual system is settled.

---

## Cross-Cutting Sitewide Findings

1. **PRODUCT.md is stale on typography.** It states "Orbitron (display/masthead) + Chakra Petch (body)" but the actual codebase only loads Barlow Condensed + Chakra Petch — Orbitron isn't referenced anywhere. Decide deliberately whether to (a) update PRODUCT.md to match reality, or (b) actually bring in Orbitron for a more overtly "racing telemetry/HUD" display face — either is fine, but right now the documented brand identity and the implemented one disagree.
2. **No motion library at all** — everything is hand-rolled CSS keyframes + one `IntersectionObserver` fade. This is the fundamental gap versus the "extremely modern, cinematic, motion-rich" brief. Introducing GSAP (already covered by the `gsap-*` skills available in this environment) for scroll-triggered reveals, the championship-graph line-draw, and card entrance choreography is the highest-leverage technical change — it's additive (a `<script>` include), doesn't require a build step, and directly targets the stated goal.
3. **A prior "Stage 3: calm the page" editing pass stripped nearly all box-shadow/glow effects** (95 `box-shadow` declarations in the CSS, a large fraction literally set to `none` with a retirement comment). Any redesign should treat this as reintroducing *considered* depth (tinted shadows, soft glows on hover, the "double-bezel" nested-card technique) rather than assuming a from-scratch depth system needs inventing — the color/blur values these keyframes reference are still in the file as a starting point.
4. **Per-page bespoke CSS instead of a shared component library.** Race-report pages (`.dz-*`), driver pages (`.cst-*`), and likely others each define near-identical stat-tile/quote-card/timeline patterns inline, explicitly marked "do not reuse elsewhere." This is the actual root cause of inconsistency across ~40 content pages — consolidating these into `styles.css` should happen *before* any visual redesign, otherwise every visual change has to be manually re-applied to 20+ one-off style blocks.
5. **Zero imagery on the two highest-traffic surfaces** (homepage article grid, driver profile heroes) despite the repo already containing 30+ OG images and presumably driver/team assets. This is a content-serving gap, not just a CSS gap — the visual "cinematic" upgrade is bottlenecked on deciding what imagery pipeline populates these cards, not just on writing new CSS.
6. **Two real CSS bugs** (malformed `.search-section` nesting duplicating ~90 lines of rules; duplicated/broken `.category-tab` block) should be cleaned up as part of any styles.css rewrite regardless of the redesign direction — they're dead weight and a correctness risk, not just an aesthetic one.
7. **Reduced-motion coverage is inconsistent** — present for the hero and a few later-added components, absent for several older keyframes (`speedLine`, `shimmer`, `tabActivate`, `livePulse`). A full motion overhaul must apply `prefers-reduced-motion` blanket coverage to every new animation from day one, not retrofit it.
8. **A template/breadcrumb bug** ("Watch F1" wrongly inserted into team-page breadcrumbs) suggests these ~130 pages may be partially script-generated (the `scripts/` directory has `gen-*.py` files) — any redesign of shared markup should go through those generator scripts where they exist, rather than hand-editing each HTML file, to avoid the same class of copy-paste drift recurring.

---

## Prioritized Roadmap

### Phase 1 — Sitewide foundation (low risk, cascades to all ~130 pages)
1. Clean up the two CSS bugs (`.search-section` nesting, duplicated `.category-tab`) and delete dead keyframes (`glowPulse`, `progressGlow` if truly unused).
2. Consolidate `.dz-*` / `.cst-*` and other per-page bespoke component styles into `styles.css` as named, reusable classes (stat tile, quote card, radio/timeline card). Do this via the existing `scripts/` generators where the page was originally generated by one.
3. Reintroduce considered depth: tinted box-shadows and a "double-bezel" nested-card treatment for `.glass-card`, `.featured-article`, `.countdown-item`, replacing the flat `box-shadow: none` left by the Stage-3 pass.
4. Add GSAP (core + ScrollTrigger) as a shared `<script>` include; replace the single `IntersectionObserver` fade-in with staggered, blurred fade-up entrances for cards/sections sitewide, with `prefers-reduced-motion` handling built in from the start.
5. Fix the stray "Watch F1" breadcrumb bug across team pages.

### Phase 2 — Signature cinematic moments (the site's differentiators)
1. Championship graph: full-bleed showcase framing + scroll-triggered line-draw animation (`stroke-dashoffset`) + touch-friendly tooltips.
2. Homepage hero: layer current-headline typography over the existing car/track animation instead of the static "F1WOW NEWS" wordmark; reduce 6 CTAs to 2 primary + a secondary nav row.
3. Homepage/news article grid: real bento layout (1 large image card + medium image cards + dense text list) using the OG images that already exist per article.
4. Race Hub podium: rebuild as an actual staggered-height podium visualization with reveal animation.

### Phase 3 — Per-template polish
1. Driver profile: add portraits, extend `--team` accent color usage beyond the hero band, add a points-trend sparkline.
2. Team profile: parity pass with driver pages (livery imagery, constructor history blurb), matching visual weight.
3. Race report articles: header image per article, in-page jump nav for long articles, scroll-triggered gap-chart reveal (the `drawLine` keyframe already exists, unused).
4. Calendar: distinct "next race" hero card versus compact completed-round rows.
5. Utility pages (about/contact/subscribe/legal): verify they inherit Phase 1's typography/prose and component fixes cleanly; no bespoke work needed beyond that.
