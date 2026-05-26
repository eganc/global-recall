import { describe, it, expect } from 'vitest';
import { createStorage, SCHEMA_VERSION, STORAGE_KEYS } from './storage.js';

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

  it('first ever play sets streak=1', () => {
    const s = createStorage(makeStore());
    const next = s.saveDailyResult(8, 10, 100 * DAY);
    expect(next.streak).toBe(1);
    expect(next.lastScore).toBe(8);
    expect(next.lastTotal).toBe(10);
  });

  it('consecutive day increments streak', () => {
    const s = createStorage(makeStore());
    s.saveDailyResult(8, 10, 100 * DAY);
    const next = s.saveDailyResult(9, 10, 101 * DAY);
    expect(next.streak).toBe(2);
  });

  it('gap of more than one day resets streak to 1', () => {
    const s = createStorage(makeStore());
    s.saveDailyResult(8, 10, 100 * DAY);
    s.saveDailyResult(9, 10, 101 * DAY);
    const next = s.saveDailyResult(5, 10, 105 * DAY);
    expect(next.streak).toBe(1);
  });

  it('second save on the same day is a no-op', () => {
    const s = createStorage(makeStore());
    s.saveDailyResult(8, 10, 100 * DAY);
    const next = s.saveDailyResult(10, 10, 100 * DAY);
    expect(next.streak).toBe(1);
    expect(next.lastScore).toBe(8);  // not overwritten
    expect(next.isNewBest).toBe(false);
  });

  it('tracks longestStreak as a high-water mark', () => {
    const s = createStorage(makeStore());
    s.saveDailyResult(5, 10, 100 * DAY);
    s.saveDailyResult(6, 10, 101 * DAY);
    s.saveDailyResult(7, 10, 102 * DAY);
    expect(s.getDaily().streak).toBe(3);
    expect(s.getDaily().longestStreak).toBe(3);
    // Break the streak — longestStreak stays at 3.
    const broken = s.saveDailyResult(4, 10, 110 * DAY);
    expect(broken.streak).toBe(1);
    expect(broken.longestStreak).toBe(3);
  });

  it('reports isNewBest only when current crosses longest AND streak > 1', () => {
    const s = createStorage(makeStore());
    // Day 1 — streak goes 0→1. Not "new best" — first daily is not a milestone.
    const first = s.saveDailyResult(5, 10, 100 * DAY);
    expect(first.isNewBest).toBe(false);
    // Day 2 — streak 1→2. Crosses prior longest (1). NEW BEST.
    const second = s.saveDailyResult(6, 10, 101 * DAY);
    expect(second.isNewBest).toBe(true);
    expect(second.longestStreak).toBe(2);
    // Day 3 — streak 2→3. Crosses prior longest (2). NEW BEST.
    const third = s.saveDailyResult(7, 10, 102 * DAY);
    expect(third.isNewBest).toBe(true);
    // Break streak then rebuild — equal to but not exceeding longest = NOT a new best.
    s.saveDailyResult(4, 10, 110 * DAY);  // streak resets to 1
    s.saveDailyResult(5, 10, 111 * DAY);  // streak 1→2 — longest is 3
    const equal = s.saveDailyResult(6, 10, 112 * DAY);  // streak 2→3 — ties longest
    expect(equal.streak).toBe(3);
    expect(equal.isNewBest).toBe(false);   // ties don't count as new best
    expect(equal.longestStreak).toBe(3);
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
