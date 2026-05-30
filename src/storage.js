// Persistence layer for Global Recall.
//
// Every piece of user state — records, ghost runs, daily streak, globe style,
// install-banner snooze — flows through this module. The runtime in
// index.html mirrors this exact shape so the game works without a build step,
// the same pattern src/core.js uses (see the "Mirror of src/core.js" comments
// in index.html).
//
// Why this exists: the product brief commits to building state "in a shape
// that could migrate to a backend later without a rewrite." Direct
// `localStorage.setItem('gr_foo', ...)` scattered across the file would make
// that migration mean touching every feature. Everything goes through this
// module instead, and the day we want cloud sync we swap the `store` argument
// for a remote-backed implementation.
//
// Schema versioning is load-bearing. Returning users have data in the v1
// shape already — v0 → v1 is a no-op that just stamps the version. The
// migration runner is in place so v2 (when we change the daily blob shape or
// add per-country miss counts for spaced repetition) doesn't strand anyone.

export const SCHEMA_VERSION = 3;

export const STORAGE_KEYS = Object.freeze({
  schemaVersion:    'gr_schema_version',
  ghost:            'gr_ghost',
  recs:             'gr_recs',
  sprintBest:       'gr_sprint_best',
  daily:            'gr_daily',
  style:            'gr_style',
  installDismissed: 'gr_install_dismissed',
  liteMode:         'gr_lite_mode',
  leaderboard:      'gr_leaderboard',
});

// Per-mode leaderboard: { sprint: Entry[], strict: Entry[] }
// Entry: { initials: 'AAA', score: number, ts: number }
// Cap at 100 per mode (oldest-lowest evicted), shared across the device.
export const LEADERBOARD_CAP = 100;

// Migrations are keyed by the version they UPGRADE TO. To go from v(N-1) to
// vN, run migrations[N]. Add new entries here when the schema changes; never
// rewrite an existing one (returning users at any prior version must walk
// through every step to land on the current schema).
const MIGRATIONS = {
  1: (_store) => {
    // No-op: v1 is the initial stamped schema. Existing users' localStorage
    // data is already in this shape — we just need to record the version so
    // future migrations have a defined starting point.
  },
  2: (store) => {
    // Add longestStreak to the daily blob. Seed from the user's current
    // streak so a returning user with a 7-day streak immediately sees
    // "BEST 7" instead of "BEST 0" — losing the streak right after this
    // ships would otherwise feel like the app forgot.
    try {
      const raw = store.getItem(STORAGE_KEYS.daily);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d && typeof d === 'object' && d.longestStreak == null) {
        d.longestStreak = d.streak || 0;
        store.setItem(STORAGE_KEYS.daily, JSON.stringify(d));
      }
    } catch { /* corrupt blob — leave it; readJSON will fall back later */ }
  },
  3: (store) => {
    // Initialize the empty per-mode leaderboard. v2 users had no concept
    // of one; seeding it now means qualifiesForLeaderboard short-circuits
    // to true for the first 100 runs of each mode without any guard.
    if (!store.getItem(STORAGE_KEYS.leaderboard)) {
      store.setItem(STORAGE_KEYS.leaderboard, JSON.stringify({ sprint: [], strict: [] }));
    }
  },
};

// Local-calendar day number. The streak comparison MUST use the player's
// local day, not UTC — otherwise someone in EST playing Monday 11pm
// (= Tuesday 4am UTC) and Tuesday 11pm (= Wednesday 4am UTC) looks
// "consecutive" to UTC, even though locally they skipped Tuesday entirely.
// Exported so the inline mirror in index.html stays a literal copy.
export function localDayNumber(nowMs) {
  const d = new Date(nowMs);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 86400000);
}

function readJSON(store, key, fallback) {
  try {
    const raw = store.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(store, key, value) {
  store.setItem(key, JSON.stringify(value));
}

function runMigrations(store) {
  const current = parseInt(store.getItem(STORAGE_KEYS.schemaVersion) || '0', 10) || 0;
  for (let v = current + 1; v <= SCHEMA_VERSION; v++) {
    const fn = MIGRATIONS[v];
    if (fn) fn(store);
    store.setItem(STORAGE_KEYS.schemaVersion, String(v));
  }
}

// In-memory fallback so tests and non-browser environments don't crash and
// so a single Storage instance can be used uniformly.
function memoryStore() {
  const mem = new Map();
  return {
    getItem:    (k) => (mem.has(k) ? mem.get(k) : null),
    setItem:    (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); },
  };
}

export function createStorage(store) {
  if (!store) store = memoryStore();
  runMigrations(store);

  return {
    // ── Schema introspection ────────────────────────────────────────────
    getSchemaVersion() {
      return parseInt(store.getItem(STORAGE_KEYS.schemaVersion) || '0', 10) || 0;
    },

    // ── Ghost replay (Name All) ─────────────────────────────────────────
    // Shape: { countries: string[], timestamps: number[], totalTime: number } | null
    getGhost() {
      return readJSON(store, STORAGE_KEYS.ghost, null);
    },
    saveGhost(countries, timestamps, totalTime) {
      writeJSON(store, STORAGE_KEYS.ghost, {
        countries:  countries.slice(0, 100),
        timestamps: timestamps.slice(0, 100),
        totalTime,
      });
    },
    // Used by the share-link handler that imports a ghost from a URL param.
    saveRawGhost(blob) {
      writeJSON(store, STORAGE_KEYS.ghost, blob);
    },

    // ── Personal records ────────────────────────────────────────────────
    // Shape: { [mode]: { best: number, best_time: number, runs: number } }
    getRecs() {
      return readJSON(store, STORAGE_KEYS.recs, {});
    },
    // Record a Name All run; returns { isPB, prev }.
    saveNameAllRun(count, timeS) {
      const recs = readJSON(store, STORAGE_KEYS.recs, {});
      const key = 'name_all';
      if (!recs[key]) recs[key] = { best: 0, best_time: Infinity, runs: 0 };
      recs[key].runs++;
      const isPB = count > recs[key].best
        || (count === recs[key].best && timeS < recs[key].best_time);
      const prev = recs[key].best;
      if (count > recs[key].best) recs[key].best = count;
      if (timeS < recs[key].best_time) recs[key].best_time = timeS;
      writeJSON(store, STORAGE_KEYS.recs, recs);
      return { isPB, prev };
    },

    // ── Sprint best ─────────────────────────────────────────────────────
    getSprintBest() {
      return parseInt(store.getItem(STORAGE_KEYS.sprintBest) || '0', 10) || 0;
    },
    // Returns { isNewPB, prev }.
    saveSprintResult(count) {
      const prev = parseInt(store.getItem(STORAGE_KEYS.sprintBest) || '0', 10) || 0;
      const isNewPB = count > prev;
      if (isNewPB) store.setItem(STORAGE_KEYS.sprintBest, String(count));
      return { isNewPB, prev };
    },

    // ── Daily challenge ─────────────────────────────────────────────────
    // Shape: { lastDay, streak, longestStreak, lastScore, lastTotal }
    getDaily() {
      return readJSON(store, STORAGE_KEYS.daily, {});
    },
    // Records today's result. Once-per-day idempotent (second call same UTC
    // day returns existing state without re-stamping isNewBest). Streak
    // increments when yesterday was the last day played, resets to 1
    // otherwise. longestStreak only ever moves up. Returns the persisted
    // blob with one extra ephemeral field — `isNewBest` — used by the UI
    // for "🔥 N DAY STREAK — NEW BEST!" treatment.
    saveDailyResult(count, total, nowMs = Date.now()) {
      const today = localDayNumber(nowMs);
      const d = readJSON(store, STORAGE_KEYS.daily, {});
      if (d.lastDay === today) return { ...d, isNewBest: false };
      const streak = d.lastDay === today - 1 ? (d.streak || 0) + 1 : 1;
      const prevLongest = d.longestStreak || 0;
      const longestStreak = Math.max(prevLongest, streak);
      const isNewBest = streak > prevLongest && streak > 1;
      const next = { lastDay: today, streak, longestStreak,
                     lastScore: count, lastTotal: total };
      writeJSON(store, STORAGE_KEYS.daily, next);
      return { ...next, isNewBest };
    },

    // ── Globe style preference ─────────────────────────────────────────
    getStyle() {
      return store.getItem(STORAGE_KEYS.style);
    },
    saveStyle(key) {
      store.setItem(STORAGE_KEYS.style, key);
    },

    // ── Lite Mode (performance toggle for weak GPUs) ───────────────────
    // null = "not yet decided" (caller should run auto-detect on first boot).
    // true / false = user or auto-detect has made a choice; persists.
    getLiteMode() {
      const v = store.getItem(STORAGE_KEYS.liteMode);
      if (v == null) return null;
      return v === 'true';
    },
    saveLiteMode(on) {
      store.setItem(STORAGE_KEYS.liteMode, on ? 'true' : 'false');
    },

    // ── Leaderboard (arcade-cabinet style, per-device) ─────────────────
    // Shape: { sprint: Entry[], strict: Entry[] } where Entry is
    // { initials: 'AAA', score: number, ts: epoch-ms }.
    // Sorted desc by score. Cap of 100 per mode, lowest evicted on overflow.
    getLeaderboard(mode) {
      const lb = readJSON(store, STORAGE_KEYS.leaderboard, {});
      return Array.isArray(lb[mode]) ? lb[mode] : [];
    },
    // Returns the rank (1-based) the new entry would land at, or null if
    // it doesn't qualify for the top LEADERBOARD_CAP.
    leaderboardRankFor(mode, score) {
      const list = this.getLeaderboard(mode);
      if (list.length < LEADERBOARD_CAP) {
        // Always qualifies if there's room.
        let rank = 1;
        for (const e of list) { if (e.score >= score) rank++; else break; }
        return rank;
      }
      const lowest = list[list.length - 1].score;
      if (score <= lowest) return null;
      let rank = 1;
      for (const e of list) { if (e.score >= score) rank++; else break; }
      return rank;
    },
    qualifiesForLeaderboard(mode, score) {
      return this.leaderboardRankFor(mode, score) !== null;
    },
    saveLeaderboardEntry(mode, initials, score, nowMs = Date.now()) {
      const lb = readJSON(store, STORAGE_KEYS.leaderboard, {});
      const list = Array.isArray(lb[mode]) ? lb[mode] : [];
      // Normalize initials: 3 uppercase A-Z chars, padded if short.
      const clean = String(initials || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'A');
      list.push({ initials: clean, score: Number(score) | 0, ts: nowMs });
      list.sort((a, b) => b.score - a.score || a.ts - b.ts);
      if (list.length > LEADERBOARD_CAP) list.length = LEADERBOARD_CAP;
      lb[mode] = list;
      writeJSON(store, STORAGE_KEYS.leaderboard, lb);
      return list.findIndex(e => e.ts === nowMs && e.initials === clean && e.score === (Number(score) | 0)) + 1;
    },

    // ── Install-banner snooze ──────────────────────────────────────────
    // Stored as the epoch-ms timestamp of the last dismissal. The 7-day
    // snooze window lives in the caller — Storage just records the stamp.
    getInstallDismissedAt() {
      return parseInt(store.getItem(STORAGE_KEYS.installDismissed) || '0', 10) || 0;
    },
    snoozeInstall(nowMs = Date.now()) {
      store.setItem(STORAGE_KEYS.installDismissed, String(nowMs));
    },
    clearInstallSnooze() {
      store.removeItem(STORAGE_KEYS.installDismissed);
    },
  };
}
