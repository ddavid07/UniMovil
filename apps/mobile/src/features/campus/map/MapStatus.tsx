import { StyleSheet, Text, View } from "react-native";
import { Action } from "../components/Action";
import type { MapMode } from "./map-style";
import { MapAttribution } from "./MapAttribution";
const MESSAGES = {
  ready: "Mapa cargado",
  error: "No se pudo cargar el mapa. La lista de lugares sigue disponible.",
  loading: "Cargando mapa…",
};
export function MapStatus({
  state,
  mode,
  onRetry,
  onRecenter,
  viewport,
  onZoomIn,
  onZoomOut,
}: {
  state: keyof typeof MESSAGES;
  mode: MapMode;
  onRetry: () => void;
  onRecenter: () => void;
  viewport: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  // state is restricted to the three fixed message keys.
  // eslint-disable-next-line security/detect-object-injection
  const message = MESSAGES[state];
  return (
    <View style={styles.status}>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.text, state === "ready" && styles.srOnly]}
      >
        {message}
      </Text>
      {state === "error" ? (
        <Action label="Reintentar mapa" onPress={onRetry} />
      ) : (
        <View style={styles.row}>
          <Action label="Centrar campus" onPress={onRecenter} />
          <Action label="Acercar mapa" text="+" onPress={onZoomIn} />
          <Action label="Alejar mapa" text="−" onPress={onZoomOut} />
        </View>
      )}
      {mode !== "live" && (
        <>
          <Text style={styles.text}>Mapa de prueba sin conexión externa</Text>
          <Text style={styles.text}>Vista del mapa: {viewport}</Text>
        </>
      )}
      {mode === "live" && <MapAttribution />}
    </View>
  );
}
const styles = StyleSheet.create({
  status: { backgroundColor: "#ffffff", padding: 8, gap: 4 },
  text: { fontSize: 14, color: "#18212b" },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    opacity: 0,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
