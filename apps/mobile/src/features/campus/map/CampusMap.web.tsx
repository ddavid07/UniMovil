import { useEffect, useState, type ComponentType } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Place, PlaceCoordinates } from '../domain/places';
import type { WalkingRoute } from '../domain/routing';
import type { TransitLine, TransitStop } from '../domain/transit';
import type { PublicIncident } from '@unimovil/contracts';
import { colors } from '../../../shared/theme';

type EndpointSelection = (placeId: string) => void;

interface CampusMapProps {
  places: readonly Place[];
  selectedId: string | null;
  onSelect: EndpointSelection;
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

type CampusMapComponent = ComponentType<CampusMapProps>;

export function CampusMap(props: CampusMapProps) {
  const [MapComponent, setMapComponent] = useState<CampusMapComponent | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setFailed(false);

    void import('./LeafletCampusMap.web')
      .then(({ LeafletCampusMap }) => {
        if (isCurrent) setMapComponent(() => LeafletCampusMap);
      })
      .catch(() => {
        if (isCurrent) setFailed(true);
      });

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt]);

  if (MapComponent) return <MapComponent {...props} />;

  if (failed) {
    return (
      <View style={styles.fallback}>
        <Text accessibilityRole="alert" style={styles.message}>
          No se pudo inicializar el mapa. La lista de lugares sigue disponible.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMapComponent(null);
            setLoadAttempt((attempt) => attempt + 1);
          }}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Reintentar mapa</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View accessibilityLiveRegion="polite" style={styles.fallback}>
      <ActivityIndicator color={colors.universityRed} size="small" />
      <Text style={styles.message}>Preparando el mapa del campus…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#ECE8E1',
  },
  message: { color: colors.ink, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retryButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  retryText: { color: colors.universityRedDark, fontWeight: '700' },
});
