import catalog from '../data/campus-places.json';
import {
  filterPlacesByCategories,
  parsePlaces,
  PLACE_CATEGORIES,
  togglePlaceCategory,
} from './places';

const places = parsePlaces(catalog);

describe('campus place category filters', () => {
  it('shows every category when all categories are active', () => {
    const filtered = filterPlacesByCategories(places, new Set(PLACE_CATEGORIES));

    expect(filtered).toEqual(places);
  });

  it('filters places without changing the source catalog', () => {
    const snapshot = JSON.stringify(places);
    const filtered = filterPlacesByCategories(places, new Set(['transport']));

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((place) => place.category === 'transport')).toBe(true);
    expect(JSON.stringify(places)).toBe(snapshot);
  });

  it('returns an empty collection when no category is active', () => {
    expect(filterPlacesByCategories(places, new Set())).toEqual([]);
  });

  it('toggles a category using a new set and preserves the previous state', () => {
    const active = new Set(PLACE_CATEGORIES);
    const withoutTransport = togglePlaceCategory(active, 'transport');

    expect(active.has('transport')).toBe(true);
    expect(withoutTransport.has('transport')).toBe(false);

    const restored = togglePlaceCategory(withoutTransport, 'transport');
    expect(restored).toEqual(active);
  });
});
