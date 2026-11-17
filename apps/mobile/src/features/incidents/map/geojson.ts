import type { Incident } from "../domain/incidents";

export interface IncidentGeoJSONProperties {
  readonly id: string;
  readonly title: string;
  readonly type: string;
  readonly severity: string;
  readonly status: string;
  readonly markerColor: string;
}

export function getIncidentMarkerColor(severity: string): string {
  switch (severity) {
    case "critica":
      return "#D32F2F"; // Rojo fuerte
    case "alta":
      return "#F57C00"; // Naranja intenso
    case "media":
      return "#FBC02D"; // Amarillo ámbar
    case "baja":
    default:
      return "#1976D2"; // Azul informativo
  }
}

export function incidentsToGeoJSON(
  incidents: readonly Incident[],
): GeoJSON.FeatureCollection<GeoJSON.Point, IncidentGeoJSONProperties> {
  return {
    type: "FeatureCollection",
    features: incidents.map((inc) => ({
      type: "Feature",
      id: inc.id,
      geometry: {
        type: "Point",
        coordinates: [inc.coordinates.longitude, inc.coordinates.latitude],
      },
      properties: {
        id: inc.id,
        title: inc.title,
        type: inc.type,
        severity: inc.severity,
        status: inc.status,
        markerColor: getIncidentMarkerColor(inc.severity),
      },
    })),
  };
}
