// Core matching functions extracted from index.html for unit testing.
// The game itself still uses inline versions — keep these in sync.

export function norm(s) {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[''`]/g, "'");
}

export function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  if (Math.abs(m - n) > 3) return 99;
  const dp = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
    for (let j = 1; j <= n; j++) dp[i][j] = i === 0 ? j : 0;
  }
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

export function fmt(s) {
  s = Math.round(Math.abs(s));
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

export function buildCountries(RAW) {
  return RAW.map(([canonical, aliases]) => ({
    canonical, aliases, named: false, feat: null
  }));
}

// Deterministic Fisher-Yates shuffle using an LCG seeded by `seed`.
// The same seed always produces the same shuffle — that's how Daily Challenge
// gives every player the same 10 countries on a given UTC day.
export function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

export function findMatch(raw, countries) {
  const inp = norm(raw);
  if (inp.length < 3) return null;
  for (const c of countries) {
    if (c.named) continue;
    const names = [norm(c.canonical), ...c.aliases.map(norm)];
    for (const n of names) {
      if (n === inp) return c;
      if (n.length < 7) continue;
      if (inp.length < n.length) continue;
      if (inp.length > n.length + 1) continue;
      const dist = lev(inp, n);
      if (n.length >= 8  && dist === 1) return c;
      if (n.length >= 12 && dist === 2) return c;
    }
  }
  return null;
}
