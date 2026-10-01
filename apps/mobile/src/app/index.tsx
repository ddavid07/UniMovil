import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.brand}>UniMovil</Text>
        <Text style={styles.title}>Movilidad en el campus de Moncloa</Text>
        <Text style={styles.description}>
          La aplicación móvil está preparada para empezar a integrar sus
          funcionalidades.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f7fa",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  brand: {
    marginBottom: 12,
    color: "#315a78",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    maxWidth: 420,
    color: "#17212b",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
  },
  description: {
    maxWidth: 440,
    marginTop: 16,
    color: "#53657a",
    fontSize: 16,
    lineHeight: 24,
  },
});
