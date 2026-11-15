import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Place } from "@unimovil/contracts";
import type { UIErrorMessage } from "../domain/routing-errors";

interface Props {
  readonly places: readonly Place[];
  readonly origin: Place | null;
  readonly destination: Place | null;
  readonly accessibleOnly: boolean;
  readonly loading: boolean;
  readonly error: UIErrorMessage | null;
  readonly onSelectOrigin: (place: Place) => void;
  readonly onSelectDestination: (place: Place) => void;
  readonly onSwap: () => void;
  readonly onTogglePmr: (val: boolean) => void;
  readonly onCalculate: () => void;
  readonly onClose: () => void;
}

export function RouteSelector({
  places,
  origin,
  destination,
  accessibleOnly,
  loading,
  error,
  onSelectOrigin,
  onSelectDestination,
  onSwap,
  onTogglePmr,
  onCalculate,
  onClose,
}: Props) {
  const [pickerTarget, setPickerTarget] = useState<"origin" | "destination" | null>(
    null,
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text accessibilityRole="header" style={styles.cardTitle}>
          Planificar ruta peatonal
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Cerrar selector de ruta"
          accessibilityHint="Cierra el panel de planificación de rutas"
          onPress={onClose}
          style={styles.closeBtn}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Origen */}
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Desde:</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            origin ? `Origen: ${origin.name}` : "Seleccionar origen"
          }
          style={styles.selectorBtn}
          onPress={() => setPickerTarget("origin")}
        >
          <Text
            numberOfLines={1}
            style={origin ? styles.selectedText : styles.placeholderText}
          >
            {origin?.name ?? "Seleccionar origen"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botón de Intercambio (Swap) */}
      <View style={styles.swapRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Intercambiar origen y destino"
          accessibilityHint="Invierte los puntos de partida y llegada seleccionados"
          style={styles.swapBtn}
          onPress={onSwap}
        >
          <Text style={styles.swapBtnText}>⇅ Intercambiar</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Destino */}
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Hasta:</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            destination
              ? `Destino: ${destination.name}`
              : "Seleccionar destino"
          }
          style={styles.selectorBtn}
          onPress={() => setPickerTarget("destination")}
        >
          <Text
            numberOfLines={1}
            style={
              destination ? styles.selectedText : styles.placeholderText
            }
          >
            {destination?.name ?? "Seleccionar destino"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conmutador de Accesibilidad PMR */}
      <View style={styles.switchRow}>
        <View style={styles.switchLabelContainer}>
          <Text style={styles.switchLabel}>Ruta accesible (PMR)</Text>
          <Text style={styles.switchHelp}>Evita escaleras y desniveles</Text>
        </View>
        <Switch
          accessibilityLabel="Ruta accesible (PMR)"
          accessibilityHint="Filtra itinerarios con escaleras para sillas de ruedas"
          value={accessibleOnly}
          onValueChange={onTogglePmr}
          trackColor={{ false: "#cbd5e1", true: "#10b981" }}
        />
      </View>

      {/* Mensaje de Error HU-094 */}
      {error && (
        <View accessibilityRole="alert" style={styles.errorBox}>
          <Text style={styles.errorTitle}>{error.title}</Text>
          <Text style={styles.errorMessage}>{error.userMessage}</Text>
          <Text style={styles.errorAction}>{error.recommendedAction}</Text>
        </View>
      )}

      {/* Botón Calcular */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Calcular ruta"
        accessibilityHint="Calcula el itinerario peatonal óptimo entre el origen y destino"
        accessibilityState={{ disabled: loading }}
        disabled={loading}
        style={[styles.calcBtn, loading && styles.calcBtnDisabled]}
        onPress={onCalculate}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.calcBtnText}>Calcular ruta</Text>
        )}
      </TouchableOpacity>

      {/* Modal selector de lugar */}
      {pickerTarget && (
        <Modal
          visible
          animationType="slide"
          transparent
          onRequestClose={() => setPickerTarget(null)}
        >
          <View style={styles.modalOverlay}>
            <SafeAreaView edges={["bottom"]} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {pickerTarget === "origin"
                    ? "Seleccionar punto de partida"
                    : "Seleccionar destino"}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar lista de lugares"
                  onPress={() => setPickerTarget(null)}
                >
                  <Text style={styles.modalCloseText}>Cerrar</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.placesList}>
                {places.map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    accessibilityRole="button"
                    accessibilityLabel={place.name}
                    style={styles.placeItem}
                    onPress={() => {
                      if (pickerTarget === "origin") {
                        onSelectOrigin(place);
                      } else {
                        onSelectDestination(place);
                      }
                      setPickerTarget(null);
                    }}
                  >
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeCategory}>{place.category}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 18,
    color: "#64748b",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  inputLabel: {
    width: 60,
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  selectorBtn: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "500",
  },
  placeholderText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  swapRow: {
    alignItems: "flex-end",
    paddingRight: 8,
    marginVertical: 2,
  },
  swapBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  swapBtnText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  switchLabelContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  switchHelp: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b91c1c",
  },
  errorMessage: {
    fontSize: 12,
    color: "#991b1b",
    marginTop: 2,
  },
  errorAction: {
    fontSize: 11,
    color: "#7f1d1d",
    marginTop: 4,
    fontStyle: "italic",
  },
  calcBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  calcBtnDisabled: {
    backgroundColor: "#93c5fd",
  },
  calcBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalCloseText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },
  placesList: {
    marginTop: 8,
  },
  placeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  placeName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
  },
  placeCategory: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
});
