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
import type { Place } from "@unimovil/contracts";
import { useRouting } from "../routing/useRouting";
import { RouteSelector } from "../routing/components/RouteSelector";
import { RouteSheet } from "../routing/components/RouteSheet";
import type { RoutingRepository } from "../routing/data/repository";

interface Props {
  repository?: PlacesRepository;
  routingRepository?: RoutingRepository;
}

function CampusActions({
  count,
  isRoutingOpen,
  onOpenList,
  onToggleRouting,
}: {
  count: number;
  isRoutingOpen: boolean;
  onOpenList: () => void;
  onToggleRouting: () => void;
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

function CampusModals({
  campus,
  routing,
  listOpen,
  onCloseList,
  onSelect,
}: {
  campus: ReturnType<typeof useCampus>;
  routing: ReturnType<typeof useRouting>;
  listOpen: boolean;
  onCloseList: () => void;
  onSelect: (id: string) => void;
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
    </>
  );
}

export function CampusScreen({ repository, routingRepository }: Props) {
  const campus = useCampus(repository);
  const routing = useRouting(routingRepository);
  const [listOpen, setListOpen] = useState(false);
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
              onOpenList={() => setListOpen(true)}
              onToggleRouting={() => {
                if (routing.isRoutingOpen) {
                  routing.closeRouting();
                } else {
                  routing.openRouting();
                }
              }}
            />
            <CampusRoutePanel places={campus.places} routing={routing} />
            {campus.visible.length === 0 && (
              <Text accessibilityLiveRegion="polite">
                No hay coincidencias. Cambia la búsqueda o restablece los
                filtros.
              </Text>
            )}
            <CampusMap
              allPlaces={campus.places}
              places={campus.visible}
              selected={campus.selected}
              onSelect={select}
              route={routing.route}
              mode={mapMode(process.env.EXPO_PUBLIC_MAP_MODE)}
              {...(process.env.EXPO_PUBLIC_MAPTILER_KEY
                ? { apiKey: process.env.EXPO_PUBLIC_MAPTILER_KEY }
                : {})}
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
          onCloseList={() => setListOpen(false)}
          onSelect={select}
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
