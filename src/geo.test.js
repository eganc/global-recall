import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { featureCentroid, featureAltitude, altitudeToZoom } from './geo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GEOJSON = JSON.parse(readFileSync(
  join(__dirname, '..', 'test-fixtures', 'ne_50m_admin_0_countries.geojson'),
  'utf8',
));

function findByAdmin(name) {
  return GEOJSON.features.find(f => f.properties && f.properties.ADMIN === name);
}

describe('featureCentroid', () => {
  it('returns a sensible lat/lng for a Polygon feature', () => {
    const france = findByAdmin('France');
    const c = featureCentroid(france);
    expect(c).not.toBeNull();
    // France: roughly between 42N–51N and -5W–9E. Centroid is anywhere in there.
    expect(c.lat).toBeGreaterThan(35);
    expect(c.lat).toBeLessThan(55);
    expect(c.lng).toBeGreaterThan(-10);
    expect(c.lng).toBeLessThan(15);
  });

  it('returns null for a feature without geometry', () => {
    expect(featureCentroid({})).toBeNull();
    expect(featureCentroid({ geometry: null })).toBeNull();
    expect(featureCentroid({ geometry: { type: 'Polygon', coordinates: [[]] } })).toBeNull();
  });

  it('picks the largest ring for a MultiPolygon', () => {
    const indonesia = findByAdmin('Indonesia');
    const c = featureCentroid(indonesia);
    expect(c).not.toBeNull();
    // Indonesia spans a wide range; the largest ring is one of the bigger islands.
    // Just sanity-check that the centroid is in the Indonesian archipelago bbox.
    expect(c.lat).toBeGreaterThan(-12);
    expect(c.lat).toBeLessThan(10);
    expect(c.lng).toBeGreaterThan(90);
    expect(c.lng).toBeLessThan(145);
  });
});

describe('featureAltitude', () => {
  it('returns a small altitude for a small country', () => {
    const andorra = findByAdmin('Andorra');
    const alt = featureAltitude(andorra);
    expect(alt).toBeLessThan(0.5);
  });

  it('returns a large altitude for a big country', () => {
    const russia = findByAdmin('Russia');
    const alt = featureAltitude(russia);
    expect(alt).toBeGreaterThan(1.5);
  });

  it('handles New Zealand antimeridian crossing without ballooning the span', () => {
    // Regression test for the "NZ zooms bizarrely out" bug — NZ geometry
    // includes the Chatham Islands and subantarctic dependencies, which
    // in some Natural Earth releases cross the 180° antimeridian. A
    // naïve max-min calculation read this as a 352° span and capped
    // altitude to 2.5 (the same as Russia), zooming far too wide.
    const nz = findByAdmin('New Zealand');
    expect(nz).toBeDefined();
    const alt = featureAltitude(nz);
    // NZ is closer to Andorra-sized than to Russia-sized at the country
    // scale. Should land below the global average altitude.
    expect(alt).toBeLessThan(1.5);
  });

  it('handles Fiji antimeridian crossing', () => {
    const fiji = findByAdmin('Fiji');
    if (!fiji) return;
    const alt = featureAltitude(fiji);
    expect(alt).toBeLessThan(1.0);
  });

  it('falls back to 1.5 for malformed geometry', () => {
    expect(featureAltitude({})).toBe(1.5);
    expect(featureAltitude({ geometry: null })).toBe(1.5);
    expect(featureAltitude({ geometry: { type: 'Polygon', coordinates: [[]] } })).toBe(1.5);
  });
});

describe('altitudeToZoom', () => {
  it('maps a tiny altitude to a high zoom level', () => {
    expect(altitudeToZoom(0.25)).toBeGreaterThan(4.5);
    expect(altitudeToZoom(0.25)).toBeLessThanOrEqual(5.0);
  });

  it('maps a large altitude to a low zoom level', () => {
    expect(altitudeToZoom(2.5)).toBeGreaterThanOrEqual(1.0);
    expect(altitudeToZoom(2.5)).toBeLessThan(2.0);
  });

  it('is monotonically decreasing', () => {
    const samples = [0.25, 0.5, 1.0, 1.5, 2.0, 2.5];
    let prev = Infinity;
    for (const a of samples) {
      const z = altitudeToZoom(a);
      expect(z).toBeLessThanOrEqual(prev);
      prev = z;
    }
  });

  it('clamps inside [1.0, 5.0]', () => {
    expect(altitudeToZoom(0)).toBeLessThanOrEqual(5.0);
    expect(altitudeToZoom(10)).toBeGreaterThanOrEqual(1.0);
  });
});
