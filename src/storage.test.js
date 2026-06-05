import { describe, it, expect } from 'vitest';
import { createStorage, SCHEMA_VERSION, STORAGE_KEYS, localDayNumber } from './storage.js';

// Build a fresh in-memory store, optionally pre-seeded with raw key/value pairs
// to simulate a returning user with v0 (unstamped) data.
function makeStore(seed = {}) {
  const mem = new Map(Object.entries(seed));
  return {
    getItem:    (k) => (mem.has(k) ? mem.get(k) : null),
    setItem:    (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); },
    _mem:       mem,
  };
}

describe('schema versioning', () => {
  it('stamps the version on a brand-new store', () => {
    const store = makeStore();
    const s = createStorage(store);
    expect(s.getSchemaVersion()).toBe(SCHEMA_VERSION);
    expect(store.getItem(STORAGE_KEYS.schemaVersion)).toBe(String(SCHEMA_VERSION));
  });

  it('upgrades an unstamped (v0) store without nuking existing data', () => {
    // Simulate a returning user: they have a sprint best and a daily streak
    // saved from before we introduced schema versioning.
    const store = makeStore({
      [STORAGE_KEYS.sprintBest]: '47',
      [STORAGE_KEYS.daily]:      JSON.stringify({ lastDay: 100, streak: 3 }),
    });
    const s = createStorage(store);
    expect(s.getSchemaVersion()).toBe(SCHEMA_VERSION);
    expect(s.getSprintBest()).toBe(47);
    // v0 → v2 also runs the v2 migration, which seeds longestStreak from streak.
    expect(s.getDaily()).toEqual({ lastDay: 100, streak: 3, longestStreak: 3 });
  });

  it('is idempotent on re-init', () => {
    const store = makeStore();
    createStorage(store);
    const s = createStorage(store);
    expect(s.getSchemaVersion()).toBe(SCHEMA_VERSION);
  });

  it('v2 migration seeds longestStreak from a returning v1 user', () => {
    // A v1 user with a live 7-day streak. v2 must seed longestStreak=7
    // so they don't see "BEST 0" the day the migration ships.
    const store = makeStore({
      gr_schema_version: '1',
      [STORAGE_KEYS.daily]: JSON.stringify({ lastDay: 100, streak: 7, lastScore: 8, lastTotal: 10 }),
    });
    const s = createStorage(store);
    expect(s.getDaily().longestStreak).toBe(7);
    expect(s.getDaily().streak).toBe(7);
  });

  it('v2 migration tolerates a user who has never played Daily', () => {
    const store = makeStore({ gr_schema_version: '1' });
    const s = createStorage(store);
    expect(s.getSchemaVersion()).toBe(SCHEMA_VERSION);
    expect(s.getDaily()).toEqual({});
  });

  it('v2 migration does not overwrite a pre-existing longestStreak', () => {
    const store = makeStore({
      gr_schema_version: '1',
      [STORAGE_KEYS.daily]: JSON.stringify({ lastDay: 100, streak: 3, longestStreak: 9 }),
    });
    const s = createStorage(store);
    expect(s.getDaily().longestStreak).toBe(9);
  });
});

describe('records', () => {
  it('returns empty object when no records exist', () => {
    const s = createStorage(makeStore());
    expect(s.getRecs()).toEqual({});
  });

  it('records first run as a PB with prev=0', () => {
    const s = createStorage(makeStore());
    const r = s.saveNameAllRun(50, 120);
    expect(r.isPB).toBe(true);
    expect(r.prev).toBe(0);
    expect(s.getRecs().name_all.best).toBe(50);
    expect(s.getRecs().name_all.runs).toBe(1);
  });

  it('does not promote PB when count is lower', () => {
    const s = createStorage(makeStore());
    s.saveNameAllRun(80, 200);
    const r = s.saveNameAllRun(60, 100);
    expect(r.isPB).toBe(false);
    expect(r.prev).toBe(80);
    expect(s.getRecs().name_all.best).toBe(80);
    expect(s.getRecs().name_all.runs).toBe(2);
  });

  it('promotes PB on faster time at equal count', () => {
    const s = createStorage(makeStore());
    s.saveNameAllRun(80, 200);
    const r = s.saveNameAllRun(80, 150);
    expect(r.isPB).toBe(true);
    expect(s.getRecs().name_all.best_time).toBe(150);
  });

  it('returns empty object on corrupt JSON', () => {
    const store = makeStore({ [STORAGE_KEYS.recs]: '{not json' });
    const s = createStorage(store);
    expect(s.getRecs()).toEqual({});
  });
});

describe('sprint best', () => {
  it('starts at 0', () => {
    const s = createStorage(makeStore());
    expect(s.getSprintBest()).toBe(0);
  });

  it('saves a new PB and reports prev', () => {
    const s = createStorage(makeStore());
    s.saveSprintResult(30);
    const r = s.saveSprintResult(45);
    expect(r.isNewPB).toBe(true);
    expect(r.prev).toBe(30);
    expect(s.getSprintBest()).toBe(45);
  });

  it('does not save when not a PB', () => {
    const s = createStorage(makeStore());
    s.saveSprintResult(45);
    const r = s.saveSprintResult(30);
    expect(r.isNewPB).toBe(false);
    expect(s.getSprintBest()).toBe(45);
  });
});

describe('daily', () => {
  const DAY = 86400000;
  // Noon UTC of day N — falls on the same LOCAL calendar day for every
  // timezone between UTC-12 and UTC+12, which covers anywhere a human
  // actually plays from. saveDailyResult uses local-day math now, so
  // tests that just want to express "day N" should anchor at noon UTC.
  const noonOf = (n) => n * DAY + 12 * 3600 * 1000;

  it('first ever play sets streak=1', () => {
    const s = createStorage(makeStore());
    const next = s.saveDailyResult(8, 10, noonOf(100));
    expect(next.streak).toBe(1);
    expect(next.lastScore).toBe(8);
    expect(next.lastTotal).toBe(10);
  });

  it('consecutive day increments streak', () => {
    const s = createStorage(makeStore());
    s.saveDailyResult(8, 10, noonOf(100));
    const next = s.saveDailyResult(9, 10, noonOf(101));
    expect(next.streak).toBe(2);
  });

  it('gap of more than one day resets streak to 1', () => {
    const s = createStorage(makeStore());
    s.saveDailyResult(8, 10, noonOf(100));
    s.saveDailyResult(9, 10, noonOf(101));
    const next = s.saveDailyResult(5, 10, noonOf(105));
    expect(next.streak).toBe(1);
  });

  it('second save on the same day is a no-op', () => {
    const s = createStorage(makeStore());
    s.saveDailyResult(8, 10, noonOf(100));
    const next = s.saveDailyResult(10, 10, noonOf(100));
    expect(next.streak).toBe(1);
    expect(next.lastScore).toBe(8);  // not overwritten
    expect(next.isNewBest).toBe(false);
  });

  it('tracks longestStreak as a high-water mark', () => {
    const s = createStorage(makeStore());
    s.saveDailyResult(5, 10, noonOf(100));
    s.saveDailyResult(6, 10, noonOf(101));
    s.saveDailyResult(7, 10, noonOf(102));
    expect(s.getDaily().streak).toBe(3);
    expect(s.getDaily().longestStreak).toBe(3);
    // Break the streak — longestStreak stays at 3.
    const broken = s.saveDailyResult(4, 10, noonOf(110));
    expect(broken.streak).toBe(1);
    expect(broken.longestStreak).toBe(3);
  });

  it('reports isNewBest only when current crosses longest AND streak > 1', () => {
    const s = createStorage(makeStore());
    // Day 1 — streak goes 0→1. Not "new best" — first daily is not a milestone.
    const first = s.saveDailyResult(5, 10, noonOf(100));
    expect(first.isNewBest).toBe(false);
    // Day 2 — streak 1→2. Crosses prior longest (1). NEW BEST.
    const second = s.saveDailyResult(6, 10, noonOf(101));
    expect(second.isNewBest).toBe(true);
    expect(second.longestStreak).toBe(2);
    // Day 3 — streak 2→3. Crosses prior longest (2). NEW BEST.
    const third = s.saveDailyResult(7, 10, noonOf(102));
    expect(third.isNewBest).toBe(true);
    // Break streak then rebuild — equal to but not exceeding longest = NOT a new best.
    s.saveDailyResult(4, 10, noonOf(110));  // streak resets to 1
    s.saveDailyResult(5, 10, noonOf(111));  // streak 1→2 — longest is 3
    const equal = s.saveDailyResult(6, 10, noonOf(112));  // streak 2→3 — ties longest
    expect(equal.streak).toBe(3);
    expect(equal.isNewBest).toBe(false);   // ties don't count as new best
    expect(equal.longestStreak).toBe(3);
  });

  it('uses local-day math: noon-UTC of day N falls on the same local day for every realistic TZ', () => {
    // The streak compare relies on local day. Noon UTC is the safe anchor
    // because UTC±12 still lands the same calendar date locally.
    expect(localDayNumber(noonOf(100))).toBe(localDayNumber(noonOf(100) + 1000));
    // A 36-hour gap MUST cross a local-day boundary (gap >= 1 local day),
    // regardless of TZ. Used by the regression test below.
    expect(localDayNumber(noonOf(100)) < localDayNumber(noonOf(100) + 36 * 3600 * 1000)).toBe(true);
  });

  it('regression: a skipped local day resets the streak even when UTC days look consecutive', () => {
    // Reproduces the bug a real user hit. Play 1: noon UTC day 100 →
    // every TZ between UTC-12 and UTC+12 reads this as local day 100.
    // Play 2: noon UTC day 102 (36-hour gap → at least one local day
    // skipped, regardless of TZ). Streak MUST reset.
    const s = createStorage(makeStore());
    s.saveDailyResult(5, 10, noonOf(100));
    expect(s.getDaily().streak).toBe(1);
    const next = s.saveDailyResult(5, 10, noonOf(102));
    expect(next.streak).toBe(1);  // gap of 2 local days → reset
  });
});

describe('style', () => {
  it('returns null when nothing saved', () => {
    const s = createStorage(makeStore());
    expect(s.getStyle()).toBe(null);
  });

  it('roundtrips a value', () => {
    const s = createStorage(makeStore());
    s.saveStyle('atlas');
    expect(s.getStyle()).toBe('atlas');
  });
});

describe('lite mode', () => {
  it('returns null when never set (so caller knows to auto-detect)', () => {
    const s = createStorage(makeStore());
    expect(s.getLiteMode()).toBe(null);
  });

  it('roundtrips true and false as booleans', () => {
    const s = createStorage(makeStore());
    s.saveLiteMode(true);
    expect(s.getLiteMode()).toBe(true);
    s.saveLiteMode(false);
    expect(s.getLiteMode()).toBe(false);
  });

  it('returns true for the literal string "true", false otherwise', () => {
    // Defensive: corrupt or hand-edited values must not parse as truthy by mistake.
    const store = makeStore({ [STORAGE_KEYS.liteMode]: 'yes' });
    const s = createStorage(store);
    expect(s.getLiteMode()).toBe(false);
  });
});

describe('install snooze', () => {
  it('returns 0 when never dismissed', () => {
    const s = createStorage(makeStore());
    expect(s.getInstallDismissedAt()).toBe(0);
  });

  it('records the timestamp', () => {
    const s = createStorage(makeStore());
    s.snoozeInstall(123456);
    expect(s.getInstallDismissedAt()).toBe(123456);
  });

  it('clears the timestamp', () => {
    const s = createStorage(makeStore());
    s.snoozeInstall(999);
    s.clearInstallSnooze();
    expect(s.getInstallDismissedAt()).toBe(0);
  });
});

describe('ghost', () => {
  it('returns null when no ghost saved', () => {
    const s = createStorage(makeStore());
    expect(s.getGhost()).toBe(null);
  });

  it('caps countries and timestamps at 100', () => {
    const s = createStorage(makeStore());
    const big = Array.from({ length: 150 }, (_, i) => i);
    s.saveGhost(big.map(String), big, 600);
    const g = s.getGhost();
    expect(g.countries).toHaveLength(100);
    expect(g.timestamps).toHaveLength(100);
    expect(g.totalTime).toBe(600);
  });

  it('saveRawGhost accepts a pre-built blob (URL-import path)', () => {
    const s = createStorage(makeStore());
    s.saveRawGhost({ countries: ['Peru'], timestamps: [1], totalTime: 1 });
    expect(s.getGhost().countries).toEqual(['Peru']);
  });

  it('returns null on corrupt JSON', () => {
    const store = makeStore({ [STORAGE_KEYS.ghost]: 'nope' });
    const s = createStorage(store);
    expect(s.getGhost()).toBe(null);
  });
});

describe('leaderboard', () => {
  it('starts empty, qualifies any positive score, ranks #1 first', () => {
    const s = createStorage(makeStore());
    expect(s.getLeaderboard('sprint')).toEqual([]);
    expect(s.qualifiesForLeaderboard('sprint', 5)).toBe(true);
    expect(s.leaderboardRankFor('sprint', 5)).toBe(1);
  });

  it('sorts descending by score, ties broken by older-first', () => {
    const s = createStorage(makeStore());
    s.saveLeaderboardEntry('sprint', 'AAA', 10, 1000);
    s.saveLeaderboardEntry('sprint', 'BBB', 20, 2000);
    s.saveLeaderboardEntry('sprint', 'CCC', 20, 3000);
    const list = s.getLeaderboard('sprint');
    expect(list.map(e => e.initials)).toEqual(['BBB', 'CCC', 'AAA']);
  });

  it('normalizes initials to 3 uppercase A-Z, padding shorts', () => {
    const s = createStorage(makeStore());
    s.saveLeaderboardEntry('sprint', 'xy!', 5, 100);
    expect(s.getLeaderboard('sprint')[0].initials).toBe('XYA');
  });

  it('caps the list at 100 entries, evicts lowest', () => {
    const s = createStorage(makeStore());
    for (let i = 0; i < 105; i++) {
      s.saveLeaderboardEntry('sprint', 'AAA', i + 1, 1000 + i);
    }
    const list = s.getLeaderboard('sprint');
    expect(list.length).toBe(100);
    expect(list[0].score).toBe(105);
    expect(list[99].score).toBe(6);
  });

  it('disqualifies a score that does not beat the lowest of a full board', () => {
    const s = createStorage(makeStore());
    for (let i = 0; i < 100; i++) {
      s.saveLeaderboardEntry('sprint', 'AAA', 50 + i, 1000 + i);
    }
    // Lowest entry is 50; 50 ties (not greater than) → disqualify.
    expect(s.qualifiesForLeaderboard('sprint', 50)).toBe(false);
    expect(s.qualifiesForLeaderboard('sprint', 51)).toBe(true);
  });

  it('separates leaderboards per mode', () => {
    const s = createStorage(makeStore());
    s.saveLeaderboardEntry('sprint', 'AAA', 10, 1000);
    s.saveLeaderboardEntry('strict', 'BBB', 5, 1000);
    expect(s.getLeaderboard('sprint').length).toBe(1);
    expect(s.getLeaderboard('strict').length).toBe(1);
    expect(s.getLeaderboard('strict')[0].initials).toBe('BBB');
  });
});

describe('my scores (private self-identification)', () => {
  it('records and recognises a submission across the same fingerprint', () => {
    const s = createStorage(makeStore());
    s.recordMyScore('sprint', 'MIO', 42, 1700000000000);
    expect(s.isMyScore('sprint', 'MIO', 42, 1700000000000)).toBe(true);
  });

  it('recognises your rows even under different initials', () => {
    const s = createStorage(makeStore());
    s.recordMyScore('sprint', 'MIO', 42, 1700000000000);
    s.recordMyScore('sprint', 'ZZZ', 50, 1700000000001);
    expect(s.isMyScore('sprint', 'MIO', 42, 1700000000000)).toBe(true);
    expect(s.isMyScore('sprint', 'ZZZ', 50, 1700000000001)).toBe(true);
  });

  it('does not claim a stranger row with the same initials+score but a different ts', () => {
    const s = createStorage(makeStore());
    s.recordMyScore('sprint', 'AAA', 99, 1700000000000);
    expect(s.isMyScore('sprint', 'AAA', 99, 1700000000999)).toBe(false);
  });

  it('is mode-scoped', () => {
    const s = createStorage(makeStore());
    s.recordMyScore('sprint', 'AAA', 10, 1700000000000);
    expect(s.isMyScore('strict', 'AAA', 10, 1700000000000)).toBe(false);
  });

  it('normalises initials the same way the board does', () => {
    const s = createStorage(makeStore());
    s.recordMyScore('sprint', 'm!o', 7, 1700000000000);
    expect(s.isMyScore('sprint', 'MOA', 7, 1700000000000)).toBe(true);
  });

  it('caps the list so it cannot grow without bound', () => {
    const s = createStorage(makeStore());
    for (let i = 0; i < 320; i++) s.recordMyScore('sprint', 'AAA', i, 1700000000000 + i);
    const list = s.getMyScores();
    expect(list.length).toBeLessThanOrEqual(300);
    // Most recent survive; the very first ones were trimmed.
    expect(s.isMyScore('sprint', 'AAA', 319, 1700000000319)).toBe(true);
    expect(s.isMyScore('sprint', 'AAA', 0, 1700000000000)).toBe(false);
  });
});
