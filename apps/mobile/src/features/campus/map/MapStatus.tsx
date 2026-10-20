import { StyleSheet, Text, View } from "react-native";
import { Action } from "../components/Action";
import type { MapMode } from "./map-style";
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
}: {
  state: keyof typeof MESSAGES;
  mode: MapMode;
  onRetry: () => void;
  onRecenter: () => void;
  viewport: string;
}) {
  // state is restricted to the three fixed message keys.
  // eslint-disable-next-line security/detect-object-injection
  const message = MESSAGES[state];
  return (
    <View style={styles.status}>
      <Text accessibilityLiveRegion="polite" style={styles.text}>
        {message}
      </Text>
      {state === "error" ? (
        <Action label="Reintentar mapa" onPress={onRetry} />
      ) : (
        <Action label="Centrar campus" onPress={onRecenter} />
      )}
      {mode !== "live" && (
        <>
          <Text style={styles.text}>Prueba cartográfica sin MapTiler</Text>
          <Text style={styles.text}>Vista del mapa: {viewport}</Text>
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  status: { backgroundColor: "#ffffff", padding: 8, gap: 4 },
  text: { fontSize: 14, color: "#18212b" },
});
