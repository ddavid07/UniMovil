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
import { CampusModals } from "./components/CampusModals";
import { CampusInteractiveSection } from "./components/CampusInteractiveSection";
import { useCampus } from "./useCampus";
import type { PlacesRepository } from "./data/repository";
import type { Place, TransitStop } from "@unimovil/contracts";
import { useRouting } from "../routing/useRouting";
import type { RoutingRepository } from "../routing/data/repository";
import { NetworkBanner } from "../offline/components/NetworkBanner";
import { useNetworkStatus } from "../offline/useNetworkStatus";
import { ReportIncidentScreen } from "../incidents/components/ReportIncidentScreen";
import {
  IncidentStore,
  MONCLOA_CAMPUS_SEED_INCIDENTS,
  type Incident,
} from "../incidents/domain/incidents";

interface Props {
  readonly repository?: PlacesRepository;
  readonly routingRepository?: RoutingRepository;
  readonly isOffline?: boolean;
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

function CampusCatalogStatus({
  status,
  onRetry,
}: {
  readonly status: "loading" | "error" | "ready";
  readonly onRetry: () => void;
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

function useCampusIncidents() {
  const [store] = useState(
    () => new IncidentStore(MONCLOA_CAMPUS_SEED_INCIDENTS),
  );
  const [incidents, setIncidents] = useState(store.getAll());

  function submit(input: Parameters<IncidentStore["submitIncident"]>[0]) {
    const result = store.submitIncident(input);
    if (result.success) setIncidents(store.getAll());
  }

  return { incidents, submit };
}

function CampusHeader({
  network,
  campus,
}: {
  readonly network: ReturnType<typeof useNetworkStatus>;
  readonly campus: ReturnType<typeof useCampus>;
}) {
  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        UniMovil · Moncloa
      </Text>
      <NetworkBanner
        isOffline={network.isOffline}
        onRetry={() => {
          void network.retryConnection();
        }}
      />
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
    </>
  );
}

function toggleRouting(routing: ReturnType<typeof useRouting>): void {
  if (routing.isRoutingOpen) routing.closeRouting();
  else routing.openRouting();
}

export function CampusScreen({
  repository,
  routingRepository,
  isOffline,
}: Props) {
  const campus = useCampus(repository);
  const routing = useRouting(routingRepository);
  const network = useNetworkStatus(isOffline);
  const [listOpen, setListOpen] = useState(false);
  const [showTransit, setShowTransit] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedTransitStop, setSelectedTransitStop] =
    useState<TransitStop | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );
  const incidentState = useCampusIncidents();

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
        <CampusHeader network={network} campus={campus} />
        <CampusInteractiveSection
          campus={campus}
          routing={routing}
          select={select}
          showTransit={showTransit}
          showIncidents={showIncidents}
          selectedTransitStop={selectedTransitStop}
          incidents={incidentState.incidents}
          onSelectIncident={setSelectedIncident}
          onSelectTransitStop={(stop) => setSelectedTransitStop(stop)}
          onOpenList={() => setListOpen(true)}
          onToggleRouting={() => toggleRouting(routing)}
          onToggleTransit={() => setShowTransit((prev) => !prev)}
          onToggleIncidents={() => setShowIncidents((prev) => !prev)}
          onReportIncident={() => setReportOpen(true)}
        />
        <Text style={styles.attribution}>
          Datos de lugares © colaboradores de OpenStreetMap · ODbL
        </Text>
        <CampusModals
          campus={campus}
          routing={routing}
          listOpen={listOpen}
          selectedTransitStop={selectedTransitStop}
          selectedIncident={selectedIncident}
          onCloseList={() => setListOpen(false)}
          onSelect={select}
          onCloseTransitStop={() => setSelectedTransitStop(null)}
          onCloseIncident={() => setSelectedIncident(null)}
          onPlanRouteToStop={(stop) =>
            routing.openRouting(createStopPlace(stop))
          }
        />
        {reportOpen && (
          <ReportIncidentScreen
            onSubmit={(input) => {
              incidentState.submit(input);
              setReportOpen(false);
            }}
            onClose={() => setReportOpen(false)}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f6f8" },
  screen: { flex: 1, padding: 12, gap: 8 },
  title: { fontSize: 22, fontWeight: "700", color: "#18212b" },
  attribution: { fontSize: 12, color: "#414b57" },
  message: { flex: 1, justifyContent: "center", gap: 12, padding: 20 },
});
