import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { norm } from './core.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');

// Extract RAW from index.html instead of duplicating it. RAW is the source
// of truth for the runtime; pulling it out by regex keeps the test honest
// without forcing another inline-mirror file.
const HTML = readFileSync(join(REPO, 'index.html'), 'utf8');
const m = HTML.match(/const RAW = (\[[\s\S]*?\n\]);/);
if (!m) throw new Error('Could not extract RAW array from index.html');
// eslint-disable-next-line no-eval
const RAW = eval(m[1]);

const GEOJSON = JSON.parse(readFileSync(
  join(REPO, 'test-fixtures', 'ne_50m_admin_0_countries.geojson'),
  'utf8',
));

const featureByKey = {};
for (const feat of GEOJSON.features) {
  const p = feat.properties;
  for (const field of ['ADMIN', 'NAME', 'NAME_LONG', 'FORMAL_EN', 'NAME_ALT']) {
    if (p[field] && p[field] !== '-99') featureByKey[norm(p[field])] = feat;
  }
}

function resolve(canonical, aliases) {
  const names = [norm(canonical), ...aliases.map(norm)];
  for (const n of names) if (featureByKey[n]) return featureByKey[n];
  return null;
}

describe('country → GeoJSON coverage', () => {
  it('RAW was extracted from index.html', () => {
    // 195 UN states (incl. Holy See/Vatican) + Taiwan + Kosovo. Exact
    // assertion guards against an accidental row deletion or a regex slip.
    expect(RAW.length).toBe(198);
  });

  it('every RAW country resolves to a GeoJSON feature', () => {
    const unresolved = [];
    for (const [canonical, aliases] of RAW) {
      if (!resolve(canonical, aliases)) unresolved.push(canonical);
    }
    expect(unresolved).toEqual([]);
  });

  it('every resolved feature has a usable ADMIN id', () => {
    // promoteId: 'ADMIN' in the MapLibre source spec means ADMIN becomes the
    // feature id. If a feature's ADMIN is missing or '-99', setFeatureState
    // silently fails and the country will never paint.
    const bad = [];
    for (const [canonical, aliases] of RAW) {
      const feat = resolve(canonical, aliases);
      if (!feat) continue;
      const admin = feat.properties && feat.properties.ADMIN;
      if (!admin || admin === '-99') bad.push({ canonical, admin });
    }
    expect(bad).toEqual([]);
  });

  it('no two RAW countries resolve to the same feature', () => {
    const seen = new Map();
    const dups = [];
    for (const [canonical, aliases] of RAW) {
      const feat = resolve(canonical, aliases);
      if (!feat) continue;
      const admin = feat.properties.ADMIN;
      if (seen.has(admin)) dups.push({ admin, first: seen.get(admin), second: canonical });
      else seen.set(admin, canonical);
    }
    expect(dups).toEqual([]);
  });
});
