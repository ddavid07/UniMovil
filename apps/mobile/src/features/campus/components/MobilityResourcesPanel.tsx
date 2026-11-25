import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../shared/theme';
import {
  createSearchIndex,
  searchPlaces,
  type Place,
  type PlaceCoordinates,
} from '../domain/places';
import { listMobilityResources, type MobilityCategory } from '../domain/mobility';

const CATEGORIES: readonly { id: MobilityCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'access', label: 'Accesos' },
  { id: 'parking', label: 'Aparcamientos' },
  { id: 'bicycle', label: 'Bicicletas' },
  { id: 'service', label: 'Servicios' },
  { id: 'transport', label: 'Transporte' },
];

interface MobilityResourcesPanelProps {
  places: readonly Place[];
  currentLocation: PlaceCoordinates | null;
  onRequestLocation: () => void;
  onViewPlace: (place: Place) => void;
  onRouteToPlace: (place: Place) => void;
}

export function MobilityResourcesPanel({
  places,
  currentLocation,
  onRequestLocation,
  onViewPlace,
  onRouteToPlace,
}: MobilityResourcesPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState<MobilityCategory | 'all'>('all');
  const [origin, setOrigin] = useState<PlaceCoordinates | null>(null);
  const [originLabel, setOriginLabel] = useState('');
  const [originQuery, setOriginQuery] = useState('');
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(false);
  const searchIndex = useMemo(() => createSearchIndex(places), [places]);
  const suggestions = isSelectingOrigin
    ? searchPlaces(searchIndex, originQuery).slice(0, 5)
    : [];
  const resources = useMemo(
    () => listMobilityResources(places, origin, category),
    [category, origin, places],
  );

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.heading}
      >
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Accesibilidad y movilidad</Text>
          <Text style={styles.subtitle}>
            Fuentes, fecha y certeza de la información
          </Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.content}>
          <Text style={styles.explanation}>
            Los datos cartográficos ayudan a localizar lugares, pero no certifican
            accesos, horarios, plazas reservadas ni disponibilidad.
          </Text>
          <Text style={styles.label}>Origen para ordenar por cercanía</Text>
          <TextInput
            accessibilityLabel="Origen para buscar recursos cercanos"
            onChangeText={(value) => {
              setOriginQuery(value);
              setIsSelectingOrigin(true);
            }}
            onFocus={() => setIsSelectingOrigin(true)}
            placeholder="Busca un lugar del campus"
            style={styles.input}
            value={isSelectingOrigin ? originQuery : originLabel}
          />
          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map((place) => (
                <Pressable
                  accessibilityRole="button"
                  key={place.id}
                  onPress={() => {
                    setOrigin(place.coordinates);
                    setOriginLabel(place.name);
                    setOriginQuery(place.name);
                    setIsSelectingOrigin(false);
                  }}
                  style={styles.suggestion}
                >
                  <Text style={styles.suggestionText}>{place.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (!currentLocation) {
                  onRequestLocation();
                  return;
                }
                setOrigin(currentLocation);
                setOriginLabel('Mi ubicación aproximada');
                setOriginQuery('');
                setIsSelectingOrigin(false);
              }}
              style={styles.secondaryAction}
            >
              <Text style={styles.actionText}>
                {currentLocation ? 'Usar ubicación aproximada' : 'Elegir mi ubicación'}
              </Text>
            </Pressable>
            {origin && (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setOrigin(null);
                  setOriginLabel('');
                  setOriginQuery('');
                }}
                style={styles.secondaryAction}
              >
                <Text style={styles.actionText}>Quitar origen</Text>
              </Pressable>
            )}
          </View>
          {origin && (
            <Text style={styles.explanation}>
              La distancia mostrada es geográfica aproximada, no la distancia de una
              ruta.
            </Text>
          )}
          <View style={styles.categoryRow}>
            {CATEGORIES.map((item) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: category === item.id }}
                key={item.id}
                onPress={() => setCategory(item.id)}
                style={[
                  styles.categoryButton,
                  category === item.id && styles.categorySelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === item.id && styles.categoryTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {resources.length === 0 ? (
            <Text accessibilityRole="alert" style={styles.empty}>
              No hay lugares cartografiados en esta categoría.
            </Text>
          ) : (
            <View style={styles.resourceList}>
              {resources.slice(0, 12).map((resource) => (
                <View key={resource.place.id} style={styles.resource}>
                  <Text accessibilityRole="header" style={styles.resourceName}>
                    {resource.place.name}
                  </Text>
                  <Text style={styles.status}>
                    Accesibilidad: información desconocida · Operación: desconocida
                  </Text>
                  {resource.distanceMeters !== null && (
                    <Text style={styles.distance}>
                      Aproximadamente {Math.round(resource.distanceMeters)} m desde el
                      origen
                    </Text>
                  )}
                  <Text style={styles.explanation}>{resource.accessibility.scope}</Text>
                  <Pressable
                    accessibilityRole="link"
                    onPress={() =>
                      void Linking.openURL(resource.accessibility.sourceUrl)
                    }
                    style={styles.sourceLink}
                  >
                    <Text style={styles.sourceText}>
                      Fuente: OpenStreetMap · {resource.accessibility.license} ·
                      comprobado el {resource.accessibility.checkedAt}
                    </Text>
                  </Pressable>
                  <View style={styles.actions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => onViewPlace(resource.place)}
                      style={styles.secondaryAction}
                    >
                      <Text style={styles.actionText}>Ver en el mapa</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => onRouteToPlace(resource.place)}
                      style={styles.primaryAction}
                    >
                      <Text style={styles.primaryActionText}>Iniciar ruta</Text>
                    </Pressable>
                  </View>
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
    gap: 8,
    paddingHorizontal: 14,
  },
  headingCopy: { flex: 1, gap: 2 },
  title: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 11 },
  expandIcon: { color: colors.universityRedDark, fontSize: 24, fontWeight: '700' },
  content: { gap: 9, paddingHorizontal: 12, paddingBottom: 12 },
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
  suggestion: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 10 },
  suggestionText: { color: colors.ink, fontSize: 13 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  secondaryAction: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#F2E3E7',
  },
  primaryAction: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: colors.universityRedDark,
  },
  actionText: { color: colors.universityRedDark, fontSize: 11, fontWeight: '700' },
  primaryActionText: { color: colors.surface, fontSize: 11, fontWeight: '700' },
  explanation: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  categoryButton: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
  },
  categorySelected: { borderColor: colors.universityRed, backgroundColor: '#F2E3E7' },
  categoryText: { color: colors.muted, fontSize: 11 },
  categoryTextSelected: { color: colors.universityRedDark, fontWeight: '700' },
  resourceList: { gap: 8 },
  resource: { gap: 6, padding: 10, borderRadius: 12, backgroundColor: colors.canvas },
  resourceName: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  status: { color: colors.error, fontSize: 11, fontWeight: '700' },
  distance: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  sourceLink: { alignSelf: 'flex-start' },
  sourceText: {
    color: colors.universityRedDark,
    fontSize: 10,
    textDecorationLine: 'underline',
  },
  empty: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
