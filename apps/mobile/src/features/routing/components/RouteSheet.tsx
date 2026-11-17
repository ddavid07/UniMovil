import { useMemo } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteResponse, TransportMode } from "@unimovil/contracts";
import { formatDistance, formatDuration } from "../domain/routing";
import { calculateMultimodalAlternatives } from "../../transit/domain/transit";
import { MultimodalComparisonCard } from "../../transit/components/MultimodalComparisonCard";

interface Props {
  readonly route: RouteResponse | null;
  readonly onClose: () => void;
  readonly onAccept?: (() => void) | undefined;
  readonly embedded?: boolean | undefined;
  readonly selectedMode?: TransportMode | undefined;
  readonly onSelectMode?: ((mode: TransportMode) => void) | undefined;
}

function RouteHeader({
  onClose,
  onAccept,
}: {
  readonly onClose: () => void;
  readonly onAccept?: (() => void) | undefined;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text accessibilityRole="header" style={styles.title}>
          Itinerario peatonal
        </Text>
        <Text style={styles.subtitle}>Moncloa · Campus Complutense</Text>
      </View>
      <View style={styles.headerActions}>
        {onAccept && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Ver en el mapa"
            style={styles.acceptBtn}
            onPress={onAccept}
          >
            <Text style={styles.acceptBtnText}>Ver en el mapa</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Cerrar ruta"
          style={styles.closeBtn}
          onPress={onClose}
        >
          <Text style={styles.closeBtnText}>Cerrar ruta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RouteMetricsRow({ route }: { route: RouteResponse }) {
  const durationStr = formatDuration(route.estimatedDurationMinutes);
  const distanceStr = formatDistance(route.totalDistanceMeters);

  return (
    <View style={styles.metricsRow}>
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>{durationStr}</Text>
        <Text style={styles.metricLabel}>Tiempo a pie</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>{distanceStr}</Text>
        <Text style={styles.metricLabel}>Distancia total</Text>
      </View>

      <View
        style={[
          styles.metricCard,
          route.accessible ? styles.pmrCardGreen : styles.pmrCardGray,
        ]}
      >
        <Text
          style={[
            styles.metricValueSmall,
            route.accessible ? styles.pmrTextGreen : styles.pmrTextGray,
          ]}
        >
          {route.accessible ? "Ruta accesible PMR" : "Ruta con escaleras"}
        </Text>
        <Text style={styles.metricLabel}>
          {route.accessible ? "Sin barreras" : "Con desniveles"}
        </Text>
      </View>
    </View>
  );
}

function RouteStepList({ route }: { route: RouteResponse }) {
  return (
    <View style={styles.stepsContainer}>
      <Text style={styles.stepsHeader}>Indicaciones paso a paso</Text>
      <ScrollView
        style={styles.stepsList}
        contentContainerStyle={styles.stepsContent}
      >
        {route.segments.map((segment, index) => (
          <View
            key={segment.id}
            style={styles.stepItem}
            accessibilityRole="text"
            accessibilityLabel={`Paso ${index + 1}: ${segment.instruction}. Distancia: ${formatDistance(segment.distanceMeters)}${segment.hasRamp ? ", tramo con rampa accesible" : ""}${segment.hasStairs ? ", tramo con escaleras" : ""}`}
          >
            <View style={styles.stepBullet}>
              <Text style={styles.bulletNumber}>{index + 1}</Text>
            </View>
            <View style={styles.stepDetails}>
              <Text style={styles.stepInstruction}>{segment.instruction}</Text>
              <View style={styles.stepMetaRow}>
                <Text style={styles.stepDistance}>
                  {formatDistance(segment.distanceMeters)}
                </Text>
                {segment.hasRamp && (
                  <View style={styles.badgeRamp}>
                    <Text style={styles.badgeTextGreen}>Rampa adaptada</Text>
                  </View>
                )}
                {segment.hasStairs && (
                  <View style={styles.badgeStairs}>
                    <Text style={styles.badgeTextRed}>Escaleras</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function RouteSheet({
  route,
  onClose,
  onAccept,
  embedded = false,
  selectedMode,
  onSelectMode,
}: Props) {
  const multimodalAlternatives = useMemo(() => {
    if (!route) return [];
    return calculateMultimodalAlternatives(
      route.origin,
      route.destination,
      route,
      { accessibleOnly: route.accessible },
    );
  }, [route]);

  if (!route) {
    return null;
  }

  const sheetContent = (
    <View style={embedded ? styles.embeddedOverlay : styles.overlay}>
      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <RouteHeader onClose={onClose} onAccept={onAccept} />
        <RouteMetricsRow route={route} />
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollBodyContent}
        >
          {multimodalAlternatives.length > 0 && (
            <View style={styles.multimodalWrapper}>
              <MultimodalComparisonCard
                alternatives={multimodalAlternatives}
                selectedMode={selectedMode ?? route.mode ?? "walking"}
                onSelectMode={onSelectMode}
              />
            </View>
          )}
          <RouteStepList route={route} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  if (embedded) {
    return sheetContent;
  }

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      {sheetContent}
    </Modal>
  );
}

const styles = StyleSheet.create({
  embeddedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-end",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: "#8e1235",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  closeBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
  },
  metricValueSmall: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  pmrCardGreen: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  pmrTextGreen: {
    color: "#065f46",
  },
  pmrCardGray: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  pmrTextGray: {
    color: "#64748b",
  },
  scrollBody: {
    maxHeight: 460,
  },
  scrollBodyContent: {
    paddingBottom: 20,
    gap: 12,
  },
  multimodalWrapper: {
    marginTop: 6,
  },
  stepsContainer: {
    gap: 6,
  },
  stepsHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginTop: 8,
  },
  stepsList: {
    maxHeight: 240,
  },
  stepsContent: {
    paddingBottom: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  stepBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  bulletNumber: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  stepDetails: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 19,
  },
  stepMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  stepDistance: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  badgeRamp: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextGreen: {
    fontSize: 10,
    color: "#047857",
    fontWeight: "600",
  },
  badgeStairs: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextRed: {
    fontSize: 10,
    color: "#b91c1c",
    fontWeight: "600",
  },
});
