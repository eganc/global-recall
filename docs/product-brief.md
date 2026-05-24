# Product Brief: Global Recall

*A daily-practice app that turns adults who feel mild shame about their geography knowledge into people who can actually name every country on Earth — using a 3D globe as a visual memory palace.*

---

## The Problem

Most adults have a vague mental map of the world with big holes in it, and they're quietly aware of it. They watch the news, meet people from places they can't picture, and feel a small, persistent sense that they *should* know this stuff. The existing options to fix it — flat-map quiz sites like Sporcle, one-and-done daily games like Worldle, school-style flashcard apps — either feel infantilizing, don't actually teach spatial intuition, or don't build a habit.

## The User

A 30–55-year-old, college-educated adult who plays Wordle, Connections, and Worldle on their phone in the evening. They traveled in their 20s, watch international news, and consider themselves reasonably worldly — but if you handed them a blank map, they'd struggle past about 60–80 countries. They're not trying to win a geography bee. They want to be the kind of person who can place a country when it comes up in conversation, and they'd quietly enjoy being able to say "yeah, I can name every country on Earth" the way someone says they ran a half-marathon.

## The Status Quo

Today they do one of three things: (1) play Sporcle's "Countries of the World" quiz on a flat map every few months, get bored, and forget half of what they learned; (2) play Worldle daily, which is shareable but teaches you almost nothing about *where* countries are because it shows them one at a time without spatial context; or (3) nothing — they just live with the gap and feel mildly bad about it. None of these build geography fluency. They're entertainment that brushes against learning, not learning itself.

## The Solution

Global Recall is a daily-practice geography app built around a beautiful 3D globe. You name countries from memory and watch them light up in their real position and at their real scale. A Daily mode gives you a short, shareable challenge each day; Sprint and Name All modes let you push your fluency. Underneath, spaced repetition surfaces the countries you keep missing, a streak mechanic gives you something to defend, and a visible fluency level makes progress feel real. The globe isn't decoration — it's the memory palace. You don't memorize Azerbaijan as a shape, you remember it as a place you've flown to a hundred times, with its real neighbors at their real scale.

## The Differentiator

**The real differentiator: singular focus on teaching exhaustive globe mastery as the goal.** Global Recall is the only product whose explicit purpose is to take a curious adult from "I know maybe 60 countries" to "I can name every country on Earth and point to it on a globe." Other products in the space dabble — Sporcle has a flat-map quiz buried in a sea of trivia, Worldle gives you one country a day with no spatial context, Seterra is school-flashcard ergonomics — but none of them are *built end-to-end* around the goal of total, exhaustive, spatial fluency. The 3D globe is the right rendering choice for that goal (you can't teach real-world scale and adjacency on a flat map), but the rendering tech is open source and isn't itself the moat. The moat is the *opinionated, focused product* built around a goal nobody else is treating as the point.

**Positioning and execution advantages (not moats):**
- **Daily-practice loop with progression** — streaks, spaced repetition, fluency levels. Genuinely valuable, but a funded competitor could clone the mechanics in a quarter. The defense here is execution polish and being in-market first with this combination for geography specifically.
- **The "name them all" framing as a flex** — positioning the achievement as comparable to a half-marathon, not a daily score. This is a positioning advantage, not a barrier to entry.

Honest competitive read: defensible enough for an indie / small-business outcome, not defensible against a well-funded entrant who decides this category is worth owning. Win condition is to be the obvious answer for "I want to actually learn world geography" before anyone bigger notices.

## MVP Scope

The product already exists in playable form (Name All, Sprint, Daily, multiple-choice Easy mode, typo tolerance, PWA install, offline support). What's missing to test the *real* Duolingo-mode hypothesis:

**In:**
- **Streak mechanic** — days-in-a-row counter, visible on share cards and the home screen. The retention engine.
- **Spaced repetition on missed countries** — countries you got wrong come back more often until they stick. The thing that makes it *practice*, not *quiz*.
- **Visible fluency level** — a simple, motivating progression metric ("Level 7 — 142/195 fluent") shown on the home screen and shareable.
- **Polished Daily-mode share card** — clean enough that someone would actually post it in a group chat. Includes streak.
- **Globe UX fixes** — country-outlines overlay mode for readability; fix the highlight-layer z-fighting where terrain pokes through.

**Out (deferred):**
- Capitals, flags, US states, regions, mountain ranges — all the multi-domain expansion. Only build these after the core daily-habit loop is proven with countries alone.
- Multiplayer / tournaments / friend leaderboards.
- Account system / cloud sync. Local-only progress is fine until users ask for sync.
- Paid tier / monetization plumbing — keep it free until traction is real.

**Architectural decisions worth flagging:**
- Single-HTML-file architecture has served you well, but spaced repetition + streaks + fluency level needs persistent state. Decide intentionally: localStorage-only forever, or do you eventually need an account/sync model? Build state in a shape that *could* migrate to a backend later without a rewrite.
- Share card design: it's the single most important visual artifact in your distribution loop. Worth more design effort than its size suggests.

## The Core Hypothesis

**This works if** adults who feel mild shame about their geography knowledge will form a daily-practice habit when the streak gives them something to defend, the spaced repetition makes progress visible, and the 3D globe makes the knowledge stick — and if a non-trivial fraction of them eventually share their results because "I can name every country on Earth" is a flex worth posting.

If 30-day retention on new installs lands above ~15% and Daily-mode share cards get clicked through by strangers at any meaningful rate, the thesis is alive. If retention is sub-5% and nobody shares, the thesis is dead and the polished quiz game is the right product instead.

## Distribution Plan

**Primary channel: App Store organic search (ASO).** Realistically, this is where the majority of installs will come from. People who want to learn geography type "geography game," "learn countries," "world map quiz," or "countries quiz" into the App Store or Google Play. The category is well-defined, the search intent is high, and the competition (mostly aged, ugly quiz apps) is beatable on screenshots and product polish alone. ASO requires real investment: targeted keywords in the listing, screenshots that show the 3D globe in action (the differentiator must be visible at-a-glance in the listing), strong icon, and ratings velocity. This is the engine. Everything else amplifies it.

**Amplifier #1 — Daily-mode share cards (short-cycle viral).** Once the streak mechanic and polished share card are in place, Daily results posted in group chats and Twitter/Bluesky drive direct installs. Low per-share signal, but recurring and visible — and crucially, each share is also a soft marketing impression that compounds over time. Not the engine on its own, but a steady multiplier on top of organic installs.

**Amplifier #2 — The "name them all" flex (long-cycle viral).** "I named all 195 countries in 16 minutes" posted to r/geography, r/MapPorn, or Twitter. Rare but high-signal — the kind of share that drives spikes of organic installs and can earn ASO ratings velocity in a short window.

**Seeded launch (one-time):** ProductHunt launch when the streak/spaced-repetition loop is in. One organic post to r/geography when the share card is polished. Outreach to a small number of geography YouTubers (RealLifeLore, Wendover, Geography Now) whose audiences are the exact target persona — long-shot, but the cost of pitching is one email each. The launch isn't the strategy; it's the kickoff for the App Store ratings flywheel.

**Critical assumption:** the viral loop has *never been tested with a stranger yet*. Until it has, the amplifier channels are theoretical. Until the App Store listing is live with proper ASO, the primary channel doesn't even exist yet. First two validation goals, in order: (1) ship a real App Store listing with targeted keywords and see what the organic baseline looks like; (2) once installs are happening, watch whether the share card actually causes anyone to click through.

## Realistic Outcome

If the Duolingo-mode loop is actually built and shipped to the app stores, this realistically generates **$300–$2,000/month at steady state** within 6–12 months, with a lower-probability path to ~$5K/mo if Daily mode catches and the daily-habit loop compounds. That's a real income stream, not a business — but it justifies the multi-month build commitment if you stick with it long enough for retention to compound. The dominant failure mode isn't building the wrong thing; it's shipping the new mechanics, seeing a flat curve for 8 weeks, and giving up before the habit loop has time to take hold.

## Key Risks

1. **The 3D globe is both the moat and the friction.** It's beautiful and structurally differentiating, but harder to scan than a flat map. If the country-outlines mode and highlight-layer fix don't land cleanly, the differentiator becomes the reason new users bounce.
2. **The viral loop is entirely theoretical.** Nobody outside immediate family has tested whether the share card actually causes anyone to click through. The whole distribution thesis depends on a behavior that hasn't happened once.
3. **The achievement moment is far from the install moment.** "I named all 195" is weeks or months of practice away. Without strong short-term retention (the streak), most new users bounce long before they reach the share-worthy milestone. The streak isn't a nice-to-have — it's load-bearing.
4. **Single-builder, multi-month build commitment.** Choosing the Duolingo-mode expansion was a real decision. The biggest risk to the project is loss of momentum at month 3, before the retention curve has had time to validate or kill the thesis.

## Next Steps

1. **This week:** Rename "Kids Mode" → "Easy Mode" (or "Multiple Choice"). One-line change, immediately stops pushing away the actual target user.
2. **Next 1–2 sessions:** Design the persistent-state schema (streak, daily completion history, per-country miss-counts for spaced repetition, fluency level). Pick localStorage shape that could migrate to a backend later without a rewrite. Architectural decision — do this before any of the features below.
3. **Following sessions, in order:** (a) streak mechanic + home-screen display, (b) polished Daily-mode share card including streak, (c) spaced repetition surfacing missed countries, (d) visible fluency level on home screen and share card, (e) globe UX fixes (country-outlines mode, highlight z-fighting). Ship each one independently; don't bundle.
4. **First external test:** Once the streak + share card are in, post Global Recall once to r/geography or share with 10 friends outside the family. Watch what happens. This is the first real signal — does anyone share unprompted?