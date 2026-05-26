# Global Recall

A daily-practice geography app that turns adults who feel mild shame about their geography knowledge into people who can actually name every country on Earth — using a 3D globe as a visual memory palace.

**Stage:** Live PWA at `globalrecall.themillrace.ca`. Pre-App-Store launch.
**Distribution:** Apple App Store + Google Play via Capacitor wrap (publisher: Millrace Inc., Canadian corp). DUNS submitted, Apple Developer Program enrollment pending. Bundle ID locked: `com.millrace.globalrecall`.
**Motivation:** Incidental income / studio side-project. Realistic target $300–$2K/mo within 6–12 months; stretch path ~$5K/mo if Daily mode catches.

## Stack

- **Frontend:** Single `index.html`, vanilla JS, no framework, no build step.
- **Map rendering:** `globe.gl` (built on three-globe / Three.js), loaded from unpkg CDN. **Actively being replaced with MapLibre GL JS** — read `docs/maplibre-migration-plan.md` before touching the map layer.
- **Backend:** None. Pure client-side game. No accounts, no sync.
- **Persistence:** `localStorage`, wrapped behind `src/storage.js` (mirrored inline in `index.html`). Schema v2 with migration runner.
- **Hosting:** Vercel, auto-deploys from `main`. Service worker (`sw.js`) for offline + cache invalidation.
- **Tests:** Vitest. ES modules in `src/` for testable helpers, mirrored inline in `index.html` (no build step).
- **App-store wrapper:** Capacitor (not yet integrated; planned after the MapLibre migration lands).
- **Analytics:** None yet. v1: UTM tags + App Store Connect / Google Play Console install/retention. v1.1: Plausible (~$9/mo) when event-level data is wanted.

Don't suggest switching the rendering library, backend posture, auth posture, or hosting without being asked — those are settled. Specifically don't suggest TypeScript migration, moving to Firebase / Supabase / any database, or adding a framework (React, Vue, Svelte). Splitting code across more files, introducing a build step, or restructuring the project layout are open conversations — propose them when there's a concrete benefit, but always as a "want me to do this?" question, not unilaterally.

## Architecture

### Data model (per-device, localStorage)

All keys under the `gr_` prefix. Read/write only through the `Storage` module — never direct `localStorage` calls in feature code.

- `gr_schema_version` — integer. Migration runner walks v0 → SCHEMA_VERSION on every boot.
- `gr_ghost` — Name All replay blob (`{ countries, timestamps, totalTime }`).
- `gr_recs` — per-mode records (`{ name_all: { best, best_time, runs } }`).
- `gr_sprint_best` — integer.
- `gr_daily` — `{ lastDay, streak, longestStreak, lastScore, lastTotal }`.
- `gr_style` — selected globe style.
- `gr_install_dismissed` — PWA install-banner snooze timestamp.
- `gr_lite_mode` — boolean | null. null = auto-detect on first boot.

### Key flows

- **Daily mode** is the retention engine. 10 date-seeded countries per UTC day. Streak increments on consecutive plays, resets on any gap, once-per-day idempotent.
- **Name All** is the showcase mode — 195 countries from memory. Ghost replay system lets you race a prior run.
- **Sprint** is a 5-minute countdown for fluency drilling.
- **Easy Mode** (multiple-choice with continent hint) is for kids / brand-new users.

### Architectural decisions (locked — do not revisit mid-build)

- **Per-device storage only.** No backend, no auth, no cloud sync, no leaderboard. All "streak" / "longest" / "records" are per-device. Will revisit only when real users ask for sync.
- **Storage abstraction is the migration path.** The day cloud sync becomes a real ask, only `src/storage.js` + its inline mirror change. Every feature reads/writes through it.
- **Schema versioning is load-bearing.** Returning users must walk through every migration cleanly. Never rewrite an existing migration; only add new ones.
- **Daily seeding depends on stable country order + launch date constant** (`Date.UTC(2026, 4, 12)` in `getDailyNumber`). Changing either breaks streaks for existing users.
- **Country aliases are tuned for typo tolerance.** The `RAW` array + alias lists in `index.html` are mature (29 tests in `src/core.test.js` cover the matching). Adding aliases is fine; restructuring the matching engine requires care.
- **Publisher = Millrace Inc., bundle = `com.millrace.globalrecall`.** One-shot at first store submission. Don't change.

### Current code organization (historical, not religious)

The game lives in a single `index.html` with testable helpers in `src/*.js` mirrored inline. This is **how the project currently is**, not a rule. The owner prefers a tidy codebase and is open to splitting things out (more files, a build step, normal ES module imports without the inline mirror duplication) when it serves a concrete benefit. If you see code that would clearly be cleaner if extracted, propose it as a "want me to do this?" question with a one-line benefit — don't just refactor unilaterally, and don't religiously preserve the single-file pattern either.

## Project structure

```
index.html          ~2100 lines. The game.
sw.js               Service worker. Bump CACHE version on every shipped change.
manifest.json       PWA manifest.
src/
  core.js           Matching engine (norm, lev, findMatch, seededShuffle).
  core.test.js      29 tests.
  storage.js        Persistence layer + schema migration runner.
  storage.test.js   32 tests.
docs/
  product-brief.md            The product thesis. Read for "why" questions.
  stack-decision.md           Locked stack decisions (Capacitor, Millrace, etc.).
  feedback-log.md             Triage log. FT-NNN issue numbers.
  maplibre-migration-plan.md  Active rewrite plan. READ BEFORE TOUCHING THE MAP LAYER.
package.json        vitest dev dep only. No build, no bundler.
```

Key conventions:
- Testable code currently goes in `src/*.js` as ES modules and is mirrored inline in `index.html` (search for "Mirror of src/" comments). When you edit one, you edit both. This duplication exists because there's no build step yet — it's not a virtue, just current reality. If you want to propose a build step that eliminates it, that's a fine conversation.
- Service worker cache name must bump on every shipped change or users get stale code. Pattern: `global-recall-vN`.

## Commands

- `npm test` — runs vitest once. All tests must pass before shipping.
- `git push origin main` — production deploy. The static host auto-deploys from main.
- No build, no dev server. Open `index.html` directly or use any static server.

## MVP scope

**In scope (next sessions):**
- FT-008 fix via MapLibre migration (see `docs/maplibre-migration-plan.md`).
- Polished Daily share card (canvas image, currently text-only).
- Spaced repetition on missed countries.
- Visible fluency level on home screen.
- Capacitor wrap + first TestFlight + Google Play internal-track submissions.

**Explicitly out of scope (do not implement or scaffold for):**
- Capitals, flags, US states, regions, mountain ranges — all multi-domain expansion. Only after the core daily-habit loop is proven.
- Multiplayer / tournaments / friend leaderboards.
- Account system / cloud sync.
- Paid tier / monetization plumbing.
- Native rewrite (React Native, Flutter) — Capacitor wrapper is the decided path.
- Build step / bundler / framework migration.

**The core hypothesis:** adults who feel mild shame about their geography will form a daily-practice habit when the streak gives them something to defend, the spaced repetition makes progress visible, and the 3D globe makes the knowledge stick — and a non-trivial fraction will share results because "I can name every country on Earth" is a flex worth posting.

## Conventions

- **Don't sound like an AI wrote it.** This applies to code comments, commit messages, and conversational replies. The tells to avoid: excessive enthusiasm ("Great question!", "Absolutely!"), restating the user's question before answering, hedging everywhere ("might potentially..."), bullet vomit when prose would be clearer, decorative emojis used as visual flair, closing pleasantries ("Let me know if you have any other questions!"). The owner DOES use emojis in conversation — that's fine and not the point. The point is voice: sound like a builder explaining their work to another builder, not like a polished documentation deliverable.
- **Commit messages: tight headline, context paragraph(s) explaining WHY.** Look at recent commits for the voice. No emoji in commit text. No marketing tone.
- **Co-author trailer on all AI-assisted commits:** `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
- **UI copy emojis are deliberate** (🔥 ⊕ ◎ 📅 🌃 ⚡ etc.) — part of the brutalist visual language. Keep them where they exist; add new ones only as deliberate UI choices, not as decoration.
- **Service worker cache version bumps on every shipped change.** Otherwise users get stale code.
- **No analytics / telemetry libraries** until the v1.1 Plausible step in the stack decision.
- **No stray `console.log`** in shipped code. `console.error` for genuine error paths is fine.

## Ask before doing

- Any change to the Storage schema (would need a v3 migration).
- Any change to the country list, aliases, or the daily seeding algorithm (would break returning users' streaks).
- Adding any external dependency to `index.html` (every script tag is a privacy / perf / availability cost).
- Anything that would introduce a build step.
- Anything that touches the bundle ID, app name, or App Store / Play Store listing.
- Closing FT-008, FT-009, FT-010, or FT-011 — verify with the user first.

## Active context

A MapLibre GL rewrite is in progress to fix FT-008 (3D globe at 3–4 FPS on weak GPUs — confirmed on a Chromebook). Read `docs/maplibre-migration-plan.md` before touching `index.html`'s map layer. The shipped Lite Mode (commit `c994ea2`) helps idle but doesn't bridge the gap — it stays in the codebase until the rewrite lands, then gets repurposed as the Render Mode toggle (3D Globe / Flat Globe).

Two known bugs to address during or after the rewrite:
- **FT-010** — China highlights green but the input text doesn't clear.
- **FT-011** — typing an already-named country gives zero feedback.
