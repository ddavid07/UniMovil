import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import type { Place } from "@unimovil/contracts";
import { CATEGORY_LABELS } from "../domain/places";

export function SearchSuggestions({
  places,
  onSelect,
}: {
  places: readonly Place[];
  onSelect: (id: string) => void;
}) {
  return (
    <FlatList
      style={styles.list}
      keyboardShouldPersistTaps="handled"
      data={places.slice(0, 3)}
      keyExtractor={(place) => place.id}
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sugerencia: ${item.name}, ${CATEGORY_LABELS[item.category]}`}
          onPress={() => onSelect(item.id)}
          style={styles.item}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
        </Pressable>
      )}
    />
  );
}
const styles = StyleSheet.create({
  list: { maxHeight: 160, flexGrow: 0 },
  item: {
    minHeight: 48,
    padding: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#c3c8ce",
  },
  name: { fontSize: 16, color: "#18212b" },
  category: { fontSize: 14, color: "#414b57" },
});
