import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Place } from "@unimovil/contracts";

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  faculty: "Facultad",
  library: "Biblioteca",
  transport: "Transporte",
  sports: "Deportes",
  cafeteria: "Cafetería",
  administration: "Administración",
  service: "Servicio",
};

export function PlaceCard({ place, onPress }: PlaceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{place.name}</Text>
          {place.shortName && (
            <Text style={styles.shortName}>({place.shortName})</Text>
          )}
        </View>
        <View style={styles.badges}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {CATEGORY_NAMES[place.category] ?? place.category}
            </Text>
          </View>
          {place.hasAccessibleAccess && (
            <View style={styles.accessibleBadge}>
              <Text style={styles.accessibleText}>♿ PMR</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {place.description}
      </Text>

      {place.address && (
        <View style={styles.footer}>
          <Text style={styles.addressIcon}>📍</Text>
          <Text style={styles.address} numberOfLines={1}>
            {place.address}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9edf0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1c252e",
    lineHeight: 22,
  },
  shortName: {
    fontSize: 13,
    color: "#53657a",
    fontWeight: "500",
    marginTop: 2,
  },
  badges: {
    flexDirection: "row",
    gap: 4,
  },
  categoryBadge: {
    backgroundColor: "#eef4f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1f4b75",
    textTransform: "uppercase",
  },
  accessibleBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  accessibleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2e7d32",
  },
  description: {
    fontSize: 13,
    color: "#53657a",
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f4f8",
    paddingTop: 8,
  },
  addressIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  address: {
    fontSize: 12,
    color: "#8a9ba8",
    flex: 1,
  },
});
