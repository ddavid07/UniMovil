import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CATEGORY_LABELS,
  MIN_QUERY_LENGTH,
  normalizeSearchText,
  type Place,
} from '../domain/places';
import { colors } from '../../../shared/theme';

interface PlaceResultsProps {
  places: readonly Place[];
  query: string;
  selectedId: string | null;
  hasCategoryFilters?: boolean;
  onSelect: (place: Place) => void;
  onClear: () => void;
  onResetFilters?: () => void;
}

export function PlaceResults({
  places,
  query,
  selectedId,
  hasCategoryFilters = false,
  onSelect,
  onClear,
  onResetFilters,
}: PlaceResultsProps) {
  const isSearching = query.trim().length > 0;
  const hasSearchTerm =
    Array.from(normalizeSearchText(query)).length >= MIN_QUERY_LENGTH;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text accessibilityRole="header" style={styles.heading}>
            {isSearching ? 'Resultados' : 'Lugares del campus'}
          </Text>
          <Text style={styles.description}>
            {isSearching && !hasSearchTerm
              ? 'Escribe al menos dos caracteres para buscar.'
              : isSearching
                ? `${places.length} ${places.length === 1 ? 'coincidencia' : 'coincidencias'}`
                : 'Consulta los lugares también en esta lista.'}
          </Text>
        </View>
        <Text style={styles.count}>{places.length}</Text>
      </View>

      {places.length === 0 && isSearching && !hasSearchTerm ? (
        <View style={styles.emptyState}>
          <Text style={styles.description}>
            Añade otro carácter para mostrar sugerencias.
          </Text>
        </View>
      ) : places.length === 0 && hasCategoryFilters ? (
        <View style={styles.emptyState}>
          <Text accessibilityRole="alert" style={styles.emptyTitle}>
            {isSearching
              ? 'No hay coincidencias en las categorías activas.'
              : 'No hay lugares en las categorías activas.'}
          </Text>
          <Text style={styles.description}>
            Activa otra categoría o restablece los filtros.
          </Text>
          {onResetFilters && (
            <Pressable
              accessibilityRole="button"
              onPress={onResetFilters}
              style={({ pressed }) => [styles.clearAction, pressed && styles.pressed]}
            >
              <Text style={styles.clearActionText}>Restablecer categorías</Text>
            </Pressable>
          )}
          {isSearching && (
            <Pressable
              accessibilityRole="button"
              onPress={onClear}
              style={({ pressed }) => [styles.clearAction, pressed && styles.pressed]}
            >
              <Text style={styles.clearActionText}>Borrar búsqueda</Text>
            </Pressable>
          )}
        </View>
      ) : places.length === 0 ? (
        <View style={styles.emptyState}>
          {isSearching ? (
            <>
              <Text accessibilityRole="alert" style={styles.emptyTitle}>
                No hay coincidencias para “{query}”.
              </Text>
              <Text style={styles.description}>
                Cambia la búsqueda para encontrar otro lugar.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={onClear}
                style={({ pressed }) => [styles.clearAction, pressed && styles.pressed]}
              >
                <Text style={styles.clearActionText}>Borrar búsqueda</Text>
              </Pressable>
            </>
          ) : (
            <Text accessibilityRole="alert" style={styles.emptyTitle}>
              No hay lugares disponibles.
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.list}>
          {places.map((place) => {
            const selected = selectedId === place.id;

            return (
              <Pressable
                accessibilityLabel={`${place.name}, ${CATEGORY_LABELS[place.category]}, ${selected ? 'seleccionado' : 'mostrar en el mapa'}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={place.id}
                onPress={() => onSelect(place)}
                style={({ pressed }) => [
                  styles.row,
                  selected && styles.selectedRow,
                  pressed && styles.pressed,
                ]}
                testID={`place-result-${place.id}`}
              >
                <View style={[styles.marker, selected && styles.selectedMarker]}>
                  <Text style={styles.markerText}>
                    {place.name.charAt(0).toLocaleUpperCase('es')}
                  </Text>
                </View>
                <View style={styles.rowCopy}>
                  <Text numberOfLines={1} style={styles.placeName}>
                    {place.name}
                  </Text>
                  <Text style={styles.category}>{CATEGORY_LABELS[place.category]}</Text>
                </View>
                <Text accessibilityElementsHidden style={styles.arrow}>
                  ›
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingCopy: {
    gap: 3,
  },
  heading: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  count: {
    minWidth: 34,
    height: 34,
    overflow: 'hidden',
    borderRadius: 17,
    color: colors.universityRed,
    backgroundColor: '#F5E6EA',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 34,
  },
  list: {
    gap: 8,
  },
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  selectedRow: {
    borderColor: colors.universityRed,
    backgroundColor: '#FFF7F8',
  },
  pressed: {
    opacity: 0.78,
  },
  marker: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#E9EEF1',
  },
  selectedMarker: {
    backgroundColor: colors.universityRed,
  },
  markerText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  placeName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  category: {
    color: colors.muted,
    fontSize: 12,
  },
  arrow: {
    marginLeft: 4,
    color: colors.universityRed,
    fontSize: 24,
  },
  emptyState: {
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  clearAction: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  clearActionText: {
    color: colors.universityRedDark,
    fontSize: 14,
    fontWeight: '700',
  },
});
