import { Pressable, StyleSheet, Text } from "react-native";
export function Action({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={selected === undefined ? "button" : "checkbox"}
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? {} : { checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#68707a",
    backgroundColor: "#ffffff",
  },
  selected: { backgroundColor: "#8e1235", borderColor: "#8e1235" },
  pressed: { opacity: 0.7 },
  text: { color: "#18212b", fontSize: 16 },
  selectedText: { color: "#ffffff" },
});
