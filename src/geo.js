// Pure geometry helpers extracted from index.html for unit testing.
// Mirrored inline in index.html — when you edit one, edit both.
//
// The `altitude` concept is a legacy globe.gl term: 0.25 ≈ tiny island,
// 2.5 ≈ Russia-sized. We keep it as an intermediate so the camera-zoom
// curve is tunable separately from the geometry-size estimate.

// Cluster of a feature's "main body": the largest polygon PLUS every other
// polygon whose centroid is within CLUSTER_DEG of it. Keeps archipelago
// nations (Bahamas, Marshall Islands) together for a sensible zoom while
// dropping far-flung dependencies (US Alaska/Hawaii, France's Guiana).
const CLUSTER_DEG = 12;
export function featureCluster(feat) {
  const geo = feat && feat.geometry;
  if (!geo) return null;
  let rings = [];
  if (geo.type === 'Polygon') rings = [geo.coordinates[0]];
  else if (geo.type === 'MultiPolygon') rings = geo.coordinates.map(p => p[0]).filter(r => r && r.length);
  if (!rings.length) return null;
  let main = rings[0], bestArea = -1;
  for (const r of rings) {
    let lo = Infinity, hi = -Infinity, lo2 = Infinity, hi2 = -Infinity;
    for (const [x, y] of r) { if (x < lo) lo = x; if (x > hi) hi = x; if (y < lo2) lo2 = y; if (y > hi2) hi2 = y; }
    const a = (hi - lo) * (hi2 - lo2);
    if (a > bestArea) { bestArea = a; main = r; }
  }
  let mlng = 0, mlat = 0;
  for (const [x, y] of main) { mlng += x; mlat += y; }
  mlng /= main.length; mlat /= main.length;
  const lats = [], lngs = [];
  for (const r of rings) {
    let clng = 0, clat = 0;
    for (const [x, y] of r) { clng += x; clat += y; }
    clng /= r.length; clat /= r.length;
    let dlng = Math.abs(clng - mlng); if (dlng > 180) dlng = 360 - dlng;
    if (Math.hypot(dlng, clat - mlat) <= CLUSTER_DEG) {
      for (const [x, y] of r) { lngs.push(x); lats.push(y); }
    }
  }
  if (!lats.length) for (const [x, y] of main) { lngs.push(x); lats.push(y); }
  if (!lats.length) return null;
  let slng = 0, slat = 0;
  for (let i = 0; i < lats.length; i++) { slng += lngs[i]; slat += lats[i]; }
  const span = Math.max(Math.max(...lats) - Math.min(...lats), lngSpan(lngs));
  return { lat: slat / lats.length, lng: slng / lngs.length, span };
}

// Centroid of the feature's main cluster (see featureCluster).
export function featureCentroid(feat) {
  const c = featureCluster(feat);
  return c ? { lat: c.lat, lng: c.lng } : null;
}

// Span (degrees of the longer axis) of the feature's main cluster.
export function featureSpan(feat) {
  const c = featureCluster(feat);
  return c ? c.span : 8;
}

// Span (degrees) → MapLibre zoom level, tiered by hand so microstates stay
// visible and giant countries still fit. Mirror of index.html spanToZoom.
export function spanToZoom(span) {
  if (span < 0.4)  return 9.0;
  if (span < 1.2)  return 7.8;
  if (span < 2.5)  return 6.2;
  if (span < 5)    return 5.0;
  if (span < 9)    return 4.0;
  if (span < 16)   return 3.4;
  if (span < 28)   return 2.8;
  if (span < 45)   return 2.3;
  return 1.6;
}

// Antimeridian-aware longitude span. Naïve max-min returns ~352° for a
// feature whose geometry crosses the dateline (New Zealand, Fiji, Russia
// in some Natural Earth releases). Real span = 360 - that.
//
// We pick the smaller of (a) the naïve span and (b) the span computed
// after shifting all negative longitudes by +360. That's correct for
// every real country: no country actually spans more than 180°
// longitudinally (the antipode is the wraparound point).
function lngSpan(lngs) {
  const naive = Math.max(...lngs) - Math.min(...lngs);
  if (naive <= 180) return naive;
  const shifted = lngs.map(l => l < 0 ? l + 360 : l);
  return Math.min(naive, Math.max(...shifted) - Math.min(...shifted));
}

// Estimate of the feature's bounding-box size in "altitude units".
// Capped at [0.25, 2.5] — those bounds correspond to the smallest
// (microstates) and largest (Russia) reasonable cases. The cap also
// guards against pathological geometries (empty feature, far-flung
// dependencies pulling the bbox huge).
export function featureAltitude(feat) {
  try {
    const geo = feat && feat.geometry;
    if (!geo) return 1.5;
    let allPts = [];
    if (geo.type === 'Polygon') allPts = geo.coordinates[0];
    else if (geo.type === 'MultiPolygon') {
      for (const poly of geo.coordinates) allPts = allPts.concat(poly[0]);
    }
    if (!allPts.length) return 1.5;
    const lats = allPts.map(p => p[1]);
    const lngs = allPts.map(p => p[0]);
    const spanLat = Math.max(...lats) - Math.min(...lats);
    const spanLngAdj = lngSpan(lngs);
    const span = Math.max(spanLngAdj, spanLat);
    return Math.max(0.25, Math.min(2.5, span / 55));
  } catch { return 1.5; }
}

// Map a feature-altitude estimate to a MapLibre zoom level. Biased
// toward less zoom than mathematically tight — user feedback says
// "further out > too close" because surrounding context (is this near
// an ocean? near other countries?) makes the country recognisable.
//   alt 0.25 → z ~5.0;  alt 1.0 → z ~3.5;  alt 2.5 → z ~1.0
export function altitudeToZoom(alt) {
  const z = 5.0 - alt * 1.5;
  return Math.max(1.0, Math.min(5.0, z));
}
