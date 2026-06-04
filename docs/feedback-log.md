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
- [ ] **[Bug]** Globe near-unusable on modern Chromebook + weak Android tablets — profile FPS / draw calls, ship a Lite Mode (no atmosphere, no auto-rotate, simplified polygon rendering, auto-detect low-end devices) (FT-008)

### Monitor
- [ ] **[Feature]** Flat 2D map fallback for devices that can't run the 3D globe — son's explicit ask; only revisit if FT-008 perf work can't reach acceptable on weak devices (FT-009)

## Triage Batch — 2026-05-26 (Egan, during Lite Mode Chromebook testing)

### Do Now
- [x] **[Bug]** China highlights green on correct match but the input text box doesn't clear — verified resolved by the MapLibre migration; tested on prod (FT-010)
- [x] **[Polish]** Typing a country that's already been named gives zero feedback — verified resolved by the MapLibre migration (FT-011)

## Triage Batch — 2026-06-04 (Egan, watching kids' friends play; iPhone + Android)

### Do Now
- [ ] **[Bug]** iPhone: when the keyboard opens, the header + highlighted country scroll off the top of the screen. Android is fine. Cause: the `interactive-widget=resizes-content` meta tag (the Android fix) is Chromium-only; iOS Safari ignores it and scrolls the page instead. Fix: drive `#app` height from `visualViewport` in JS on both platforms (FT-012)
- [ ] **[Bug]** Daily mode: camera doesn't frame the target countries on start, and some targets render solid yellow while others read as outline-only. Cause: Daily paints all 10 at once at 0.55 opacity with no border case and only jumps the camera to country #1 — unlike Strict/Sprint/Easy which focus one bright target at a time and fly to it. Fix: focus the active/nearest unnamed target (bright fill + border), fly to it on start and after each correct answer (FT-013)
- [ ] **[UX]** Home screen: players tap the mode tile expecting it to start; nobody presses START GAME. Also no way back to home mid-game (only End Game → Menu). Fix: tile tap launches the mode immediately; add a ⌂ MAIN MENU item to the hamburger and make the logo tap go home (FT-014)
- [ ] **[UX]** Hint flow: in Sprint the idle auto-hint fires too fast (5s) and silently burns a strike. Players want control. Fix: replace the silent idle auto-strike with explicit HINT (tap-to-escalate: capital pin → first letter+length → reveal) and SKIP buttons. Capital-on-map already exists via `showCapitalPin` — lean on it so the text box hides less of the map (FT-015)

### Backlog
- [ ] **[Feature]** Async head-to-head "shared-seed race." Sprint seed encoded in the share URL (`?r=<seed36>&s=<score>&i=<initials>`) so a friend replays the identical country sequence; the link carries the score to beat. Tier 1 = pure client-side, conversation rides the players' own chat app (zero backend). Tier 2 = optional 24h "race room" in Upstash (`race:<seed>` key with EXPIRE) for a shared mini-scoreboard, reusing the existing leaderboard Vercel-function pattern. Deferred per sequencing — build after daily-retention is validated. This is the agreed monetization wedge: free async racing as growth; paid tier reserved for genuinely-costs-to-scale features (live realtime races, cloud/cross-device save, private friend boards), opt-in, off by default (FT-016)
- [ ] **[Polish]** NES/8-bit loading screen — pixel globe that rotates with country blips lighting up, blinking "NOW LOADING", segmented progress bar. Pure inline CSS/canvas, no new deps, must work offline (PWA). Owner is enthusiastic; do as a focused visual pass with a look-then-tweak round (FT-017)

### Strategic notes (not tickets)
- **Identify > Recall as the product goal.** Knowing *where* a country is matters more than rattling off names. The targeting modes (Strict, Sprint, Daily) are the coherent spine and should all work the same identify way; "Global Recall" stays as the name; the recall/free-order framing becomes the flex/trophy layer (Name All). Future direction: regional Sprint ladder (Sprint: Europe → Africa → … → World → Strict) for replayable variety + visible fluency progression. Owner endorsed identify-as-goal; reposition Easy mode as onboarding rather than a peer mode.
- **Monetization line is now intentionally open** (was locked out in CLAUDE.md). Owner OK to cross it: opt-in, premium content off/unavailable by default. Still deferred until retention is proven. Update CLAUDE.md's locked-decisions section when monetization work actually starts.
