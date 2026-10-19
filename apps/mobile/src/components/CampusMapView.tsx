import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Place } from "@unimovil/contracts";

interface CampusMapViewProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
}

// Límites geográficos del Campus de Moncloa (UCM)
const CAMPUS_BOUNDS = {
  minLat: 40.4385,
  maxLat: 40.4555,
  minLng: -3.7365,
  maxLng: -3.7175,
};

// Ubicación simulada por defecto del estudiante (Metro Ciudad Universitaria - HU-011)
const DEFAULT_USER_LOCATION = {
  latitude: 40.4438,
  longitude: -3.7261,
  name: "Tu ubicación (Metro Cdad. Universitaria)",
};

const CATEGORY_ICONS: Record<string, string> = {
  faculty: "🏛️",
  library: "📚",
  transport: "🚇",
  sports: "⚽",
  cafeteria: "☕",
  administration: "🏢",
  service: "ℹ️",
};

export function CampusMapView({ places, onSelectPlace }: CampusMapViewProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [activePlace, setActivePlace] = useState<Place | null>(null);

  // Proyección de coordenadas GPS a porcentaje de pantalla (X, Y)
  const projectCoordinates = (lat: number, lng: number) => {
    const latSpan = CAMPUS_BOUNDS.maxLat - CAMPUS_BOUNDS.minLat;
    const lngSpan = CAMPUS_BOUNDS.maxLng - CAMPUS_BOUNDS.minLng;

    // Normalizado de 0 a 100%
    const x = ((lng - CAMPUS_BOUNDS.minLng) / lngSpan) * 100;
    const y = ((CAMPUS_BOUNDS.maxLat - lat) / latSpan) * 100;

    return {
      left: `${Math.max(5, Math.min(92, x))}%`,
      top: `${Math.max(5, Math.min(90, y))}%`,
    };
  };

  const userCoords = projectCoordinates(
    DEFAULT_USER_LOCATION.latitude,
    DEFAULT_USER_LOCATION.longitude,
  );

  return (
    <View style={styles.container}>
      {/* Contenedor del Mapa */}
      <View style={styles.mapCanvas}>
        {/* Fondo con diseño esquemático del campus */}
        <View style={styles.campusGrid} />
        
        {/* Ejes viales principales del campus */}
        <View style={styles.avenidaComplutense} />
        <Text style={styles.streetLabel}>Av. Complutense</Text>

        {/* Zona verde del Paraninfo */}
        <View style={styles.greenZoneParaninfo} />

        {/* Indicador de posición del usuario (HU-011) */}
        {showUserLocation && (
          <View style={[styles.userMarkerContainer, userCoords as object]}>
            <View style={styles.userPulseRing} />
            <View style={styles.userDot} />
          </View>
        )}

        {/* Marcadores / Pines de Facultades y Edificios (HU-010) */}
        {places.map((place) => {
          const coords = projectCoordinates(
            place.coordinates.latitude,
            place.coordinates.longitude,
          );
          const isSelected = activePlace?.id === place.id;
          const icon = CATEGORY_ICONS[place.category] ?? "📍";

          return (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.markerWrapper,
                coords as object,
                isSelected && styles.markerWrapperSelected,
              ]}
              onPress={() => setActivePlace(place)}
              activeOpacity={0.8}
            >
              <View style={[styles.markerPin, isSelected && styles.markerPinActive]}>
                <Text style={styles.markerIcon}>{icon}</Text>
              </View>
              <View style={styles.markerLabelContainer}>
                <Text style={styles.markerLabel} numberOfLines={1}>
                  {place.shortName ?? place.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Controles de Mapa flotantes (Zoom y GPS) */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
          >
            <Text style={styles.controlText}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
          >
            <Text style={styles.controlText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlButton,
              showUserLocation && styles.gpsButtonActive,
            ]}
            onPress={() => setShowUserLocation((prev) => !prev)}
          >
            <Text style={styles.controlText}>🎯</Text>
          </TouchableOpacity>
        </View>

        {/* Leyenda de escala */}
        <View style={styles.scaleBar}>
          <Text style={styles.scaleText}>Campus de Moncloa · UCM</Text>
        </View>
      </View>

      {/* Tarjeta flotante inferior cuando se selecciona un marcador */}
      {activePlace && (
        <View style={styles.calloutCard}>
          <View style={styles.calloutHeader}>
            <View style={styles.calloutTitleBox}>
              <Text style={styles.calloutTitle}>{activePlace.name}</Text>
              <Text style={styles.calloutCategory}>
                {CATEGORY_ICONS[activePlace.category]} {activePlace.category.toUpperCase()}
                {activePlace.hasAccessibleAccess ? " · ♿ ACCESIBLE PMR" : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setActivePlace(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.calloutClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.calloutDescription} numberOfLines={2}>
            {activePlace.description}
          </Text>

          <View style={styles.calloutActions}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => {
                onSelectPlace(activePlace);
              }}
            >
              <Text style={styles.detailButtonText}>Ver Ficha Completa ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");
const MAP_HEIGHT = 440;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  mapCanvas: {
    width: "100%",
    height: MAP_HEIGHT,
    backgroundColor: "#e8eff5",
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1.5,
    borderColor: "#d3e0ea",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  campusGrid: {
    ...StyleSheet.absoluteFill,
    opacity: 0.25,
    borderWidth: 0.5,
    borderColor: "#a6c1d7",
  },
  avenidaComplutense: {
    position: "absolute",
    left: "15%",
    top: 0,
    bottom: 0,
    width: 22,
    backgroundColor: "#ffffff",
    transform: [{ rotate: "-22deg" }],
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "#c4d5e2",
  },
  streetLabel: {
    position: "absolute",
    left: "32%",
    top: "48%",
    transform: [{ rotate: "-22deg" }],
    fontSize: 10,
    fontWeight: "700",
    color: "#7e9bb2",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  greenZoneParaninfo: {
    position: "absolute",
    left: "6%",
    bottom: "12%",
    width: 90,
    height: 75,
    backgroundColor: "#d7ebd6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#badaba",
  },
  userMarkerContainer: {
    position: "absolute",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -16,
    marginTop: -16,
    zIndex: 10,
  },
  userPulseRing: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(33, 150, 243, 0.25)",
    borderWidth: 1,
    borderColor: "#2196f3",
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0070f3",
    borderWidth: 2.5,
    borderColor: "#ffffff",
  },
  markerWrapper: {
    position: "absolute",
    alignItems: "center",
    marginLeft: -18,
    marginTop: -32,
    zIndex: 5,
  },
  markerWrapperSelected: {
    zIndex: 20,
    transform: [{ scale: 1.15 }],
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1f4b75",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  markerPinActive: {
    backgroundColor: "#1f4b75",
    borderColor: "#0d2b45",
  },
  markerIcon: {
    fontSize: 16,
  },
  markerLabelContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
    borderWidth: 0.5,
    borderColor: "#ccd9e2",
    maxWidth: 90,
  },
  markerLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#1c252e",
    textAlign: "center",
  },
  controlsContainer: {
    position: "absolute",
    right: 12,
    top: 12,
    gap: 8,
    zIndex: 15,
  },
  controlButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d2dfe8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  gpsButtonActive: {
    backgroundColor: "#e8f4fd",
    borderColor: "#0070f3",
  },
  controlText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1f4b75",
  },
  scaleBar: {
    position: "absolute",
    bottom: 8,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scaleText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#53657a",
  },
  calloutCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#dbe5ed",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  calloutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  calloutTitleBox: {
    flex: 1,
    marginRight: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1c252e",
  },
  calloutCategory: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1f4b75",
    marginTop: 2,
  },
  calloutClose: {
    fontSize: 14,
    color: "#8a9ba8",
    fontWeight: "bold",
    padding: 2,
  },
  calloutDescription: {
    fontSize: 13,
    color: "#53657a",
    marginVertical: 8,
    lineHeight: 18,
  },
  calloutActions: {
    marginTop: 4,
  },
  detailButton: {
    backgroundColor: "#1f4b75",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  detailButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
