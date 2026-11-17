import type { FeatureCollection, LineString, Point } from "geojson";
import type { TransitLine, TransitStop } from "@unimovil/contracts";

export function transitLinesGeoJSON(
  lines: readonly TransitLine[],
): FeatureCollection<LineString> {
  return {
    type: "FeatureCollection",
    features: lines.map((line) => ({
      type: "Feature",
      id: line.id,
      properties: {
        id: line.id,
        code: line.code,
        name: line.name,
        color: line.color,
      },
      geometry: {
        type: "LineString",
        coordinates: line.polyline.map((coord) => [
          coord.longitude,
          coord.latitude,
        ]),
      },
    })),
  };
}

export function transitStopsGeoJSON(
  stops: readonly TransitStop[],
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: stops.map((stop) => ({
      type: "Feature",
      id: stop.id,
      properties: {
        id: stop.id,
        code: stop.code,
        name: stop.name,
        accessible: stop.wheelchairAccessible,
      },
      geometry: {
        type: "Point",
        coordinates: [stop.coordinates.longitude, stop.coordinates.latitude],
      },
    })),
  };
}
