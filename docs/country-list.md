# What counts as a country

Global Recall currently asks you to name **198 places**: the 195 conventionally called
countries, plus Taiwan, Kosovo and Western Sahara.

This page exists because "how many countries are there" has no neutral answer, and any
list is a position. Here's ours.

---

## The principle

**The point of this game is awareness of the globe. Politics is not a consideration.**

Contested territories are the places where that awareness matters most. They're the ones
that turn up in the news, the ones people most often can't place, and the ones a flat
list of UN members quietly erases. A player who finishes this game and still doesn't know
where Western Sahara is has been failed by the game.

So the bias is toward **more granular, not less**. When a place has a border on the map, a
government, and people living under it, the educational answer is to ask you to name it.

**Inclusion is a geographic statement, not a political one.** Putting a place on the list
says it exists and you should know where it is. It says nothing about whose claim is
valid, and it is not an endorsement of anyone's position. Leaving a place off would also
be a position — the difference is that leaving it off additionally makes you worse at
geography.

---

## Where 195 comes from

The familiar figure is:

- **193 UN member states**
- **2 UN permanent observer states** — the Holy See (Vatican City) and the State of
  Palestine

That's 195. It's the number most quizzes use and the number most people have in their
head, which makes it a useful starting point. It is not a complete list of places that
function as countries, and it was never meant to be one.

## The three beyond 195

### Taiwan
Self-governing, with its own elected government, currency, passport and armed forces. Not
a UN member — the China seat transferred to the People's Republic of China in 1971 — and
formally recognised by only a small number of states. 23 million people live there. You
should know where it is.

### Kosovo
Declared independence from Serbia in 2008. Recognised by roughly half of UN member states
and not by Serbia, Russia or China. Not a UN member. It has borders, a government and a
currency, and it appears on the map you're looking at.

### Western Sahara
The UN lists it as a non-self-governing territory, the last one in Africa. Most of it is
administered by Morocco; the Polisario Front's Sahrawi Arab Democratic Republic controls
the remainder, is an African Union member, and is recognised by a number of states. The
dispute is live and unresolved.

It renders on the globe as a distinct shaded region. A player can see the shape. Refusing
to name it teaches them less than naming it does.

---

## What's not in the list yet

These are **omissions, not exclusions** — the principle above argues for most of them,
and they aren't in yet for practical reasons rather than political ones.

| Place | Why it's a candidate | What's blocking it |
|---|---|---|
| Somaliland | De facto independent since 1991, own currency, elections, borders | Natural Earth doesn't draw it as a separate feature, so the globe can't highlight it |
| Northern Cyprus | Controls territory, own government, recognised by Türkiye | Feature availability |
| Transnistria | Own currency, government, controls a defined strip | Feature availability |
| Abkhazia / South Ossetia | Both administered separately from Georgia | Feature availability |

The honest blocker across all of these is the same: **if MapLibre can't paint it, the
globe can't teach it**, and a country you can't see highlighted is a vocabulary question
rather than a geography one. Adding them means sourcing geometry, not settling an
argument.

### Dependencies and territories

Greenland, Puerto Rico, Hong Kong, Bermuda, French Guiana and similar are currently out.
Under a strict reading of "more granular in the interest of education" there's a real case
for them — plenty of people can't place Greenland either. This is an open question rather
than a settled one. It would roughly double the list and change what the game is, so it
needs a deliberate decision.

### Constituent countries

England, Scotland and Wales are aliases for the United Kingdom rather than separate
answers. Typing "England" is accepted and scores you the UK. This one is settled: they
have no separate border on the world map.

---

## Capitals

Strict mode uses capital cities as hints, which hits the same problem in miniature. Two
worth stating plainly:

- **Israel → Jerusalem.** Designated as the capital under Israeli law; the status of the
  city is internationally disputed and most embassies are elsewhere.
- **Palestine → Ramallah.** The administrative seat. The State of Palestine designates
  East Jerusalem.

Both are recorded that way in the source with the dispute noted in a comment, rather than
quietly resolved in one direction.

---

## Scoring

The list is 198, so a perfect Strict or Name All run is 198 and the leaderboard accepts
scores up to 198. Any "195" still visible in the app is a stale label and a bug.

---

## Why this list is hard to change

**The Daily challenge is seeded from the list's order.** Adding or removing an entry
reshuffles every past and future day's set, which is why the list is treated as frozen and
why expanding it is a deliberate migration rather than an edit. This is a real cost and
it's the main reason the candidates above are still candidates.

If you think we've got one wrong, open an issue. "You included X" and "you left out Y" are
both fair, and the reasoning above is a judgement call, not a fact we're defending.
