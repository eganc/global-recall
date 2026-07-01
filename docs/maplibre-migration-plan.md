# MapLibre GL Migration Plan

> **Status:** Shipped. Live on `main` / production.
> **Decision date:** 2026-05-26
> **Driver:** FT-008 (globe near-unusable on Chromebook + weak Android devices)
> **Reference:** [GitHub issue #1](https://github.com/eganc/global-recall/issues/1)

This doc is the durable hand-off for a multi-session rewrite. Read it cold; it tells you
everything you need to start without re-deriving the prior conversation.

---

## TL;DR

We are replacing the current globe rendering layer — `globe.gl` (built on three-globe /
Three.js) — with **MapLibre GL JS** running its native `projection: 'globe'` mode, with
a `projection: 'mercator'` (or orthographic) toggle as the "Flat Map" mode for low-end
devices and for users who prefer 2D.

The game logic, country data, matching engine, modes, Storage module, streak HUD, share
card, and PWA infrastructure all stay. Only the **map rendering layer** is being swapped.

---

## Why this rewrite — the decision and what it replaces

### The driver: FT-008

Profiled on a real Chromebook. The 3D globe ran at 3–4 FPS at idle. The root cause turned
out to be specifically the **per-mesh WebGL draw-call overhead of globe.gl's polygon
rendering** — 195 country polygons = 195 separate THREE.Mesh objects. Confirmed by:

- `myGlobe.polygonsData([])` → instantly 60 FPS
- `myGlobe.showAtmosphere(false)` → 4 → 6.6 FPS (~2× win; secondary cost)
- `myGlobe.polygonStrokeColor(()=> transparent)` → no improvement
- `myGlobe.polygonAltitude(()=> 0)` → no improvement

The cap mesh itself is the expensive primitive on integrated GPUs. No amount of
side/stroke/altitude tweaking saves us.

### Why the Lite Mode (commit c994ea2) wasn't enough

The shipped Lite Mode reduces idle to 60 FPS by removing unhighlighted polygons from
the scene, but mid-game falls off a cliff as polygons accumulate:

- 0 named → 58.8 FPS
- 7 named → 19 FPS
- 21 named → 11 FPS
- 40 named → 3.3 FPS

Lite Mode helps idle and very-early-game on weak devices, but doesn't bridge the gap.
It stays in the codebase as a quick win for users on capable devices that still want
the lightest experience, but is **not the FT-008 fix**.

### Why MapLibre GL specifically — and why not the alternatives

| Option | Verdict | Why |
|---|---|---|
| **MapLibre GL** | **Picked** | Free, open-source, ~200KB. Vector tiles → infinite zoom quality. Native 3D globe (`projection: 'globe'`) + 2D mercator/orthographic toggle in **one library**. Layer-based country highlights via style expressions — no per-feature mesh count problem. Runs smooth on weak GPUs because tile-based rendering only draws what's visible. |
| Mapbox GL JS | Rejected | Same tech as MapLibre but non-OSS since v2 and has commercial usage limits. We want free. |
| CesiumJS | Rejected | Industrial-grade but ~3MB bundle and many features we don't need. Overkill. |
| Stay on globe.gl, drop into THREE scene, merge cap meshes into one | Rejected | Solves perf but not zoom quality (textures still pixelate). Doesn't give us 2D fallback. Half-measure. |
| globe.gl + texture-overlay rewrite | Rejected | Same — solves perf, not zoom quality, not 2D. |
| d3-geo + Canvas2D for 2D mode only, keep globe.gl for 3D | Rejected | Two render pipelines to maintain. MapLibre gives us both in one library. |

### What we get from the rewrite that we didn't have before

1. **Perf on weak devices.** Vector tile rendering at 60 FPS on Chromebook-class hardware.
2. **Infinite zoom quality.** Currently the satellite/night textures look low-res when
   zoomed in (user complaint pre-dating FT-008). Vector tiles render at any resolution.
3. **3D globe + 2D map in one library.** The "Flat Globe" mode son asked for (FT-009)
   comes for free — same library, different `projection` setting. No second render path.
4. **Foundation for future "geography modes."** Orthographic, Mercator, Robinson,
   Winkel-Tripel projections all available via MapLibre's projection system. Sets up
   future product moves like "this is the map you grew up on, and here's the equal-area
   truth" educational content.
5. **Smaller install footprint.** Removes the ~500KB satellite JPG textures we ship for
   each style preset. MapLibre + a self-hosted PMTiles file is comparable or smaller.

---

## What stays vs what gets replaced

### Stays — do not touch

| Item | Where | Why |
|---|---|---|
| Matching engine | `src/core.js`, inline mirror in `index.html` | 29 tests pass, mature, country aliases tuned. |
| Persistence layer | `src/storage.js`, inline mirror in `index.html`, schema v2 | Returning users have streaks, longestStreak, etc. Migration runner must keep working. |
| Country data | `RAW` array in `index.html` | 195 countries, ~30-50 aliases each, daily seeding depends on stable order. |
| Game modes | All four: Name All, Sprint (5min), Daily (10), Easy (multiple-choice) | Product surface. Each mode keeps its rules. |
| Streak HUD | Home-screen row + share text + new-best banner | Shipped in c199a35. Just point it at the new map for the visual feedback. |
| Ghost system | Name All replay via `gr_ghost` | Shipped. Storage already abstracts it. |
| Service worker | `sw.js` | Update cache list to include MapLibre + PMTiles instead of three-globe + JPGs. Bump cache version. |
| Single-HTML-file architecture | `index.html` + a few `src/*.js` modules mirrored inline | This is part of the project's iteration-speed thesis. Don't introduce a build step. |
| Vitest test setup | `package.json` + `src/*.test.js` | 61 tests across 2 files. Keep adding tests for the new map layer's pure helpers. |
| Capacitor wrap target | `com.millrace.globalrecall`, Apple/Google org enrollment | Stack decision is locked. DUNS requested. |

### Replaces — actively rip out

| Item | Where | Replace with |
|---|---|---|
| `globe.gl` script tag | `index.html:607` | `maplibre-gl` script + CSS |
| `myGlobe = Globe()(el)` + `initGlobe()` | `index.html:1431+` | `new maplibregl.Map({ container, style, projection: 'globe' })` |
| `STYLES.{atlas,blue,night,dark}` with `globeImageUrl` | `index.html:1115+` | MapLibre style JSON specs — at minimum: an Atlas-style parchment political map + a satellite-style. Style preferences still persist via `Storage.getStyle/saveStyle`. |
| Polygon mesh rendering (`polygonsData`, `polygonCapColor`, etc.) | `refreshGlobe`, `pushPolygons`, `visiblePolygons` | MapLibre layer styling — country fill/border colors driven by feature-state expressions. **Zero per-country meshes.** |
| Solid-color texture helper | `solidColorTexture()` | Not needed — MapLibre paints fills via style. |
| Lite Mode polygon filtering | `liteMode` branch in `visiblePolygons`, `refreshGlobe`, `initGlobe` | Lite Mode becomes a **render mode**: "3D Globe" vs "Flat Globe". Same `gr_lite_mode` Storage key, repurposed. Auto-detect still routes weak devices to Flat Globe. |
| `flyToFeature` (globe.gl pointOfView) | `index.html:1392` | `map.flyTo({ center: [lng, lat], zoom: N })` |
| Blink loop's per-frame `refreshGlobe` | `startBlink`, `refreshGlobe` | MapLibre layer paint property update (`setPaintProperty`) on the target — much cheaper, runs on any GPU. May be able to keep the blink ON in flat mode now. |
| Satellite JPG fetches | three-globe CDN URLs in `STYLES` | Self-hosted PMTiles file (one binary, all zoom levels included) OR a tile provider. |

### Open decisions to nail down at the start of the next session

These don't need to be decided in this plan doc — but they're the first questions to
answer when implementation begins. Don't start coding until they're picked.

1. **Tile source.** Three real options:
   - **Self-hosted Protomaps PMTiles** (`.pmtiles` file shipped statically, served by any
     static host including Vercel. Single binary, all zoom levels.). Fits our deploy story
     perfectly. ~50-200MB depending on detail level.
   - **MapTiler free tier** (100k requests/mo, has nice basemaps including political
     atlas-style). Trivial to wire up, but adds a third-party dependency and an API key.
   - **OpenStreetMap raster tiles** (free, no key, but fair-use limits and raster-only —
     loses some of the vector-rendering quality win).

   Recommended starting point: **Protomaps PMTiles**. Aligns with the single-static-host
   thesis. Worth measuring file size before committing.

2. **Country geometries source.** MapLibre style layers reference data sources. For our
   country shapes / highlights, two options:
   - Use a layer from the tile source (e.g., Natural Earth's `admin_0_countries`
     packaged into the PMTiles file).
   - Load the same GeoJSON we use now as a separate `geojson` source (already in
     `index.html`'s `loadGeoJSON()`).

   The second is easier to port (we keep our existing data pipeline) and easier to test.
   Probably start there, optimize to tile-embedded layer later.

3. **3D / Flat toggle UX.** Same `⚡ LITE MODE` menu button, relabeled to `🌐 RENDER MODE:
   3D / FLAT`? Or first-class buttons in the style switcher row alongside Atlas /
   Classic? The latter is more discoverable but adds visual weight.

4. **Style authorship.** MapLibre styles are JSON specs. We need at least one — the
   Atlas parchment look we already designed. May want a satellite-style as a second
   preset. Style JSONs are non-trivial; budget time for tuning.

---

## Implementation phases

Strictly sequential. Don't start phase N+1 until N is verified on the Chromebook.

### Phase 1 — Spike

**Goal:** Render a MapLibre globe with country borders in `#globe-el`. No game logic.
Verify 30+ FPS on the Chromebook, idle and while rotating.

- Decide tile source (item 1 above).
- Add MapLibre GL CDN script + CSS to `index.html` head.
- Replace `initGlobe` body with `new maplibregl.Map(...)`.
- Add a basic style with country borders visible.
- Test on Chromebook. **If FPS is bad here, the plan is wrong; stop and reassess.**

### Phase 2 — Country selection

**Goal:** When code calls "highlight country X," the country fills with a color on the
map. No game logic yet, just the highlight primitive.

- Pick the country layer (item 2 above).
- Add feature-state-driven layer paint expressions: `["case", ["==", ["feature-state", "named"], true], "rgba(34,197,94,0.88)", "rgba(0,0,0,0)"]` etc.
- Helper: `setCountryHighlight(featureId, state)` and `clearAllHighlights()`.
- Smoke test from console.

### Phase 3 — Port game modes one at a time

In this order: **Name All → Sprint → Daily → Easy**. Each mode independently testable.

For each mode, port: round start, input-match-to-highlight, end-game banner, share path.
Keep the existing matching engine and Storage calls untouched.

### Phase 4 — Style switcher + Render mode

- Author the Atlas-style MapLibre style spec (parchment ocean, tan country fills,
  sepia borders).
- Author the satellite-style spec (or use a provider's satellite tiles).
- Wire `Storage.getStyle/saveStyle` to the MapLibre `map.setStyle()` call.
- Rename `gr_lite_mode` semantics in UI to "Render Mode: 3D Globe / Flat Globe."
  Storage key + auto-detect logic stay the same; just the label and what it controls
  changes (now flips `map.setProjection()` between `globe` and `mercator`/`orthographic`).

### Phase 5 — Navigation: flyTo, jumpToNext, auto-next, blink

- `flyToFeature` → `map.flyTo({ center, zoom })`.
- Auto-next still works the same conceptually; just retargets the new map.
- Blink: use `map.setPaintProperty()` on a stroke-color override for the target
  feature ID, toggled every 600ms. Should be cheap enough to keep ON in Flat mode too
  (verify on Chromebook).

### Phase 6 — End-of-game banners, share card, streak HUD

These are mostly DOM, not map. Should require minimal change. Verify the streak row
still updates from `Storage.getDaily()`. Verify share text still builds correctly.

### Phase 7 — Cross-device verification

- Chromebook: 60 FPS idle in both modes. 60 FPS through endgame Name All in both modes.
- Mid-range Android (if available): same.
- iOS Safari (PWA installed): same.
- Desktop Chrome / Firefox / Safari: zoom-quality regression check — should look BETTER
  than current globe.gl since vector tiles render crisply at any zoom.

### Phase 8 — Ship

- Bump SW cache version.
- Update `docs/stack-decision.md` to note that the map layer is now MapLibre GL.
- Close FT-008 (with link to the rewrite commit).
- Close FT-009 (the flat map ask is shipped as Flat Globe render mode).

---

## Bugs to address during or after the rewrite

These were spotted during the Lite Mode test session. The rewrite probably resolves
them as a side effect (different input/match wiring + MapLibre handles "already
selected" cleanly), but verify.

- **FT-010 (🐞 Bug):** China highlights green but the input text doesn't clear. Likely
  a race in the matching engine — China has multiple aliases ("PRC", "People's Republic
  of China") and some path through findMatch may not be hitting the input-clear at the
  end of the handler.
- **FT-011 (💅 Polish):** Typing the name of an already-named country gives zero
  feedback — the input just sits there. Should toast "ALREADY NAMED" or shake/flash the
  input to acknowledge. Currently the absence of feedback feels like the app froze.

---

## What NOT to do during the rewrite

- **Don't keep globe.gl side-by-side.** Pick a moment to cut over; running both during
  the port doubles the surface area and the test burden. Cut on phase 1.
- **Don't add features during the port.** No spaced repetition, no new modes, no
  capitals/flags, no multi-domain expansion. Those are post-launch.
- **Don't change the Storage schema.** `gr_daily`, `gr_recs`, `gr_sprint_best`,
  `gr_ghost`, `gr_style` all stay. Returning users keep their streaks. The migration
  runner stays the same. (`gr_lite_mode` semantics change but the key stays; existing
  values still parse cleanly as boolean.)
- **Don't change country aliases or the daily seeding algorithm.** Either would break
  the streak for returning users.
- **Don't introduce a build step.** Single-HTML-file iteration speed is part of the
  thesis. ES modules in `src/` for testable helpers, mirrored inline. Same pattern as
  today.

---

## Project state at the time of this plan (2026-05-26)

### Recent commits (newest first)

```
c994ea2 feat(perf): Lite Mode for weak GPUs (FT-008) + remove auto-rotate
8705558 docs: triage Chromebook perf feedback (FT-008 Do Now, FT-009 Monitor)
c199a35 feat: streak HUD — home-screen row + share text + new-best banner
c17963b feat: extract persistent state into a versioned Storage module
6873622 feat: blink the next-target country's outline when auto-next is on
e356fff feat: Parchment Atlas globe style (new default)
c4039d9 fix: lift Easy Mode + Daily highlight polygons off terrain (FT-003 root cause)
372b5b4 docs: triage feedback log + drop completed Easy Mode rename bullet
a5458b6 fix: daily-mode input + Next button + Easy Mode highlight (FT-001/002/003)
```

### File inventory

- `index.html` — game, ~2100 lines, single file
- `sw.js` — service worker, cache `global-recall-v14`
- `manifest.json` — PWA manifest
- `src/core.js` + `src/core.test.js` — matching engine, 29 tests
- `src/storage.js` + `src/storage.test.js` — persistence + schema v2, 32 tests
- `docs/product-brief.md` — product context, distribution thesis, retention loop
- `docs/stack-decision.md` — locked: Capacitor wrap, Millrace Inc. publisher, DUNS in
  flight, analytics deferred to Plausible v1.1
- `docs/feedback-log.md` — triage log, FT-001 through FT-011
- `docs/maplibre-migration-plan.md` — this file
- `package.json` — vitest dev dep only, no build step

### Open issues

- [#1](https://github.com/eganc/global-recall/issues/1) FT-008 — globe near-unusable on
  Chromebook + weak Android devices. **This rewrite is the fix.**

---

## Opening prompt for the next session

Use this verbatim when you start the fresh session:

> Read `docs/maplibre-migration-plan.md`. We're starting Phase 1 (the MapLibre spike).
> First, walk me through the three tile-source options with concrete file-size /
> setup-cost / runtime-cost numbers so I can pick. Then once I've picked, start the
> spike — render a MapLibre globe with country borders in `#globe-el`, no game logic.
> Goal: I open it on my Chromebook and confirm 30+ FPS idle and while rotating.
