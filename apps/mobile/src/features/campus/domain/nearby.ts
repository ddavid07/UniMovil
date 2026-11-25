import type { Place, PlaceCoordinates } from './places';

export function estimateDistanceMeters(
  first: PlaceCoordinates,
  second: PlaceCoordinates,
): number {
  const earthRadius = 6_371_000;
  const radians = Math.PI / 180;
  const latitudeDelta = (second.latitude - first.latitude) * radians;
  const longitudeDelta = (second.longitude - first.longitude) * radians;
  const firstLatitude = first.latitude * radians;
  const secondLatitude = second.latitude * radians;
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearbyPlaces(
  places: readonly Place[],
  reference: PlaceCoordinates,
): readonly { place: Place; distanceMeters: number }[] {
  return places
    .map((place) => ({
      place,
      distanceMeters: estimateDistanceMeters(reference, place.coordinates),
    }))
    .sort((first, second) => first.distanceMeters - second.distanceMeters);
}

export function formatEstimatedDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) return `aprox. ${Math.round(distanceMeters)} m`;
  return `aprox. ${(distanceMeters / 1000).toFixed(1).replace('.', ',')} km`;
}
