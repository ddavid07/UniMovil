import { Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";
import type { TransitStop } from "@unimovil/contracts";
import type { Incident } from "../../incidents/domain/incidents";
import type { useCampus } from "../useCampus";
import type { useRouting } from "../../routing/useRouting";
import { Action } from "./Action";
import { SearchSuggestions } from "./SearchSuggestions";
import { RouteSelector } from "../../routing/components/RouteSelector";
import { CampusMap } from "../map/CampusMap";
import { mapMode } from "../map/map-style";

interface Props {
  readonly campus: ReturnType<typeof useCampus>;
  readonly routing: ReturnType<typeof useRouting>;
  readonly select: (id: string) => void;
  readonly showTransit: boolean;
  readonly showIncidents: boolean;
  readonly selectedTransitStop: TransitStop | null;
  readonly onSelectTransitStop: (stop: TransitStop) => void;
  readonly incidents: readonly Incident[];
  readonly onSelectIncident: (incident: Incident) => void;
  readonly onOpenList: () => void;
  readonly onToggleRouting: () => void;
  readonly onToggleTransit: () => void;
  readonly onToggleIncidents: () => void;
  readonly onReportIncident: () => void;
  readonly onOpenRouteDetails?: (() => void) | undefined;
  readonly onClearRoute?: (() => void) | undefined;
}

function CampusActions({
  count,
  isRoutingOpen,
  showTransit,
  showIncidents,
  onOpenList,
  onToggleRouting,
  onToggleTransit,
  onToggleIncidents,
  onReportIncident,
}: {
  readonly count: number;
  readonly isRoutingOpen: boolean;
  readonly showTransit: boolean;
  readonly showIncidents: boolean;
  readonly onOpenList: () => void;
  readonly onToggleRouting: () => void;
  readonly onToggleTransit: () => void;
  readonly onToggleIncidents: () => void;
  readonly onReportIncident: () => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.actionRow}
      keyboardShouldPersistTaps="handled"
      style={styles.actionScrollView}
    >
      <Action
        label={isRoutingOpen ? "Cerrar ruta" : "Planificar ruta"}
        text={isRoutingOpen ? "✕ Cerrar ruta" : "🗺️ Planificar ruta"}
        primary
        onPress={() => {
          Keyboard.dismiss();
          onToggleRouting();
        }}
      />
      <Action
        label={`Ver lugares (${count})`}
        text={`📍 Lugares (${count})`}
        onPress={() => {
          Keyboard.dismiss();
          onOpenList();
        }}
      />
      <Action
        label={showTransit ? "Ocultar EMT" : "Ver EMT"}
        text={showTransit ? "🚌 EMT activas" : "🚌 Ver EMT"}
        onPress={() => {
          Keyboard.dismiss();
          onToggleTransit();
        }}
      />
      <Action
        label={showIncidents ? "Ocultar incidencias" : "Ver incidencias"}
        text={showIncidents ? "⚠️ Incidencias" : "⚠️ Ver avisos"}
        onPress={() => {
          Keyboard.dismiss();
          onToggleIncidents();
        }}
      />
      <Action
        label="⚠ Reportar incidencia"
        text="➕ Reportar"
        onPress={() => {
          Keyboard.dismiss();
          onReportIncident();
        }}
      />
    </ScrollView>
  );
}

function CampusMapExplorer({
  campus,
  routing,
  select,
  showTransit,
  showIncidents,
  selectedTransitStop,
  onSelectTransitStop,
  incidents,
  onSelectIncident,
  onOpenRouteDetails,
  onClearRoute,
}: {
  readonly campus: ReturnType<typeof useCampus>;
  readonly routing: ReturnType<typeof useRouting>;
  readonly select: (id: string) => void;
  readonly showTransit: boolean;
  readonly showIncidents: boolean;
  readonly selectedTransitStop: TransitStop | null;
  readonly onSelectTransitStop: (stop: TransitStop) => void;
  readonly incidents: readonly Incident[];
  readonly onSelectIncident: (incident: Incident) => void;
  readonly onOpenRouteDetails?: (() => void) | undefined;
  readonly onClearRoute?: (() => void) | undefined;
}) {
  return (
    <View style={styles.mapExplorerContainer}>
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
        showIncidents={showIncidents}
        selectedTransitStop={selectedTransitStop}
        onSelectTransitStop={onSelectTransitStop}
        incidents={incidents}
        onSelectIncident={onSelectIncident}
        mode={mapMode(process.env.EXPO_PUBLIC_MAP_MODE)}
        onOpenRouteDetails={onOpenRouteDetails}
        onClearRoute={onClearRoute}
      />
    </View>
  );
}

export function CampusInteractiveSection({
  campus,
  routing,
  select,
  showTransit,
  showIncidents,
  selectedTransitStop,
  onSelectTransitStop,
  incidents,
  onSelectIncident,
  onOpenList,
  onToggleRouting,
  onToggleTransit,
  onToggleIncidents,
  onReportIncident,
  onOpenRouteDetails,
  onClearRoute,
}: Props) {
  if (campus.catalog.status !== "ready") return null;

  return (
    <View style={styles.container}>
      {campus.query.trim().length > 0 && (
        <SearchSuggestions places={campus.visible} onSelect={select} />
      )}
      <CampusActions
        count={campus.visible.length}
        isRoutingOpen={routing.isRoutingOpen}
        showTransit={showTransit}
        showIncidents={showIncidents}
        onOpenList={onOpenList}
        onToggleRouting={onToggleRouting}
        onToggleTransit={onToggleTransit}
        onToggleIncidents={onToggleIncidents}
        onReportIncident={onReportIncident}
      />
      {routing.isRoutingOpen && (
        <RouteSelector
          places={campus.places}
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
          onClose={() => {
            if (routing.route) {
              routing.closePlanner();
            } else {
              routing.closeRouting();
            }
          }}
        />
      )}
      <CampusMapExplorer
        campus={campus}
        routing={routing}
        select={select}
        showTransit={showTransit}
        showIncidents={showIncidents}
        selectedTransitStop={selectedTransitStop}
        onSelectTransitStop={onSelectTransitStop}
        incidents={incidents}
        onSelectIncident={onSelectIncident}
        onOpenRouteDetails={onOpenRouteDetails}
        onClearRoute={onClearRoute}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  actionScrollView: {
    maxHeight: 46,
    flexGrow: 0,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  mapExplorerContainer: {
    flex: 1,
    minHeight: 320,
    display: "flex",
    flexDirection: "column",
  },
});
