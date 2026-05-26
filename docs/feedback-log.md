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
