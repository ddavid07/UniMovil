import React, { useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Place, PlaceCategory } from "@unimovil/contracts";
import { SearchBar } from "../components/SearchBar.js";
import { CategoryFilter } from "../components/CategoryFilter.js";
import { PlaceCard } from "../components/PlaceCard.js";
import { PlaceDetailModal } from "../components/PlaceDetailModal.js";
import { placesService } from "../services/placesService.js";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | undefined>(undefined);
  const [onlyAccessible, setOnlyAccessible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Filtrado reactivo de lugares del campus (HU-012, HU-013)
  const filteredPlaces = useMemo(() => {
    return placesService.getPlaces({
      query: searchQuery,
      category: selectedCategory,
      onlyAccessible,
    });
  }, [searchQuery, selectedCategory, onlyAccessible]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Cabecera de la App */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>UNIMOVIL</Text>
              <Text style={styles.campusTitle}>Campus de Moncloa · UCM</Text>
            </View>
          </View>

          {/* Barra de búsqueda interactiva (HU-013) */}
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar facultad, biblioteca, metro..."
            />
          </View>

          {/* Chips de filtro por categoría y PMR (HU-012, HU-040) */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onlyAccessible={onlyAccessible}
            onToggleAccessible={() => setOnlyAccessible((prev) => !prev)}
          />

          {/* Contador de resultados */}
          <View style={styles.countContainer}>
            <Text style={styles.countText}>
              {filteredPlaces.length === 1
                ? "1 lugar encontrado"
                : `${filteredPlaces.length} lugares encontrados`}
            </Text>
          </View>

          {/* Listado de tarjetas de lugares */}
          <FlatList
            data={filteredPlaces}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlaceCard
                place={item}
                onPress={() => setSelectedPlace(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Sin resultados</Text>
                <Text style={styles.emptySubtitle}>
                  No encontramos ningún lugar que coincida con "{searchQuery}".
                  Prueba a cambiar los filtros o el texto.
                </Text>
              </View>
            }
          />

          {/* Ficha completa del lugar en modal emergente (HU-014) */}
          <PlaceDetailModal
            place={selectedPlace}
            visible={selectedPlace !== null}
            onClose={() => setSelectedPlace(null)}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f7fa",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 13,
    fontWeight: "800",
    color: "#315a78",
    letterSpacing: 1.5,
  },
  campusTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#17212b",
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  countContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  countText: {
    fontSize: 12,
    color: "#627d98",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1c252e",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#8a9ba8",
    textAlign: "center",
    lineHeight: 18,
  },
});
