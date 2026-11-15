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
        <CampusInteractiveSection
          campus={campus}
          routing={routing}
          select={select}
          showTransit={showTransit}
          selectedTransitStop={selectedTransitStop}
          onSelectTransitStop={(stop) => setSelectedTransitStop(stop)}
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
  attribution: { fontSize: 12, color: "#414b57" },
  message: { flex: 1, justifyContent: "center", gap: 12, padding: 20 },
});
