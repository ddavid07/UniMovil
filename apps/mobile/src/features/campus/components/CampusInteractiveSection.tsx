import { Keyboard, StyleSheet, Text, View } from "react-native";
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
      <Action
        label={showIncidents ? "Ocultar incidencias" : "Ver incidencias"}
        onPress={() => {
          Keyboard.dismiss();
          onToggleIncidents();
        }}
      />
      <Action
        label="⚠ Reportar incidencia"
        onPress={() => {
          Keyboard.dismiss();
          onReportIncident();
        }}
      />
    </View>
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
        showIncidents={showIncidents}
        selectedTransitStop={selectedTransitStop}
        onSelectTransitStop={onSelectTransitStop}
        incidents={incidents}
        onSelectIncident={onSelectIncident}
        mode={mapMode(process.env.EXPO_PUBLIC_MAP_MODE)}
      />
    </>
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
}: Props) {
  if (campus.catalog.status !== "ready") return null;

  return (
    <>
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
          onClose={routing.closeRouting}
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
      />
    </>
  );
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: "row", gap: 8 },
});
