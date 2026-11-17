import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  readonly isOffline: boolean;
  readonly onRetry?: () => void;
}

export function NetworkBanner({ isOffline, onRetry }: Props) {
  if (!isOffline) {
    return null;
  }

  return (
    <View
      style={styles.banner}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel="Aviso de modo sin conexión. Mostrando datos cacheados."
    >
      <View style={styles.contentRow}>
        <Text style={styles.icon} accessibilityElementsHidden>
          ⚠️
        </Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Modo sin conexión</Text>
          <Text style={styles.subtitle}>
            Mostrando catálogo y datos cacheados. Las consultas en tiempo real
            se reanudarán al reconectar.
          </Text>
        </View>
      </View>
      {onRetry && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reintentar conexión con el servidor"
          accessibilityHint="Pulsa para comprobar si la conexión a internet se ha restablecido"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.retryText}>Reintentar conexión</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    gap: 8,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
  },
  subtitle: {
    fontSize: 12,
    color: "#78350f",
    marginTop: 2,
    lineHeight: 16,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#f59e0b",
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});
