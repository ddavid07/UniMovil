import React, { useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Place, PlaceCategory } from "@unimovil/contracts";
import { SearchBar } from "../components/SearchBar";
import { CategoryFilter } from "../components/CategoryFilter";
import { PlaceCard } from "../components/PlaceCard";
import { PlaceDetailModal } from "../components/PlaceDetailModal";
import { CampusMapView } from "../components/CampusMapView";
import { placesService } from "../services/placesService";

type ViewMode = "list" | "map";

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    PlaceCategory | undefined
  >(undefined);
  const [onlyAccessible, setOnlyAccessible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Filtrado reactivo de lugares del campus (HU-012, HU-013, HU-040)
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
          {/* Cabecera y Selector de Vistas (Lista vs Mapa) */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>UNIMOVIL</Text>
              <Text style={styles.campusTitle}>Campus de Moncloa · UCM</Text>
            </View>

            {/* Alternador de Vista (Segmented Control) */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  viewMode === "map" && styles.tabButtonActive,
                ]}
                onPress={() => setViewMode("map")}
              >
                <Text
                  style={[
                    styles.tabText,
                    viewMode === "map" && styles.tabTextActive,
                  ]}
                >
                  🗺️ Mapa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  viewMode === "list" && styles.tabButtonActive,
                ]}
                onPress={() => setViewMode("list")}
              >
                <Text
                  style={[
                    styles.tabText,
                    viewMode === "list" && styles.tabTextActive,
                  ]}
                >
                  📋 Lista ({filteredPlaces.length})
                </Text>
              </TouchableOpacity>
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

          {/* VISTA 1: MAPA INTERACTIVO DEL CAMPUS (HU-010, HU-011) */}
          {viewMode === "map" && (
            <CampusMapView
              places={filteredPlaces}
              onSelectPlace={(place) => setSelectedPlace(place)}
            />
          )}

          {/* VISTA 2: LISTA DE RESULTADOS (HU-013, HU-014) */}
          {viewMode === "list" && (
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
                    No encontramos ningún lugar que coincida con "{searchQuery}
                    ". Prueba a cambiar los filtros o el texto.
                  </Text>
                </View>
              }
            />
          )}

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  brand: {
    fontSize: 12,
    fontWeight: "800",
    color: "#315a78",
    letterSpacing: 1.5,
  },
  campusTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#17212b",
    marginTop: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e3ebf2",
    borderRadius: 12,
    padding: 3,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#53657a",
  },
  tabTextActive: {
    color: "#1f4b75",
    fontWeight: "700",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
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
