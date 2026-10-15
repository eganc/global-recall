# ASO Brief: Global Recall

**Target stores:** Apple App Store, Google Play
**Publisher:** Millrace Inc. · **Bundle:** `com.millrace.globalrecall`
**Status:** Pre-submission. Capacitor wrap of the live PWA at globalrecall.app.
**Written:** 2026-10-15

---

## The core ASO problem

"Global Recall" contains no keyword anyone searches for, and it reads like a memory
app or a Total Recall reference. Nobody will ever type it into a store search before
they've heard of us. That's a fine brand name and a bad search asset, and it means
**100% of organic discovery has to come from the subtitle and keyword field.** Every
decision below follows from that.

The name is locked (one-shot at first submission, per CLAUDE.md), so this is a
constraint to work around, not a question to reopen.

---

## Keyword strategy

**Primary** (highest intent, must appear in indexed fields)
- geography quiz
- countries of the world
- name all countries

**Secondary** (strong intent, work into subtitle / short description / keyword field)
- world map quiz · learn geography · 195 countries · daily geography game · country quiz

**Supporting** (keyword field and long description only)
- globe · atlas · nations · capitals · flags · continents · trivia · memorize · study ·
  streak · world geography game · geography for kids

**Deliberately not targeting:** "flags" and "capitals" as primary. Every competitor
leads with them, we don't do either, and ranking for a term the app doesn't satisfy
buys uninstalls. Capitals appear only as Strict-mode hints.

### Competitive read

The iOS geography-quiz niche is **fragmented and shallow**. Rating counts across the
visible competitor set are low — Geognosis 4.8/119, Map-Quiz 4.7/375, Name the Nations
4.7/18, World Quiz! 4.3/15, Country Quiz 0. That's not a category anyone owns, which is
good news for a new entrant with a better product, and bad news as a demand signal.

Nobody in the mobile set combines **a 3D globe with a daily streak**. Globle has the
globe without the teaching loop; Worldle has the daily without spatial context; Seterra
and Sporcle have the content on flat maps with no habit mechanic. That intersection is
the positioning, and it should be visible in the first screenshot and the subtitle.

**Verify before relying on any of this:** these are listing-copy inferences from web
search, not tool data. Pull real volume and difficulty from AppTweak, Sensor Tower or
AppFollow before locking the keyword field.

---

## Category

| Store | Recommendation | Why |
|---|---|---|
| Apple | **Primary: Education** · Secondary: Games → Trivia | Games → Trivia is dominated by general-knowledge apps with huge review counts. Education matches the actual product (a practice habit, not a party game) and the people searching "learn geography" convert better than people browsing trivia. |
| Google Play | **Apps → Education** (not Games) | Play forces an Apps/Games split at the top level. Listing as a Game puts us against Educational/Trivia charts we can't touch at zero reviews. Education also unlocks Teacher Approved consideration later. |

**Content rating:** Everyone / PEGI 3. No user-generated content, no ads, no data
collection, no external links in-app except the privacy page.

**Competitive density:** Medium. Crowded with low-quality entries, empty at the top.
Top-20 in a geography-specific search is realistically reachable; top-20 in Education
overall is not.

---

## Apple App Store listing

**App Name** (24/30)
```
Global Recall: Geography
```

**Subtitle** (27/30)
```
Name every country on Earth
```

**Keyword field** (92/100 — comma-separated, no spaces, no words repeated from Name or Subtitle)
```
195,countries,world,map,globe,atlas,nation,capital,flag,trivia,study,streak,quiz,daily,learn
```

"195" lives here rather than in the subtitle: it is the term with real search volume, but the app actually asks for 200, so it belongs in the index and not in a user-facing promise.

**Promotional text** (updatable without a release — use it for the store launch)
```
New: a daily challenge that takes five minutes. Ten countries, the same ten for everyone, a new set every day.
```

**Description** (not indexed by Apple — written purely for conversion)

```
You probably can't name every country on Earth. Most of us run dry somewhere around 60.

Global Recall is a geography game built on a 3D globe you can spin. A country lights
up, you type its name, and the camera flies to it so you see where it actually sits.
Do that for five minutes a day and the map stops being a blur.

DAILY CHALLENGE
Ten countries, the same ten for everyone, a new set every day. Keep a streak going.

SPRINT
One minute on the clock. How many can you get? Scores go on the high score board.

STRICT
All 200, named on sight, three strikes. There's a hint when you're genuinely stuck,
and the recap afterwards tells you which ones needed it.

NAME ALL
No timer, no highlights, no order. Just you and 200 blanks. Race a replay of your
own best run.

EASY MODE
Multiple choice with continent hints, for kids or for your first week.

Spelling is forgiven within reason, and old names work - Burma, Holland, Swaziland,
Czechia, England.

No account. No ads. Nothing to sign up for. Works offline.
```

---

## Google Play listing

**Title** (29/30)
```
Global Recall: Geography Quiz
```

**Short description** (76/80)
```
Name every country on Earth on a 3D globe. Free daily geography game.
```

**Full description** — reuse the Apple description above with one change: open the
first paragraph with the phrase "geography quiz" so Play's indexer sees it early, since
unlike Apple, Play *does* index the long description.

```
Global Recall is a geography quiz built on a 3D globe. You probably can't name every
country on Earth - most of us run dry somewhere around 60.
```
...then continue with the Apple body unchanged.

---

## Screenshot sequence

The first three are what appear in search results on both stores. They carry the whole
click-through rate, so they get outcome headlines, not feature labels.

1. **"How many countries can you name?"** — the globe mid-spin with several countries lit
   green. The hook, and the only screenshot most people will ever see.
2. **"Ten a day. Keep the streak."** — the Daily tile showing an active streak counter.
   This is the differentiator no competitor shows.
3. **"The globe flies to each one."** — a country highlighted with the camera settled on
   it, neighbours visible. Sells the spatial-learning claim in one image.
4. **"One minute. Go."** — Sprint mid-run with the clock visible.
5. **"All 195, three strikes."** — Strict with the progress counter.
6. **"Typos forgiven."** — the input showing a misspelling being accepted.
7. **"Works with no signal."** — offline/home-screen install.
8. *(Play only)* Feature graphic already exists at `store-assets/play/feature-graphic.png`
   (1024×500, correct spec).

Existing raw captures are in `store-assets/screenshots-raw/` and need headline overlays
before submission. Dark mode throughout — the brutalist dark palette is the product's
identity, not a preference.

---

## Pricing

**Free. No in-app purchases, no ads, no subscription.**

This is not a default, it's the decision already recorded in CLAUDE.md: monetization is
open but deferred, anything paid must be opt-in and off by default, and nothing gets
built until daily retention is proven. Shipping a paywall into a product with no
retention data would be guessing.

Two things follow for ASO:
- **Ads are off the table regardless.** They'd wreck retention on a five-minute daily
  habit, and retention is the exact thing v1 exists to measure.
- **There's no revenue to fund user acquisition**, so organic is the whole channel.
  That raises the stakes on the subtitle, the keyword field and screenshot 1.

When monetization does arrive, the brief's stated wedge is features that genuinely cost
to scale — live realtime races, cloud save, private friend boards — not a content gate.
A content gate on 195 countries would be transparently artificial.

---

## ASO risks

1. **The name carries no search weight.** Already covered above. If the subtitle and
   keyword field underperform, there is no fallback — brand search will be zero for
   months.
2. **Zero reviews at launch.** Both stores weight review velocity heavily, and a new app
   at 4.8/20 outranks an old one at 3.9/200. Without seeded reviewers the listing starts
   invisible.
3. **The global leaderboard is currently returning HTTP 500 in production.** Sprint and
   Strict both promise "scores go on the board." If that ships broken it's a visible
   defect in two of five modes and a predictable one-star theme. **Fix before submission.**
4. ~~**195 vs 198.**~~ **Resolved.** The list is 200 on purpose and the reasoning is
   public in `docs/country-list.md`. Stale `195` labels in the UI have been corrected.
   Residual risk is now small but real: a reviewer may still object to Taiwan or Western
   Sahara being listed at all. The policy page is the answer, and it's linked from the
   splash footer. Expect it to come up in at least one review.
5. **"Geography" in the app name invites Education-category comparison** against
   curriculum apps with institutional backing. The screenshots have to make it obvious
   within one frame that this is a game, not courseware.

---

## Before launch

1. **Fix the leaderboard 500.** It's the only functional defect blocking a clean
   submission, and it makes two mode descriptions false.
2. ~~Resolve 195 vs 198~~ — done. Keep `docs/country-list.md` linked from the listing so
   the policy is one tap away if a reviewer challenges it.
3. **Line up 15–20 TestFlight / Play internal testers who will actually post a review in
   the first 72 hours.** Review velocity in the launch window is the single biggest
   ranking lever available at zero budget. Ask them directly; don't hope.
4. **Add an in-app review prompt at the right moment** — after a seven-day streak or a
   completed Name All run, never on first launch. Both stores throttle the native prompt,
   so spending it at the high-water mark of someone's experience matters.
5. **Pull real keyword data** from AppTweak or Sensor Tower and re-validate the keyword
   field before it's locked into a release.
