import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Action } from "./components/Action";
import { ExplorerControls } from "./components/ExplorerControls";
import { CampusDialogs } from "./components/CampusDialogs";
import { SearchSuggestions } from "./components/SearchSuggestions";
import { CampusMap } from "./map/CampusMap";
import { mapMode } from "./map/map-style";
import { useCampus } from "./useCampus";
import type { PlacesRepository } from "./data/repository";
import type { Place, TransitStop } from "@unimovil/contracts";
import { useRouting } from "../routing/useRouting";
import { RouteSelector } from "../routing/components/RouteSelector";
import { RouteSheet } from "../routing/components/RouteSheet";
import type { RoutingRepository } from "../routing/data/repository";
import { TransitStopSheet } from "../transit/components/TransitStopSheet";

interface Props {
  repository?: PlacesRepository;
  routingRepository?: RoutingRepository;
}

function createStopPlace(stop: TransitStop): Place {
  return {
    id: stop.id,
    name: stop.name,
    category: "transport",
    coordinates: stop.coordinates,
    aliases: [stop.code],
    accessibility: stop.wheelchairAccessible ? "yes" : "unknown",
    source: {
      url: "https://www.emtmadrid.es",
      checkedAt: "2026-11-15",
      license: "ODbL-1.0",
    },
  };
}

function CampusActions({
  count,
  isRoutingOpen,
  showTransit,
  onOpenList,
  onToggleRouting,
  onToggleTransit,
}: {
  count: number;
  isRoutingOpen: boolean;
  showTransit: boolean;
  onOpenList: () => void;
  onToggleRouting: () => void;
  onToggleTransit: () => void;
}) {
  return (
    <View style={styles.actionRow}>
      <Action
        label={`Ver lugares (${count})`}
        onPress={() => {
          Keyboard.dismiss();
          onOpenList();
        }}
      />
      <Action
        label={isRoutingOpen ? "Cerrar ruta" : "Planificar ruta"}
        onPress={() => {
          Keyboard.dismiss();
          onToggleRouting();
        }}
      />
      <Action
        label={showTransit ? "Ocultar EMT" : "Ver EMT"}
        onPress={() => {
          Keyboard.dismiss();
          onToggleTransit();
        }}
      />
    </View>
  );
}

function CampusRoutePanel({
  places,
  routing,
}: {
  places: readonly Place[];
  routing: ReturnType<typeof useRouting>;
}) {
  if (!routing.isRoutingOpen) return null;
  return (
    <RouteSelector
      places={places}
      origin={routing.origin}
      destination={routing.destination}
      accessibleOnly={routing.accessibleOnly}
      loading={routing.loading}
      error={routing.error}
      onSelectOrigin={routing.setOrigin}
      onSelectDestination={routing.setDestination}
      onSwap={routing.swap}
      onTogglePmr={routing.setAccessibleOnly}
      onCalculate={() => {
        void routing.calculate();
      }}
      onClose={routing.closeRouting}
    />
  );
}

function CampusCatalogStatus({
  status,
  onRetry,
}: {
  status: "loading" | "error" | "ready";
  onRetry: () => void;
}) {
  if (status === "loading") {
    return (
      <View style={styles.message}>
        <ActivityIndicator accessibilityLabel="Cargando lugares" />
        <Text>Cargando lugares…</Text>
      </View>
    );
  }
  if (status === "error") {
    return (
      <View style={styles.message}>
        <Text>No se pudo cargar el catálogo.</Text>
        <Action label="Reintentar catálogo" onPress={onRetry} />
      </View>
    );
  }
  return null;
}

function CampusMapExplorer({
  campus,
  routing,
  select,
  showTransit,
  selectedTransitStop,
  onSelectTransitStop,
}: {
  campus: ReturnType<typeof useCampus>;
  routing: ReturnType<typeof useRouting>;
  select: (id: string) => void;
  showTransit: boolean;
  selectedTransitStop: TransitStop | null;
  onSelectTransitStop: (stop: TransitStop) => void;
}) {
  return (
    <>
      {campus.visible.length === 0 && (
        <Text accessibilityLiveRegion="polite">
          No hay coincidencias. Cambia la búsqueda o restablece los filtros.
        </Text>
      )}
      <CampusMap
        allPlaces={campus.places}
        places={campus.visible}
        selected={campus.selected}
        onSelect={select}
        route={routing.route}
        showTransit={showTransit}
        selectedTransitStop={selectedTransitStop}
        onSelectTransitStop={onSelectTransitStop}
        mode={mapMode(process.env.EXPO_PUBLIC_MAP_MODE)}
        {...(process.env.EXPO_PUBLIC_MAPTILER_KEY
          ? { apiKey: process.env.EXPO_PUBLIC_MAPTILER_KEY }
          : {})}
      />
    </>
  );
}

function CampusModals({
  campus,
  routing,
  listOpen,
  selectedTransitStop,
  onCloseList,
  onSelect,
  onCloseTransitStop,
  onPlanRouteToStop,
}: {
  campus: ReturnType<typeof useCampus>;
  routing: ReturnType<typeof useRouting>;
  listOpen: boolean;
  selectedTransitStop: TransitStop | null;
  onCloseList: () => void;
  onSelect: (id: string) => void;
  onCloseTransitStop: () => void;
  onPlanRouteToStop: (stop: TransitStop) => void;
}) {
  return (
    <>
      <CampusDialogs
        campus={campus}
        listOpen={listOpen}
        onCloseList={onCloseList}
        onSelect={onSelect}
        onPlanRoute={(place) => routing.openRouting(place)}
      />
      <RouteSheet route={routing.route} onClose={routing.clearRoute} />
      <TransitStopSheet
        stop={selectedTransitStop}
        onClose={onCloseTransitStop}
        onPlanRouteToStop={onPlanRouteToStop}
      />
    </>
  );
}

export function CampusScreen({ repository, routingRepository }: Props) {
  const campus = useCampus(repository);
  const routing = useRouting(routingRepository);
  const [listOpen, setListOpen] = useState(false);
  const [showTransit, setShowTransit] = useState(true);
  const [selectedTransitStop, setSelectedTransitStop] =
    useState<TransitStop | null>(null);

  function select(id: string) {
    Keyboard.dismiss();
    setListOpen(false);
    campus.select(id);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text accessibilityRole="header" style={styles.title}>
          UniMovil · Moncloa
        </Text>
        <ExplorerControls
          query={campus.query}
          categories={campus.categories}
          onQuery={campus.setQuery}
          onToggle={campus.toggleCategory}
          onReset={campus.reset}
        />
        <CampusCatalogStatus
          status={campus.catalog.status}
          onRetry={campus.retry}
        />
        {campus.catalog.status === "ready" && (
          <>
            {campus.query.trim().length > 0 && (
              <SearchSuggestions places={campus.visible} onSelect={select} />
            )}
            <CampusActions
              count={campus.visible.length}
              isRoutingOpen={routing.isRoutingOpen}
              showTransit={showTransit}
              onOpenList={() => setListOpen(true)}
              onToggleRouting={() => {
                if (routing.isRoutingOpen) {
                  routing.closeRouting();
                } else {
                  routing.openRouting();
                }
              }}
              onToggleTransit={() => setShowTransit((prev) => !prev)}
            />
            <CampusRoutePanel places={campus.places} routing={routing} />
            <CampusMapExplorer
              campus={campus}
              routing={routing}
              select={select}
              showTransit={showTransit}
              selectedTransitStop={selectedTransitStop}
              onSelectTransitStop={(stop) => setSelectedTransitStop(stop)}
            />
          </>
        )}
        <Text style={styles.attribution}>
          Datos de lugares © colaboradores de OpenStreetMap · ODbL
        </Text>
        <CampusModals
          campus={campus}
          routing={routing}
          listOpen={listOpen}
          selectedTransitStop={selectedTransitStop}
          onCloseList={() => setListOpen(false)}
          onSelect={select}
          onCloseTransitStop={() => setSelectedTransitStop(null)}
          onPlanRouteToStop={(stop) => routing.openRouting(createStopPlace(stop))}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f6f8" },
  screen: { flex: 1, padding: 12, gap: 8 },
  title: { fontSize: 22, fontWeight: "700", color: "#18212b" },
  actionRow: { flexDirection: "row", gap: 8 },
  attribution: { fontSize: 12, color: "#414b57" },
  message: { flex: 1, justifyContent: "center", gap: 12, padding: 20 },
});
