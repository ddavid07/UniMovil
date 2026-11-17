import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

export function MapAttribution() {
  const [error, setError] = useState(false);
  function open(url: string) {
    setError(false);
    void Linking.openURL(url).catch(() => setError(true));
  }
  return (
    <View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="© OpenStreetMap contributors"
          onPress={() => open("https://www.openstreetmap.org/copyright")}
          style={styles.credit}
        >
          <Text style={styles.text}>© OpenStreetMap contributors</Text>
        </Pressable>
      </View>
      {error && (
        <Text accessibilityRole="alert" style={styles.text}>
          No se pudieron abrir los créditos. Inténtalo de nuevo.
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" },
  credit: {
    minHeight: 22,
    justifyContent: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: { color: "#0284c7", fontSize: 12, textDecorationLine: "underline" },
});
