import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../shared/theme';
import {
  createSearchIndex,
  normalizeSearchText,
  searchPlaces,
  type Place,
  type PlaceCoordinates,
} from '../domain/places';
import {
  calculateWalkingRoute,
  formatRouteDistance,
  formatRouteDuration,
  type RouteResult,
} from '../domain/routing';
import { assessAccessibleRoute } from '../domain/mobility';
import { calculateTransitRoute, type TransitRoute } from '../domain/transit';

type Endpoint = 'origin' | 'destination';
type Preference = 'shortest' | 'fewest-transfers';
type RouteMode = 'walking' | 'transit' | 'bicycle';

interface RoutePlannerProps {
  places: readonly Place[];
  originId: string | null;
  destinationId: string | null;
  originUsesCurrentLocation: boolean;
  currentLocation: PlaceCoordinates | null;
  onOriginChange: (placeId: string | null) => void;
  onDestinationChange: (placeId: string | null) => void;
  onUseCurrentLocation: () => void;
  onPickOnMap: (endpoint: Endpoint) => void;
  mapSelectionTarget: Endpoint | null;
  onRouteChange: (result: RouteResult | null) => void;
  onSelectStep: (stepIndex: number | null) => void;
  onSelectTransitLine: (lineId: string | null) => void;
  selectedStepIndex: number | null;
  expandRequest: number;
  now?: Date;
}

const WALK_SPEED_METERS_PER_SECOND = 1.2;

export function RoutePlanner({
  places,
  originId,
  destinationId,
  originUsesCurrentLocation,
  currentLocation,
  onOriginChange,
  onDestinationChange,
  onUseCurrentLocation,
  onPickOnMap,
  mapSelectionTarget,
  onRouteChange,
  onSelectStep,
  onSelectTransitLine,
  selectedStepIndex,
  expandRequest,
  now,
}: RoutePlannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [activeEndpoint, setActiveEndpoint] = useState<Endpoint | null>(null);
  const [preference, setPreference] = useState<Preference>('shortest');
  const [selectedMode, setSelectedMode] = useState<RouteMode>('walking');
  const [avoidStairs, setAvoidStairs] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const searchIndex = useMemo(() => createSearchIndex(places), [places]);
  const origin = places.find((place) => place.id === originId);
  const destination = places.find((place) => place.id === destinationId);
  const originCoordinates = originUsesCurrentLocation
    ? currentLocation
    : origin?.coordinates;
  const result = useMemo(() => {
    if (!originCoordinates || !destination) return null;
    return calculateWalkingRoute(
      originCoordinates,
      destination.coordinates,
      undefined,
      100,
      {
        avoidStairs,
      },
    );
  }, [avoidStairs, destination, originCoordinates]);
  const accessibleRouteAssessment = assessAccessibleRoute(
    result?.status === 'found' ? result.route : null,
    [],
  );
  const transitRoute = useMemo(() => {
    if (!originCoordinates || !destination) return null;
    return calculateTransitRoute(
      originCoordinates,
      destination.coordinates,
      now ?? clock,
    );
  }, [clock, destination, now, originCoordinates]);

  useEffect(() => {
    if (now || !expanded) return undefined;
    const interval = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(interval);
  }, [expanded, now]);

  useEffect(() => {
    onRouteChange(result);
  }, [onRouteChange, result]);

  useEffect(() => {
    if (expandRequest > 0) setExpanded(true);
  }, [expandRequest]);

  useEffect(() => {
    setOriginQuery(
      originUsesCurrentLocation ? 'Mi ubicación actual' : (origin?.name ?? ''),
    );
  }, [origin?.name, originUsesCurrentLocation]);

  useEffect(() => {
    setDestinationQuery(destination?.name ?? '');
  }, [destination?.name]);

  function suggestionsFor(query: string): readonly Place[] {
    if (Array.from(normalizeSearchText(query)).length < 2) return [];
    return searchPlaces(searchIndex, query).slice(0, 5);
  }

  function setEndpoint(endpoint: Endpoint, place: Place): void {
    setSelectedMode('walking');
    onSelectTransitLine(null);
    if (endpoint === 'origin') {
      onOriginChange(place.id);
      setOriginQuery(place.name);
    } else {
      onDestinationChange(place.id);
      setDestinationQuery(place.name);
    }
    setActiveEndpoint(null);
    onSelectStep(null);
  }

  function renderEndpoint(endpoint: Endpoint): React.ReactNode {
    const isOrigin = endpoint === 'origin';
    const query = isOrigin ? originQuery : destinationQuery;
    const selectedName = isOrigin
      ? originUsesCurrentLocation
        ? 'Mi ubicación actual'
        : origin?.name
      : destination?.name;
    const suggestions = activeEndpoint === endpoint ? suggestionsFor(query) : [];

    return (
      <View style={styles.endpoint} key={endpoint}>
        <Text style={styles.endpointLabel}>{isOrigin ? 'Origen' : 'Destino'}</Text>
        <TextInput
          accessibilityLabel={isOrigin ? 'Origen de la ruta' : 'Destino de la ruta'}
          onChangeText={(value) => {
            setSelectedMode('walking');
            onSelectTransitLine(null);
            if (isOrigin) {
              onOriginChange(null);
              setOriginQuery(value);
            } else {
              onDestinationChange(null);
              setDestinationQuery(value);
            }
            setActiveEndpoint(endpoint);
          }}
          onFocus={() => setActiveEndpoint(endpoint)}
          placeholder="Busca un lugar del campus"
          returnKeyType="search"
          style={styles.input}
          value={activeEndpoint === endpoint ? query : (selectedName ?? query)}
        />
        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((place) => (
              <Pressable
                accessibilityRole="button"
                key={place.id}
                onPress={() => setEndpoint(endpoint, place)}
                style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}
              >
                <Text style={styles.suggestionText}>{place.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.endpointActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setExpanded(true);
              onPickOnMap(endpoint);
              setActiveEndpoint(null);
            }}
            style={({ pressed }) => [styles.smallAction, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>Elegir en el mapa</Text>
          </Pressable>
          {isOrigin && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onUseCurrentLocation();
                setActiveEndpoint(null);
              }}
              style={({ pressed }) => [styles.smallAction, pressed && styles.pressed]}
            >
              <Text style={styles.actionText}>Mi ubicación</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.heading}
      >
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Planificar ruta</Text>
          <Text style={styles.subtitle}>A pie por caminos cartografiados</Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.content}>
          {renderEndpoint('origin')}
          {renderEndpoint('destination')}
          {mapSelectionTarget && (
            <Text accessibilityLiveRegion="polite" style={styles.mapHint}>
              Toca un lugar del mapa para establecer el{' '}
              {mapSelectionTarget === 'origin' ? 'origen' : 'destino'}.
            </Text>
          )}
          <Text style={styles.modeHeading}>Alternativas disponibles</Text>
          <View style={styles.modeRow}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedMode === 'walking' }}
              onPress={() => {
                setSelectedMode('walking');
                onSelectTransitLine(null);
              }}
              style={[
                styles.modeCard,
                selectedMode === 'walking' && styles.modeSelected,
              ]}
            >
              <Text style={styles.modeTitle}>A pie</Text>
              <Text style={styles.modeDetail}>
                {result?.status === 'found'
                  ? `${formatRouteDistance(result.route.distanceMeters)} · ${formatRouteDuration(result.route.durationMinutes)}`
                  : originCoordinates && destination
                    ? 'No hay camino verificado para estos puntos'
                    : 'Selecciona origen y destino'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{
                selected: selectedMode === 'transit',
                disabled: !transitRoute,
              }}
              disabled={!transitRoute}
              onPress={() => {
                if (!transitRoute) return;
                setSelectedMode('transit');
                onSelectTransitLine(transitRoute.lineId);
              }}
              style={[
                styles.modeCard,
                selectedMode === 'transit' && styles.modeSelected,
              ]}
            >
              <Text style={styles.modeTitle}>Autobús</Text>
              <Text style={styles.modeDetail}>
                {transitRoute
                  ? `${formatRouteDuration(transitRoute.durationMinutes)} · ${transitRoute.lineReference}`
                  : originCoordinates && destination
                    ? 'Sin combinación verificada en el horario'
                    : 'Selecciona origen y destino'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{
                selected: selectedMode === 'bicycle',
                disabled: true,
              }}
              disabled
              style={styles.modeCard}
            >
              <Text style={styles.modeTitle}>Bicicleta</Text>
              <Text style={styles.modeDetail}>Sin red de rutas verificada</Text>
            </Pressable>
          </View>
          <Text style={styles.modeHeading}>Preferencia</Text>
          <View style={styles.preferenceRow}>
            <PreferenceButton
              label="Menos distancia"
              selected={preference === 'shortest'}
              onPress={() => {
                setPreference('shortest');
                const transitIsShorter =
                  transitRoute !== null &&
                  (result?.status !== 'found' ||
                    transitRoute.totalDistanceMeters < result.route.distanceMeters);
                setSelectedMode(transitIsShorter ? 'transit' : 'walking');
                onSelectTransitLine(transitIsShorter ? transitRoute.lineId : null);
              }}
            />
            <PreferenceButton
              label="Menos transbordos"
              selected={preference === 'fewest-transfers'}
              onPress={() => {
                setPreference('fewest-transfers');
                setSelectedMode('walking');
                onSelectTransitLine(null);
              }}
            />
          </View>
          {preference === 'fewest-transfers' && (
            <Text style={styles.explanation}>
              La alternativa de autobús usa un único servicio directo sin transbordos;
              no se combinan líneas en este incremento.
            </Text>
          )}
          <Text style={styles.modeHeading}>
            Preferencias de accesibilidad de esta sesión
          </Text>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: avoidStairs }}
            onPress={() => setAvoidStairs((value) => !value)}
            style={styles.accessibilityPreference}
            testID="avoid-stairs-preference"
          >
            <Text style={styles.accessibilityCheckbox}>{avoidStairs ? '✓' : '□'}</Text>
            <Text style={styles.explanation}>
              Evitar tramos cartografiados como escaleras
            </Text>
          </Pressable>
          <Text style={styles.explanation}>
            {accessibleRouteAssessment.status === 'available'
              ? 'La red contiene evidencia verificada para los tramos de esta ruta.'
              : 'No hay datos verificados suficientes para ofrecer una ruta en silla de ruedas. La ruta a pie no implica que sea accesible.'}
          </Text>
          {selectedMode === 'transit' && transitRoute && (
            <TransitRouteDetails route={transitRoute} />
          )}
          {originUsesCurrentLocation && !currentLocation && (
            <Text accessibilityRole="alert" style={styles.resultMessage}>
              Autoriza el acceso a tu ubicación para calcular esta ruta.
            </Text>
          )}
          {result?.status === 'found' && (
            <View style={styles.resultCard}>
              <Text accessibilityRole="header" style={styles.resultTitle}>
                Ruta a pie estimada
              </Text>
              <Text style={styles.resultSummary}>
                {formatRouteDistance(result.route.distanceMeters)} ·{' '}
                {formatRouteDuration(result.route.durationMinutes)}
              </Text>
              <Text style={styles.explanation}>
                Duración calculada con una velocidad peatonal media de{' '}
                {WALK_SPEED_METERS_PER_SECOND} m/s. El trazado empieza y termina en el
                nodo cartográfico más cercano; las conexiones hasta el acceso real
                pueden variar.
              </Text>
              <Text style={styles.explanation}>
                Red de OpenStreetMap comprobada el {result.route.sourceCheckedAt}. La
                cartografía no confirma accesibilidad, horarios ni que todos los accesos
                estén abiertos.
              </Text>
              <ScrollView style={styles.steps}>
                {result.route.steps.map((step, index) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedStepIndex === index }}
                    key={`${index}-${step.instruction}`}
                    onPress={() => onSelectStep(index)}
                    style={({ pressed }) => [
                      styles.step,
                      selectedStepIndex === index && styles.selectedStep,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    <View style={styles.stepCopy}>
                      <Text style={styles.stepText}>{step.instruction}</Text>
                      <Text style={styles.stepDistance}>
                        {formatRouteDistance(step.distanceMeters)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          {result?.status === 'outside-network' && (
            <Text accessibilityRole="alert" style={styles.resultMessage}>
              No hay camino cartografiado a menos de 100 m de uno de los extremos.
              Prueba otro acceso o lugar.
            </Text>
          )}
          {result?.status === 'no-connection' && (
            <Text accessibilityRole="alert" style={styles.resultMessage}>
              La red cartografiada no conecta estos puntos. No se ha dibujado una línea
              recta como si fuera una ruta.
            </Text>
          )}
          {originId && destinationId && originId === destinationId && (
            <Text accessibilityRole="alert" style={styles.resultMessage}>
              El origen y el destino son el mismo lugar.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function TransitRouteDetails({ route }: { route: TransitRoute }) {
  return (
    <View accessibilityLabel="Detalles de la ruta en autobús" style={styles.resultCard}>
      <Text accessibilityRole="header" style={styles.resultTitle}>
        Autobús {route.lineReference} · {route.headsign}
      </Text>
      <Text style={styles.resultSummary}>
        {formatRouteDistance(route.totalDistanceMeters)} ·{' '}
        {formatRouteDuration(route.durationMinutes)} · {route.transfers} transbordos
      </Text>
      <Text style={styles.explanation}>
        Camina {formatRouteDistance(route.walkingToStopDistanceMeters)} hasta{' '}
        {route.originStop.name}; salida programada {route.departureTime}.
      </Text>
      <Text style={styles.explanation}>
        Baja en {route.destinationStop.name}; después camina{' '}
        {formatRouteDistance(route.walkingFromStopDistanceMeters)} hasta el destino.
        Llegada programada a la parada {route.arrivalTime}.
      </Text>
      <Text style={styles.explanation}>
        Duración total estimada: {route.durationMinutes} min (espera {route.waitMinutes}{' '}
        min y viaje en autobús {route.rideMinutes} min, además de los tramos a pie).
        Horario estático comprobado el {route.sourceCheckedAt}; puede no reflejar
        cambios operativos.
      </Text>
    </View>
  );
}

function PreferenceButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.preference, selected && styles.preferenceSelected]}
    >
      <Text style={[styles.preferenceText, selected && styles.preferenceTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  headingCopy: { flex: 1, gap: 2 },
  title: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 11 },
  expandIcon: { color: colors.universityRedDark, fontSize: 24, fontWeight: '700' },
  content: { gap: 10, paddingHorizontal: 12, paddingBottom: 12 },
  endpoint: { gap: 4 },
  endpointLabel: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: colors.ink,
    backgroundColor: colors.canvas,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  suggestion: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
  },
  suggestionText: { color: colors.ink, fontSize: 13 },
  endpointActions: { flexDirection: 'row', gap: 8 },
  smallAction: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#F2E3E7',
  },
  actionText: { color: colors.universityRedDark, fontSize: 11, fontWeight: '700' },
  mapHint: { color: colors.universityRedDark, fontSize: 12, fontWeight: '700' },
  modeHeading: { marginTop: 2, color: colors.ink, fontSize: 12, fontWeight: '800' },
  modeRow: { flexDirection: 'row', gap: 6 },
  modeCard: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.canvas,
  },
  modeSelected: { borderColor: colors.universityRed, backgroundColor: '#FFF8F9' },
  modeTitle: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  modeDetail: { color: colors.muted, fontSize: 10, lineHeight: 14 },
  preferenceRow: { flexDirection: 'row', gap: 8 },
  accessibilityPreference: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: colors.canvas,
  },
  accessibilityCheckbox: {
    color: colors.universityRedDark,
    fontSize: 18,
    fontWeight: '800',
  },
  preference: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  preferenceSelected: { borderColor: colors.universityRed, backgroundColor: '#F2E3E7' },
  preferenceText: { color: colors.muted, fontSize: 11 },
  preferenceTextSelected: { color: colors.universityRedDark, fontWeight: '700' },
  explanation: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  resultCard: { gap: 7, padding: 10, borderRadius: 12, backgroundColor: colors.canvas },
  resultTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  resultSummary: { color: colors.universityRedDark, fontSize: 14, fontWeight: '800' },
  steps: { maxHeight: 180 },
  step: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 7,
    borderRadius: 9,
  },
  selectedStep: { backgroundColor: '#E7EDF9' },
  stepNumber: {
    width: 24,
    height: 24,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    color: colors.surface,
    backgroundColor: colors.universityRedDark,
    fontSize: 12,
    fontWeight: '800',
  },
  stepCopy: { flex: 1, gap: 2 },
  stepText: { color: colors.ink, fontSize: 12 },
  stepDistance: { color: colors.muted, fontSize: 10 },
  resultMessage: { color: colors.error, fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.72 },
});
