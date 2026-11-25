import { CAMPUS_BOUNDARY, CAMPUS_VIEW_BOUNDS } from './campus-boundary';

describe('Campus de Moncloa boundary data', () => {
  it('keeps a closed ODbL polygon with its OpenStreetMap provenance', () => {
    const feature = CAMPUS_BOUNDARY.features[0];
    const outerRing = feature?.geometry.coordinates[0];

    expect(feature?.id).toBe('osm-way-30648317');
    expect(feature?.properties).toMatchObject({
      campus: 'Campus de Moncloa',
      sourceUrl: 'https://www.openstreetmap.org/way/30648317',
      license: 'ODbL-1.0',
      checkedAt: '2026-11-24',
      sourceVersion: 110,
    });
    expect(outerRing).toHaveLength(401);
    expect(outerRing?.[0]).toEqual(outerRing?.at(-1));
  });

  it('derives the map frame from the campus polygon', () => {
    expect(CAMPUS_VIEW_BOUNDS).toEqual([
      -3.7429016, 40.4343908, -3.7140968, 40.4581143,
    ]);
  });
});
