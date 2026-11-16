import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { TransitStop } from "@unimovil/contracts";

interface Props {
  readonly stop: TransitStop | null;
  readonly onClose: () => void;
  readonly onPlanRouteToStop?: (stop: TransitStop) => void;
}

function LineBadge({ line }: { line: string }) {
  const isLineG = line === "G";
  const isLineF = line === "F";
  const badgeStyle = isLineG
    ? styles.lineBadgeG
    : isLineF
      ? styles.lineBadgeF
      : styles.lineBadgeDefault;

  return (
    <View style={[styles.lineBadge, badgeStyle]}>
      <Text style={styles.lineBadgeText}>{line}</Text>
    </View>
  );
}

function NextArrivalsList({ stop }: { stop: TransitStop }) {
  if (!stop.nextArrivals || stop.nextArrivals.length === 0) {
    return (
      <Text style={styles.emptyArrivals}>
        No hay estimaciones en tiempo real disponibles en este momento.
      </Text>
    );
  }

  return (
    <View style={styles.arrivalsContainer}>
      <Text style={styles.sectionSubtitle}>Próximas llegadas estimadas:</Text>
      {stop.nextArrivals.map((arrival) => (
        <View
          key={`${arrival.line}-${arrival.destination}`}
          style={styles.arrivalRow}
        >
          <View style={styles.arrivalLineCol}>
            <LineBadge line={arrival.line} />
            <Text style={styles.arrivalDestText}>
              hacia {arrival.destination}
            </Text>
          </View>
          <Text style={styles.arrivalEstimateText}>
            {arrival.estimateMinutes === 0
              ? "Llegando"
              : `en ${arrival.estimateMinutes} min`}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function TransitStopSheet({ stop, onClose, onPlanRouteToStop }: Props) {
  if (!stop) {
    return null;
  }

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          {/* Cabecera */}
          <View style={styles.header}>
            <View style={styles.titleCol}>
              <View style={styles.codeRow}>
                <Text style={styles.operatorTag}>EMT Madrid</Text>
                <Text style={styles.codeTag}>Parada {stop.code}</Text>
              </View>
              <Text accessibilityRole="header" style={styles.stopName}>
                {stop.name}
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cerrar ficha de parada"
              style={styles.closeBtn}
              onPress={onClose}
            >
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Accesibilidad PMR */}
            <View
              style={[
                styles.pmrBox,
                stop.wheelchairAccessible
                  ? styles.pmrBoxGreen
                  : styles.pmrBoxGray,
              ]}
            >
              <Text style={styles.pmrIcon}>
                {stop.wheelchairAccessible ? "♿" : "⚠️"}
              </Text>
              <Text
                style={[
                  styles.pmrText,
                  stop.wheelchairAccessible
                    ? styles.pmrTextGreen
                    : styles.pmrTextGray,
                ]}
              >
                {stop.wheelchairAccessible
                  ? "Parada adaptada para movilidad reducida (PMR)"
                  : "Parada sin adaptación de accesibilidad"}
              </Text>
            </View>

            {/* Líneas que pasan */}
            <View style={styles.linesSection}>
              <Text style={styles.sectionSubtitle}>
                Líneas que prestan servicio:
              </Text>
              <View style={styles.linesRow}>
                {stop.lines.map((line) => (
                  <LineBadge key={line} line={line} />
                ))}
              </View>
            </View>

            {/* Próximas llegadas */}
            <NextArrivalsList stop={stop} />

            {/* Botón de acción */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Planificar ruta hasta esta parada"
              style={styles.planBtn}
              onPress={() => {
                onPlanRouteToStop?.(stop);
                onClose();
              }}
            >
              <Text style={styles.planBtnText}>
                Planificar ruta hasta esta parada
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
  },
  titleCol: {
    flex: 1,
    gap: 4,
  },
  codeRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  operatorTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#005aa9",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeTag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  stopName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  content: {
    gap: 14,
  },
  pmrBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  pmrBoxGreen: {
    backgroundColor: "#f0fdf4",
  },
  pmrBoxGray: {
    backgroundColor: "#f8fafc",
  },
  pmrIcon: {
    fontSize: 16,
  },
  pmrText: {
    fontSize: 12,
    fontWeight: "600",
  },
  pmrTextGreen: {
    color: "#166534",
  },
  pmrTextGray: {
    color: "#64748b",
  },
  linesSection: {
    gap: 6,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  linesRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  lineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  lineBadgeG: {
    backgroundColor: "#005aa9",
  },
  lineBadgeF: {
    backgroundColor: "#d97706",
  },
  lineBadgeDefault: {
    backgroundColor: "#475569",
  },
  lineBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  arrivalsContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 14,
  },
  arrivalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrivalLineCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrivalDestText: {
    fontSize: 13,
    color: "#334155",
  },
  arrivalEstimateText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  emptyArrivals: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: 12,
  },
  planBtn: {
    backgroundColor: "#005aa9",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  planBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
