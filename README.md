# Global Recall 🌍

**Name every country on Earth. From memory. No hints. Just you and the globe.**

→ **[globalrecall.themillrace.ca](https://globalrecall.themillrace.ca)**

---

## The story behind it

When I was a kid, I was obsessed with maps. I'd take the blank Canada maps my teachers handed out, photocopy a stack of them at home, and spend hours filling in every city, town, lake, and river I could possibly name.

Years later in Cégep, I took a world geography course where the entire grade — the *whole thing* — came down to one exam: name every country on a map. It was one of the most challenging and rewarding things I did in school. And it kept paying off. Meeting someone from a country you've actually placed on a map hits differently. Understanding news from a region you can visualise is a different experience entirely. The world gets smaller, in the best way.

Fast-forward a couple of decades. My son started learning world geography — a few years younger than I did. I sat down with the apps available and thought: *I can make something much better than this.*

So I did.

---

## What it is

A free-recall geography game built around a spinning 3D globe. No multiple choice. No process of elimination. You type country names from memory and watch them light up.

195 countries. One input field. Go.

### Game modes

| Mode | Description |
|---|---|
| **Name All** | The classic. Name every country on Earth. No time limit, pure memory. |
| **Sprint · 5 Min** | How many can you name in five minutes? Beat your record. |
| **Daily Challenge** | Ten countries, seeded by date — same set for everyone, every day. |
| **Kids Mode** | Multiple choice with continent hints. Four options, globe highlights the target. Great for getting started. |

### Features

- **Fuzzy matching** — "Brazl" counts. "Nicragua" counts. Typos happen.
- **Aliases** — Burma, Czechia, Ivory Coast, UK — all accepted.
- **3D globe** — Countries light up as you name them. Auto-flies to the next target.
- **Ghost replay** — Share your naming order with friends as a URL.
- **PWA** — Installs on your home screen, works offline.
- **Portrait + landscape** — Playable on any device.

---

## Tech

A deliberately minimal stack. No framework, no build step, no bundler.

- **Single HTML file** — the entire game lives in `index.html`
- **[Globe.gl](https://globe.gl)** — Three.js-powered 3D globe
- **[Natural Earth GeoJSON](https://github.com/nvkelso/natural-earth-vector)** via jsDelivr — country polygons
- **Service Worker** — offline caching, PWA install
- **Vitest** — unit tests for the matching engine (`npm test`)
- **Vercel** — hosting + cache headers

The matching engine uses Levenshtein distance with length-gated fuzzy thresholds — short names (≤7 chars) require exact matches to avoid Iceland/Ireland collisions; longer names forgive 1–2 character edits.

---

## Development

No build step required. Open `index.html` in a browser, or serve it locally:

```bash
npx serve .
```

Run the unit tests:

```bash
npm test
```

The test suite covers the normalisation pipeline, Levenshtein implementation, and the full `findMatch` fuzzy logic including edge cases.

---

## Why bother?

The world is big. Most people couldn't point to Eswatini, Timor-Leste, or São Tomé and Príncipe on a map. That's not a criticism — it's just geography, and geography isn't taught the way it used to be.

But knowing where things are changes how you experience the world. It changes how you read the news, how you talk to people you've just met, how you understand history. It's one of those things that sounds like trivia until it quietly isn't.

Global Recall exists to make that knowledge accessible — and, hopefully, fun enough that people actually stick with it.

---

*Built by [Egan Cheung](https://themillrace.ca)*
