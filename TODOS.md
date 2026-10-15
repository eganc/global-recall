# Global Recall — TODOs

Last updated: 2026-08-19

Where things stand and what's next. Anything durable — locked decisions, conventions,
architecture — lives in `CLAUDE.md` instead. Bugs and user feedback get triaged as FT-NNN
in [`docs/feedback-log.md`](docs/feedback-log.md).

---

## Status

The MapLibre rewrite shipped and took FT-008, FT-009, FT-010 and FT-011 with it. Lite Mode
became the Render Mode toggle (3D Globe / Flat Mercator), still keyed off `gr_lite_mode`
via `map.setProjection()`.

The app is code-complete for v1 and parked waiting on store accounts, not on engineering.
Last commit was 2026-07-09.

## Next

1. **Apple Developer Program enrollment and Google Play Console account.** DUNS went in
   back in May; both need a status check. Nothing ships until they clear.
2. **Verify FT-012 and FT-013 on a real iPhone.** The keyboard-viewport fix and the Daily
   target framing are both marked fixed-but-unverified. Do this before submitting — a
   keyboard bug on iOS is a 1-star first review.
3. **Feature graphic (1024×500) and phone screenshots.** The only real work left before
   submission. Sequence and copy are in `docs/aso-brief.md`.
4. **Submit.** Play internal track first — no review wait, and it proves the signed-bundle
   pipeline works. Then TestFlight, then production. Every console field is pre-answered
   in `docs/play-console-submission.md`.

After launch, the backlog is FT-005 (PWA install is missing the map style switcher — the
only unfixed bug), spaced repetition on missed countries, a visible fluency level on the
home screen, and FT-016 (async shared-seed race, the growth loop, gated on retention).

## Open — no FT number

- **Alias expansion.** Roughly 30–50 aliases per country today; the polish target is ~100
  (historical names, native scripts, common misspellings). Edit `RAW` in `play.html`.
  The 35 matching tests in `src/core.test.js` cover the engine — adding aliases is safe,
  restructuring the matcher is not.

- **A real stats screen.** `gr_recs`, `gr_sprint_best` and `gr_daily` all sit in
  localStorage and only surface as one-line stats on the mode tiles. An overlay that
  showed streak history, per-mode bests and which countries you keep missing would make
  progress visible — which is half the retention thesis.

## Tech debt

- **The `src/*.js` ↔ `play.html` mirrors.** Five blocks are duplicated between the
  testable ES modules and the inline runtime copy (search "Mirror of src/"). Keeping them
  in sync is manual and entirely on the author to remember. A build step would fix it at
  the cost of the no-build-step simplicity. Acceptable for now, but it's the thing most
  likely to cause a subtle "tests pass, prod is wrong" bug.
