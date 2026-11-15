import { useMemo } from "react";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import type { TransitLine } from "@unimovil/contracts";
import { transitLinesGeoJSON } from "./geojson";

interface Props {
  readonly lines: readonly TransitLine[];
  readonly visible?: boolean | undefined;
}

export function TransitLineLayer({ lines, visible = true }: Props) {
  const geojsonData = useMemo(() => {
    if (!visible || lines.length === 0) return null;
    return transitLinesGeoJSON(lines);
  }, [lines, visible]);

  if (!visible || !geojsonData) {
    return null;
  }

  return (
    <GeoJSONSource id="transit-lines-source" data={geojsonData}>
      <Layer
        id="transit-lines-casing"
        type="line"
        paint={{
          "line-color": "#ffffff",
          "line-width": 6,
          "line-opacity": 0.9,
        }}
      />
      <Layer
        id="transit-lines-main"
        type="line"
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        paint={{
          "line-color": ["get", "color"],
          "line-width": 4,
          "line-opacity": 0.85,
        }}
      />
    </GeoJSONSource>
  );
}
