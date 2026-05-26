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

  function highlight(featureId, state) {
    if (!map || !featureId) return;
    map.removeFeatureState({ source: 'countries', id: featureId });
    if (state) {
      map.setFeatureState(
        { source: 'countries', id: featureId },
        { [state]: true }
      );
    }
  }

  function clear() {
    if (!map) return;
    map.removeFeatureState({ source: 'countries' });
    prevKidsTargetAdmin = null;
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

  return { highlight, clear, paintDailyTargets, paintKidsTarget, markNamed };
}
