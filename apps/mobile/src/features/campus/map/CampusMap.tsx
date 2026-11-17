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
import { IncidentLayer } from "../../incidents/map/IncidentLayer";
import {
  MONCLOA_CAMPUS_SEED_INCIDENTS,
  type Incident,
} from "../../incidents/domain/incidents";

interface Props {
  places: readonly Place[];
  allPlaces: readonly Place[];
  selected: Place | null;
  onSelect: (id: string) => void;
  mode: MapMode;
  route?: RouteResponse | null | undefined;
  showTransit?: boolean | undefined;
  transitLines?: readonly TransitLine[] | undefined;
  transitStops?: readonly TransitStop[] | undefined;
  selectedTransitStop?: TransitStop | null | undefined;
  onSelectTransitStop?: ((stop: TransitStop) => void) | undefined;
  onSelectIncident?: ((incident: Incident) => void) | undefined;
  showIncidents?: boolean | undefined;
  incidents?: readonly Incident[] | undefined;
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
          No se pudo cargar el mapa. Puedes consultar todos los lugares desde la
          lista.
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
  showIncidents,
  incidents,
  onSelectIncident,
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
  showIncidents?: boolean | undefined;
  incidents?: readonly Incident[] | undefined;
  onSelectIncident?: ((incident: Incident) => void) | undefined;
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
      <IncidentLayer
        incidents={incidents ?? MONCLOA_CAMPUS_SEED_INCIDENTS}
        visible={showIncidents ?? true}
        onSelectIncident={onSelectIncident}
      />
    </>
  );
}

function CampusMapCanvas({
  controller,
  style,
  mode,
  setViewport,
  layersProps,
}: {
  controller: ReturnType<typeof useMapController>;
  style: NonNullable<ReturnType<typeof useMapController>["style"]>;
  mode: MapMode;
  setViewport: (vp: string) => void;
  layersProps: Parameters<typeof MapLayers>[0];
}) {
  return (
    <Map
      key={controller.attempt}
      testID="campus-map"
      accessibilityLabel="Mapa del campus de Moncloa"
      style={styles.map}
      mapStyle={style}
      attribution
      logo={false}
      onDidFinishLoadingMap={() => controller.setState("ready")}
      onDidFinishLoadingStyle={() => controller.setState("ready")}
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
      <MapLayers {...layersProps} />
    </Map>
  );
}

export function CampusMap({
  places,
  allPlaces,
  selected,
  onSelect,
  mode,
  route,
  showTransit = false,
  transitLines,
  transitStops,
  selectedTransitStop,
  onSelectTransitStop,
  onSelectIncident,
  showIncidents = false,
  incidents,
}: Props) {
  const controller = useMapController(allPlaces, selected, mode);
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
      <CampusMapCanvas
        controller={controller}
        style={controller.style}
        mode={mode}
        setViewport={setViewport}
        layersProps={{
          places,
          selected,
          onSelect,
          showLabels: mode === "live",
          showTransit,
          transitLines,
          transitStops,
          selectedTransitStop,
          onSelectTransitStop,
          route,
          showIncidents,
          incidents,
          onSelectIncident,
        }}
      />
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
