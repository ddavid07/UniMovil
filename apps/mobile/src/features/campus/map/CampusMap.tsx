import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
  TransformRequestManager,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import type { Feature, LineString, MultiLineString } from 'geojson';
import type { PlaceCoordinates } from '../domain/places';
import { CATEGORY_LABELS, CATEGORY_SYMBOLS, type Place } from '../domain/places';
import { CAMPUS_BOUNDARY, CAMPUS_VIEW_BOUNDS } from '../data/campus-boundary';
import { colors } from '../../../shared/theme';
import {
  CAMPUS_MAP_STYLE,
  OSM_TILE_HEADER_ID,
  OSM_TILE_URL_MATCH,
  OSM_TILE_USER_AGENT,
} from './map-style';
import type { WalkingRoute } from '../domain/routing';
import type { TransitLine, TransitStop } from '../domain/transit';
import type { PublicIncident } from '@unimovil/contracts';
import {
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_STATUS_LABELS,
} from '../../incidents/labels';

const MAP_LOAD_TIMEOUT_MS = 18_000;

interface CampusMapProps {
  places: readonly Place[];
  selectedId: string | null;
  onSelect: (placeId: string) => void;
  currentLocation?: PlaceCoordinates | null;
  locationCenterRequest?: number;
  showEmptyState?: boolean;
  onResetFilters?: () => void;
  route?: WalkingRoute | null;
  highlightedStepIndex?: number | null;
  selectedTransitLine?: TransitLine | null;
  transitStops?: readonly TransitStop[];
  onSelectTransitStop?: (stop: TransitStop) => void;
  incidents?: readonly PublicIncident[];
  onSelectIncident?: (publicId: string) => void;
}

export function CampusMap({
  places,
  selectedId,
  onSelect,
  currentLocation = null,
  locationCenterRequest = 0,
  showEmptyState = false,
  onResetFilters = () => undefined,
  route = null,
  highlightedStepIndex = null,
  selectedTransitLine = null,
  transitStops = [],
  onSelectTransitStop = () => undefined,
  incidents = [],
  onSelectIncident = () => undefined,
}: CampusMapProps) {
  const camera = useRef<CameraRef>(null);
  const zoom = useRef(14);
  const [mapResourcesReady, setMapResourcesReady] = useState(false);
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const selectedPlace = places.find((place) => place.id === selectedId);
  const selectedTransitStop = transitStops.find(
    (stop) => selectedId === `emt-stop-${stop.id}`,
  );
  const highlightedStep =
    highlightedStepIndex === null ? undefined : route?.steps[highlightedStepIndex];
  const routeFeature: Feature<LineString> | null = route
    ? {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates.map((point) => [
            point.longitude,
            point.latitude,
          ]),
        },
      }
    : null;
  const selectedStepFeature: Feature<LineString> | null = highlightedStep
    ? {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: highlightedStep.coordinates.map((point) => [
            point.longitude,
            point.latitude,
          ]),
        },
      }
    : null;
  const transitFeature: Feature<MultiLineString> | null = selectedTransitLine
    ? {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiLineString',
          coordinates: selectedTransitLine.patterns.flatMap((pattern) =>
            pattern.shapes.map((shape) => [...shape]),
          ) as [number, number][][],
        },
      }
    : null;

  useEffect(() => {
    TransformRequestManager.addHeader({
      id: OSM_TILE_HEADER_ID,
      name: 'User-Agent',
      value: OSM_TILE_USER_AGENT,
      match: OSM_TILE_URL_MATCH,
    });
    setMapResourcesReady(true);

    return () => TransformRequestManager.removeHeader(OSM_TILE_HEADER_ID);
  }, []);

  useEffect(() => {
    if (mapState !== 'loading') return undefined;

    const timeout = setTimeout(() => setMapState('error'), MAP_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [attempt, mapState]);

  useEffect(() => {
    if (!selectedId || mapState !== 'ready') return;
    const place = places.find((item) => item.id === selectedId);
    const stop = transitStops.find((item) => selectedId === `emt-stop-${item.id}`);
    const coordinates = place?.coordinates ?? stop?.coordinates;
    if (!coordinates) return;

    zoom.current = 16;
    camera.current?.easeTo({
      center: [coordinates.longitude, coordinates.latitude],
      zoom: 16,
      duration: 650,
    });
  }, [mapState, places, selectedId, transitStops]);

  useEffect(() => {
    if (!currentLocation || locationCenterRequest === 0 || mapState !== 'ready') {
      return;
    }

    zoom.current = 16;
    camera.current?.easeTo({
      center: [currentLocation.longitude, currentLocation.latitude],
      zoom: 16,
      duration: 650,
    });
  }, [currentLocation, locationCenterRequest, mapState]);

  function retryMap(): void {
    setMapState('loading');
    setAttempt((current) => current + 1);
  }

  function zoomBy(amount: number): void {
    zoom.current = Math.min(18.5, Math.max(12, zoom.current + amount));
    camera.current?.zoomTo(zoom.current, { duration: 250 });
  }

  function centerCampus(): void {
    zoom.current = 13.8;
    camera.current?.fitBounds(CAMPUS_VIEW_BOUNDS, {
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
      duration: 500,
    });
  }

  return (
    <View style={styles.container}>
      {mapResourcesReady && (
        <Map
          accessibilityLabel="Mapa interactivo del Campus de Moncloa. La lista de lugares ofrece una alternativa textual."
          accessibilityRole="image"
          attribution
          key={attempt}
          mapStyle={CAMPUS_MAP_STYLE}
          onDidFailLoadingMap={() => setMapState('error')}
          onDidFinishLoadingMap={() => setMapState('ready')}
          onDidFinishLoadingStyle={() => setMapState('ready')}
          style={styles.map}
          testID="campus-map"
        >
          <Camera
            ref={camera}
            initialViewState={{
              bounds: CAMPUS_VIEW_BOUNDS,
              padding: { top: 24, right: 24, bottom: 24, left: 24 },
            }}
            maxBounds={CAMPUS_VIEW_BOUNDS}
            maxZoom={18.5}
            minZoom={12}
          />
          <GeoJSONSource data={CAMPUS_BOUNDARY} id="campus-boundary">
            <Layer
              id="campus-boundary-fill"
              paint={{
                'fill-color': colors.universityRed,
                'fill-opacity': 0.1,
              }}
              type="fill"
            />
            <Layer
              id="campus-boundary-outline"
              paint={{
                'line-color': colors.universityRedDark,
                'line-opacity': 0.95,
                'line-width': 2,
              }}
              type="line"
            />
          </GeoJSONSource>
          {transitFeature && selectedTransitLine && (
            <GeoJSONSource data={transitFeature} id="transit-route">
              <Layer
                id="transit-route-line"
                paint={{
                  'line-color': selectedTransitLine.color,
                  'line-opacity': 0.8,
                  'line-width': 4,
                }}
                type="line"
              />
            </GeoJSONSource>
          )}
          {routeFeature && (
            <GeoJSONSource data={routeFeature} id="walking-route">
              <Layer
                id="walking-route-line"
                paint={{
                  'line-color': colors.universityRed,
                  'line-width': 5,
                  'line-opacity': 0.9,
                }}
                type="line"
              />
            </GeoJSONSource>
          )}
          {selectedStepFeature && (
            <GeoJSONSource data={selectedStepFeature} id="walking-route-step">
              <Layer
                id="walking-route-step-line"
                paint={{
                  'line-color': '#173D8F',
                  'line-width': 8,
                  'line-opacity': 0.95,
                }}
                type="line"
              />
            </GeoJSONSource>
          )}
          {places
            .filter((place) => place.id !== selectedId)
            .map((place) => (
              <Marker
                accessibilityLabel={`${place.name}, ${CATEGORY_LABELS[place.category]}, mostrar en el mapa`}
                accessibilityRole="button"
                anchor="center"
                id={`place-${place.id}`}
                key={place.id}
                lngLat={[place.coordinates.longitude, place.coordinates.latitude]}
                onPress={() => onSelect(place.id)}
                testID={`map-place-${place.id}`}
              >
                <View style={styles.placeMarker}>
                  <Text style={styles.placeMarkerSymbol}>
                    {CATEGORY_SYMBOLS[place.category]}
                  </Text>
                </View>
              </Marker>
            ))}
          {selectedPlace && (
            <Marker
              accessibilityLabel={`${selectedPlace.name}, ${CATEGORY_LABELS[selectedPlace.category]}, seleccionado`}
              accessibilityRole="button"
              anchor="bottom"
              id={`selected-${selectedPlace.id}`}
              lngLat={[
                selectedPlace.coordinates.longitude,
                selectedPlace.coordinates.latitude,
              ]}
              onPress={() => onSelect(selectedPlace.id)}
              testID="selected-place-marker"
            >
              <View style={styles.selectedAnnotation}>
                <View style={styles.selectedLabel}>
                  <Text numberOfLines={2} style={styles.selectedLabelText}>
                    {selectedPlace.name}
                  </Text>
                </View>
                <View style={styles.selectedDot}>
                  <Text style={styles.selectedSymbol}>
                    {CATEGORY_SYMBOLS[selectedPlace.category]}
                  </Text>
                </View>
              </View>
            </Marker>
          )}
          {transitStops.map((stop) => (
            <Marker
              accessibilityLabel={`${stop.name}, parada de autobús`}
              accessibilityRole="button"
              anchor="center"
              id={`transit-stop-${stop.id}`}
              key={stop.id}
              lngLat={[stop.coordinates.longitude, stop.coordinates.latitude]}
              onPress={() => onSelectTransitStop(stop)}
            >
              <View
                style={[
                  styles.transitMarker,
                  selectedTransitStop?.id === stop.id && styles.transitMarkerSelected,
                ]}
              >
                <Text style={styles.transitMarkerText}>B</Text>
              </View>
            </Marker>
          ))}
          {incidents.map((incident) => (
            <Marker
              accessibilityLabel={`Incidencia pública: ${INCIDENT_CATEGORY_LABELS[incident.category]}, ${INCIDENT_STATUS_LABELS[incident.status]}`}
              accessibilityRole="button"
              anchor="center"
              id={`incident-${incident.publicId}`}
              key={incident.publicId}
              lngLat={[incident.longitude, incident.latitude]}
              onPress={() => onSelectIncident(incident.publicId)}
            >
              <View style={styles.incidentMarker}>
                <Text style={styles.incidentMarkerText}>!</Text>
              </View>
            </Marker>
          ))}
          {currentLocation && (
            <Marker
              accessibilityLabel="Tu ubicación aproximada"
              accessibilityRole="image"
              anchor="bottom"
              id="current-location"
              lngLat={[currentLocation.longitude, currentLocation.latitude]}
              testID="current-location-marker"
            >
              <View style={styles.locationAnnotation}>
                <View style={styles.locationDot}>
                  <View style={styles.locationDotCenter} />
                </View>
                <Text style={styles.locationLabel}>Tu ubicación</Text>
              </View>
            </Marker>
          )}
        </Map>
      )}

      {mapState === 'loading' && (
        <View accessibilityLiveRegion="polite" style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.universityRed} size="small" />
          <Text style={styles.loadingText}>Cargando el mapa…</Text>
        </View>
      )}

      {mapState === 'error' && (
        <View style={styles.errorOverlay}>
          <Text accessibilityRole="alert" style={styles.errorTitle}>
            No se pudo cargar el mapa base.
          </Text>
          <Text style={styles.errorText}>
            Puedes seguir consultando todos los lugares en la lista.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={retryMap}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>Reintentar mapa</Text>
          </Pressable>
        </View>
      )}

      {showEmptyState && mapState !== 'error' && (
        <View style={styles.emptyPlaces}>
          <Text accessibilityRole="alert" style={styles.emptyPlacesText}>
            No hay lugares visibles con estas categorías.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onResetFilters}
            style={({ pressed }) => [
              styles.emptyResetButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.emptyResetText}>Restablecer categorías</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.controls}>
        <Pressable
          accessibilityLabel="Acercar mapa"
          accessibilityRole="button"
          onPress={() => zoomBy(1)}
          style={({ pressed }) => [styles.control, pressed && styles.pressed]}
          testID="zoom-in"
        >
          <Text style={styles.controlText}>+</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Alejar mapa"
          accessibilityRole="button"
          onPress={() => zoomBy(-1)}
          style={({ pressed }) => [styles.control, pressed && styles.pressed]}
          testID="zoom-out"
        >
          <Text style={styles.controlText}>−</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Centrar el mapa en el campus"
          accessibilityRole="button"
          onPress={centerCampus}
          style={({ pressed }) => [
            styles.control,
            styles.centerControl,
            pressed && styles.pressed,
          ]}
          testID="center-campus"
        >
          <Text style={styles.centerText}>Campus</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 160,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: '#E5E7E4',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  loadingText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  errorTitle: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    maxWidth: 260,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: colors.universityRed,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  controls: {
    position: 'absolute',
    top: 12,
    right: 12,
    alignItems: 'center',
    gap: 7,
  },
  control: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  centerControl: {
    width: 'auto',
    minWidth: 62,
    paddingHorizontal: 9,
  },
  controlText: {
    color: colors.ink,
    fontSize: 25,
    lineHeight: 30,
  },
  centerText: {
    color: colors.universityRedDark,
    fontSize: 12,
    fontWeight: '700',
  },
  selectedAnnotation: {
    alignItems: 'center',
    gap: 4,
  },
  selectedLabel: {
    maxWidth: 210,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.universityRed,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  selectedLabelText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedDot: {
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 9,
    backgroundColor: colors.universityRedDark,
  },
  selectedSymbol: {
    color: colors.surface,
    fontSize: 8,
    fontWeight: '800',
  },
  incidentMarker: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 15,
    backgroundColor: colors.error,
  },
  incidentMarkerText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  transitMarker: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 14,
    backgroundColor: '#1769AA',
  },
  transitMarkerSelected: {
    backgroundColor: colors.universityRedDark,
    transform: [{ scale: 1.2 }],
  },
  transitMarkerText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  placeMarker: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 10,
    backgroundColor: colors.universityRed,
  },
  placeMarkerSymbol: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: '800',
  },
  locationAnnotation: {
    alignItems: 'center',
    gap: 4,
  },
  locationDot: {
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    borderRadius: 15,
    backgroundColor: '#2878C8',
  },
  locationDotCenter: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.surface,
  },
  locationLabel: {
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 9,
    color: colors.ink,
    backgroundColor: colors.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyPlaces: {
    position: 'absolute',
    right: 72,
    bottom: 12,
    left: 12,
    alignItems: 'flex-start',
    gap: 4,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  emptyPlacesText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyResetButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  emptyResetText: {
    color: colors.universityRedDark,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
});
