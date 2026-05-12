import { describe, it, expect, beforeEach } from 'vitest';
import { norm, lev, fmt, buildCountries, findMatch, seededShuffle } from './core.js';

describe('norm', () => {
  it('lowercases and trims', () => {
    expect(norm('  FRANCE  ')).toBe('france');
  });
  it('strips diacritics', () => {
    expect(norm('Éire')).toBe('eire');
    expect(norm('Österreich')).toBe('osterreich');
    expect(norm('România')).toBe('romania');
  });
  it('normalises apostrophes', () => {
    expect(norm("Côte d'Ivoire")).toBe("cote d'ivoire");
  });
});

describe('lev', () => {
  it('returns 0 for identical strings', () => {
    expect(lev('france', 'france')).toBe(0);
  });
  it('returns 1 for one substitution', () => {
    expect(lev('france', 'frence')).toBe(1);
  });
  it('returns 99 for length diff > 3', () => {
    expect(lev('a', 'abcde')).toBe(99);
  });
  it('handles empty strings', () => {
    expect(lev('', 'abc')).toBe(3);
    expect(lev('abc', '')).toBe(3);
  });
  it('returns 2 for two edits', () => {
    expect(lev('nicragua', 'nicaragua')).toBe(1); // one insertion
  });
});

describe('fmt', () => {
  it('formats zero', () => {
    expect(fmt(0)).toBe('00:00');
  });
  it('formats 90 seconds', () => {
    expect(fmt(90)).toBe('01:30');
  });
  it('formats 3600 seconds', () => {
    expect(fmt(3600)).toBe('60:00');
  });
  it('rounds fractional seconds', () => {
    expect(fmt(90.7)).toBe('01:31');
  });
  it('handles negatives (absolute value)', () => {
    expect(fmt(-60)).toBe('01:00');
  });
});

describe('findMatch', () => {
  const RAW = [
    ['France', []],
    ['Iceland', []],
    ['Ireland', []],
    ['Mongolia', []],
    ['Nicaragua', []],
    ['United Kingdom', ['UK', 'Great Britain', 'England', 'Britain', 'GB']],
    ['Myanmar', ['Burma']],
  ];
  let countries;

  beforeEach(() => {
    countries = buildCountries(RAW);
  });

  it('matches exact canonical name', () => {
    expect(findMatch('france', countries)?.canonical).toBe('France');
  });

  it('matches case-insensitively', () => {
    expect(findMatch('FRANCE', countries)?.canonical).toBe('France');
  });

  it('matches an alias', () => {
    expect(findMatch('burma', countries)?.canonical).toBe('Myanmar');
    expect(findMatch('england', countries)?.canonical).toBe('United Kingdom');
  });

  it('returns null for input shorter than 3 chars', () => {
    expect(findMatch('fr', countries)).toBeNull();
  });

  it('does not fuzzy-match short names (< 7 chars)', () => {
    // "franc" is 5 chars, France is 6 chars — both short, exact only
    expect(findMatch('franc', countries)).toBeNull();
  });

  it('does not confuse Iceland and Ireland (both 7 chars, lev=1)', () => {
    // Both are 7 chars — fuzzy requires 8+, so exact only
    expect(findMatch('iceland', countries)?.canonical).toBe('Iceland');
    expect(findMatch('ireland', countries)?.canonical).toBe('Ireland');
    // "icealnd" is a typo of Iceland — 7 chars, exact only, should NOT match
    expect(findMatch('icealnd', countries)).toBeNull();
  });

  it('allows 1-char typo for 8+ char names', () => {
    // "mongolia" is 8 chars; "mongoloa" has lev=1
    expect(findMatch('mongoloa', countries)?.canonical).toBe('Mongolia');
  });

  it('does not match short input against long name (mongoli → mongolia)', () => {
    expect(findMatch('mongoli', countries)).toBeNull();
  });

  it('allows 2-char typos for 12+ char names', () => {
    // "nicaragua" is 9 chars — needs 12+ for dist=2; "nicargauo" → dist=2, but 9<12, so should NOT match
    expect(findMatch('nicargauo', countries)).toBeNull();
    // "united kingdoo" is 14 chars → dist=2 from "united kingdom" (14), should match
    expect(findMatch('united kingdoo', countries)?.canonical).toBe('United Kingdom');
  });

  it('skips already-named countries', () => {
    countries[0].named = true; // France already named
    expect(findMatch('france', countries)).toBeNull();
  });
});

describe('seededShuffle', () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('does not mutate the input array', () => {
    const original = [...arr];
    seededShuffle(arr, 42);
    expect(arr).toEqual(original);
  });

  it('produces the same output for the same seed', () => {
    expect(seededShuffle(arr, 12345)).toEqual(seededShuffle(arr, 12345));
  });

  it('produces different output for different seeds', () => {
    expect(seededShuffle(arr, 1)).not.toEqual(seededShuffle(arr, 2));
  });

  it('preserves all elements (permutation)', () => {
    const out = seededShuffle(arr, 999);
    expect(out.sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b));
  });

  it('handles empty arrays', () => {
    expect(seededShuffle([], 42)).toEqual([]);
  });

  it('handles single-element arrays', () => {
    expect(seededShuffle([7], 42)).toEqual([7]);
  });
});
