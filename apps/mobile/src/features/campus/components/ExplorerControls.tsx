import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { PLACE_CATEGORIES, type PlaceCategory } from "@unimovil/contracts";
import { CATEGORY_LABELS, MAX_QUERY_LENGTH } from "../domain/places";
import { Action } from "./Action";
interface Props {
  query: string;
  categories: readonly PlaceCategory[];
  onQuery: (value: string) => void;
  onToggle: (category: PlaceCategory) => void;
  onReset: () => void;
}
export function ExplorerControls({
  query,
  categories,
  onQuery,
  onToggle,
  onReset,
}: Props) {
  return (
    <View style={styles.controls}>
      <TextInput
        accessibilityLabel="Buscar lugares"
        placeholder="Nombre, categoría o alias"
        value={query}
        onChangeText={onQuery}
        maxLength={MAX_QUERY_LENGTH}
        autoCorrect={false}
        returnKeyType="search"
        submitBehavior="blurAndSubmit"
        onSubmitEditing={() => Keyboard.dismiss()}
        style={styles.input}
        clearButtonMode="while-editing"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {PLACE_CATEGORIES.map((category) => (
          <Action
            key={category}
            label={
              Object.entries(CATEGORY_LABELS).find(
                ([key]) => key === category,
              )![1]
            }
            selected={categories.includes(category)}
            onPress={() => onToggle(category)}
          />
        ))}
        <Action label="Restablecer" onPress={onReset} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  controls: { gap: 6 },
  input: {
    minHeight: 40,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#18212b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  row: { gap: 6, paddingBottom: 2 },
});
