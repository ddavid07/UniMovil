import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, Map } from "@maplibre/maplibre-react-native";
import type { Place } from "@unimovil/contracts";
import { type MapMode } from "./map-style";
import { useMapController } from "./useMapController";
import { MapStatus } from "./MapStatus";
import { PlaceLayers } from "./PlaceLayers";
interface Props {
  places: readonly Place[];
  allPlaces: readonly Place[];
  selected: Place | null;
  onSelect: (id: string) => void;
  mode: MapMode;
  apiKey?: string;
}
export function CampusMap({
  places,
  allPlaces,
  selected,
  onSelect,
  mode,
  apiKey,
}: Props) {
  const controller = useMapController(allPlaces, selected, mode, apiKey);
  const [viewport, setViewport] = useState("inicial");
  if (!controller.style)
    return (
      <View style={styles.message}>
        <Text>
          Falta configurar el proveedor del mapa. Puedes consultar todos los
          lugares desde la lista.
        </Text>
      </View>
    );
  return (
    <View style={styles.container}>
      <Map
        key={controller.attempt}
        testID="campus-map"
        accessibilityLabel="Mapa del campus de Moncloa"
        style={styles.map}
        mapStyle={controller.style}
        attribution
        logo
        onDidFinishLoadingMap={() => controller.setState("ready")}
        onDidFailLoadingMap={() => controller.setState("error")}
        onRegionDidChange={(event) => {
          if (mode !== "live")
            setViewport(
              [...event.nativeEvent.center, event.nativeEvent.zoom]
                .map((value) => value.toFixed(5))
                .join(","),
            );
        }}
      >
        <Camera
          ref={controller.camera}
          initialViewState={{
            bounds: controller.bounds,
            padding: { top: 24, bottom: 40, left: 24, right: 24 },
          }}
          minZoom={10}
          maxZoom={19}
        />
        <PlaceLayers
          showLabels={mode === "live"}
          places={places}
          selected={selected}
          onSelect={onSelect}
        />
      </Map>
      <MapStatus
        state={controller.state}
        mode={mode}
        viewport={viewport}
        onRetry={controller.retry}
        onRecenter={controller.recenter}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 180 },
  map: { flex: 1 },
  message: { flex: 1, justifyContent: "center", padding: 16 },
});
