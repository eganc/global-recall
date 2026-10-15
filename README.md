# Global Recall

Type country names. Watch them light up on a spinning globe. That's it.

**[globalrecall.app](https://globalrecall.app)**

---

## Why I built this

When I was a kid I used to take the blank maps of Canada that my teachers handed out, bring home a stack of photocopies, and spend hours filling in every city and town and lake I could think of. I just loved maps.

In Cégep I took a world geography course. The entire grade was one exam — name every country on a map. That's it. At the time it felt hard. But years later it still pays off in small ways all the time. You meet someone, you know where they're from. You hear something in the news, you can actually picture it. It's one of those things that sounds like useless trivia until it isn't.

My son started learning world geography a couple years ago. I looked at the apps out there and honestly, I thought I could do better. So here we are.

---

## How it works

200 countries. One text box. Type names from memory, watch them light up on the globe.

**Modes:**
- **Daily** — 10 countries, same for everyone, changes each day. Keep the streak alive.
- **Sprint** — 1 minute, how many can you get?
- **Strict** — all 200, named on sight, three strikes. A hint button when you're truly stuck
- **Name All** — no timer, no highlights, no prompts, just try to get all 200 from memory
- **Easy Mode** — multiple choice with continent hints, for when naming from memory is too hard (which is most of us, honestly)

Most modes point at one country at a time and ask you to name it — knowing *where* a
place is turns out to matter more than being able to rattle off a list. Name All is the
exception, and it's the trophy: no prompts, no order, just you and 200 blanks.

**Why 200 and not 195?** The UN's 195, plus Taiwan, Kosovo, Western Sahara, Somaliland and
Northern Cyprus. The rule is that we don't adjudicate sovereignty — if Natural Earth draws
a place as its own feature with itself as sovereign, you're asked to name it. Contested
places are the ones people can never place, which is exactly why they're in.
[Full reasoning](docs/country-list.md).

**A few things that make it nicer to use:**
- Spelling is forgiven within reason ("Liechtenstien" works, "Madagasgar" works). Drop a
  letter entirely and it won't — the matcher tolerates wrong letters, not missing ones
- Common alternate names work too — Burma, Holland, Swaziland, Czechia, England
- The globe flies to each country after you name it
- Installs as an app on your phone, works offline

---

## Tech stuff

The whole game is one HTML file (`play.html`) with no build step. Seemed like the right
call for something this simple. `index.html` is the landing page and shares nothing with
it but a colour palette.

- [MapLibre GL JS](https://maplibre.org/) for the map — native globe projection, with a
  flat Mercator toggle for weaker devices. (This replaced Globe.gl/Three.js, which drew
  every country as its own mesh and crawled at 3–4 FPS on a Chromebook.)
- [Natural Earth GeoJSON](https://github.com/nvkelso/natural-earth-vector) for country shapes
- Service worker for offline support
- Vitest for unit tests on the matching and storage logic (`npm test`)
- [Capacitor](https://capacitorjs.com/) wraps the same files for the iOS and Android builds
- Deployed on Vercel. The one server-side piece is a leaderboard function backed by
  Upstash Redis — it stores three initials and a score, nothing else.

To run locally:

```bash
npx serve .
```

That serves the landing page at `/` and the game at `/play.html`. For the real `/play`
route and the leaderboard function, use `npx vercel dev` instead.

---

*Made by [Egan Cheung](https://themillrace.ca)*
