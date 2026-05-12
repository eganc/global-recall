# Global Recall

Type country names. Watch them light up on a spinning globe. That's it.

**[globalrecall.themillrace.ca](https://globalrecall.themillrace.ca)**

---

## Why I built this

When I was a kid I used to take the blank maps of Canada that my teachers handed out, bring home a stack of photocopies, and spend hours filling in every city and town and lake I could think of. I just loved maps.

In Cégep I took a world geography course. The entire grade was one exam — name every country on a map. That's it. At the time it felt hard. But years later it still pays off in small ways all the time. You meet someone, you know where they're from. You hear something in the news, you can actually picture it. It's one of those things that sounds like useless trivia until it isn't.

My son started learning world geography a couple years ago. I looked at the apps out there and honestly, I thought I could do better. So here we are.

---

## How it works

195 countries. One text box. Type names from memory, watch them light up on the globe. No hints, no multiple choice, no clues.

**Modes:**
- **Name All** — no timer, just try to get all 195
- **Sprint** — 5 minutes, how many can you get?
- **Daily** — 10 countries, same for everyone, changes each day
- **Kids Mode** — multiple choice with continent hints, good for younger players or people just getting started

**A few things that make it nicer to use:**
- Typos are forgiven ("Brazl" works, "Nicragua" works)
- Common alternate names work too — Burma, Czechia, UK, Ivory Coast
- The globe flies to each country after you name it
- Installs as an app on your phone, works offline

---

## Tech stuff

The whole game is one HTML file with no build step. Seemed like the right call for something this simple.

- [Globe.gl](https://globe.gl) for the 3D globe
- [Natural Earth GeoJSON](https://github.com/nvkelso/natural-earth-vector) for country shapes
- Service worker for offline support
- Vitest for unit tests on the matching logic (`npm test`)
- Deployed on Vercel

To run locally:

```bash
npx serve .
```

---

*Made by [Egan Cheung](https://themillrace.ca)*
