import { findNearbyPlaces, formatEstimatedDistance } from './nearby';
import type { Place } from './places';

const places: Place[] = [
  {
    id: 'far',
    name: 'Lejos',
    category: 'service',
    coordinates: { latitude: 40.01, longitude: -3 },
    aliases: [],
    source: {
      url: 'https://www.openstreetmap.org/node/1',
      license: 'ODbL-1.0',
      checkedAt: '2026-11-25',
    },
  },
  {
    id: 'near',
    name: 'Cerca',
    category: 'service',
    coordinates: { latitude: 40.001, longitude: -3 },
    aliases: [],
    source: {
      url: 'https://www.openstreetmap.org/node/2',
      license: 'ODbL-1.0',
      checkedAt: '2026-11-25',
    },
  },
];

describe('nearby places', () => {
  it('sorts points by estimated straight-line distance from a reference', () => {
    expect(
      findNearbyPlaces(places, { latitude: 40, longitude: -3 }).map(
        ({ place }) => place.id,
      ),
    ).toEqual(['near', 'far']);
  });

  it('labels straight-line distances as estimates', () => {
    expect(formatEstimatedDistance(840)).toBe('aprox. 840 m');
    expect(formatEstimatedDistance(1250)).toBe('aprox. 1,3 km');
  });
});
