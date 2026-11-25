import { assessAccessibleRoute, listMobilityResources } from './mobility';
import type { Place } from './places';

const place: Place = {
  id: 'osm-node-123',
  name: 'Edificio de prueba',
  category: 'building',
  coordinates: { latitude: 40.45, longitude: -3.72 },
  aliases: [],
  source: {
    url: 'https://www.openstreetmap.org/node/123',
    license: 'ODbL-1.0',
    checkedAt: '2026-11-23',
  },
};

describe('mobility evidence and route confidence', () => {
  it('keeps mapped resources unknown and preserves their source metadata', () => {
    const [resource] = listMobilityResources([place], null, 'access');

    expect(resource?.accessibility.status).toBe('unknown');
    expect(resource?.operation.status).toBe('unknown');
    expect(resource?.accessibility.sourceUrl).toBe(place.source.url);
    expect(resource?.accessibility.license).toBe('ODbL-1.0');
  });

  it('sorts resources by approximate distance from an explicitly chosen origin', () => {
    const farther = {
      ...place,
      id: 'far',
      name: 'Más lejos',
      coordinates: { latitude: 40.46, longitude: -3.72 },
    };
    const nearer = {
      ...place,
      id: 'near',
      name: 'Cercano',
      coordinates: { latitude: 40.451, longitude: -3.72 },
    };
    const resources = listMobilityResources(
      [farther, nearer],
      place.coordinates,
      'access',
    );

    expect(resources.map((resource) => resource.place.id)).toEqual(['near', 'far']);
    expect(resources[0]?.distanceMeters).toBeGreaterThan(0);
  });

  it('does not offer an accessible route when any critical evidence is unknown or affected', () => {
    const route = { wayIds: ['way-a', 'way-b'] };
    const confirmed = route.wayIds.map((wayId) => ({
      wayId,
      wheelchair: 'confirmed' as const,
      stepFree: 'confirmed' as const,
    }));

    expect(assessAccessibleRoute(route, confirmed)).toEqual({ status: 'available' });
    expect(assessAccessibleRoute(route, confirmed.slice(0, 1))).toEqual({
      status: 'unavailable',
      reason: 'unknown-evidence',
    });
    expect(
      assessAccessibleRoute(route, [
        ...confirmed.slice(0, 1),
        { ...confirmed[1]!, wheelchair: 'affected' },
      ]),
    ).toEqual({ status: 'unavailable', reason: 'affected-route' });
    expect(assessAccessibleRoute(null, confirmed)).toEqual({
      status: 'unavailable',
      reason: 'no-route',
    });
  });
});
