import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../shared/theme';
import {
  CATEGORY_LABELS,
  createSearchIndex,
  PLACE_CATEGORIES,
  searchPlaces,
  type Place,
  type PlaceCategory,
  type PlaceCoordinates,
} from '../domain/places';
import { findNearbyPlaces, formatEstimatedDistance } from '../domain/nearby';

interface NearbyPlacesProps {
  places: readonly Place[];
  currentLocation: PlaceCoordinates | null;
  onRequestLocation: () => void;
  onViewPlace: (place: Place) => void;
  onRouteToPlace: (place: Place) => void;
}

export function NearbyPlaces({
  places,
  currentLocation,
  onRequestLocation,
  onViewPlace,
  onRouteToPlace,
}: NearbyPlacesProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [category, setCategory] = useState<PlaceCategory>('service');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const index = useMemo(() => createSearchIndex(places), [places]);
  const reference = useCurrentLocation
    ? currentLocation
    : (places.find((place) => place.id === referenceId)?.coordinates ?? null);
  const suggestions =
    showSuggestions && query.trim().length >= 2
      ? searchPlaces(index, query).slice(0, 4)
      : [];
  const results = useMemo(() => {
    if (!reference) return [];
    return findNearbyPlaces(
      places.filter((place) => place.category === category),
      reference,
    ).slice(0, 6);
  }, [category, places, reference]);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.heading}
      >
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Servicios y lugares cercanos</Text>
          <Text style={styles.subtitle}>Distancia en línea recta aproximada</Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.content}>
          <Text style={styles.label}>Ubicación de referencia</Text>
          <TextInput
            accessibilityLabel="Lugar de referencia para buscar cercanos"
            onChangeText={(value) => {
              setQuery(value);
              setReferenceId(null);
              setUseCurrentLocation(false);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Busca un lugar del campus"
            style={styles.input}
            value={useCurrentLocation ? 'Mi ubicación actual' : query}
          />
          {suggestions.length > 0 && !useCurrentLocation && (
            <View style={styles.suggestions}>
              {suggestions.map((place) => (
                <Pressable
                  accessibilityRole="button"
                  key={place.id}
                  onPress={() => {
                    setReferenceId(place.id);
                    setQuery(place.name);
                    setShowSuggestions(false);
                  }}
                  style={({ pressed }) => [
                    styles.suggestion,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.suggestionText}>{place.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setUseCurrentLocation(true);
              setReferenceId(null);
              setQuery('Mi ubicación actual');
              onRequestLocation();
            }}
            style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>Usar mi ubicación</Text>
          </Pressable>
          {useCurrentLocation && !currentLocation && (
            <Text style={styles.notice}>
              Se solicitará permiso si aún no lo has concedido.
            </Text>
          )}
          <Text style={styles.label}>Categoría</Text>
          <ScrollView
            horizontal
            contentContainerStyle={styles.categories}
            showsHorizontalScrollIndicator={false}
          >
            {PLACE_CATEGORIES.map((candidate) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: candidate === category }}
                key={candidate}
                onPress={() => setCategory(candidate)}
                style={[
                  styles.category,
                  candidate === category && styles.categorySelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    candidate === category && styles.categoryTextSelected,
                  ]}
                >
                  {CATEGORY_LABELS[candidate]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          {!reference ? (
            <Text style={styles.notice}>
              Elige un lugar o usa tu ubicación para ver resultados.
            </Text>
          ) : results.length === 0 ? (
            <Text style={styles.notice}>
              No hay lugares de esta categoría en el catálogo.
            </Text>
          ) : (
            <View style={styles.results}>
              {results.map(({ place, distanceMeters }) => (
                <View key={place.id} style={styles.result}>
                  <View style={styles.resultCopy}>
                    <Text style={styles.resultName}>{place.name}</Text>
                    <Text style={styles.distance}>
                      {formatEstimatedDistance(distanceMeters)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`Mostrar ${place.name} en el mapa`}
                    accessibilityRole="button"
                    onPress={() => onViewPlace(place)}
                    style={styles.resultAction}
                  >
                    <Text style={styles.actionText}>Mapa</Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Crear una ruta a ${place.name}`}
                    accessibilityRole="button"
                    onPress={() => onRouteToPlace(place)}
                    style={styles.resultAction}
                  >
                    <Text style={styles.actionText}>Ruta</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
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
  content: { gap: 8, paddingHorizontal: 12, paddingBottom: 12 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700' },
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
  suggestion: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 10 },
  suggestionText: { color: colors.ink, fontSize: 12 },
  locationButton: {
    minHeight: 38,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#F2E3E7',
  },
  actionText: { color: colors.universityRedDark, fontSize: 11, fontWeight: '700' },
  categories: { gap: 6, paddingVertical: 2 },
  category: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
  },
  categorySelected: { borderColor: colors.universityRed, backgroundColor: '#F2E3E7' },
  categoryText: { color: colors.muted, fontSize: 10 },
  categoryTextSelected: { color: colors.universityRedDark, fontWeight: '700' },
  results: { gap: 4 },
  result: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  resultCopy: { flex: 1, gap: 2 },
  resultName: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  distance: { color: colors.muted, fontSize: 10 },
  resultAction: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.canvas,
  },
  notice: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  pressed: { opacity: 0.72 },
});
