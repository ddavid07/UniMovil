import { useState } from "react";
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Place } from "@unimovil/contracts";
import { CATEGORY_LABELS } from "../domain/places";
import { Action } from "./Action";
const ACCESSIBILITY = {
  unknown: "Sin información de accesibilidad",
  yes: "OSM indica acceso para silla de ruedas",
  no: "OSM indica ausencia de acceso para silla de ruedas",
  limited: "OSM indica acceso limitado para silla de ruedas",
};
export function PlaceSheet({
  place,
  onClose,
}: {
  place: Place | null;
  onClose: () => void;
}) {
  const [linkError, setLinkError] = useState(false);
  if (!place) return null;
  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <Action label="Cerrar ficha" onPress={onClose} />
          <ScrollView contentContainerStyle={styles.content}>
            <Text accessibilityRole="header" style={styles.title}>
              {place.name}
            </Text>
            <Text style={styles.text}>{CATEGORY_LABELS[place.category]}</Text>
            <Text style={styles.text}>
              Ubicación: {place.coordinates.latitude.toFixed(6)},{" "}
              {place.coordinates.longitude.toFixed(6)}
            </Text>
            <Text style={styles.text}>
              {place.description ?? "Sin descripción publicada."}
            </Text>
            <Text style={styles.text}>
              {ACCESSIBILITY[place.accessibility]}. Consulta la fuente; no es
              una certificación de accesibilidad.
            </Text>
            <Text style={styles.text}>
              Fuente: OpenStreetMap · Consulta: {place.source.checkedAt}
            </Text>
            <Text style={styles.text}>
              Los datos pueden cambiar. No se ha realizado una inspección de
              campo.
            </Text>
            <Action
              label="Consultar fuente en OpenStreetMap"
              onPress={() => {
                setLinkError(false);
                void Linking.openURL(place.source.url).catch(() =>
                  setLinkError(true),
                );
              }}
            />
            {linkError && (
              <Text accessibilityRole="alert" style={styles.text}>
                No se pudo abrir el navegador. Inténtalo de nuevo.
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000066",
  },
  sheet: {
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 12,
  },
  content: { gap: 16, paddingBottom: 12 },
  title: { fontSize: 24, color: "#18212b", fontWeight: "700" },
  text: { fontSize: 16, lineHeight: 24, color: "#18212b" },
});
