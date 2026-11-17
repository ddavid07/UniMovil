import { useMemo } from "react";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import type { RouteResponse } from "@unimovil/contracts";
import { buildRouteGeoJson } from "../../routing/domain/routing";

interface Props {
  readonly route: RouteResponse | null;
}

export function RouteLayer({ route }: Props) {
  const geojsonData = useMemo(() => {
    if (!route) {
      return null;
    }
    return buildRouteGeoJson(route);
  }, [route]);

  if (!route || !geojsonData) {
    return null;
  }

  const lineColor =
    route.mode === "bicycle"
      ? "#d97706"
      : route.mode === "bus"
        ? "#2563eb"
        : route.accessible
          ? "#10b981"
          : "#2563eb";

  return (
    <GeoJSONSource id="pedestrian-route-source" data={geojsonData}>
      {/* Contorno blanco para contraste con el mapa */}
      <Layer
        id="route-line-casing"
        type="line"
        paint={{
          "line-color": "#ffffff",
          "line-width": 8,
          "line-opacity": 0.85,
        }}
      />
      {/* Línea principal de la ruta */}
      <Layer
        id="route-line-main"
        type="line"
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        paint={{
          "line-color": lineColor,
          "line-width": 5,
        }}
      />
    </GeoJSONSource>
  );
}
