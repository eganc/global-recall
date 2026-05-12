# Global Recall — TODOs

Last updated: 2026-05-12

---

## Done

### Onboarding & UX
- [x] Portrait layout support (manifest `orientation: any`, CSS media query)
- [x] First-load start menu with 2×2 bento grid mode selector (replaces old onboarding overlay)
- [x] Install banner snoozes 7 days instead of permanent dismiss; menu has "📲 INSTALL APP" entry

### Game modes
- [x] **Name All** — original 195-country mode
- [x] **Sprint** — 5-minute countdown, PB tracked, auto-next on by default
- [x] **Daily Challenge** — 10 date-seeded countries, amber globe highlights, streak tracking, share-result button
- [x] **Kids Mode** — multiple choice, continent hint, globe highlights target

### Performance
- [x] HUD loop throttled to 1fps (eliminates 60fps DOM writes)
- [x] Globe auto-rotate pauses on input focus
- [x] SW precache trimmed (night/dark textures lazy-cached on first style switch)

### Code quality
- [x] `src/core.js` + Vitest harness — 29 tests for norm/lev/fmt/findMatch/seededShuffle
- [x] `applyMode()` helper extracted; removes ~14 lines of duplication between `setMode` and `launchFromMenu`
- [x] `node_modules/` added to `.gitignore`
- [x] Both inline matching and seededShuffle in index.html flagged as mirrors of `src/core.js`

---

## Open

### Content
- [ ] **Alias expansion** — currently ~30–50 aliases per country. Phase 3 polish target is ~100 per country (historical names, native scripts, common misspellings). Edit `RAW` in `index.html`.

### Features worth considering
- [ ] **Share card image** — Canvas CORS already verified (jsDelivr serves with `Access-Control-Allow-Origin: *`). Could render an end-of-game image to the clipboard for social sharing.
- [ ] **Ghost replay** — placeholder hook exists at `startGame()` (`// TODO: ghost replay hooks in here`). The ghost data is already saved and shared as URL params, but it doesn't actually animate during play yet.
- [ ] **Stats page** — `gr_recs`, `gr_sprint_best`, `gr_daily` all sit in localStorage. A "view stats" overlay could surface them.

### Tech debt (low priority)
- [ ] The matching engine and `seededShuffle` are duplicated between `index.html` (runtime) and `src/core.js` (tests). Keeping them in sync is manual — a build step could fix this, but adding one defeats the "single HTML file" simplicity. Acceptable for now.
- [ ] `getDailyNumber()` uses a hardcoded launch date (`Date.UTC(2026, 4, 12)`). If launch shifts, update this.
