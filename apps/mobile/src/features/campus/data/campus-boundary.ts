import type { FeatureCollection, Polygon } from 'geojson';
import { campusBoundary as boundaryData } from '@unimovil/contracts/campus-coverage';

export interface CampusBoundaryProperties {
  name: string;
  campus: string;
  sourceUrl: string;
  license: 'ODbL-1.0';
  checkedAt: string;
  sourceVersion: number;
  sourceUpdatedAt: string;
}

export const CAMPUS_BOUNDARY = boundaryData as FeatureCollection<
  Polygon,
  CampusBoundaryProperties
>;

const outerRing = CAMPUS_BOUNDARY.features[0]?.geometry.coordinates[0];

if (!outerRing || outerRing.length < 4) {
  throw new Error('The Campus de Moncloa boundary is not a valid polygon.');
}

let west = Number.POSITIVE_INFINITY;
let south = Number.POSITIVE_INFINITY;
let east = Number.NEGATIVE_INFINITY;
let north = Number.NEGATIVE_INFINITY;

for (const coordinate of outerRing) {
  const [longitude, latitude] = coordinate;
  if (typeof longitude !== 'number' || typeof latitude !== 'number') continue;

  west = Math.min(west, longitude);
  south = Math.min(south, latitude);
  east = Math.max(east, longitude);
  north = Math.max(north, latitude);
}

if (![west, south, east, north].every(Number.isFinite)) {
  throw new Error('The Campus de Moncloa boundary has invalid coordinates.');
}

export const CAMPUS_VIEW_BOUNDS: [number, number, number, number] = [
  west,
  south,
  east,
  north,
];
