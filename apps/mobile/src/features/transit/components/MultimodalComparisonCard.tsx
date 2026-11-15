import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { MultimodalAlternative, TransportMode } from "@unimovil/contracts";

interface Props {
  readonly alternatives: readonly MultimodalAlternative[];
  readonly selectedMode?: TransportMode;
  readonly onSelectMode?: (mode: TransportMode) => void;
}

function ModeIcon({ mode }: { mode: TransportMode }) {
  if (mode === "walking") return <Text style={styles.tabIcon}>🚶</Text>;
  if (mode === "bus") return <Text style={styles.tabIcon}>🚌</Text>;
  return <Text style={styles.tabIcon}>🚲</Text>;
}

function AlternativeDetails({
  selected,
}: {
  selected: MultimodalAlternative;
}) {
  if (!selected.available) {
    return (
      <View style={styles.unavailableBox}>
        <Text style={styles.unavailableTitle}>Opción no disponible</Text>
        <Text style={styles.unavailableReason}>
          {selected.unavailableReason ?? "No recomendada para este trayecto."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.detailsBox}>
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{selected.durationMinutes} min</Text>
          <Text style={styles.metricLabel}>Duración estimada</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {selected.distanceMeters >= 1000
              ? `${(selected.distanceMeters / 1000).toFixed(1)} km`
              : `${selected.distanceMeters} m`}
          </Text>
          <Text style={styles.metricLabel}>Distancia total</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {selected.accessible ? "PMR ✓" : "Estándar"}
          </Text>
          <Text style={styles.metricLabel}>
            {selected.accessible ? "Accesible" : "Con barreras"}
          </Text>
        </View>
      </View>

      {selected.mode === "bus" && selected.originStop && selected.destinationStop && (
        <View style={styles.transitBreakdown}>
          <Text style={styles.breakdownHeader}>Desglose del trayecto EMT:</Text>
          <Text style={styles.breakdownStep}>
            🚶 {selected.walkingToStopMinutes ?? 2} min a pie hasta {selected.originStop}
          </Text>
          <Text style={styles.breakdownStep}>
            🚌 {selected.transitRideMinutes ?? 4} min en {selected.label}
          </Text>
          <Text style={styles.breakdownStep}>
            🚶 {selected.walkingFromStopMinutes ?? 1} min a pie hasta el destino
          </Text>
        </View>
      )}
    </View>
  );
}

export function MultimodalComparisonCard({
  alternatives,
  selectedMode: initialMode,
  onSelectMode,
}: Props) {
  const [activeMode, setActiveMode] = useState<TransportMode>(
    initialMode ?? alternatives.find((a) => a.isRecommended)?.mode ?? "walking",
  );

  const selectedAlt =
    alternatives.find((a) => a.mode === activeMode) ?? alternatives[0];

  function handleSelect(mode: TransportMode) {
    setActiveMode(mode);
    onSelectMode?.(mode);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Comparativa multimodal
        </Text>
        {selectedAlt?.isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Opción recomendada</Text>
          </View>
        )}
      </View>

      {/* Selector de modo */}
      <View style={styles.tabRow}>
        {alternatives.map((alt) => {
          const isSelected = alt.mode === activeMode;
          return (
            <TouchableOpacity
              key={alt.mode}
              accessibilityRole="button"
              accessibilityLabel={`Modo ${alt.label}, ${alt.durationMinutes} minutos`}
              style={[
                styles.tabBtn,
                isSelected && styles.tabBtnActive,
                !alt.available && styles.tabBtnDisabled,
              ]}
              onPress={() => handleSelect(alt.mode)}
            >
              <ModeIcon mode={alt.mode} />
              <Text
                style={[
                  styles.tabLabel,
                  isSelected && styles.tabLabelActive,
                  !alt.available && styles.tabLabelDisabled,
                ]}
              >
                {alt.mode === "walking"
                  ? "A pie"
                  : alt.mode === "bus"
                    ? "Autobús"
                    : "Bicicleta"}
              </Text>
              {alt.available && (
                <Text
                  style={[
                    styles.tabDuration,
                    isSelected && styles.tabDurationActive,
                  ]}
                >
                  {alt.durationMinutes} min
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Detalle del modo seleccionado */}
      {selectedAlt && <AlternativeDetails selected={selectedAlt} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  recommendedBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#15803d",
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 2,
  },
  tabBtnActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  tabBtnDisabled: {
    opacity: 0.5,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  tabLabelActive: {
    color: "#2563eb",
  },
  tabLabelDisabled: {
    color: "#94a3b8",
  },
  tabDuration: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
  },
  tabDurationActive: {
    color: "#2563eb",
  },
  detailsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    alignItems: "center",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  transitBreakdown: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    gap: 4,
  },
  breakdownHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  breakdownStep: {
    fontSize: 12,
    color: "#475569",
  },
  unavailableBox: {
    backgroundColor: "#fff7ed",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fed7aa",
    gap: 4,
  },
  unavailableTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#c2410c",
  },
  unavailableReason: {
    fontSize: 12,
    color: "#9a3412",
  },
});
