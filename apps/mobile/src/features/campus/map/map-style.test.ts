import {
  CAMPUS_MAP_STYLE,
  OSM_TILE_URL,
  OSM_TILE_URL_MATCH,
  OSM_TILE_USER_AGENT,
} from './map-style';

describe('OpenStreetMap map style', () => {
  it('uses the standard raster tiles with attribution and an identifiable app name', () => {
    expect(CAMPUS_MAP_STYLE).toMatchObject({
      name: 'OpenStreetMap raster',
      sources: {
        openstreetmap: {
          type: 'raster',
          tiles: [OSM_TILE_URL],
          tileSize: 256,
          maxzoom: 19,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'openstreetmap-raster',
          type: 'raster',
          source: 'openstreetmap',
        },
      ],
    });
    expect(OSM_TILE_URL).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(OSM_TILE_USER_AGENT).toBe('UniMovil/0.1');
    expect(
      OSM_TILE_URL_MATCH.test('https://tile.openstreetmap.org/16/123/456.png'),
    ).toBe(true);
    expect(OSM_TILE_URL_MATCH.test('https://example.org/16/123/456.png')).toBe(false);
  });
});
