// Map adapter — wraps the MapLibre setFeatureState/removeFeatureState API
// behind a small surface that matches the game's actual operations. Pure
// JS, no MapLibre import: works with any object that exposes the two
// methods, which makes it unit-testable against a recorder fake.
//
// Mirrored inline in index.html (search for "Mirror of src/mapAdapter.js").
// When you edit one, edit both.

export function createMapAdapter(map) {
  // The Easy mode previous-target tracker lives inside the adapter so the
  // caller doesn't have to thread it through. clear() resets it.
  let prevKidsTargetAdmin = null;

  // Returns true if it's safe to call setFeatureState — i.e. the map has a
  // 'countries' source loaded. On slow devices the user can fire a click
  // before the map's first style.load + ensureCountryLayers completes;
  // calling setFeatureState then throws "Source 'countries' not found",
  // which aborts whatever game-setup code was mid-flight. Silently
  // no-op'ing here keeps that code path running; reapplyHighlights paints
  // the active state once the source actually loads.
  function sourceReady() {
    if (!map) return false;
    if (typeof map.getSource !== 'function') return true;  // test fake
    return !!map.getSource('countries');
  }

  function highlight(featureId, state) {
    if (!featureId || !sourceReady()) return;
    map.removeFeatureState({ source: 'countries', id: featureId });
    if (state) {
      map.setFeatureState(
        { source: 'countries', id: featureId },
        { [state]: true }
      );
    }
  }

  function clear() {
    prevKidsTargetAdmin = null;
    if (!sourceReady()) return;
    map.removeFeatureState({ source: 'countries' });
  }

  function paintDailyTargets(adminIds) {
    for (const id of adminIds) highlight(id, 'dailyTarget');
  }

  function paintKidsTarget(adminId) {
    if (prevKidsTargetAdmin && prevKidsTargetAdmin !== adminId) {
      highlight(prevKidsTargetAdmin, null);
    }
    if (adminId) {
      highlight(adminId, 'kidsTarget');
      prevKidsTargetAdmin = adminId;
    } else {
      prevKidsTargetAdmin = null;
    }
  }

  function markNamed(adminId) {
    if (!adminId) return;
    highlight(adminId, 'named');
    if (prevKidsTargetAdmin === adminId) prevKidsTargetAdmin = null;
  }

  // Toggle the auto-next "next target" outline pulse. color: 'amber'|'cyan'|null.
  // Uses setFeatureState additively so it doesn't wipe fill state (named etc.).
  function setBlink(adminId, color) {
    if (!adminId || !sourceReady()) return;
    map.setFeatureState(
      { source: 'countries', id: adminId },
      { blink: color || null }
    );
  }

  // STRICT mode capital pin — drops a labeled marker on the capital city
  // coords for the active target country when the player burns their
  // first strike. Stored in its own 'capital-pin' GeoJSON source.
  function showCapitalPin(lat, lng, label) {
    if (!map || typeof map.getSource !== 'function') return;
    const src = map.getSource('capital-pin');
    if (!src) return;
    src.setData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: { label: label || '' },
      }],
    });
  }

  function clearCapitalPin() {
    if (!map || typeof map.getSource !== 'function') return;
    const src = map.getSource('capital-pin');
    if (!src) return;
    src.setData({ type: 'FeatureCollection', features: [] });
  }

  return { highlight, clear, paintDailyTargets, paintKidsTarget, markNamed, setBlink, showCapitalPin, clearCapitalPin };
}
