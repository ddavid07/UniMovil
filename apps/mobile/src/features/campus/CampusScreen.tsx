import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, router } from 'expo-router';
import {
  Alert,
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { localPlacesRepository } from './data/repository';
import type { PlacesRepository } from './data/repository';
import {
  CATEGORY_LABELS,
  createSearchIndex,
  filterPlacesByCategories,
  normalizeSearchText,
  PLACE_CATEGORIES,
  searchPlaces,
  type Place,
  type PlaceCategory,
  type PlaceCoordinates,
  togglePlaceCategory,
} from './domain/places';
import {
  requestCurrentLocation,
  type LocationGateway,
  type LocationResult,
} from './domain/location';
import { CampusMap } from './map/CampusMap';
import { MapAttribution } from './components/MapAttribution';
import { PlaceCategoryFilters } from './components/PlaceCategoryFilters';
import { PlaceResults } from './components/PlaceResults';
import { PlaceSearch } from './components/PlaceSearch';
import { expoLocationGateway } from './data/expo-location-gateway';
import { colors } from '../../shared/theme';
import UcmLogo from '../../../assets/ucm-logo.jpg';
import { RoutePlanner } from './components/RoutePlanner';
import { NearbyPlaces } from './components/NearbyPlaces';
import { TransitPanel } from './components/TransitPanel';
import { MobilityResourcesPanel } from './components/MobilityResourcesPanel';
import {
  CAMPUS_TRANSIT,
  linesServingStop,
  transitStopAsPlace,
  type TransitLine,
  type TransitStop,
} from './domain/transit';
import type { RouteResult } from './domain/routing';
import type { PublicIncident } from '@unimovil/contracts';
import { API_BASE_URL } from '../account/api-config';

const TRANSIT_PLACES = CAMPUS_TRANSIT.stops.map(transitStopAsPlace);

function transitStopForPlaceId(placeId: string | null): TransitStop | undefined {
  if (!placeId) return undefined;
  const stopId = placeId.startsWith('emt-stop-')
    ? placeId.slice('emt-stop-'.length)
    : placeId;
  return CAMPUS_TRANSIT.stops.find((stop) => stop.id === stopId);
}

function servingTransitLine(
  stop: TransitStop,
  preferredLineId: string | null,
): TransitLine | undefined {
  const lines = linesServingStop(stop, CAMPUS_TRANSIT.lines);
  return lines.find((line) => line.id === preferredLineId) ?? lines[0];
}

interface CampusScreenProps {
  repository?: PlacesRepository;
  locationGateway?: LocationGateway;
}

export function CampusScreen({
  repository = localPlacesRepository,
  locationGateway = expoLocationGateway,
}: CampusScreenProps) {
  const [places, setPlaces] = useState<readonly Place[]>([]);
  const [publicIncidents, setPublicIncidents] = useState<readonly PublicIncident[]>([]);
  const [catalogState, setCatalogState] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [activeCategories, setActiveCategories] = useState<ReadonlySet<PlaceCategory>>(
    () => new Set(PLACE_CATEGORIES),
  );
  const [categoryAnnouncement, setCategoryAnnouncement] = useState('');
  const [currentLocation, setCurrentLocation] = useState<PlaceCoordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'loading' | LocationResult['status']
  >('idle');
  const [locationCanAskAgain, setLocationCanAskAgain] = useState(true);
  const [locationCenterRequest, setLocationCenterRequest] = useState(0);
  const [locationDisclosureOpen, setLocationDisclosureOpen] = useState(false);
  const [routeOriginId, setRouteOriginId] = useState<string | null>(null);
  const [routeDestinationId, setRouteDestinationId] = useState<string | null>(null);
  const [originUsesCurrentLocation, setOriginUsesCurrentLocation] = useState(false);
  const [mapSelectionTarget, setMapSelectionTarget] = useState<
    'origin' | 'destination' | null
  >(null);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [routeExpandRequest, setRouteExpandRequest] = useState(0);
  const [selectedTransitLineId, setSelectedTransitLineId] = useState<string | null>(
    null,
  );
  const [selectedTransitStopId, setSelectedTransitStopId] = useState<string | null>(
    null,
  );
  const locationRequestInProgress = useRef(false);
  const routeablePlaces = useMemo(() => {
    const placeIds = new Set(places.map((place) => place.id));
    return [...places, ...TRANSIT_PLACES.filter((place) => !placeIds.has(place.id))];
  }, [places]);
  const index = useMemo(() => createSearchIndex(routeablePlaces), [routeablePlaces]);
  const normalizedQuery = normalizeSearchText(query);
  const matchingPlaces = useMemo(() => {
    if (!query.trim()) return routeablePlaces;
    if (Array.from(normalizedQuery).length < 2) return [];
    return searchPlaces(index, query);
  }, [index, normalizedQuery, query, routeablePlaces]);
  const visiblePlaces = useMemo(
    () => filterPlacesByCategories(matchingPlaces, activeCategories),
    [activeCategories, matchingPlaces],
  );
  const mapPlaces = useMemo(
    () => filterPlacesByCategories(places, activeCategories),
    [activeCategories, places],
  );
  const selectedTransitLine = CAMPUS_TRANSIT.lines.find(
    (line) => line.id === selectedTransitLineId,
  );
  const selectedTransitStops = selectedTransitLine
    ? CAMPUS_TRANSIT.stops.filter((stop) =>
        selectedTransitLine.stopIds.includes(stop.id),
      )
    : [];
  const hasCategoryFilters = activeCategories.size < PLACE_CATEGORIES.length;

  useEffect(() => {
    let isCurrent = true;
    setCatalogState('loading');

    void repository
      .list()
      .then((catalog) => {
        if (!isCurrent) return;
        setPlaces(catalog);
        setCatalogState('ready');
      })
      .catch(() => {
        if (isCurrent) setCatalogState('error');
      });

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt, repository]);

  useEffect(() => {
    let isCurrent = true;
    void fetch(`${API_BASE_URL}/incidents`)
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error('Public feed unavailable')),
      )
      .then((result: { incidents: PublicIncident[] }) => {
        if (isCurrent) setPublicIncidents(result.incidents);
      })
      .catch(() => {
        if (isCurrent) setPublicIncidents([]);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  function clearSearch(): void {
    setQuery('');
    setSelectedId(null);
    setCategoryAnnouncement('');
    Keyboard.dismiss();
  }

  function selectPlace(place: Place): void {
    const categoryWasInactive = !activeCategories.has(place.category);

    if (categoryWasInactive) {
      setActiveCategories((current) => new Set(current).add(place.category));
      setCategoryAnnouncement(
        `Se ha activado la categoría ${CATEGORY_LABELS[place.category]} para mostrar ${place.name}.`,
      );
    } else {
      setCategoryAnnouncement('');
    }

    setSelectedId(place.id);
    const transitStop = transitStopForPlaceId(place.id);
    if (transitStop) {
      const servingLine = servingTransitLine(transitStop, selectedTransitLineId);
      setSelectedTransitStopId(transitStop.id);
      setSelectedTransitLineId(servingLine?.id ?? null);
    } else {
      setSelectedTransitStopId(null);
      setSelectedTransitLineId(null);
    }
    setQuery(place.name);
    setViewMode('map');
    Keyboard.dismiss();
  }

  function toggleCategory(category: PlaceCategory): void {
    setActiveCategories((current) => togglePlaceCategory(current, category));

    if (
      activeCategories.has(category) &&
      places.find((place) => place.id === selectedId)?.category === category
    ) {
      setSelectedId(null);
    }

    setCategoryAnnouncement('');
  }

  function resetCategories(): void {
    setActiveCategories(new Set(PLACE_CATEGORIES));
    setCategoryAnnouncement('');
  }

  async function locateCurrentPosition(): Promise<void> {
    if (locationRequestInProgress.current) return;

    locationRequestInProgress.current = true;
    setLocationStatus('loading');

    try {
      const result = await requestCurrentLocation(locationGateway);
      setLocationStatus(result.status);

      if (result.status === 'located') {
        setCurrentLocation(result.coordinates);
        setViewMode('map');
        setLocationCenterRequest((current) => current + 1);
      } else if (result.status === 'permission-denied') {
        setLocationCanAskAgain(result.canAskAgain);
      }
    } finally {
      locationRequestInProgress.current = false;
    }
  }

  function showLocationDisclosure(): void {
    if (currentLocation) {
      setViewMode('map');
      setLocationCenterRequest((current) => current + 1);
      return;
    }

    if (Platform.OS === 'web') {
      setLocationDisclosureOpen(true);
      return;
    }

    Alert.alert(
      'Usar tu ubicación',
      'UniMovil solicitará permiso para obtener una posición aproximada y centrar el mapa cuando lo pidas. La posición se conserva solo en memoria. Al mostrarla, el proveedor cartográfico recibe las teselas del área visible y puede inferir la zona consultada; la aplicación no envía directamente tus coordenadas.',
      [
        { text: 'Ahora no', style: 'cancel' },
        { text: 'Continuar', onPress: () => void locateCurrentPosition() },
      ],
      { cancelable: true },
    );
  }

  async function openLocationSettings(): Promise<void> {
    try {
      await locationGateway.openSettings();
      setLocationStatus('idle');
    } catch {
      setLocationStatus('error');
    }
  }

  function retryLocation(): void {
    if (locationStatus === 'permission-denied' && !locationCanAskAgain) {
      void openLocationSettings();
      return;
    }

    showLocationDisclosure();
  }

  function retryCatalog(): void {
    setLoadAttempt((current) => current + 1);
  }

  function selectMapPlace(placeId: string): void {
    const place = routeablePlaces.find((item) => item.id === placeId);
    if (!place) return;
    if (mapSelectionTarget === 'origin') {
      setRouteOriginId(place.id);
      setOriginUsesCurrentLocation(false);
      setMapSelectionTarget(null);
      setSelectedId(place.id);
      return;
    }
    if (mapSelectionTarget === 'destination') {
      setRouteDestinationId(place.id);
      setMapSelectionTarget(null);
      setSelectedId(place.id);
      return;
    }
    selectPlace(place);
  }

  function planRouteToPlace(place: Place): void {
    setRouteDestinationId(place.id);
    setSelectedId(place.id);
    const transitStop = transitStopForPlaceId(place.id);
    setSelectedTransitStopId(transitStop?.id ?? null);
    setViewMode('map');
    setRouteExpandRequest((current) => current + 1);
    setMapSelectionTarget(null);
    const servingLine = transitStop
      ? servingTransitLine(transitStop, selectedTransitLineId)
      : undefined;
    setSelectedTransitLineId(servingLine?.id ?? null);
  }

  function planRouteToStop(stop: TransitStop): void {
    planRouteToPlace(transitStopAsPlace(stop));
    setSelectedTransitStopId(stop.id);
  }

  function selectTransitStop(stop: TransitStop): void {
    setSelectedTransitStopId(stop.id);
    const servingLine = servingTransitLine(stop, selectedTransitLineId);
    setSelectedTransitLineId(servingLine?.id ?? selectedTransitLineId);
    const placeId = transitStopAsPlace(stop).id;
    setSelectedId(placeId);
    if (mapSelectionTarget) {
      if (mapSelectionTarget === 'origin') {
        setRouteOriginId(placeId);
        setOriginUsesCurrentLocation(false);
      } else {
        setRouteDestinationId(placeId);
      }
      setMapSelectionTarget(null);
    }
  }

  function handleRouteChange(result: RouteResult | null): void {
    setRouteResult(result);
    if (result?.status !== 'found') setSelectedStepIndex(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            accessibilityLabel="Marca de la Universidad Complutense de Madrid"
            accessible
            resizeMode="contain"
            source={UcmLogo}
            style={styles.logo}
          />
          <View style={styles.titleGroup}>
            <Text style={styles.eyebrow}>CAMPUS DE MONCLOA</Text>
            <Text accessibilityRole="header" style={styles.title}>
              UniMovil
            </Text>
            <Text style={styles.subtitle}>Explora la Complutense</Text>
          </View>
          <View style={styles.headerActions}>
            <Link href="/account" asChild>
              <Pressable accessibilityRole="button" style={styles.headerAction}>
                <Text style={styles.headerActionText}>Cuenta</Text>
              </Pressable>
            </Link>
            <Link href="/incidents" asChild>
              <Pressable accessibilityRole="button" style={styles.headerAction}>
                <Text style={styles.headerActionText}>Incidencias</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.introTitle}>Encuentra tu próximo destino</Text>
          <Text style={styles.introText}>
            Busca facultades, bibliotecas, paradas y otros lugares del campus.
          </Text>
        </View>

        {catalogState === 'ready' ? (
          <PlaceSearch
            onClear={clearSearch}
            onQueryChange={(value) => {
              setQuery(value);
              setSelectedId(null);
              setCategoryAnnouncement('');
            }}
            onSelect={selectPlace}
            places={routeablePlaces}
            query={query}
          />
        ) : (
          <View style={styles.searchPlaceholder}>
            {catalogState === 'loading' ? (
              <>
                <ActivityIndicator color={colors.universityRed} size="small" />
                <Text style={styles.statusText}>Cargando lugares…</Text>
              </>
            ) : (
              <View style={styles.catalogError}>
                <Text accessibilityRole="alert" style={styles.errorText}>
                  No se pudo cargar el catálogo de lugares.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={retryCatalog}
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.retryText}>Reintentar catálogo</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {catalogState === 'ready' && (
          <PlaceCategoryFilters
            activeCategories={activeCategories}
            onReset={resetCategories}
            onToggle={toggleCategory}
          />
        )}

        {categoryAnnouncement.length > 0 && (
          <Text
            accessibilityLiveRegion="polite"
            style={styles.categoryAnnouncement}
            testID="category-announcement"
          >
            {categoryAnnouncement}
          </Text>
        )}

        <RoutePlanner
          currentLocation={currentLocation}
          destinationId={routeDestinationId}
          expandRequest={routeExpandRequest}
          mapSelectionTarget={mapSelectionTarget}
          onDestinationChange={(placeId) => {
            setRouteDestinationId(placeId);
            const transitStop = transitStopForPlaceId(placeId);
            if (transitStop) {
              setSelectedTransitStopId(transitStop.id);
              setSelectedTransitLineId(
                servingTransitLine(transitStop, selectedTransitLineId)?.id ?? null,
              );
            }
          }}
          onOriginChange={(placeId) => {
            setRouteOriginId(placeId);
            setOriginUsesCurrentLocation(false);
          }}
          onSelectTransitLine={(lineId) => {
            setSelectedTransitLineId(lineId);
            setSelectedTransitStopId(null);
          }}
          onPickOnMap={setMapSelectionTarget}
          onRouteChange={handleRouteChange}
          onSelectStep={setSelectedStepIndex}
          onUseCurrentLocation={() => {
            setRouteOriginId(null);
            setOriginUsesCurrentLocation(true);
            showLocationDisclosure();
          }}
          originId={routeOriginId}
          originUsesCurrentLocation={originUsesCurrentLocation}
          places={routeablePlaces}
          selectedStepIndex={selectedStepIndex}
        />

        <NearbyPlaces
          currentLocation={currentLocation}
          onRequestLocation={showLocationDisclosure}
          onRouteToPlace={planRouteToPlace}
          onViewPlace={selectPlace}
          places={routeablePlaces}
        />

        <TransitPanel
          dataset={CAMPUS_TRANSIT}
          onRouteToStop={planRouteToStop}
          onSelectLine={(line: TransitLine) => {
            setSelectedTransitLineId(line.id);
            setSelectedTransitStopId(null);
            setViewMode('map');
          }}
          onSelectStop={selectTransitStop}
          selectedLineId={selectedTransitLineId}
          selectedStopId={selectedTransitStopId}
        />

        <MobilityResourcesPanel
          currentLocation={currentLocation}
          onRequestLocation={showLocationDisclosure}
          onRouteToPlace={planRouteToPlace}
          onViewPlace={selectPlace}
          places={routeablePlaces}
        />

        <View style={[styles.mapHeading, viewMode === 'list' && styles.listHeading]}>
          {viewMode === 'map' && (
            <View style={styles.mapHeadingCopy}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>
                Mapa del campus
              </Text>
            </View>
          )}
          <View style={styles.mapActions}>
            <Pressable
              accessibilityHint={
                currentLocation
                  ? 'Vuelve a centrar el mapa en la posición guardada en memoria.'
                  : 'Muestra información sobre el uso antes de solicitar permiso.'
              }
              accessibilityLabel={
                currentLocation
                  ? 'Centrar el mapa en tu ubicación'
                  : 'Mostrar mi ubicación aproximada'
              }
              accessibilityRole="button"
              accessibilityState={{ disabled: locationStatus === 'loading' }}
              disabled={locationStatus === 'loading'}
              onPress={showLocationDisclosure}
              style={({ pressed }) => [
                styles.locationButton,
                locationStatus === 'loading' && styles.disabled,
                pressed && styles.pressed,
              ]}
              testID="show-current-location"
            >
              <Text accessibilityElementsHidden style={styles.locationButtonIcon}>
                ◎
              </Text>
              <Text style={styles.locationButtonText}>Ubicación</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={
                viewMode === 'map'
                  ? 'Mostrar lista de lugares'
                  : 'Mostrar mapa del campus'
              }
              accessibilityRole="button"
              accessibilityState={{ disabled: catalogState !== 'ready' }}
              disabled={catalogState !== 'ready'}
              onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              style={({ pressed }) => [
                styles.viewToggle,
                catalogState !== 'ready' && styles.disabled,
                pressed && styles.pressed,
              ]}
              testID="toggle-map-list"
            >
              <Text style={styles.viewToggleText}>
                {viewMode === 'map' ? 'Lista' : 'Mapa'}
              </Text>
            </Pressable>
          </View>
        </View>

        {viewMode === 'map' && (
          <Text style={styles.sectionDescription}>
            Arrastra el mapa o utiliza los controles para orientarte.
          </Text>
        )}

        {locationStatus !== 'idle' && (
          <View style={styles.locationFeedback} testID="location-feedback">
            {locationStatus === 'loading' && (
              <ActivityIndicator color={colors.universityRed} size="small" />
            )}
            <Text
              accessibilityLiveRegion={
                locationStatus === 'loading' || locationStatus === 'located'
                  ? 'polite'
                  : 'assertive'
              }
              accessibilityRole={
                locationStatus === 'permission-denied' ||
                locationStatus === 'services-disabled' ||
                locationStatus === 'unavailable' ||
                locationStatus === 'error'
                  ? 'alert'
                  : undefined
              }
              style={styles.locationMessage}
            >
              {locationStatus === 'loading'
                ? 'Buscando una posición aproximada…'
                : locationStatus === 'located'
                  ? 'Se muestra tu ubicación aproximada en el mapa.'
                  : locationStatus === 'permission-denied'
                    ? locationCanAskAgain
                      ? 'No se concedió el permiso. Puedes seguir usando el mapa manualmente.'
                      : 'El permiso está bloqueado. Puedes activarlo en Ajustes.'
                    : locationStatus === 'services-disabled'
                      ? 'La ubicación del dispositivo está desactivada. El mapa manual sigue disponible.'
                      : locationStatus === 'unavailable'
                        ? 'No se obtuvo una posición ahora. Puedes volver a intentarlo.'
                        : 'No se pudo consultar la ubicación. Puedes volver a intentarlo.'}
            </Text>
            {locationStatus !== 'loading' && locationStatus !== 'located' && (
              <Pressable
                accessibilityRole="button"
                onPress={retryLocation}
                style={({ pressed }) => [
                  styles.locationRetry,
                  pressed && styles.pressed,
                ]}
                testID="retry-location"
              >
                <Text style={styles.locationRetryText}>
                  {locationStatus === 'permission-denied' && !locationCanAskAgain
                    ? 'Abrir Ajustes'
                    : 'Reintentar'}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {locationDisclosureOpen && (
          <View accessibilityRole="alert" style={styles.locationDisclosure}>
            <Text style={styles.locationDisclosureTitle}>Usar tu ubicación</Text>
            <Text style={styles.locationMessage}>
              UniMovil pedirá permiso para obtener una posición aproximada y centrar el
              mapa. La posición se conserva solo en memoria. El proveedor cartográfico
              recibe las teselas del área visible y puede inferir la zona consultada; la
              aplicación no envía directamente tus coordenadas.
            </Text>
            <View style={styles.disclosureActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setLocationDisclosureOpen(false)}
                style={styles.locationRetry}
              >
                <Text style={styles.locationRetryText}>Ahora no</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setLocationDisclosureOpen(false);
                  void locateCurrentPosition();
                }}
                style={styles.locationRetry}
              >
                <Text style={styles.locationRetryText}>Continuar</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.viewport}>
          {viewMode === 'map' ? (
            <>
              <CampusMap
                onSelect={(placeId) => {
                  selectMapPlace(placeId);
                }}
                currentLocation={currentLocation}
                locationCenterRequest={locationCenterRequest}
                onResetFilters={resetCategories}
                onSelectTransitStop={selectTransitStop}
                places={mapPlaces}
                selectedId={selectedId}
                selectedTransitLine={selectedTransitLine ?? null}
                transitStops={selectedTransitStops}
                incidents={publicIncidents}
                onSelectIncident={(publicId) =>
                  router.push(`/incidents?incidentId=${encodeURIComponent(publicId)}`)
                }
                route={routeResult?.status === 'found' ? routeResult.route : null}
                highlightedStepIndex={selectedStepIndex}
                showEmptyState={
                  catalogState === 'ready' &&
                  mapPlaces.length === 0 &&
                  selectedTransitStops.length === 0
                }
              />
              <MapAttribution />
            </>
          ) : (
            catalogState === 'ready' && (
              <ScrollView
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                style={styles.listViewport}
              >
                <PlaceResults
                  onClear={clearSearch}
                  onSelect={selectPlace}
                  onResetFilters={resetCategories}
                  places={visiblePlaces}
                  query={query}
                  selectedId={selectedId}
                  hasCategoryFilters={hasCategoryFilters}
                />
                <MapAttribution />
              </ScrollView>
            )
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flex: 1,
    gap: 9,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingBottom: 2,
  },
  logo: {
    width: 61,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  titleGroup: {
    flex: 1,
    gap: 1,
  },
  headerActions: { gap: 5 },
  headerAction: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  headerActionText: {
    color: colors.universityRedDark,
    fontSize: 11,
    fontWeight: '700',
  },
  eyebrow: {
    color: colors.universityRedDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.15,
  },
  title: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
  },
  intro: {
    gap: 4,
    paddingTop: 5,
  },
  introTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '700',
  },
  introText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  searchPlaceholder: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  statusText: {
    color: colors.muted,
    fontSize: 14,
  },
  catalogError: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: 13,
    lineHeight: 19,
  },
  retryButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F5E6EA',
  },
  retryText: {
    color: colors.universityRedDark,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  categoryAnnouncement: {
    color: colors.universityRedDark,
    fontSize: 12,
    lineHeight: 17,
  },
  mapHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 1,
  },
  listHeading: {
    justifyContent: 'flex-end',
  },
  mapActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapHeadingCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  locationButton: {
    minWidth: 82,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  locationButtonIcon: {
    color: colors.mapMarker,
    fontSize: 20,
    fontWeight: '700',
  },
  locationButtonText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  viewToggle: {
    minWidth: 60,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F2E3E7',
  },
  viewToggleText: {
    color: colors.universityRedDark,
    fontSize: 13,
    fontWeight: '700',
  },
  locationFeedback: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  locationMessage: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 17,
  },
  locationDisclosure: {
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  locationDisclosureTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  disclosureActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  locationRetry: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#F2E3E7',
  },
  locationRetryText: {
    color: colors.universityRedDark,
    fontSize: 12,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  viewport: {
    flex: 1,
    minHeight: 0,
  },
  listViewport: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
  },
});
