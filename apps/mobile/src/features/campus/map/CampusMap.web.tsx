import { useEffect, useRef, useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import L from "leaflet";
import type {
  Place,
  RouteResponse,
  TransitLine,
  TransitStop,
} from "@unimovil/contracts";
import { type MapMode } from "./map-style";
import { MapStatus } from "./MapStatus";
import {
  CAMPUS_TRANSIT_LINES,
  CAMPUS_TRANSIT_STOPS,
} from "../../transit/data/transit-data";
import {
  MONCLOA_CAMPUS_SEED_INCIDENTS,
  type Incident,
} from "../../incidents/domain/incidents";
import { formatDistance, formatDuration } from "../../routing/domain/routing";

interface Props {
  readonly places: readonly Place[];
  readonly allPlaces: readonly Place[];
  readonly selected: Place | null;
  readonly onSelect: (id: string) => void;
  readonly mode: MapMode;
  readonly route?: RouteResponse | null | undefined;
  readonly showTransit?: boolean | undefined;
  readonly transitLines?: readonly TransitLine[] | undefined;
  readonly transitStops?: readonly TransitStop[] | undefined;
  readonly selectedTransitStop?: TransitStop | null | undefined;
  readonly onSelectTransitStop?: ((stop: TransitStop) => void) | undefined;
  readonly onSelectIncident?: ((incident: Incident) => void) | undefined;
  readonly showIncidents?: boolean | undefined;
  readonly incidents?: readonly Incident[] | undefined;
  readonly onOpenRouteDetails?: (() => void) | undefined;
  readonly onClearRoute?: (() => void) | undefined;
}

const CAMPUS_CENTER: [number, number] = [40.449, -3.729];
const DEFAULT_ZOOM = 15;

function createPinIcon(color: string, symbol: string) {
  return L.divIcon({
    className: "unimovil-map-pin",
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 3px 6px rgba(0,0,0,0.35);
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 14px;
          line-height: 1;
        ">${symbol}</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

const PLACE_ICON = createPinIcon("#8e1235", "🏛️");
const SELECTED_ICON = createPinIcon("#dc2626", "📍");
const TRANSIT_ICON = createPinIcon("#16a34a", "🚌");
const INCIDENT_ICON = createPinIcon("#d97706", "⚠️");

export function CampusMap({
  places,
  selected,
  onSelect,
  mode,
  route,
  showTransit = false,
  transitStops = CAMPUS_TRANSIT_STOPS,
  selectedTransitStop,
  onSelectTransitStop,
  onSelectIncident,
  showIncidents = false,
  incidents = MONCLOA_CAMPUS_SEED_INCIDENTS,
  onOpenRouteDetails,
  onClearRoute,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const routeStartMarkerRef = useRef<L.Marker | null>(null);
  const routeEndMarkerRef = useRef<L.Marker | null>(null);
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
  const [viewportText, setViewportText] = useState(
    `${CAMPUS_CENTER[0].toFixed(4)}, ${CAMPUS_CENTER[1].toFixed(4)} (zoom ${DEFAULT_ZOOM})`,
  );

  // 1. Inject Leaflet CSS and initialize map
  useEffect(() => {
    if (
      typeof document !== "undefined" &&
      !document.getElementById("leaflet-css")
    ) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet map with gentle trackpad/touch sensitivity
    const map = L.map(mapContainerRef.current, {
      center: CAMPUS_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 5, // Allows zooming out fully
      maxZoom: 19,
      zoomControl: false, // We use custom MapStatus controls below
      attributionControl: false, // MapStatus displays attribution
      // Calibrated sensitivity for 2-finger trackpad / mousewheel
      wheelPxPerZoomLevel: 175, // Tuned for responsive, smooth zooming
      zoomDelta: 0.5,
      zoomSnap: 0.25,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    map.on("zoomend", () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      const c = map.getCenter();
      setViewportText(
        `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)} (zoom ${zoom.toFixed(1)})`,
      );
    });

    map.on("moveend", () => {
      const c = map.getCenter();
      setViewportText(
        `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)} (zoom ${map.getZoom().toFixed(1)})`,
      );
    });

    mapInstanceRef.current = map;

    // Ensure map tiles calculate correct bounds after mount
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Watch for layout resizing (e.g. switching between web and mobile preview)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Update markers when places, selection, transit, or incidents change
  useEffect(() => {
    const group = markersLayerRef.current;
    if (!group) return;

    group.clearLayers();

    // Add place markers
    places.forEach((place) => {
      const isSelected = selected?.id === place.id;
      const marker = L.marker(
        [place.coordinates.latitude, place.coordinates.longitude],
        { icon: isSelected ? SELECTED_ICON : PLACE_ICON, zIndexOffset: isSelected ? 1000 : 100 },
      );
      marker.bindTooltip(place.name, { direction: "top", offset: [0, -28] });
      marker.on("click", () => onSelect(place.id));
      group.addLayer(marker);
    });

    // Add transit stops if visible
    if (showTransit) {
      transitStops.forEach((stop) => {
        const isSelected = selectedTransitStop?.id === stop.id;
        const marker = L.marker(
          [stop.coordinates.latitude, stop.coordinates.longitude],
          { icon: TRANSIT_ICON, zIndexOffset: isSelected ? 900 : 50 },
        );
        marker.bindTooltip(`🚌 ${stop.name} (${stop.lines.join(", ")})`, {
          direction: "top",
          offset: [0, -28],
        });
        marker.on("click", () => onSelectTransitStop?.(stop));
        group.addLayer(marker);
      });
    }

    // Add incident markers if visible
    if (showIncidents) {
      incidents.forEach((incident) => {
        const marker = L.marker(
          [incident.coordinates.latitude, incident.coordinates.longitude],
          { icon: INCIDENT_ICON, zIndexOffset: 800 },
        );
        marker.bindTooltip(`⚠️ ${incident.title} (${incident.status})`, {
          direction: "top",
          offset: [0, -28],
        });
        marker.on("click", () => onSelectIncident?.(incident));
        group.addLayer(marker);
      });
    }
  }, [places, selected, showTransit, transitStops, selectedTransitStop, showIncidents, incidents, onSelect, onSelectTransitStop, onSelectIncident]);

  // 3. Pan to selected place or transit stop
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selected) {
      map.flyTo(
        [selected.coordinates.latitude, selected.coordinates.longitude],
        16,
        { duration: 0.8 },
      );
    } else if (selectedTransitStop) {
      map.flyTo(
        [
          selectedTransitStop.coordinates.latitude,
          selectedTransitStop.coordinates.longitude,
        ],
        16,
        { duration: 0.8 },
      );
    }
  }, [selected, selectedTransitStop]);

  // 4. Update route line and start/destination markers if route is present
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (routeStartMarkerRef.current) {
      map.removeLayer(routeStartMarkerRef.current);
      routeStartMarkerRef.current = null;
    }
    if (routeEndMarkerRef.current) {
      map.removeLayer(routeEndMarkerRef.current);
      routeEndMarkerRef.current = null;
    }

    if (route && route.polyline.length > 0) {
      const latLngs: [number, number][] = route.polyline.map((coord) => [
        coord.latitude,
        coord.longitude,
      ]);
      const line = L.polyline(latLngs, {
        color: route.accessible ? "#16a34a" : "#0284c7",
        weight: 6,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      routeLayerRef.current = line;

      // Add Start (Origen) marker
      const startCoord = route.origin;
      const startMarker = L.marker([startCoord.latitude, startCoord.longitude], {
        icon: createPinIcon("#16a34a", "🚩"),
        zIndexOffset: 1100,
      }).addTo(map);
      startMarker.bindTooltip("🚩 Punto de partida (Origen)", {
        direction: "top",
        offset: [0, -28],
      });
      routeStartMarkerRef.current = startMarker;

      // Add End (Destino) marker
      const endCoord = route.destination;
      const endMarker = L.marker([endCoord.latitude, endCoord.longitude], {
        icon: createPinIcon("#8e1235", "🏁"),
        zIndexOffset: 1200,
      }).addTo(map);
      endMarker.bindTooltip("🏁 Destino de la ruta", {
        direction: "top",
        offset: [0, -28],
      });
      routeEndMarkerRef.current = endMarker;

      // Auto invalidate map size and fit route in bounds
      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(line.getBounds(), { padding: [40, 40] });
      }, 100);
    }
  }, [route]);

  // Controls for MapStatus
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo(CAMPUS_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
    }
  };

  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.zoomOut();
    }
  };

  return (
    <View style={styles.container}>
      {/* Route Info Banner */}
      {route && (
        <View style={styles.routeBanner}>
          <View style={styles.routeBannerContent}>
            <View
              style={[
                styles.routeBadge,
                route.accessible ? styles.routeBadgePmr : styles.routeBadgeStd,
              ]}
            >
              <Text style={styles.routeBadgeIcon}>
                {route.accessible ? "♿" : "🚶"}
              </Text>
              <Text style={styles.routeBadgeText}>
                {route.accessible ? "Accesible PMR" : "Peatonal"}
              </Text>
            </View>
            <View style={styles.routeTextGroup}>
              <Text style={styles.routeTitle}>
                {formatDuration(route.estimatedDurationMinutes)} ({formatDistance(route.totalDistanceMeters)})
              </Text>
              <Text style={styles.routeDetails}>
                {route.accessible
                  ? "Itinerario sin desniveles ni escaleras"
                  : "Itinerario peatonal estándar"}
              </Text>
            </View>
          </View>
          <View style={styles.routeActionsGroup}>
            {onOpenRouteDetails && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver itinerario paso a paso"
                style={styles.viewItineraryBtn}
                onPress={onOpenRouteDetails}
              >
                <Text style={styles.viewItineraryBtnText}>📋 Ver itinerario</Text>
              </Pressable>
            )}
            {onClearRoute && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancelar ruta"
                style={styles.cancelRouteBtn}
                onPress={onClearRoute}
              >
                <Text style={styles.cancelRouteBtnText}>✕ Cancelar ruta</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Selected Place Card */}
      {selected && (
        <View style={styles.selectedCard}>
          <View style={styles.selectedCardRow}>
            <Text style={styles.selectedCardTitle}>📍 {selected.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{selected.category}</Text>
            </View>
          </View>
          {selected.accessibility && (
            <Text style={styles.selectedCardMeta}>
              ♿ Accesibilidad: {selected.accessibility}
            </Text>
          )}
        </View>
      )}

      {/* Selected Transit Stop Card */}
      {selectedTransitStop && !selected && (
        <View style={styles.transitSelectedCard}>
          <Text style={styles.transitSelectedTitle}>
            🚌 Parada: {selectedTransitStop.name}
          </Text>
          <Text style={styles.transitSelectedSubtitle}>
            Líneas: {selectedTransitStop.lines.join(", ")}
          </Text>
        </View>
      )}

      {/* Active Layer Badges */}
      {(showTransit || showIncidents) && (
        <View style={styles.badgesRow}>
          {showTransit && (
            <View style={styles.layerBadgeGreen}>
              <Text style={styles.layerBadgeTextGreen}>
                🚌 EMT activas ({transitStops.length} paradas)
              </Text>
            </View>
          )}
          {showIncidents && incidents.length > 0 && (
            <View style={styles.layerBadgeAmber}>
              <Text style={styles.layerBadgeTextAmber}>
                ⚠️ {incidents.length} incidencias reportadas
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Native Leaflet Map DOM Container */}
      <View style={styles.mapFrame}>
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        />
      </View>

      {/* Map status footer with functional buttons */}
      <MapStatus
        state="ready"
        mode={mode}
        viewport={viewportText}
        onRetry={() => {}}
        onRecenter={handleRecenter}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 380,
    height: "100%",
    width: "100%",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  mapFrame: {
    flex: 1,
    minHeight: 320,
    height: "100%",
    width: "100%",
    backgroundColor: "#e5e7eb",
  },
  routeBanner: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 2,
    borderBottomColor: "#0284c7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  routeBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 240,
  },
  routeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routeBadgePmr: {
    backgroundColor: "#dcfce7",
  },
  routeBadgeStd: {
    backgroundColor: "#e0f2fe",
  },
  routeBadgeIcon: {
    fontSize: 14,
  },
  routeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },
  routeTextGroup: {
    flex: 1,
  },
  routeTitle: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 14,
  },
  routeDetails: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 1,
  },
  routeActionsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewItineraryBtn: {
    backgroundColor: "#8e1235",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },
  viewItineraryBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  cancelRouteBtn: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  cancelRouteBtnText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  selectedCard: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#bfdbfe",
  },
  selectedCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e3a8a",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1d4ed8",
    textTransform: "capitalize",
  },
  selectedCardMeta: {
    fontSize: 11,
    color: "#3b82f6",
    marginTop: 2,
  },
  transitSelectedCard: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#bbf7d0",
  },
  transitSelectedTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },
  transitSelectedSubtitle: {
    fontSize: 11,
    color: "#15803d",
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  layerBadgeGreen: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  layerBadgeTextGreen: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
  },
  layerBadgeAmber: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  layerBadgeTextAmber: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400e",
  },
});
