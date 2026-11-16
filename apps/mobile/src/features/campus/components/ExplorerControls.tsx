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
        showsHorizontalScrollIndicator
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
  controls: { gap: 8 },
  input: {
    minHeight: 48,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#68707a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#18212b",
  },
  row: { gap: 8, paddingBottom: 4 },
});
