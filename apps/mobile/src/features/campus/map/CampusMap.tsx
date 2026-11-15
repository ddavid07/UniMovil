import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, Map } from "@maplibre/maplibre-react-native";
import type {
  Place,
  RouteResponse,
  TransitLine,
  TransitStop,
} from "@unimovil/contracts";
import { type MapMode } from "./map-style";
import { useMapController } from "./useMapController";
import { MapStatus } from "./MapStatus";
import { PlaceLayers } from "./PlaceLayers";
import { RouteLayer } from "./RouteLayer";
import { TransitLineLayer } from "../../transit/map/TransitLineLayer";
import { TransitStopLayer } from "../../transit/map/TransitStopLayer";
import {
  CAMPUS_TRANSIT_LINES,
  CAMPUS_TRANSIT_STOPS,
} from "../../transit/data/transit-data";

interface Props {
  places: readonly Place[];
  allPlaces: readonly Place[];
  selected: Place | null;
  onSelect: (id: string) => void;
  mode: MapMode;
  apiKey?: string | undefined;
  route?: RouteResponse | null | undefined;
  showTransit?: boolean | undefined;
  transitLines?: readonly TransitLine[] | undefined;
  transitStops?: readonly TransitStop[] | undefined;
  selectedTransitStop?: TransitStop | null | undefined;
  onSelectTransitStop?: ((stop: TransitStop) => void) | undefined;
}

function MapStateMessage({
  resourcesReady,
  hasStyle,
}: {
  resourcesReady: boolean;
  hasStyle: boolean;
}) {
  if (!resourcesReady) {
    return (
      <View style={styles.message}>
        <Text>Cargando mapa…</Text>
      </View>
    );
  }
  if (!hasStyle) {
    return (
      <View style={styles.message}>
        <Text>
          Falta configurar el proveedor del mapa. Puedes consultar todos los
          lugares desde la lista.
        </Text>
      </View>
    );
  }
  return null;
}

function MapLayers({
  places,
  selected,
  onSelect,
  showLabels,
  showTransit,
  transitLines,
  transitStops,
  selectedTransitStop,
  onSelectTransitStop,
  route,
}: {
  places: readonly Place[];
  selected: Place | null;
  onSelect: (id: string) => void;
  showLabels: boolean;
  showTransit: boolean;
  transitLines?: readonly TransitLine[] | undefined;
  transitStops?: readonly TransitStop[] | undefined;
  selectedTransitStop?: TransitStop | null | undefined;
  onSelectTransitStop?: ((stop: TransitStop) => void) | undefined;
  route?: RouteResponse | null | undefined;
}) {
  return (
    <>
      <PlaceLayers
        showLabels={showLabels}
        places={places}
        selected={selected}
        onSelect={onSelect}
      />
      <TransitLineLayer
        lines={transitLines ?? CAMPUS_TRANSIT_LINES}
        visible={showTransit}
      />
      <TransitStopLayer
        stops={transitStops ?? CAMPUS_TRANSIT_STOPS}
        selectedStop={selectedTransitStop}
        onSelectStop={onSelectTransitStop ?? (() => {})}
        visible={showTransit}
      />
      <RouteLayer route={route ?? null} />
    </>
  );
}

export function CampusMap({
  places,
  allPlaces,
  selected,
  onSelect,
  mode,
  apiKey,
  route,
  showTransit = false,
  transitLines,
  transitStops,
  selectedTransitStop,
  onSelectTransitStop,
}: Props) {
  const controller = useMapController(allPlaces, selected, mode, apiKey);
  const [viewport, setViewport] = useState("inicial");

  if (!controller.resourcesReady || !controller.style) {
    return (
      <MapStateMessage
        resourcesReady={controller.resourcesReady}
        hasStyle={Boolean(controller.style)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Map
        key={controller.attempt}
        testID="campus-map"
        accessibilityLabel="Mapa del campus de Moncloa"
        style={styles.map}
        mapStyle={controller.style}
        attribution
        logo={false}
        onDidFinishLoadingMap={() => controller.setState("ready")}
        onDidFailLoadingMap={() => controller.setState("error")}
        onRegionDidChange={(event) => {
          controller.recordZoom(event.nativeEvent.zoom);
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
        <MapLayers
          places={places}
          selected={selected}
          onSelect={onSelect}
          showLabels={mode === "live"}
          showTransit={showTransit}
          transitLines={transitLines}
          transitStops={transitStops}
          selectedTransitStop={selectedTransitStop}
          onSelectTransitStop={onSelectTransitStop}
          route={route}
        />
      </Map>
      <MapStatus
        state={controller.state}
        mode={mode}
        viewport={viewport}
        onRetry={controller.retry}
        onRecenter={controller.recenter}
        onZoomIn={() => controller.zoomBy(1)}
        onZoomOut={() => controller.zoomBy(-1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 180 },
  map: { flex: 1 },
  message: { flex: 1, justifyContent: "center", padding: 16 },
});
