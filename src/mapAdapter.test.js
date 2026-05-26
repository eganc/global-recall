import { describe, it, expect, beforeEach } from 'vitest';
import { createMapAdapter } from './mapAdapter.js';

function makeFakeMap() {
  const calls = [];
  return {
    calls,
    setFeatureState: (target, state) => calls.push(['set', target, state]),
    removeFeatureState: (target) => calls.push(['remove', target]),
  };
}

describe('mapAdapter', () => {
  let map, adapter;
  beforeEach(() => {
    map = makeFakeMap();
    adapter = createMapAdapter(map);
  });

  describe('highlight()', () => {
    it('clears any prior state then sets the new one', () => {
      adapter.highlight('France', 'named');
      expect(map.calls).toEqual([
        ['remove', { source: 'countries', id: 'France' }],
        ['set', { source: 'countries', id: 'France' }, { named: true }],
      ]);
    });

    it('with state=null only clears', () => {
      adapter.highlight('France', null);
      expect(map.calls).toEqual([
        ['remove', { source: 'countries', id: 'France' }],
      ]);
    });

    it('ignores empty featureId', () => {
      adapter.highlight('', 'named');
      adapter.highlight(null, 'named');
      adapter.highlight(undefined, 'named');
      expect(map.calls).toEqual([]);
    });
  });

  describe('clear()', () => {
    it('removes all feature-state from the countries source', () => {
      adapter.clear();
      expect(map.calls).toEqual([['remove', { source: 'countries' }]]);
    });

    it('resets the kids-target tracker so the next paintKidsTarget does not clear a stale id', () => {
      adapter.paintKidsTarget('France');
      adapter.clear();
      map.calls.length = 0;
      adapter.paintKidsTarget('Japan');
      // No clear-call for France should appear — clear() forgot it.
      expect(map.calls).toEqual([
        ['remove', { source: 'countries', id: 'Japan' }],
        ['set', { source: 'countries', id: 'Japan' }, { kidsTarget: true }],
      ]);
    });
  });

  describe('paintDailyTargets()', () => {
    it('paints every admin id with dailyTarget state', () => {
      adapter.paintDailyTargets(['France', 'Brazil', 'Japan']);
      const sets = map.calls.filter(c => c[0] === 'set');
      expect(sets).toEqual([
        ['set', { source: 'countries', id: 'France' }, { dailyTarget: true }],
        ['set', { source: 'countries', id: 'Brazil' }, { dailyTarget: true }],
        ['set', { source: 'countries', id: 'Japan' }, { dailyTarget: true }],
      ]);
    });
  });

  describe('paintKidsTarget()', () => {
    it('first call just paints the target', () => {
      adapter.paintKidsTarget('France');
      expect(map.calls).toEqual([
        ['remove', { source: 'countries', id: 'France' }],
        ['set', { source: 'countries', id: 'France' }, { kidsTarget: true }],
      ]);
    });

    it('clears the previous target before painting the next', () => {
      adapter.paintKidsTarget('France');
      map.calls.length = 0;
      adapter.paintKidsTarget('Japan');
      expect(map.calls).toEqual([
        ['remove', { source: 'countries', id: 'France' }],
        ['remove', { source: 'countries', id: 'Japan' }],
        ['set', { source: 'countries', id: 'Japan' }, { kidsTarget: true }],
      ]);
    });

    it('called with the same id twice does not clear itself before re-painting', () => {
      adapter.paintKidsTarget('France');
      map.calls.length = 0;
      adapter.paintKidsTarget('France');
      // highlight() still does its own remove+set, but no extra "clear France first" call.
      expect(map.calls).toEqual([
        ['remove', { source: 'countries', id: 'France' }],
        ['set', { source: 'countries', id: 'France' }, { kidsTarget: true }],
      ]);
    });

    it('called with null clears the prior target and forgets it', () => {
      adapter.paintKidsTarget('France');
      map.calls.length = 0;
      adapter.paintKidsTarget(null);
      expect(map.calls).toEqual([
        ['remove', { source: 'countries', id: 'France' }],
      ]);
      // And a follow-up doesn't try to clear France again.
      map.calls.length = 0;
      adapter.paintKidsTarget('Japan');
      expect(map.calls).toEqual([
        ['remove', { source: 'countries', id: 'Japan' }],
        ['set', { source: 'countries', id: 'Japan' }, { kidsTarget: true }],
      ]);
    });
  });

  describe('markNamed()', () => {
    it('paints as named', () => {
      adapter.markNamed('France');
      expect(map.calls).toEqual([
        ['remove', { source: 'countries', id: 'France' }],
        ['set', { source: 'countries', id: 'France' }, { named: true }],
      ]);
    });

    it('forgets the kids-target tracker if the named country was the current target', () => {
      adapter.paintKidsTarget('Japan');
      map.calls.length = 0;
      adapter.markNamed('Japan');
      // Now next paintKidsTarget should NOT try to clear Japan again.
      map.calls.length = 0;
      adapter.paintKidsTarget('Brazil');
      expect(map.calls).toEqual([
        ['remove', { source: 'countries', id: 'Brazil' }],
        ['set', { source: 'countries', id: 'Brazil' }, { kidsTarget: true }],
      ]);
    });

    it('ignores empty admin id', () => {
      adapter.markNamed(null);
      adapter.markNamed('');
      adapter.markNamed(undefined);
      expect(map.calls).toEqual([]);
    });
  });

  describe('null map', () => {
    it('every method is a no-op without throwing', () => {
      const a = createMapAdapter(null);
      expect(() => a.highlight('France', 'named')).not.toThrow();
      expect(() => a.clear()).not.toThrow();
      expect(() => a.paintDailyTargets(['A', 'B'])).not.toThrow();
      expect(() => a.paintKidsTarget('Japan')).not.toThrow();
      expect(() => a.markNamed('France')).not.toThrow();
    });
  });
});
