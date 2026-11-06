import { useMemo } from "react";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import type { Place } from "@unimovil/contracts";
import { placesGeoJSON } from "./geojson";

export function PlaceLayers({
  places,
  selected,
  onSelect,
  showLabels,
}: {
  places: readonly Place[];
  selected: Place | null;
  onSelect: (id: string) => void;
  showLabels: boolean;
}) {
  const data = useMemo(() => placesGeoJSON(places), [places]);
  return (
    <GeoJSONSource
      id="campus-places"
      hitbox={{ top: 24, bottom: 24, left: 24, right: 24 }}
      data={data}
      onPress={(event) => {
        const id: unknown = event.nativeEvent.features[0]?.properties?.id;
        if (typeof id === "string" && places.some((place) => place.id === id)) {
          event.stopPropagation();
          onSelect(id);
        }
      }}
    >
      <Layer
        id="place-dots"
        type="circle"
        paint={{
          "circle-radius": 9,
          "circle-color": "#8e1235",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        }}
      />
      <Layer
        id="selected-place"
        type="circle"
        filter={["==", ["get", "id"], selected?.id ?? ""]}
        paint={{
          "circle-radius": 13,
          "circle-color": "#18212b",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
        }}
      />
      {showLabels && (
        <Layer
          id="place-names"
          type="symbol"
          layout={{
            "text-field": ["get", "name"],
            "text-font": ["Noto Sans Regular"],
            "text-size": 12,
            "text-offset": [0, 1.4],
            "text-anchor": "top",
          }}
          paint={{
            "text-color": "#18212b",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2,
          }}
        />
      )}
    </GeoJSONSource>
  );
}
