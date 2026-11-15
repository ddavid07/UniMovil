import { useMemo } from "react";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import type { TransitStop } from "@unimovil/contracts";
import { transitStopsGeoJSON } from "./geojson";

interface Props {
  readonly stops: readonly TransitStop[];
  readonly selectedStop?: TransitStop | null | undefined;
  readonly onSelectStop: (stop: TransitStop) => void;
  readonly visible?: boolean | undefined;
}

export function TransitStopLayer({
  stops,
  selectedStop,
  onSelectStop,
  visible = true,
}: Props) {
  const geojsonData = useMemo(() => {
    if (!visible || stops.length === 0) return null;
    return transitStopsGeoJSON(stops);
  }, [stops, visible]);

  if (!visible || !geojsonData) {
    return null;
  }

  return (
    <GeoJSONSource
      id="transit-stops-source"
      hitbox={{ top: 20, bottom: 20, left: 20, right: 20 }}
      data={geojsonData}
      onPress={(event) => {
        const id: unknown = event.nativeEvent.features[0]?.properties?.id;
        if (typeof id === "string") {
          const matched = stops.find((s) => s.id === id);
          if (matched) {
            event.stopPropagation();
            onSelectStop(matched);
          }
        }
      }}
    >
      <Layer
        id="transit-stops-dots"
        type="circle"
        paint={{
          "circle-radius": 7,
          "circle-color": "#005aa9",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        }}
      />
      <Layer
        id="transit-stops-selected"
        type="circle"
        filter={["==", ["get", "id"], selectedStop?.id ?? ""]}
        paint={{
          "circle-radius": 11,
          "circle-color": "#d97706",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
        }}
      />
    </GeoJSONSource>
  );
}
