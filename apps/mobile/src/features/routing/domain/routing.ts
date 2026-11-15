import type { RouteResponse } from "@unimovil/contracts";

export interface GeoJsonLineStringFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][]; // [longitude, latitude] según estándar GeoJSON
  };
  properties: {
    id: string;
    distanceMeters: number;
    durationMinutes: number;
    accessible: boolean;
  };
}

export function formatDistance(meters: number): string {
  if (meters < 0 || !Number.isFinite(meters)) {
    return "0 m";
  }
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1);
    return `${km.replace(".", ",")} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0 || !Number.isFinite(minutes)) {
    return "< 1 min";
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) {
      return `${hours} h`;
    }
    return `${hours} h ${remainingMins} min`;
  }
  return `${Math.round(minutes)} min`;
}

export function buildRouteGeoJson(
  route: RouteResponse,
): GeoJsonLineStringFeature {
  const coordinates: [number, number][] = route.polyline.map((coord) => [
    coord.longitude,
    coord.latitude,
  ]);

  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: {
      id: route.id,
      distanceMeters: route.totalDistanceMeters,
      durationMinutes: route.estimatedDurationMinutes,
      accessible: route.accessible,
    },
  };
}
