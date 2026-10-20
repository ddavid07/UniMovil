import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Place } from "@unimovil/contracts";

interface PlaceDetailModalProps {
  place: Place | null;
  visible: boolean;
  onClose: () => void;
}

export function PlaceDetailModal({
  place,
  visible,
  onClose,
}: PlaceDetailModalProps) {
  if (!place) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Barra superior de arrastre / cerrar */}
          <View style={styles.dragHandle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Cabecera */}
            <View style={styles.header}>
              <Text style={styles.title}>{place.name}</Text>
              {place.shortName && (
                <Text style={styles.subtitle}>{place.shortName}</Text>
              )}
            </View>

            {/* Badges de estado */}
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {place.category.toUpperCase()}
                </Text>
              </View>
              {place.hasAccessibleAccess && (
                <View style={[styles.badge, styles.badgeAccessible]}>
                  <Text style={styles.badgeAccessibleText}>
                    ♿ ACCESO ADAPTADO PMR
                  </Text>
                </View>
              )}
            </View>

            {/* Descripción */}
            <Text style={styles.description}>{place.description}</Text>

            {/* Datos clave */}
            <View style={styles.infoSection}>
              {place.address && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📍</Text>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Dirección</Text>
                    <Text style={styles.infoValue}>{place.address}</Text>
                  </View>
                </View>
              )}

              {place.openingHours && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>🕒</Text>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Horario de atención</Text>
                    <Text style={styles.infoValue}>{place.openingHours}</Text>
                  </View>
                </View>
              )}

              {place.contactEmail && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>✉️</Text>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Contacto</Text>
                    <Text style={styles.infoValue}>{place.contactEmail}</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🛰️</Text>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Coordenadas GPS</Text>
                  <Text style={styles.infoValue}>
                    {place.coordinates.latitude.toFixed(4)},{" "}
                    {place.coordinates.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Puertas y accesibilidad (HU-014, HU-040) */}
            <View style={styles.accessSection}>
              <Text style={styles.sectionTitle}>Puertas y Entradas</Text>
              {place.accessPoints.map((ap) => (
                <View key={ap.id} style={styles.accessCard}>
                  <Text style={styles.accessName}>{ap.name}</Text>
                  <View style={styles.accessFeatures}>
                    {ap.isAccessible && (
                      <Text style={styles.featurePill}>♿ Accesible</Text>
                    )}
                    {ap.hasRamp && (
                      <Text style={styles.featurePill}>📐 Rampa</Text>
                    )}
                    {ap.hasElevator && (
                      <Text style={styles.featurePill}>🛗 Ascensor</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Botón de cierre */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cerrar Ficha</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 12,
  },
  dragHandle: {
    width: 44,
    height: 5,
    backgroundColor: "#d1dbe3",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 8,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  header: {
    marginTop: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1c252e",
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: "#53657a",
    fontWeight: "600",
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 10,
  },
  badge: {
    backgroundColor: "#eef4f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1f4b75",
  },
  badgeAccessible: {
    backgroundColor: "#e8f5e9",
  },
  badgeAccessibleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2e7d32",
  },
  description: {
    fontSize: 14,
    color: "#4a5968",
    lineHeight: 22,
    marginVertical: 8,
  },
  infoSection: {
    backgroundColor: "#f7f9fa",
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#8a9ba8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 13,
    color: "#1c252e",
    fontWeight: "500",
    marginTop: 1,
  },
  accessSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1c252e",
    marginBottom: 10,
  },
  accessCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  accessName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1c252e",
    marginBottom: 6,
  },
  accessFeatures: {
    flexDirection: "row",
    gap: 6,
  },
  featurePill: {
    fontSize: 11,
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    color: "#486581",
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "#1f4b75",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
