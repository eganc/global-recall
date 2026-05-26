// Pure geometry helpers extracted from index.html for unit testing.
// Mirrored inline in index.html — when you edit one, edit both.
//
// The `altitude` concept is a legacy globe.gl term: 0.25 ≈ tiny island,
// 2.5 ≈ Russia-sized. We keep it as an intermediate so the camera-zoom
// curve is tunable separately from the geometry-size estimate.

// Centroid of the largest polygon in a GeoJSON feature.
// MultiPolygon: picks the ring with the most vertices (usually the
// mainland) so islands don't pull the centroid into the ocean.
export function featureCentroid(feat) {
  const geo = feat && feat.geometry;
  if (!geo) return null;
  let pts = [];
  if (geo.type === 'Polygon') pts = geo.coordinates[0];
  else if (geo.type === 'MultiPolygon') {
    let max = 0;
    for (const poly of geo.coordinates) {
      if (poly[0] && poly[0].length > max) { max = poly[0].length; pts = poly[0]; }
    }
  }
  if (!pts.length) return null;
  let lng = 0, lat = 0;
  for (const [x, y] of pts) { lng += x; lat += y; }
  return { lat: lat / pts.length, lng: lng / pts.length };
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
