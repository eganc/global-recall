# Stack Decision: Global Recall

**Distribution target:** Apple App Store + Google Play (primary). Web PWA continues as the dev surface and as a secondary install channel.
**Motivation mode:** incidental income / studio side-project. The brief sizes the realistic steady-state outcome at $300–$2K/mo within 6–12 months, with a stretch path to ~$5K/mo if Daily catches.

---

## Context: this is not a greenfield stack decision

Global Recall already exists and works. Single `index.html`, vanilla JS, three-globe via CDN, service worker for offline, `localStorage` for state. That stack has served well — single-file architecture is a real superpower for an indie tool and should not be torn up. The brief explicitly flags this and says "build state in a shape that *could* migrate to a backend later without a rewrite."

So the question this doc actually answers is: **what does the existing stack need to absorb to ship to the app stores and run the Duolingo loop (streak, SR, fluency, share card)?** Not "what should we build with?"

---

## The stack

- **Frontend:** Vanilla HTML/JS/CSS, single `index.html`. **Unchanged** (no framework). Map rendering swapped from three-globe to **MapLibre GL JS** (CDN) in 2026-06 — see `docs/maplibre-migration-plan.md` — to fix FT-008 (globe unusable on weak GPUs) and add the Flat Mercator render mode. Adding a framework now would still burn weeks for negative product value.
- **Backend:** None for v1. All game state is client-side. *(See "Architectural decisions" — the Storage abstraction is the migration path.)*
- **Database:** `localStorage`, wrapped behind a single `Storage` module so the persistence surface is one swappable file when sync becomes a real need (post-traction).
- **Auth:** None for v1. The brief explicitly defers account/sync until users ask. Auth is one-shot risk HIGH — don't add it speculatively.
- **Hosting (web):** Vercel for the PWA. Single static deploy from `main`. No serverless functions needed yet.
- **App store wrapper:** **Capacitor** for both iOS and Google Play. Single codebase, wraps the existing PWA, lets us add native APIs incrementally (haptics on streak claim, ATT prompt on iOS, share sheet) without rewriting the game.
- **Payments:** N/A for v1 — brief says "keep it free until traction is real."
- **Analytics:** **UTM-tagged share URLs + App Store Connect / Google Play Console for v1.** Zero cost, zero ops, covers the two questions the brief actually needs answered ("what's the organic install baseline" and "does the share card cause click-throughs"). **Plausible (~$9/mo)** is lined up for the day we want event-level questions ("what % of new users finished their first Daily", "what % switched to Atlas") — add it only when there's something to learn from it.
- **Share card image:** Already client-side `<canvas>` → PNG. Stays that way. No backend image rendering.
- **Key dependencies:** MapLibre GL JS (CDN, pinned via SW cache), vitest (dev), Capacitor core + iOS + Android plugins (when wrapping starts).

---

## Deviations from default

- **No Firebase, no Firestore, no Cloud Functions.** The product has zero server-side state and no auth. Adding Firebase now would be speculative tooling. When sync becomes a real user request, Firestore (or a single Postgres row keyed by an anonymous device ID) is the migration target — not a v1 requirement.
- **No Next.js.** The single-HTML-file architecture is part of why this app has been shippable in evenings. A Next.js migration is a multi-week tax with no product benefit unless we need server-rendered share cards or per-user routing — neither is on the roadmap.
- **Capacitor over React Native / Flutter / native.** Per the skill's mobile decision tree: no offline-only requirement beyond what the SW already gives, no critical device hardware (the share API exists in web, optional native enhancement later). Capacitor is the right wrapper because it preserves the existing single-page app and the iteration loop stays "edit index.html, refresh."
- **No TWA-only Android path.** Tempting (cheapest path to Google Play) but it splits the iOS and Android stories and forces us to maintain two distribution strategies. Capacitor for both is worth the small iOS overhead.

---

## Architectural decisions in this stack

These are the calls that are expensive to undo. Each one is a candidate for `/eng-review` to lock in before code touches them.

1. **Persistence abstraction (`src/storage.js`).** Extract every `localStorage.getItem`/`setItem`/`removeItem` call in `index.html` behind a single typed module: `Storage.getStreak()`, `Storage.recordDailyResult(date, result)`, `Storage.getCountryStats()`, etc. Keys, shapes, and a `schemaVersion` field live in this module. **Why architectural:** every feature in the next phase (streak, SR, fluency level, share card) writes to persistent state. If they write directly to `localStorage` with ad-hoc keys, migrating to cloud sync later means rewriting every feature. One-shot risk MEDIUM.

2. **State schema versioning.** The persisted blob (or set of blobs) must carry a `schemaVersion` integer from day 1, and the Storage module must read+migrate on load. Without this, the first time we change the streak shape or add a field, returning users lose their streak. One-shot risk HIGH for retention.

3. **Publisher and bundle identifier — locked to Millrace Inc.** App Store Connect enrollment as **Organization (Millrace Inc., Canadian corp)**; Google Play Console enrollment as the same legal entity. Bundle ID: **`com.millrace.globalrecall`**. Apple Org enrollment requires a DUNS number — requested today via Apple's free intake form ([developer.apple.com/support/D-U-N-S](https://developer.apple.com/support/D-U-N-S/)), ~5–14 business day lead time, runs in parallel with the Storage/streak/share-card build. Bundle ID is one-shot per store; renaming = new listing and lost reviews. Note: the existing share-card URL already says `globalrecall.themillrace.ca`, so the studio name is already user-facing — this just makes it consistent across stores. One-shot risk HIGH.

4. **App display name + icon + screenshots (ASO inputs).** Brief flags ASO as the primary distribution channel. The listing copy, keyword set, and screenshot plan should be locked in via `/aso-brief` before submission — the listing is the engine. Renaming the app post-launch destroys ranking signal. One-shot risk HIGH.

5. **Anonymous device-level analytics, ATT-free.** On iOS, any tracker that hashes the user, collects IDFA, or makes precise behavior trails will trigger App Tracking Transparency and tank opt-in rates. Plausible/Umami stay below that threshold. If we ever add per-user telemetry, ATT becomes a separate design problem.

6. **Web PWA vs wrapped app — same code, different shipping cadence.** The web PWA can ship hourly via `git push`. The wrapped iOS/Android apps require a full store review (1–7 days). Feature flags or a `runtime: 'web' | 'ios' | 'android'` switch in the Storage/share module will be needed so we don't accidentally ship a web change that breaks an in-flight store review. Low one-shot risk but worth designing in early.

---

## What this stack is optimized for

**Shipping the existing game to both app stores within weeks, not months, while keeping the iteration speed that makes evening-session development possible.** The cost is that we are explicitly not building for scale, multi-device sync, or team accounts — those are deferred until usage data justifies them.

---

## What to set up first

In strict order. Each one unblocks the next.

1. **Storage abstraction module** (`src/storage.js`) — extract every existing `localStorage` call into a typed module with a `schemaVersion` field and a migration runner. Add tests in `src/storage.test.js`. This is the prerequisite for the streak + SR + fluency features in the brief's Next Steps. *(~1 session.)*
2. **Streak mechanic on top of the new Storage module** — days-in-a-row counter, home-screen display, included in share card. Brief calls this the retention engine. *(~1–2 sessions.)*
3. **Polished Daily-mode share card** including streak — single most important artifact in the distribution loop. *(~1 session, this is mostly canvas + design work.)*
4. **Run `/aso-brief`** — keyword strategy, listing copy, screenshot plan, category, pricing locked before the first store submission. Skill exists; use it.
5. **Capacitor wrap + first TestFlight + Google Play internal-track build** — get a real binary into both stores' review pipelines while the streak/share-card work continues. The first submission has the longest lead time; start it the day step 3 is done.

Spaced repetition and visible fluency level (brief's Next Steps 3c, 3d) land *after* the first store builds are submitted — they improve retention but the listing can go live without them.
