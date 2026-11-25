import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { divIcon, latLngBounds } from 'leaflet';
import type { FeatureCollection, Polygon } from 'geojson';
import type { PlaceCoordinates } from '../domain/places';
import { CATEGORY_LABELS, CATEGORY_SYMBOLS, type Place } from '../domain/places';
import { CAMPUS_BOUNDARY, CAMPUS_VIEW_BOUNDS } from '../data/campus-boundary';
import { colors } from '../../../shared/theme';
import { OSM_TILE_URL } from './map-style';
import type { WalkingRoute } from '../domain/routing';
import type { TransitLine, TransitStop } from '../domain/transit';
import type { PublicIncident } from '@unimovil/contracts';
import {
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_STATUS_LABELS,
} from '../../incidents/labels';

const CAMPUS_BOUNDS = latLngBounds(
  [CAMPUS_VIEW_BOUNDS[1], CAMPUS_VIEW_BOUNDS[0]],
  [CAMPUS_VIEW_BOUNDS[3], CAMPUS_VIEW_BOUNDS[2]],
);

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

interface MapCameraProps {
  selectedCoordinates?: PlaceCoordinates;
  currentLocation: PlaceCoordinates | null;
  locationCenterRequest: number;
}

function MapCamera({
  selectedCoordinates,
  currentLocation,
  locationCenterRequest,
}: MapCameraProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedCoordinates) {
      map.flyTo([selectedCoordinates.latitude, selectedCoordinates.longitude], 16, {
        duration: 0.65,
      });
    }
  }, [map, selectedCoordinates]);

  useEffect(() => {
    if (!currentLocation || locationCenterRequest === 0) return;
    map.flyTo([currentLocation.latitude, currentLocation.longitude], 16, {
      duration: 0.65,
    });
  }, [currentLocation, locationCenterRequest, map]);

  return null;
}

function MapReady({ onReady }: { onReady: () => void }) {
  useMapEvents({ load: onReady });
  return null;
}

function categoryIcon(category: Place['category']) {
  const symbol = CATEGORY_SYMBOLS[category];
  const html = `<span class="campus-marker" aria-hidden="true">${symbol}</span>`;
  return divIcon({
    className: 'campus-marker-icon',
    html,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function incidentIcon() {
  return divIcon({
    className: 'incident-marker-icon',
    html: '<span class="incident-marker" aria-hidden="true">!</span>',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export function LeafletCampusMap({
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
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [tileAttempt, setTileAttempt] = useState(0);
  const selectedPlace = places.find((place) => place.id === selectedId);
  const selectedTransitStop = transitStops.find(
    (stop) => selectedId === `emt-stop-${stop.id}`,
  );
  const selectedCoordinates =
    selectedPlace?.coordinates ?? selectedTransitStop?.coordinates;
  const step =
    highlightedStepIndex === null ? undefined : route?.steps[highlightedStepIndex];
  const outlineStyle = useMemo(
    () => ({
      color: colors.universityRedDark,
      weight: 2,
      fillColor: colors.universityRed,
      fillOpacity: 0.1,
    }),
    [],
  );

  useEffect(() => {
    if (mapState !== 'loading') return undefined;
    const timer = setTimeout(() => setMapState('error'), 18_000);
    return () => clearTimeout(timer);
  }, [mapState]);

  function retryMap(): void {
    setMapState('loading');
    setTileAttempt((attempt) => attempt + 1);
  }

  return (
    <View style={styles.container}>
      <MapContainer
        aria-label="Mapa interactivo del Campus de Moncloa. La lista de lugares ofrece una alternativa textual."
        bounds={CAMPUS_BOUNDS}
        boundsOptions={{ padding: [24, 24] }}
        className="campus-leaflet-map"
        maxBounds={CAMPUS_BOUNDS}
        maxZoom={18.5}
        minZoom={12}
        scrollWheelZoom
        whenReady={() => setMapState('ready')}
        zoomControl
      >
        <MapReady onReady={() => setMapState('ready')} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>'
          eventHandlers={{
            tileerror: () => setMapState('error'),
            tileload: () => setMapState('ready'),
          }}
          key={tileAttempt}
          maxZoom={19}
          url={OSM_TILE_URL}
        />
        <GeoJSON
          data={CAMPUS_BOUNDARY as FeatureCollection<Polygon>}
          style={outlineStyle}
        />
        {places.map((place) => (
          <Marker
            alt={`${place.name}, ${CATEGORY_LABELS[place.category]}`}
            eventHandlers={{ click: () => onSelect(place.id) }}
            icon={categoryIcon(place.category)}
            key={place.id}
            keyboard
            position={[place.coordinates.latitude, place.coordinates.longitude]}
            title={`${place.name}, ${CATEGORY_LABELS[place.category]}`}
          >
            {place.id === selectedId && (
              <Tooltip direction="top" permanent>
                {place.name}
              </Tooltip>
            )}
          </Marker>
        ))}
        {selectedTransitLine?.patterns.flatMap((pattern) =>
          pattern.shapes.map((shape, index) => (
            <Polyline
              key={`${selectedTransitLine.id}-${pattern.id}-shape-${index}`}
              positions={shape.map(([longitude, latitude]) => [latitude, longitude])}
              pathOptions={{
                color: selectedTransitLine.color,
                weight: 5,
                opacity: 0.85,
              }}
            />
          )),
        )}
        {transitStops.map((stop) => (
          <Marker
            alt={`${stop.name}, parada de autobús`}
            eventHandlers={{ click: () => onSelectTransitStop(stop) }}
            icon={divIcon({
              className: `transit-stop-icon${stop.id === selectedTransitStop?.id ? ' transit-stop-icon-selected' : ''}`,
              html: '<span class="transit-stop-marker" aria-hidden="true">B</span>',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            })}
            key={stop.id}
            keyboard
            position={[stop.coordinates.latitude, stop.coordinates.longitude]}
            title={`${stop.name}, parada de autobús`}
          >
            <Tooltip direction="top" permanent={stop.id === selectedTransitStop?.id}>
              {stop.name}
            </Tooltip>
          </Marker>
        ))}
        {incidents.map((incident) => (
          <Marker
            alt={`Incidencia pública: ${INCIDENT_CATEGORY_LABELS[incident.category]}, ${INCIDENT_STATUS_LABELS[incident.status]}`}
            eventHandlers={{ click: () => onSelectIncident(incident.publicId) }}
            icon={incidentIcon()}
            key={incident.publicId}
            keyboard
            position={[incident.latitude, incident.longitude]}
            title={`Incidencia pública: ${INCIDENT_CATEGORY_LABELS[incident.category]}, ${INCIDENT_STATUS_LABELS[incident.status]}`}
          >
            <Tooltip>
              {INCIDENT_CATEGORY_LABELS[incident.category]} ·{' '}
              {INCIDENT_STATUS_LABELS[incident.status]}
            </Tooltip>
          </Marker>
        ))}
        {currentLocation && (
          <CircleMarker
            center={[currentLocation.latitude, currentLocation.longitude]}
            pathOptions={{
              color: '#FFFFFF',
              fillColor: '#1769AA',
              fillOpacity: 1,
              weight: 3,
            }}
            radius={9}
          >
            <Tooltip direction="top">Tu ubicación aproximada</Tooltip>
          </CircleMarker>
        )}
        {route && (
          <Polyline
            positions={route.coordinates.map((point) => [
              point.latitude,
              point.longitude,
            ])}
            pathOptions={{ color: colors.universityRed, weight: 5, opacity: 0.85 }}
          />
        )}
        {step && (
          <Polyline
            positions={step.coordinates.map((point) => [
              point.latitude,
              point.longitude,
            ])}
            pathOptions={{ color: '#173D8F', weight: 8, opacity: 0.95 }}
          />
        )}
        <MapCamera
          currentLocation={currentLocation}
          locationCenterRequest={locationCenterRequest}
          selectedCoordinates={selectedCoordinates}
        />
      </MapContainer>

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
            Puedes seguir consultando los lugares en la lista textual.
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
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>Restablecer categorías</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 280, overflow: 'hidden', borderRadius: 18 },
  loadingOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  loadingText: { color: colors.muted, fontSize: 13 },
  errorOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    maxWidth: 320,
    gap: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  errorTitle: { color: colors.error, fontWeight: '700' },
  errorText: { color: colors.muted, lineHeight: 19 },
  retryButton: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 10 },
  retryText: { color: colors.universityRedDark, fontWeight: '700' },
  pressed: { opacity: 0.75 },
  emptyPlaces: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  emptyPlacesText: { color: colors.ink, flex: 1, fontSize: 13 },
});
