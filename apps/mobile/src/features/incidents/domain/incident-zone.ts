import type { PlaceCoordinates } from '../../campus/domain/places';

const EARTH_RADIUS_METERS = 6_371_000;

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function isWithinIncidentZone(
  incident: PlaceCoordinates,
  center: PlaceCoordinates,
  radiusMeters: number,
): boolean {
  if (
    !Number.isFinite(radiusMeters) ||
    radiusMeters < 0 ||
    !Number.isFinite(incident.latitude) ||
    !Number.isFinite(incident.longitude) ||
    !Number.isFinite(center.latitude) ||
    !Number.isFinite(center.longitude) ||
    Math.abs(incident.latitude) > 90 ||
    Math.abs(center.latitude) > 90 ||
    Math.abs(incident.longitude) > 180 ||
    Math.abs(center.longitude) > 180
  )
    return false;
  const latitudeDelta = radians(incident.latitude - center.latitude);
  const longitudeDelta = radians(incident.longitude - center.longitude);
  const firstLatitude = radians(center.latitude);
  const secondLatitude = radians(incident.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const normalizedHaversine = Math.min(1, Math.max(0, haversine));
  const distance =
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(normalizedHaversine), Math.sqrt(1 - normalizedHaversine));
  return distance <= radiusMeters;
}
