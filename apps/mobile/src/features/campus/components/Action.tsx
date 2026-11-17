import { Pressable, StyleSheet, Text } from "react-native";
export function Action({
  label,
  onPress,
  selected,
  text = label,
  primary,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  text?: string;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={selected === undefined ? "button" : "checkbox"}
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? {} : { checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary && styles.primary,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          primary && styles.primaryText,
          selected && styles.selectedText,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 7,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  primary: {
    backgroundColor: "#8e1235",
    borderColor: "#8e1235",
  },
  selected: { backgroundColor: "#8e1235", borderColor: "#8e1235" },
  pressed: { opacity: 0.7 },
  text: { color: "#334155", fontSize: 13, fontWeight: "600" },
  primaryText: { color: "#ffffff", fontWeight: "700" },
  selectedText: { color: "#ffffff", fontWeight: "700" },
});
