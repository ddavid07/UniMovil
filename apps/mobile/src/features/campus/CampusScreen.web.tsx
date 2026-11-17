import { useState, useMemo, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { PlacesRepository } from "./data/repository";
import {
  PLACE_CATEGORIES,
  type Place,
  type PlaceCategory,
  type TransitStop,
} from "@unimovil/contracts";
import type { RoutingRepository } from "../routing/data/repository";
import { useCampus } from "./useCampus";
import { useRouting } from "../routing/useRouting";
import { useNetworkStatus } from "../offline/useNetworkStatus";
import { ExplorerControls } from "./components/ExplorerControls";
import { Action } from "./components/Action";
import { SearchSuggestions } from "./components/SearchSuggestions";
import { RouteSelector } from "../routing/components/RouteSelector";
import { formatDistance, formatDuration } from "../routing/domain/routing";
import { CampusInteractiveSection } from "./components/CampusInteractiveSection";
import { CampusMap } from "./map/CampusMap";
import { mapMode } from "./map/map-style";
import { CampusDialogs } from "./components/CampusDialogs";
import { RouteSheet } from "../routing/components/RouteSheet";
import { TransitStopSheet } from "../transit/components/TransitStopSheet";
import { IncidentSheet } from "../incidents/components/IncidentSheet";
import { NetworkBanner } from "../offline/components/NetworkBanner";
import { ReportIncidentScreen } from "../incidents/components/ReportIncidentScreen";
import {
  IncidentStore,
  MONCLOA_CAMPUS_SEED_INCIDENTS,
  type Incident,
} from "../incidents/domain/incidents";

interface Props {
  readonly repository?: PlacesRepository;
  readonly routingRepository?: RoutingRepository;
  readonly isOffline?: boolean;
}

const CATEGORY_META: Record<
  PlaceCategory,
  { label: string; icon: string }
> = {
  building: { label: "Edificios", icon: "🏛️" },
  transport: { label: "Transporte", icon: "🚌" },
  parking: { label: "Aparcamientos", icon: "🅿️" },
  bicycle: { label: "Bicicletas", icon: "🚲" },
  service: { label: "Servicios", icon: "ℹ️" },
  entrance: { label: "Accesos", icon: "🚪" },
};

function createStopPlace(stop: TransitStop): Place {
  return {
    id: stop.id,
    name: stop.name,
    category: "transport",
    coordinates: stop.coordinates,
    aliases: [stop.code],
    accessibility: stop.wheelchairAccessible ? "yes" : "unknown",
    source: {
      url: "https://www.emtmadrid.es",
      checkedAt: "2026-11-15",
      license: "ODbL-1.0",
    },
  };
}

function toggleRouting(routing: ReturnType<typeof useRouting>): void {
  if (routing.isRoutingOpen) routing.closeRouting();
  else routing.openRouting();
}

export function CampusScreen({
  repository,
  routingRepository,
  isOffline,
}: Props) {
  // Default to full web layout, with option to toggle mobile preview
  const [viewMode, setViewMode] = useState<"web" | "mobile">("web");
  const [routePlannerOpen, setRoutePlannerOpen] = useState(true);

  const campus = useCampus(repository);
  const routing = useRouting(routingRepository);
  const network = useNetworkStatus(isOffline);

  const [listOpen, setListOpen] = useState(false);
  const [showTransit, setShowTransit] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedTransitStop, setSelectedTransitStop] =
    useState<TransitStop | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );
  const [incidentStore] = useState(
    () => new IncidentStore(MONCLOA_CAMPUS_SEED_INCIDENTS),
  );
  const [incidents, setIncidents] = useState(incidentStore.getAll());

  // Route Sheet Modal Visibility state
  const [routeSheetOpen, setRouteSheetOpen] = useState(false);
  const prevRouteIdRef = useRef<string | null>(null);

  // Automatically show the Route Sheet popup when a new route is calculated
  useEffect(() => {
    if (routing.route && routing.route.id !== prevRouteIdRef.current) {
      prevRouteIdRef.current = routing.route.id;
      setRouteSheetOpen(true);
    } else if (!routing.route) {
      prevRouteIdRef.current = null;
      setRouteSheetOpen(false);
    }
  }, [routing.route]);

  // Count places per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of PLACE_CATEGORIES) {
      counts[cat] = campus.places.filter((p) => p.category === cat).length;
    }
    return counts;
  }, [campus.places]);

  function select(id: string) {
    setListOpen(false);
    campus.select(id);
  }

  function handleReportSubmit(
    input: Parameters<IncidentStore["submitIncident"]>[0],
  ) {
    const result = incidentStore.submitIncident(input);
    if (result.success) setIncidents(incidentStore.getAll());
    setReportOpen(false);
  }

  return (
    <View style={styles.webPageRoot}>
      {/* 1. TOP HEADER / APP BAR */}
      <header style={webHeaderStyle}>
        <View style={styles.headerLeft}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>UCM</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>UniMovil</Text>
            <Text style={styles.brandSubtitle}>
              Campus de Moncloa · Universidad Complutense de Madrid
            </Text>
          </View>
        </View>

        {/* View Mode Switcher (Web vs Mobile Preview) */}
        <View style={styles.headerCenter}>
          <View style={styles.switcherGroup}>
            <Pressable
              style={[
                styles.switchBtn,
                viewMode === "web" && styles.switchBtnActive,
              ]}
              onPress={() => setViewMode("web")}
            >
              <Text
                style={[
                  styles.switchBtnText,
                  viewMode === "web" && styles.switchBtnTextActive,
                ]}
              >
                💻 Vista Web
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.switchBtn,
                viewMode === "mobile" && styles.switchBtnActive,
              ]}
              onPress={() => setViewMode("mobile")}
            >
              <Text
                style={[
                  styles.switchBtnText,
                  viewMode === "mobile" && styles.switchBtnTextActive,
                ]}
              >
                📱 Vista Móvil
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Quick link to Admin App */}
        <View style={styles.headerRight}>
          <Pressable
            style={styles.adminLink}
            onPress={() => {
              window.open("http://localhost:5173", "_blank");
            }}
          >
            <Text style={styles.adminLinkText}>⚙️ Panel de Gestión Web ↗</Text>
          </Pressable>
        </View>
      </header>

      {/* 2. BODY: EITHER FULL WEB LAYOUT OR SMARTPHONE MOCKUP PREVIEW */}
      {viewMode === "mobile" ? (
        /* MOBILE PHONE SIMULATOR VIEW (WITH FULLY VISIBLE MAP) */
        <View style={styles.mobileBackdrop}>
          <View style={styles.phoneDeviceShell}>
            {/* Phone speaker notch */}
            <View style={styles.phoneNotch}>
              <View style={styles.phoneSpeaker} />
            </View>

            {/* Mobile Scrollable Screen Container */}
            <ScrollView
              style={styles.mobileScreenContainer}
              contentContainerStyle={styles.mobileScreenContent}
              showsVerticalScrollIndicator={false}
            >
              <Text accessibilityRole="header" style={styles.mobileAppTitle}>
                UniMovil · Moncloa
              </Text>
              <NetworkBanner
                isOffline={network.isOffline}
                onRetry={() => {
                  void network.retryConnection();
                }}
              />
              <ExplorerControls
                query={campus.query}
                categories={campus.categories}
                onQuery={campus.setQuery}
                onToggle={campus.toggleCategory}
                onReset={campus.reset}
              />
              <CampusInteractiveSection
                campus={campus}
                routing={routing}
                select={select}
                showTransit={showTransit}
                showIncidents={showIncidents}
                selectedTransitStop={selectedTransitStop}
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
                onSelectTransitStop={(stop) => setSelectedTransitStop(stop)}
                onOpenList={() => setListOpen(true)}
                onToggleRouting={() => toggleRouting(routing)}
                onToggleTransit={() => setShowTransit((prev) => !prev)}
                onToggleIncidents={() => setShowIncidents((prev) => !prev)}
                onReportIncident={() => setReportOpen(true)}
              />
              <Text style={styles.mobileAttribution}>
                Datos de lugares © colaboradores de OpenStreetMap · ODbL
              </Text>
            </ScrollView>
          </View>
        </View>
      ) : (
        /* FULL DESKTOP WEB APPLICATION LAYOUT */
        <View style={styles.mainLayout}>
          {/* LEFT SIDEBAR */}
          <aside style={webSidebarStyle}>
            {/* 1. Search Box with Icon */}
            <View style={styles.searchSection}>
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  accessibilityLabel="Buscar lugares"
                  placeholder="Buscar edificio, facultad, alias..."
                  placeholderTextColor="#94a3b8"
                  value={campus.query}
                  onChangeText={campus.setQuery}
                  style={styles.webSearchInput}
                  autoCorrect={false}
                />
                {campus.query.length > 0 && (
                  <Pressable onPress={() => campus.setQuery("")}>
                    <Text style={styles.clearSearchBtn}>✕</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* 2. Checkbox Category Filters (Clean 2-Column Grid) */}
            <View style={styles.filterSection}>
              <View style={styles.filterHeaderRow}>
                <Text style={styles.filterSectionTitle}>CATEGORÍAS</Text>
                <Pressable onPress={campus.reset} style={styles.resetBtn}>
                  <Text style={styles.resetBtnText}>Restablecer</Text>
                </Pressable>
              </View>

              <View style={styles.checkboxGrid}>
                {PLACE_CATEGORIES.map((category) => {
                  const meta = CATEGORY_META[category];
                  const isChecked = campus.categories.includes(category);
                  const count = categoryCounts[category] ?? 0;

                  return (
                    <Pressable
                      key={category}
                      style={[
                        styles.checkboxCard,
                        isChecked && styles.checkboxCardChecked,
                      ]}
                      onPress={() => campus.toggleCategory(category)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isChecked }}
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          isChecked && styles.checkboxBoxChecked,
                        ]}
                      >
                        {isChecked && (
                          <Text style={styles.checkboxCheckmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.categoryIcon}>{meta.icon}</Text>
                      <View style={styles.categoryTextCol}>
                        <Text
                          style={[
                            styles.categoryLabel,
                            isChecked && styles.categoryLabelChecked,
                          ]}
                          numberOfLines={1}
                        >
                          {meta.label}
                        </Text>
                        <Text style={styles.categoryCount}>({count})</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. Action Toolbar */}
            <View style={styles.actionToolbar}>
              <Action
                label={
                  routePlannerOpen
                    ? "🧭 Ocultar planificador"
                    : "🧭 Planificar ruta"
                }
                onPress={() => setRoutePlannerOpen((prev) => !prev)}
                selected={routePlannerOpen}
              />
              <Action
                label={showTransit ? "🚌 EMT" : "🚌 Sin EMT"}
                onPress={() => setShowTransit((prev) => !prev)}
                selected={showTransit}
              />
              <Action
                label={showIncidents ? "⚠️ Avisos" : "⚠️ Sin avisos"}
                onPress={() => setShowIncidents((prev) => !prev)}
                selected={showIncidents}
              />
              <Action label="➕ Reportar" onPress={() => setReportOpen(true)} />
            </View>

            {/* Catalog Loading State */}
            {campus.catalog.status === "loading" && (
              <View style={styles.catalogStatus}>
                <ActivityIndicator color="#8e1235" />
                <Text style={styles.catalogStatusText}>
                  Cargando catálogo del campus…
                </Text>
              </View>
            )}

            {/* 4. Scrollable Dynamic Content Area */}
            <ScrollView
              style={styles.sidebarContent}
              contentContainerStyle={styles.sidebarScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {/* If user is typing search query */}
              {campus.query.trim().length > 0 && (
                <View style={styles.sidebarCard}>
                  <Text style={styles.cardTitle}>Sugerencias de búsqueda:</Text>
                  <SearchSuggestions
                    places={campus.visible}
                    onSelect={select}
                  />
                </View>
              )}

              {/* A. PLANIFICADOR DE RUTA (Placed directly below filters & toolbar) */}
              {routePlannerOpen && (
                <View style={styles.routeCardContainer}>
                  <RouteSelector
                    places={campus.places}
                    origin={routing.origin}
                    destination={routing.destination}
                    accessibleOnly={routing.accessibleOnly}
                    loading={routing.loading}
                    error={routing.error}
                    onSelectOrigin={routing.setOrigin}
                    onSelectDestination={routing.setDestination}
                    onSwap={routing.swap}
                    onTogglePmr={routing.setAccessibleOnly}
                    onCalculate={() => {
                      void routing.calculate();
                    }}
                    onClose={() => setRoutePlannerOpen(false)}
                  />
                </View>
              )}

              {/* Active Route Status Card in Sidebar */}
              {routing.route && (
                <View style={styles.activeRouteCard}>
                  <View style={styles.activeRouteHeaderRow}>
                    <View style={styles.activeRouteBadgeRow}>
                      <Text style={styles.activeRouteIcon}>🗺️</Text>
                      <Text style={styles.activeRouteTitle}>
                        Ruta activa {routing.route.accessible ? "(♿ Accesible PMR)" : "(🚶 Estándar)"}
                      </Text>
                    </View>
                    <Pressable
                      onPress={routing.clearRoute}
                      accessibilityRole="button"
                      accessibilityLabel="Cancelar ruta activa"
                    >
                      <Text style={styles.activeRouteCancelText}>✕ Borrar</Text>
                    </Pressable>
                  </View>
                  <View style={styles.activeRouteMetrics}>
                    <Text style={styles.activeRouteMetricsText}>
                      ⏱️ {formatDuration(routing.route.estimatedDurationMinutes)} · 📏 {formatDistance(routing.route.totalDistanceMeters)}
                    </Text>
                    <Text style={styles.activeRouteSub}>
                      {routing.route.accessible
                        ? "Itinerario accesible sin desniveles ni escaleras"
                        : "Itinerario peatonal estándar"}
                    </Text>
                  </View>
                  <View style={styles.activeRouteActions}>
                    <Pressable
                      style={styles.activeRouteViewBtn}
                      onPress={() => setRouteSheetOpen(true)}
                      accessibilityRole="button"
                      accessibilityLabel="Ver itinerario paso a paso"
                    >
                      <Text style={styles.activeRouteViewBtnText}>
                        📋 Ver itinerario paso a paso
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* B. SELECTED PLACE DETAILS (Compact view with quick routing actions) */}
              {campus.selected && (
                <View style={styles.selectedPlaceCardCompact}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.selectedPlaceTitle}>
                      📍 {campus.selected.name}
                    </Text>
                    <Pressable onPress={() => campus.select("")}>
                      <Text style={styles.closeCardText}>✕</Text>
                    </Pressable>
                  </View>
                  <View style={styles.placeTagsRow}>
                    <View style={styles.badgePill}>
                      <Text style={styles.badgePillText}>
                        {campus.selected.category}
                      </Text>
                    </View>
                    {campus.selected.accessibility === "yes" && (
                      <View style={styles.badgePillGreen}>
                        <Text style={styles.badgePillTextGreen}>
                          ♿ Adaptado
                        </Text>
                      </View>
                    )}
                  </View>
                  {campus.selected.aliases.length > 0 && (
                    <Text style={styles.placeMetaTextCompact}>
                      Alias: {campus.selected.aliases.join(", ")}
                    </Text>
                  )}
                  <View style={styles.placeRouteQuickActions}>
                    <Pressable
                      style={styles.quickOriginBtn}
                      onPress={() => {
                        setRoutePlannerOpen(true);
                        routing.setOrigin(campus.selected);
                      }}
                    >
                      <Text style={styles.quickOriginText}>
                        🚩 Salir de aquí
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickDestBtn}
                      onPress={() => {
                        setRoutePlannerOpen(true);
                        routing.setDestination(campus.selected);
                      }}
                    >
                      <Text style={styles.quickDestText}>
                        🏁 Ir hacia aquí
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* C. LUGARES COINCIDENTES (Smaller, compact format placed below route planner) */}
              <View style={styles.compactPlacesContainer}>
                <View style={styles.compactHeaderRow}>
                  <Text style={styles.compactPlacesHeader}>
                    LUGARES COINCIDENTES ({campus.visible.length})
                  </Text>
                  {campus.selected && (
                    <Pressable onPress={() => campus.select("")}>
                      <Text style={styles.clearSelectionText}>Deseleccionar</Text>
                    </Pressable>
                  )}
                </View>

                {campus.visible.length === 0 ? (
                  <Text style={styles.emptyTextCompact}>
                    No hay lugares para estos filtros.
                  </Text>
                ) : (
                  <View style={styles.compactList}>
                    {campus.visible.map((place) => {
                      const isSelected = campus.selected?.id === place.id;
                      const icon = CATEGORY_META[place.category]?.icon ?? "📍";

                      return (
                        <Pressable
                          key={place.id}
                          style={[
                            styles.compactPlaceItem,
                            isSelected && styles.compactPlaceItemSelected,
                          ]}
                          onPress={() => select(place.id)}
                        >
                          <Text style={styles.compactPlaceIcon}>{icon}</Text>
                          <View style={styles.compactPlaceInfo}>
                            <Text
                              style={[
                                styles.compactPlaceName,
                                isSelected && styles.compactPlaceNameSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {place.name}
                            </Text>
                            <Text
                              style={styles.compactPlaceSub}
                              numberOfLines={1}
                            >
                              {CATEGORY_META[place.category]?.label ??
                                place.category}
                              {place.accessibility === "yes"
                                ? " · ♿ Adaptado"
                                : ""}
                            </Text>
                          </View>
                          <Text style={styles.compactChevron}>›</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Sidebar Footer */}
            <View style={styles.sidebarFooter}>
              <Text style={styles.footerAttribution}>
                Datos de lugares © colaboradores de OpenStreetMap · ODbL
              </Text>
            </View>
          </aside>

          {/* RIGHT MAP PANE (FULL WIDTH / FULL HEIGHT) */}
          <main style={webMapMainStyle}>
            <CampusMap
              allPlaces={campus.places}
              places={campus.visible}
              selected={campus.selected}
              onSelect={select}
              mode={mapMode(process.env.EXPO_PUBLIC_MAP_MODE)}
              route={routing.route}
              showTransit={showTransit}
              showIncidents={showIncidents}
              selectedTransitStop={selectedTransitStop}
              onSelectTransitStop={(stop) => setSelectedTransitStop(stop)}
              incidents={incidents}
              onSelectIncident={setSelectedIncident}
              onOpenRouteDetails={() => setRouteSheetOpen(true)}
              onClearRoute={routing.clearRoute}
            />
          </main>
        </View>
      )}

      {/* MODALS */}
      <CampusDialogs
        campus={campus}
        listOpen={listOpen}
        onCloseList={() => setListOpen(false)}
        onSelect={select}
        onPlanRoute={(place) => routing.openRouting(place)}
      />
      <RouteSheet
        route={routeSheetOpen ? routing.route : null}
        onClose={routing.clearRoute}
        onAccept={() => setRouteSheetOpen(false)}
      />
      <TransitStopSheet
        stop={selectedTransitStop}
        onClose={() => setSelectedTransitStop(null)}
        onPlanRouteToStop={(stop) =>
          routing.openRouting(createStopPlace(stop))
        }
      />
      <IncidentSheet
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />

      {reportOpen && (
        <ReportIncidentScreen
          onSubmit={handleReportSubmit}
          onClose={() => setReportOpen(false)}
        />
      )}
    </View>
  );
}

// Inline styles for HTML semantic tags on web
const webHeaderStyle: React.CSSProperties = {
  height: "56px",
  backgroundColor: "#8e1235", // UCM Complutense red
  color: "#ffffff",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingLeft: "20px",
  paddingRight: "20px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
  zIndex: 10,
  flexShrink: 0,
};

const webSidebarStyle: React.CSSProperties = {
  width: "420px",
  height: "100%",
  backgroundColor: "#ffffff",
  borderRight: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  zIndex: 5,
  flexShrink: 0,
  boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
};

const webMapMainStyle: React.CSSProperties = {
  flex: 1,
  height: "100%",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const styles = StyleSheet.create({
  webPageRoot: {
    flex: 1,
    height: "100vh" as unknown as number,
    width: "100vw" as unknown as number,
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandBadge: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  brandBadgeText: {
    color: "#8e1235",
    fontWeight: "800",
    fontSize: 13,
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  brandSubtitle: {
    color: "#fecdd3",
    fontSize: 11,
  },
  headerCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  switcherGroup: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    padding: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  switchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  switchBtnActive: {
    backgroundColor: "#ffffff",
  },
  switchBtnText: {
    color: "#fecdd3",
    fontSize: 13,
    fontWeight: "600",
  },
  switchBtnTextActive: {
    color: "#8e1235",
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adminLink: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  adminLinkText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  mainLayout: {
    flex: 1,
    flexDirection: "row",
    height: "calc(100vh - 56px)" as unknown as number,
    overflow: "hidden",
  },
  searchSection: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  webSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#1e293b",
  },
  clearSearchBtn: {
    fontSize: 14,
    color: "#94a3b8",
    padding: 4,
  },

  /* CATEGORY CHECKBOX SECTION */
  filterSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  filterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  resetBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resetBtnText: {
    fontSize: 11,
    color: "#8e1235",
    fontWeight: "600",
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  checkboxCard: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  checkboxCardChecked: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: "#8e1235",
    borderColor: "#8e1235",
  },
  checkboxCheckmark: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 12,
  },
  categoryIcon: {
    fontSize: 13,
  },
  categoryTextCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  categoryLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  categoryLabelChecked: {
    color: "#8e1235",
    fontWeight: "700",
  },
  categoryCount: {
    fontSize: 11,
    color: "#94a3b8",
  },

  actionToolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  catalogStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  catalogStatusText: {
    fontSize: 13,
    color: "#64748b",
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarScrollContent: {
    padding: 12,
    gap: 10,
  },
  sidebarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  closeCardText: {
    fontSize: 14,
    color: "#64748b",
    padding: 2,
  },

  /* ROUTE PLANNER CONTAINER */
  routeCardContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },

  /* ACTIVE ROUTE SIDEBAR CARD */
  activeRouteCard: {
    backgroundColor: "#fdf2f4",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#fecdd3",
    gap: 8,
  },
  activeRouteHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeRouteBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  activeRouteIcon: {
    fontSize: 14,
  },
  activeRouteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8e1235",
  },
  activeRouteCancelText: {
    fontSize: 12,
    color: "#9f1239",
    fontWeight: "600",
  },
  activeRouteMetrics: {
    gap: 2,
  },
  activeRouteMetricsText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  activeRouteSub: {
    fontSize: 11,
    color: "#64748b",
  },
  activeRouteActions: {
    marginTop: 4,
  },
  activeRouteViewBtn: {
    backgroundColor: "#8e1235",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  activeRouteViewBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },

  /* SELECTED PLACE CARD COMPACT */
  selectedPlaceCardCompact: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    gap: 5,
  },
  selectedPlaceTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e3a8a",
    flex: 1,
  },
  placeTagsRow: {
    flexDirection: "row",
    gap: 6,
  },
  badgePill: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1d4ed8",
    textTransform: "capitalize",
  },
  badgePillGreen: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePillTextGreen: {
    fontSize: 10,
    fontWeight: "600",
    color: "#15803d",
  },
  placeMetaTextCompact: {
    fontSize: 11,
    color: "#3b82f6",
  },
  placeRouteQuickActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  quickOriginBtn: {
    flex: 1,
    backgroundColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  quickOriginText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 11,
  },
  quickDestBtn: {
    flex: 1,
    backgroundColor: "#1d4ed8",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  quickDestText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 11,
  },

  /* COMPACT PLACES LIST (BELOW ROUTE PLANNER) */
  compactPlacesContainer: {
    gap: 4,
    marginTop: 4,
  },
  compactHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  compactPlacesHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  clearSelectionText: {
    fontSize: 10,
    color: "#8e1235",
    fontWeight: "600",
  },
  emptyTextCompact: {
    fontSize: 11,
    color: "#94a3b8",
    paddingVertical: 6,
  },
  compactList: {
    gap: 3,
  },
  compactPlaceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 8,
  },
  compactPlaceItemSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  compactPlaceIcon: {
    fontSize: 13,
  },
  compactPlaceInfo: {
    flex: 1,
    gap: 1,
  },
  compactPlaceName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  compactPlaceNameSelected: {
    color: "#1d4ed8",
  },
  compactPlaceSub: {
    fontSize: 10,
    color: "#64748b",
  },
  compactChevron: {
    fontSize: 13,
    color: "#cbd5e1",
    fontWeight: "700",
  },

  sidebarFooter: {
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  footerAttribution: {
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "center",
  },

  /* MOBILE PHONE PREVIEW STYLES */
  mobileBackdrop: {
    flex: 1,
    height: "calc(100vh - 56px)" as unknown as number,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  phoneDeviceShell: {
    width: "100%",
    maxWidth: 440,
    height: "100%",
    maxHeight: 880,
    backgroundColor: "#f5f6f8",
    borderRadius: 36,
    borderWidth: 8,
    borderColor: "#1e293b",
    overflow: "hidden",
  },
  phoneNotch: {
    height: 20,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneSpeaker: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#334155",
  },
  mobileScreenContainer: {
    flex: 1,
  },
  mobileScreenContent: {
    padding: 12,
    gap: 8,
  },
  mobileAppTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#18212b",
  },
  mobileAttribution: {
    fontSize: 12,
    color: "#414b57",
    marginVertical: 4,
  },
});
