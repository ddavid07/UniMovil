import {
  calculateWalkingRoute,
  formatRouteDistance,
  formatRouteDuration,
  parseRoutingNetwork,
  type RoutingNetwork,
} from './routing';

const network: RoutingNetwork = {
  source: {
    source: 'OpenStreetMap contributors',
    url: 'https://api.openstreetmap.org/api/0.6/map',
    license: 'ODbL-1.0',
    checkedAt: '2026-11-25',
    campusBoundarySource: 'https://www.openstreetmap.org/way/30648317',
  },
  nodes: [
    { id: 'a', latitude: 40, longitude: -3 },
    { id: 'b', latitude: 40, longitude: -2.999 },
    { id: 'c', latitude: 40.001, longitude: -2.999 },
    { id: 'd', latitude: 40.001, longitude: -3 },
  ],
  ways: [
    {
      id: 'way-ab',
      version: '1',
      updatedAt: '2026-11-25T00:00:00Z',
      properties: { highway: 'footway', name: 'Camino de prueba' },
      nodes: ['a', 'b'],
    },
    {
      id: 'way-bc',
      version: '1',
      updatedAt: '2026-11-25T00:00:00Z',
      properties: { highway: 'footway', name: 'Camino de prueba' },
      nodes: ['b', 'c'],
    },
    {
      id: 'way-ad',
      version: '1',
      updatedAt: '2026-11-25T00:00:00Z',
      properties: { highway: 'footway', name: 'Camino alternativo' },
      nodes: ['a', 'd'],
    },
  ],
};

describe('walking route domain', () => {
  it('finds a connected route and creates ordered instructions', () => {
    const result = calculateWalkingRoute(network.nodes[0]!, network.nodes[2]!, network);

    expect(result.status).toBe('found');
    if (result.status !== 'found') return;

    expect(
      result.route.coordinates.map(({ latitude, longitude }) => ({
        latitude,
        longitude,
      })),
    ).toEqual(
      [network.nodes[0]!, network.nodes[1]!, network.nodes[2]!].map(
        ({ latitude, longitude }) => ({ latitude, longitude }),
      ),
    );
    expect(result.route.distanceMeters).toBeGreaterThan(190);
    expect(result.route.durationMinutes).toBeGreaterThan(0);
    expect(result.route.steps[0]?.instruction).toContain('Camino de prueba');
  });

  it('reports a destination with no connected mapped path', () => {
    const result = calculateWalkingRoute(network.nodes[0]!, network.nodes[3]!, {
      ...network,
      ways: network.ways.slice(0, 2),
    });

    expect(result).toEqual({ status: 'no-connection' });
  });

  it('rejects coordinates too far from the mapped network', () => {
    const result = calculateWalkingRoute(
      { latitude: 41, longitude: -3 },
      network.nodes[1]!,
      network,
    );

    expect(result).toEqual({ status: 'outside-network' });
  });

  it('rejects malformed network metadata and filters restricted ways', () => {
    expect(() => parseRoutingNetwork({})).toThrow('no tiene una fuente válida');

    const parsed = parseRoutingNetwork({
      ...network,
      ways: [
        ...network.ways,
        {
          id: 'private-way',
          version: '1',
          updatedAt: '2026-11-25T00:00:00Z',
          properties: { highway: 'service', access: 'private' },
          nodes: ['a', 'b'],
        },
      ],
    });

    expect(parsed.ways.some((way) => way.id === 'private-way')).toBe(false);
  });

  it('formats walking distance and estimated duration', () => {
    expect(formatRouteDistance(845)).toBe('845 m');
    expect(formatRouteDistance(1500)).toBe('1,5 km');
    expect(formatRouteDuration(58)).toBe('58 min');
    expect(formatRouteDuration(65)).toBe('1 h 5 min');
    expect(formatRouteDuration(120)).toBe('2 h');
  });
});
