# Feedback Log

## Triage Batch — 2026-05-15 (Mia Hlywa + Milo Cheung, iMessage)

### Do Now
- [x] **[Bug]** Daily mode submits/dismisses before user finishes typing a full country name (FT-001)
- [x] **[Bug]** Daily mode "Next" button fails intermittently — user can't advance (FT-002)
- [x] **[Bug]** Easy Mode sometimes doesn't highlight the target country on the globe — likely the known highlight-layer z-fighting (FT-003) — fixed: getAltitude now lifts _dailyTarget and _kidsTarget polygons, not just _named
- [ ] **[Bug]** PWA-installed app missing the map style switcher present on web (FT-005)

### Backlog
- [ ] **[Feature]** Reveal the chosen country's true location on the globe after a wrong Easy-mode answer — supports memory-palace thesis (FT-004)

### Monitor
- [ ] **[Polish]** Sprint scoring is gameable by typing short country names first — consider weighting or alphabetical fairness if Sprint becomes a focus mode (FT-006)
- [ ] **[Feature]** Landmass-based Sprint variants (biggest-first, smallest-first) — fun but deferred until core daily-habit loop is proven (FT-007)

## Triage Batch — 2026-05-25 (Milo Cheung, son, verified on Chromebook)

### Do Now
- [x] **[Bug]** Globe near-unusable on modern Chromebook + weak Android tablets — profile FPS / draw calls, ship a Lite Mode (no atmosphere, no auto-rotate, simplified polygon rendering, auto-detect low-end devices) (FT-008) — resolved by the MapLibre GL migration (vector-tile rendering replaces the per-country mesh cost); see `docs/maplibre-migration-plan.md`

### Monitor
- [x] **[Feature]** Flat 2D map fallback for devices that can't run the 3D globe — son's explicit ask; only revisit if FT-008 perf work can't reach acceptable on weak devices (FT-009) — shipped as the Render Mode toggle (3D Globe / Flat Mercator), same `gr_lite_mode` key, `map.setProjection()` under the hood

## Triage Batch — 2026-05-26 (Egan, during Lite Mode Chromebook testing)

### Do Now
- [x] **[Bug]** China highlights green on correct match but the input text box doesn't clear — verified resolved by the MapLibre migration; tested on prod (FT-010)
- [x] **[Polish]** Typing a country that's already been named gives zero feedback — verified resolved by the MapLibre migration (FT-011)

## Triage Batch — 2026-06-04 (Egan, watching kids' friends play; iPhone + Android)

### Do Now
- [x] **[Bug]** iPhone: keyboard pushed header + country off the top. Fixed — `#app` is now `position:fixed`, sized live from `visualViewport` (commit dd7c476 / 276e1fa). **Pending iPhone device verification.** (FT-012)
- [x] **[Bug]** Daily targets rendered inconsistently + camera didn't frame them. Fixed two ways: (1) daily/kids targets get 0.85 fill + 2px outline, and the paint expression was de-duplicated so a style swap no longer reverts it; (2) Daily converted to the identify engine — one bright target at a time, camera flies to each. **Pending device verification.** (FT-013)
- [x] **[UX]** Home flow: mode tiles now launch immediately; ⌂ MAIN MENU in hamburger + logo tap go home (commit 276e1fa). (FT-014)
- [x] **[UX]** Hint flow: idle auto-strike removed; explicit HINT (tap-to-escalate) + SKIP buttons added; capital pin already drops on the map (commit 276e1fa). (FT-015)

### Done this batch (verify on device)
- [x] **[Coherence]** Daily converted from recall ("name any of 10") to identify ("name the highlighted one, one at a time") — now consistent with Strict/Sprint. Seeding untouched. Daily seeding extracted to `src/core.js` + 6 tests (commit b04e481). **Verify the daily streak still increments and the share card still reads right.**
- [x] **[Polish]** NES/8-bit loading screen — spinning pixel globe with blips, NOW LOADING blink, segmented bar, scanlines (FT-017, commit dd7c476).

### Backlog
- [ ] **[Feature]** Async head-to-head "shared-seed race." Sprint seed encoded in the share URL (`?r=<seed36>&s=<score>&i=<initials>`) so a friend replays the identical country sequence; the link carries the score to beat. Tier 1 = pure client-side, conversation rides the players' own chat app (zero backend). Tier 2 = optional 24h "race room" in Upstash (`race:<seed>` key with EXPIRE) for a shared mini-scoreboard, reusing the existing leaderboard Vercel-function pattern. Deferred per sequencing — build after daily-retention is validated. This is the agreed monetization wedge: free async racing as growth; paid tier reserved for genuinely-costs-to-scale features (live realtime races, cloud/cross-device save, private friend boards), opt-in, off by default (FT-016)
- [ ] **[Polish]** NES/8-bit loading screen — pixel globe that rotates with country blips lighting up, blinking "NOW LOADING", segmented progress bar. Pure inline CSS/canvas, no new deps, must work offline (PWA). Owner is enthusiastic; do as a focused visual pass with a look-then-tweak round (FT-017)

### Strategic notes (not tickets)
- **Identify > Recall as the product goal.** Knowing *where* a country is matters more than rattling off names. The targeting modes (Strict, Sprint, Daily) are the coherent spine and should all work the same identify way; "Global Recall" stays as the name; the recall/free-order framing becomes the flex/trophy layer (Name All). Future direction: regional Sprint ladder (Sprint: Europe → Africa → … → World → Strict) for replayable variety + visible fluency progression. Owner endorsed identify-as-goal; reposition Easy mode as onboarding rather than a peer mode.
- **Monetization line is now intentionally open** (was locked out in CLAUDE.md). Owner OK to cross it: opt-in, premium content off/unavailable by default. Still deferred until retention is proven. Update CLAUDE.md's locked-decisions section when monetization work actually starts.
