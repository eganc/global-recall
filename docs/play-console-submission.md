# Google Play Console — Submission Cheat-Sheet

Exact answers for every field in the Play Console new-app flow. Fill top to
bottom. Listing marketing copy (title/short/full description) lives in
`docs/aso-brief.md` — this file covers the console-specific forms that copy
doesn't.

**The signed bundle to upload:**
`android/app/build/outputs/bundle/release/app-release.aab`
(versionCode 1, versionName 1.0 — rebuild with `cd android && ./gradlew bundleRelease`
after bumping the version in `android/app/build.gradle` for any future release.)

---

## App details

- **App name:** Global Recall
- **Default language:** English (United States) – en-US
- **App or game:** Game
- **Free or paid:** Free
- **Package name:** com.millrace.globalrecall (locked, set automatically from the .aab)

## Store listing

- **Short description / Full description:** paste from `docs/aso-brief.md` → Google Play section.
- **App icon:** 512×512 PNG — export from `resources/icon.png` (it's 1024², downsize to 512).
- **Feature graphic:** 1024×500 — needs to be made (see ASO brief screenshot notes; a globe with the app name).
- **Phone screenshots:** min 2, up to 8 — capture on device/emulator against the live build. Sequence in `docs/aso-brief.md`.
- **Category:** Education (primary). See the ASO brief for the Education-vs-Games rationale.
- **Tags:** pick from Play's list — "Education", "Educational games", "Trivia" if offered.
- **Contact email:** egancheung@gmail.com
- **Privacy policy URL:** https://globalrecall.themillrace.ca/privacy.html

## Data Safety form (the important one — answers below match the actual app)

- **Does your app collect or share any of the required user data types?**
  → **Yes** (the leaderboard submission collects a small amount).
- **Is all of the user data collected by your app encrypted in transit?**
  → **Yes** (HTTPS to the Vercel/Upstash endpoint).
- **Do you provide a way for users to request that their data is deleted?**
  → The leaderboard stores no identifier tying a row to a person, so there's no
    per-user delete. Answer **No** to "can users request deletion," and in the
    explanation note the data is anonymous (3-letter initials + score + timestamp,
    no account/device ID). If Play requires a deletion URL regardless, point to the
    privacy policy which explains the anonymity.

  **Data types to declare:**
  - Everything under Location, Personal info, Financial info, Health, Messages,
    Photos, Contacts, Calendar, Files, App activity (analytics), Device IDs → **NOT collected.**
  - The only thing collected: the optional leaderboard entry. Play has no perfect
    category for "3 chosen letters + a game score." Closest is **App activity →
    "Other in-app actions"** or **App info and performance → "Other app data"**.
    Declare that one type as:
      - Collected: **Yes**
      - Shared: **No** (it's not shared with third parties; it's your own backend)
      - Processed ephemerally: **No** (it persists in the leaderboard)
      - Required or optional: **Optional** (only if the user chooses to submit initials)
      - Purpose: **App functionality** (the leaderboard feature)

- **Bottom line to keep the form honest:** no accounts, no ads, no analytics SDK,
  no device identifiers, no PII. The single declared item is the voluntary,
  anonymous leaderboard score. This matches `privacy.html` exactly.

## Content rating questionnaire

- **Category:** Reference, News, or Educational.
- All content questions (violence, sexuality, profanity, drugs, gambling,
  user-generated content, etc.) → **No.** It's a geography quiz.
- The 3-letter leaderboard initials are technically user-entered text, but they're
  filtered to A–Z, capped at 3 chars, and never shown as free-form chat — not
  "user-generated content" in the moderation sense. If asked whether users can
  interact or share content, answer **No**.
- Expected rating: **Everyone / PEGI 3.**

## Ads

- **Does your app contain ads?** → **No.**

## Target audience and content

- **Target age group:** 13+ is the cleanest answer (avoids the stricter
  Families/under-13 program requirements). The app has a Kids/Easy mode but is
  designed for a general adult audience per the product brief — do NOT opt into
  the "Designed for Families" program, which adds compliance overhead the MVP
  doesn't need.

## Release

- **Track:** start with **Internal testing** (up to 100 testers by email, no review
  wait) to confirm the signed bundle installs and runs from the store pipeline.
  Then promote to **Closed testing** → **Production** when ready.
- **Countries:** all, or start with your own for the internal track.
- **Upload:** the `.aab` above. Play re-signs with an app signing key it manages;
  your `keystore/global-recall-upload.jks` is the *upload* key that authenticates
  you to Play. Keep it safe — losing it means a reset process with Google.

---

## Order of operations once the account is verified

1. Create app → fill App details.
2. Store listing (paste copy, upload icon + feature graphic + screenshots).
3. Data Safety form (answers above).
4. Content rating questionnaire (answers above).
5. Ads / Target audience / other declarations (answers above).
6. Create an Internal testing release → upload the .aab → add yourself as a tester.
7. Install from the internal-test link on a real device, confirm it runs.
8. Promote to Production and submit for review.
