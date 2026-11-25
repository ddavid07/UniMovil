import {
  CAMPUS_TRANSIT,
  calculateTransitRoute,
  getLineStops,
  linesServingStop,
  parseTransitDataset,
  transitStopAsPlace,
  upcomingDeparturesForStop,
} from './transit';

describe('campus transit data', () => {
  it('loads dated EMT lines, ordered campus stops, and static schedules', () => {
    expect(CAMPUS_TRANSIT.lines.length).toBeGreaterThan(20);
    expect(CAMPUS_TRANSIT.stops.length).toBeGreaterThan(50);
    expect(CAMPUS_TRANSIT.source.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(CAMPUS_TRANSIT.source.schedulesAreRealtime).toBe(false);
    expect(CAMPUS_TRANSIT.lines.every((line) => line.patterns.length > 0)).toBe(true);
  });

  it('returns direction-specific ordered stops and finds lines serving a stop', () => {
    const line = CAMPUS_TRANSIT.lines.find(
      (candidate) => candidate.patterns.length > 1,
    )!;
    const pattern = line.patterns[0]!;
    const orderedStops = getLineStops(line, CAMPUS_TRANSIT.stops, pattern.id);

    expect(orderedStops.map((stop) => stop.id)).toEqual(pattern.stopIds);
    expect(linesServingStop(orderedStops[0]!, CAMPUS_TRANSIT.lines)).toContain(line);
  });

  it('returns next scheduled departures for services active on the selected date', () => {
    const now = new Date('2026-11-25T06:00:00.000Z');
    const stop = CAMPUS_TRANSIT.stops.find(
      (candidate) => upcomingDeparturesForStop(candidate.id, now).length > 0,
    );
    expect(stop).toBeDefined();
    const departures = upcomingDeparturesForStop(stop!.id, now);

    expect(departures.length).toBeGreaterThan(0);
    expect(departures[0]!.minutesUntil).toBeGreaterThanOrEqual(0);
    expect(departures[0]!.lineReference).toBeTruthy();
  });

  it('finds a direct scheduled bus route with walking access legs', () => {
    const line = CAMPUS_TRANSIT.lines.find((candidate) =>
      candidate.patterns.some(
        (pattern) => pattern.stopIds.length > 1 && pattern.trips.length > 0,
      ),
    )!;
    const pattern = line.patterns.find(
      (candidate) => candidate.stopIds.length > 1 && candidate.trips.length > 0,
    )!;
    const origin = CAMPUS_TRANSIT.stops.find((stop) => stop.id === pattern.stopIds[0])!;
    const destination = CAMPUS_TRANSIT.stops.find(
      (stop) => stop.id === pattern.stopIds[pattern.stopIds.length - 1],
    )!;
    const route = calculateTransitRoute(
      origin.coordinates,
      destination.coordinates,
      new Date('2026-11-25T05:30:00.000Z'),
    );

    expect(route).not.toBeNull();
    expect(route?.lineReference).toBeTruthy();
    expect(route?.transfers).toBe(0);
    expect(route?.walkingToStopDistanceMeters).toBeGreaterThanOrEqual(0);
    expect(route?.walkingFromStopDistanceMeters).toBeGreaterThanOrEqual(0);
    expect(route?.durationMinutes).toBeGreaterThan(0);
  });

  it('does not invent a transit route beyond the campus stop coverage', () => {
    expect(
      calculateTransitRoute(
        { latitude: 40.4168, longitude: -3.7038 },
        { latitude: 40.4169, longitude: -3.704 },
        new Date('2026-11-25T06:00:00.000Z'),
      ),
    ).toBeNull();
  });

  it('provides route-compatible stops under their source license', () => {
    const place = transitStopAsPlace(CAMPUS_TRANSIT.stops[0]!);

    expect(place.category).toBe('transport');
    expect(place.id).toContain(CAMPUS_TRANSIT.stops[0]!.id);
    expect(place.source.license).toBe('Open Data Commons Attribution License');
    expect(place.coordinates).toEqual(CAMPUS_TRANSIT.stops[0]!.coordinates);
  });

  it('rejects unknown stops, missing source details, and duplicate stops', () => {
    expect(() => parseTransitDataset({})).toThrow('fuente válida');
    expect(() =>
      parseTransitDataset({
        ...CAMPUS_TRANSIT,
        lines: [{ ...CAMPUS_TRANSIT.lines[0]!, stopIds: ['missing'] }],
      }),
    ).toThrow('línea inválida');
    expect(() =>
      parseTransitDataset({
        ...CAMPUS_TRANSIT,
        stops: [...CAMPUS_TRANSIT.stops, CAMPUS_TRANSIT.stops[0]],
      }),
    ).toThrow('paradas duplicadas');
  });
});
