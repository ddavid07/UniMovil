import { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import logo from "../../../../assets/maptiler-logo.png";

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
          accessibilityLabel="Cartografía © MapTiler"
          onPress={() => open("https://www.maptiler.com")}
          style={styles.brand}
        >
          <Image source={logo} style={styles.logo} accessible={false} />
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Créditos © MapTiler"
          onPress={() => open("https://www.maptiler.com/copyright/")}
          style={styles.maptilerCredit}
        >
          <Text style={styles.text}>© MapTiler</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Datos © colaboradores de OpenStreetMap"
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
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: {
    minHeight: 48,
    minWidth: 83,
    padding: 8,
    backgroundColor: "#18212b",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  logo: { width: 67, height: 20 },
  maptilerCredit: {
    minHeight: 48,
    minWidth: 48,
    width: 68,
    justifyContent: "center",
  },
  credit: { minHeight: 48, flex: 1, justifyContent: "center" },
  text: { color: "#18212b", fontSize: 12 },
});
