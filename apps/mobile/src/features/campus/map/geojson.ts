import type { FeatureCollection, Point } from "geojson";
import type { Place } from "@unimovil/contracts";
export function placesGeoJSON(
  places: readonly Place[],
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: places.map((place) => ({
      type: "Feature",
      id: place.id,
      properties: { id: place.id, name: place.name, category: place.category },
      geometry: {
        type: "Point",
        coordinates: [place.coordinates.longitude, place.coordinates.latitude],
      },
    })),
  };
}
