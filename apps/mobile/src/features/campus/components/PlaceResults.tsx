import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Place } from "@unimovil/contracts";
import { CATEGORY_LABELS } from "../domain/places";
import { Action } from "./Action";
interface Props {
  places: readonly Place[];
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onReset: () => void;
}
export function PlaceResults({
  places,
  open,
  onClose,
  onSelect,
  onReset,
}: Props) {
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <Text accessibilityRole="header" style={styles.heading}>
          Lugares encontrados: {places.length}
        </Text>
        <Action label="Volver al mapa" onPress={onClose} />
        <FlatList
          data={places}
          keyExtractor={(place) => place.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text>
                No hay lugares que coincidan. Cambia la búsqueda o restablece
                los filtros.
              </Text>
              <Action
                label="Restablecer búsqueda y filtros"
                onPress={onReset}
              />
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${CATEGORY_LABELS[item.category]}, ${item.coordinates.latitude.toFixed(5)}, ${item.coordinates.longitude.toFixed(5)}`}
              onPress={() => onSelect(item.id)}
              style={styles.item}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>
                {CATEGORY_LABELS[item.category]} ·{" "}
                {item.coordinates.latitude.toFixed(5)},{" "}
                {item.coordinates.longitude.toFixed(5)}
              </Text>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12, backgroundColor: "#f5f6f8" },
  heading: { fontSize: 22, fontWeight: "700", color: "#18212b" },
  item: {
    minHeight: 64,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#c3c8ce",
  },
  name: { fontSize: 18, color: "#18212b" },
  detail: { fontSize: 14, color: "#414b57", marginTop: 6 },
  empty: { gap: 16, paddingVertical: 20 },
});
