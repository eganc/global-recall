# What counts as a country

Global Recall asks you to name **200 places**: the 195 conventionally called countries,
plus Taiwan, Kosovo, Western Sahara, Somaliland and Northern Cyprus.

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

**We don't adjudicate sovereignty. The map does.** The globe renders Natural Earth's
`admin_0_countries` layer, and we defer to it: if Natural Earth draws a place as its own
feature and records it as its own sovereign, you'll be asked to name it. If it doesn't,
you won't.

That is a deliberate delegation rather than a dodge. Natural Earth's editors have already
done this work in public, with a documented rationale and a revision history, and they
have thought about it harder than we have. Borrowing their boundary means the list is
answerable to something outside our own opinion, and it means the list changes when the
cartography does rather than when we feel differently.

It also gives us a practical floor: a place the globe can't paint can't be taught by the
globe, so it would be a vocabulary question wearing a geography costume.

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

## The contested three

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

## What the rule includes, and what it leaves out

The dataset has 242 features. Applying the rule — drawn as its own feature, and recorded
as its own sovereign — gives 200 of them. Drop Antarctica, which has no permanent
population and no government, and add Palestine, which the 195 carries but which Natural
Earth files under Israeli sovereignty, and the rule lands on **200 places**.

### The other two

- **Somaliland** — Natural Earth marks it `TYPE: Sovereign country` with itself as
  sovereign. De facto independent from Somalia since 1991, with its own currency,
  elections and borders, and recognised by no UN member state.
- **Northern Cyprus** — same marking. Controls the northern third of the island, has its
  own government, and is recognised by Türkiye alone. Nicosia is a divided city; the
  capital used here is North Nicosia (Lefkoşa).

Transnistria, Abkhazia and South Ossetia are **not** separate features in the layer, so
under the rule they're out. That is the rule doing its job: somebody who thinks about
boundaries for a living looked at these and did not draw them, and we take that as the
answer rather than overriding it.

### Dependencies and territories

Greenland, Hong Kong, Puerto Rico, the Faroes, Aruba, Guernsey, Bermuda and 30-odd others
*are* drawn separately — but Natural Earth records each one's sovereign as a state already
on the list. Denmark's Greenland is Denmark's. They render on the globe and you can see
them; you're just not asked to name them, because the thing you'd be naming is already an
answer.

### Antarctica and Siachen Glacier

Both are drawn and neither is a country. Antarctica has no permanent population or
government; Siachen Glacier is a disputed stretch of ice. Out.

### Constituent countries

England, Scotland and Wales are aliases for the United Kingdom rather than separate
answers. Typing "England" is accepted and scores you the UK. They have no separate feature
on the world map.

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

A perfect Strict or Name All run is 200, and the leaderboard accepts scores up to 200.
Any "195" or "198" still visible in the app is a stale label and a bug — please report it.

---

## Why this list is hard to change

**The Daily challenge is seeded from the list's order.** Adding or removing an entry
reshuffles every past and future day's set, which is why the list is treated as frozen and
why expanding it is a deliberate migration rather than an edit. This is a real cost and
it's the main reason the candidates above are still candidates.

If you think we've got one wrong, open an issue. "You included X" and "you left out Y" are
both fair, and the reasoning above is a judgement call, not a fact we're defending.
