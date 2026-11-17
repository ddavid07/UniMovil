import { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { RouteResponse } from "@unimovil/contracts";
import { formatDistance, formatDuration } from "../domain/routing";
import { calculateMultimodalAlternatives } from "../../transit/domain/transit";
import { MultimodalComparisonCard } from "../../transit/components/MultimodalComparisonCard";

export interface RouteSheetProps {
  readonly route: RouteResponse | null;
  readonly onClose: () => void;
  readonly onAccept?: (() => void) | undefined;
  readonly embedded?: boolean;
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
      <View style={styles.headerTitleCol}>
        <View style={styles.headerBadgeRow}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>UCM</Text>
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            Itinerario peatonal
          </Text>
        </View>
        <Text style={styles.subtitle}>
          Moncloa · Campus de la Universidad Complutense
        </Text>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Cerrar ruta"
        accessibilityHint="Cierra la ruta y limpia el trazado"
        style={styles.closeBtn}
        onPress={onClose}
      >
        <Text style={styles.closeBtnText}>✕ Cerrar ruta</Text>
      </TouchableOpacity>
    </View>
  );
}

function RouteMetricsRow({ route }: { readonly route: RouteResponse }) {
  const durationStr = formatDuration(route.estimatedDurationMinutes);
  const distanceStr = formatDistance(route.totalDistanceMeters);

  return (
    <View style={styles.metricsRow}>
      <View style={styles.metricCard}>
        <Text style={styles.metricIcon}>⏱️</Text>
        <Text style={styles.metricValue}>{durationStr}</Text>
        <Text style={styles.metricLabel}>Tiempo a pie</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricIcon}>📏</Text>
        <Text style={styles.metricValue}>{distanceStr}</Text>
        <Text style={styles.metricLabel}>Distancia total</Text>
      </View>

      <View
        style={[
          styles.metricCard,
          route.accessible ? styles.pmrCardGreen : styles.pmrCardGray,
        ]}
      >
        <Text style={styles.metricIcon}>{route.accessible ? "♿" : "🚶"}</Text>
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

function RouteStepList({ route }: { readonly route: RouteResponse }) {
  return (
    <View style={styles.stepsContainer}>
      <Text style={styles.stepsHeader}>Indicaciones paso a paso</Text>
      <View style={styles.stepsList}>
        {route.segments.map((segment, index) => (
          <View
            key={segment.id}
            style={styles.stepItem}
            accessibilityRole="text"
            accessibilityLabel={`Paso ${index + 1}: ${segment.instruction}. Distancia: ${formatDistance(segment.distanceMeters)}${segment.hasRamp ? ", tramo con rampa accesible" : ""}${segment.hasStairs ? ", tramo con escaleras" : ""}`}
          >
            <View
              style={[
                styles.stepBullet,
                segment.hasRamp && styles.bulletRamp,
                segment.hasStairs && styles.bulletStairs,
              ]}
            >
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
                    <Text style={styles.badgeTextGreen}>♿ Rampa adaptada</Text>
                  </View>
                )}
                {segment.hasStairs && (
                  <View style={styles.badgeStairs}>
                    <Text style={styles.badgeTextRed}>🪜 Escaleras</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function RouteSheet({
  route,
  onClose,
  onAccept,
  embedded = false,
}: RouteSheetProps) {
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

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    } else {
      onClose();
    }
  };

  const sheetBody = (
    <View style={embedded ? styles.embeddedSheet : styles.dialogCard}>
      {/* Header */}
      <RouteHeader onClose={onClose} onAccept={handleAccept} />

      {/* Primary Call-To-Action Banner: Accept & View On Map */}
      <View style={styles.acceptBanner}>
        <View style={styles.acceptBannerTextCol}>
          <Text style={styles.acceptBannerTitle}>
            ¿Quieres seguir esta ruta en el mapa?
          </Text>
          <Text style={styles.acceptBannerSub}>
            Cierra este panel y visualiza el trazado en el mapa interactivo.
          </Text>
        </View>
        <View style={styles.acceptBannerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aceptar y ver en el mapa"
            style={styles.acceptBtn}
            onPress={handleAccept}
          >
            <Text style={styles.acceptBtnText}>🗺️ Aceptar y ver en el mapa</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancelar ruta"
            style={styles.cancelRouteBtn}
            onPress={onClose}
          >
            <Text style={styles.cancelRouteBtnText}>✕ Cancelar</Text>
          </Pressable>
        </View>
      </View>

      {/* Scrollable details */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollBodyContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Quick Metrics */}
        <RouteMetricsRow route={route} />

        {/* Multimodal comparison */}
        {multimodalAlternatives.length > 0 && (
          <View style={styles.multimodalWrapper}>
            <MultimodalComparisonCard
              alternatives={multimodalAlternatives}
            />
          </View>
        )}

        {/* Step-by-step directions */}
        <RouteStepList route={route} />

        {/* Bottom accept reminder button */}
        <View style={styles.bottomActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aceptar y ver en el mapa"
            style={styles.bottomAcceptBtn}
            onPress={handleAccept}
          >
            <Text style={styles.bottomAcceptBtnText}>
              🗺️ Aceptar y ver trazado en el mapa
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );

  if (embedded) {
    return (
      <View style={styles.embeddedOverlay}>
        <Pressable
          style={styles.embeddedBackdrop}
          onPress={onClose}
          accessibilityLabel="Cerrar detalles de ruta"
        />
        {sheetBody}
      </View>
    );
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>{sheetBody}</View>
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
    justifyContent: "flex-end",
    display: "flex",
    flexDirection: "column",
  },
  embeddedBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  embeddedSheet: {
    position: "relative",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1001,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  dialogCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 640,
    maxHeight: "90%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  headerTitleCol: {
    flex: 1,
  },
  headerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBadge: {
    backgroundColor: "#8e1235",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  headerBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
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
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  closeBtnText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  acceptBanner: {
    backgroundColor: "#fdf2f4",
    borderBottomWidth: 1,
    borderBottomColor: "#fecdd3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  acceptBannerTextCol: {
    flex: 1,
    minWidth: 220,
  },
  acceptBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8e1235",
  },
  acceptBannerSub: {
    fontSize: 12,
    color: "#9f1239",
    marginTop: 2,
  },
  acceptBannerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: "#8e1235",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#8e1235",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  acceptBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  cancelRouteBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cancelRouteBtnText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 13,
  },
  scrollBody: {
    flex: 1,
  },
  scrollBodyContent: {
    padding: 20,
    gap: 16,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metricIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  metricValueSmall: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
  pmrCardGreen: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  pmrCardGray: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
  },
  pmrTextGreen: {
    color: "#166534",
  },
  pmrTextGray: {
    color: "#475569",
  },
  multimodalWrapper: {
    marginTop: 4,
  },
  stepsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  stepsHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  stepBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0284c7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  bulletRamp: {
    backgroundColor: "#16a34a",
  },
  bulletStairs: {
    backgroundColor: "#e11d48",
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
    lineHeight: 20,
  },
  stepMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  stepDistance: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  badgeRamp: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextGreen: {
    fontSize: 11,
    color: "#15803d",
    fontWeight: "600",
  },
  badgeStairs: {
    backgroundColor: "#ffe4e6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextRed: {
    fontSize: 11,
    color: "#be123c",
    fontWeight: "600",
  },
  bottomActions: {
    paddingTop: 8,
    alignItems: "center",
  },
  bottomAcceptBtn: {
    backgroundColor: "#8e1235",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  bottomAcceptBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});
