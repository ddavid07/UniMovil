import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { PlaceCategory } from "@unimovil/contracts";

interface CategoryFilterProps {
  selectedCategory?: PlaceCategory;
  onSelectCategory: (category?: PlaceCategory) => void;
  onlyAccessible: boolean;
  onToggleAccessible: () => void;
}

const CATEGORIES: { key?: PlaceCategory; label: string; icon: string }[] = [
  { key: undefined, label: "Todos", icon: "📍" },
  { key: "faculty", label: "Facultades", icon: "🏛️" },
  { key: "library", label: "Bibliotecas", icon: "📚" },
  { key: "transport", label: "Transporte", icon: "🚇" },
  { key: "sports", label: "Deportes", icon: "⚽" },
];

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  onlyAccessible,
  onToggleAccessible,
}: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.label}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => onSelectCategory(cat.key)}
            >
              <Text style={styles.icon}>{cat.icon}</Text>
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Filtro de accesibilidad PMR (HU-040) */}
        <TouchableOpacity
          style={[styles.chip, onlyAccessible && styles.accessibleActive]}
          onPress={onToggleAccessible}
        >
          <Text style={styles.icon}>♿</Text>
          <Text
            style={[
              styles.chipText,
              onlyAccessible && styles.accessibleTextActive,
            ]}
          >
            Solo Accesible
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  chipActive: {
    backgroundColor: "#1f4b75",
    borderColor: "#1f4b75",
  },
  accessibleActive: {
    backgroundColor: "#1b5e20",
    borderColor: "#1b5e20",
  },
  icon: {
    marginRight: 6,
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
    color: "#53657a",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  accessibleTextActive: {
    color: "#ffffff",
  },
});
