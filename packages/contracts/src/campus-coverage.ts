import boundaryData from '../data/campus-boundary.json';

const outerRing = boundaryData.features[0]?.geometry.coordinates[0] as
  readonly (readonly [number, number])[] | undefined;

if (!outerRing || outerRing.length < 4) {
  throw new Error('The approximate campus coverage polygon is invalid.');
}
const ring = outerRing;

export const campusBoundary = boundaryData;

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export function isWithinCampusCoverage(coordinate: Coordinate): boolean {
  if (!Number.isFinite(coordinate.latitude) || !Number.isFinite(coordinate.longitude)) {
    return false;
  }

  const point = [coordinate.longitude, coordinate.latitude] as const;
  let inside = false;

  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index, index += 1
  ) {
    const [currentLongitude, currentLatitude] = ring[index]!;
    const [previousLongitude, previousLatitude] = ring[previous]!;
    const crosses =
      currentLatitude > point[1] !== previousLatitude > point[1] &&
      point[0] <
        ((previousLongitude - currentLongitude) * (point[1] - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude;

    if (crosses) inside = !inside;
  }

  return inside;
}
