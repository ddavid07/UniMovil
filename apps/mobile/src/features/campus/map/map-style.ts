import type { MapProps } from '@maplibre/maplibre-react-native';

export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_TILE_USER_AGENT = 'UniMovil/0.1';
export const OSM_TILE_HEADER_ID = 'unimovil-osm-user-agent';
export const OSM_TILE_URL_MATCH = /^https:\/\/tile\.openstreetmap\.org\//;

export const CAMPUS_MAP_STYLE: MapProps['mapStyle'] = {
  version: 8,
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
  layers: [{ id: 'openstreetmap-raster', type: 'raster', source: 'openstreetmap' }],
};
