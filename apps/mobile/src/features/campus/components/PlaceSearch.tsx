import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  CATEGORY_LABELS,
  createSearchIndex,
  MIN_QUERY_LENGTH,
  normalizeSearchText,
  searchPlaces,
  type Place,
} from '../domain/places';
import { colors } from '../../../shared/theme';

interface PlaceSearchProps {
  places: readonly Place[];
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (place: Place) => void;
  onClear: () => void;
}

export function PlaceSearch({
  places,
  query,
  onQueryChange,
  onSelect,
  onClear,
}: PlaceSearchProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchIndex = useMemo(() => createSearchIndex(places), [places]);
  const normalizedQuery = normalizeSearchText(query);
  const matches = useMemo(
    () =>
      Array.from(normalizedQuery).length >= MIN_QUERY_LENGTH
        ? searchPlaces(searchIndex, query).slice(0, 6)
        : [],
    [normalizedQuery, query, searchIndex],
  );
  const isOpen = showSuggestions && query.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchField}>
        <Text accessibilityElementsHidden style={styles.searchIcon}>
          ⌕
        </Text>
        <TextInput
          accessibilityLabel="Buscar lugares del campus"
          accessibilityHint="Busca por nombre, categoría o número de parada."
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          onChangeText={(value) => {
            setShowSuggestions(true);
            onQueryChange(value);
          }}
          onFocus={() => setShowSuggestions(query.trim().length > 0)}
          placeholder="Edificios, servicios, transporte…"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          style={styles.input}
          testID="place-search-input"
          value={query}
        />
        {isOpen && (
          <Pressable
            accessibilityLabel="Borrar búsqueda"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              setShowSuggestions(false);
              onClear();
            }}
            style={styles.clearButton}
            testID="clear-search-button"
          >
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        )}
      </View>

      {isOpen && (
        <View
          accessibilityLabel="Sugerencias de lugares"
          style={styles.suggestions}
          testID="search-suggestions"
        >
          {Array.from(normalizedQuery).length < MIN_QUERY_LENGTH ? (
            <Text style={styles.helperText}>Escribe al menos dos caracteres.</Text>
          ) : matches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No encontramos ese lugar</Text>
              <Text style={styles.helperText}>
                Prueba con otro nombre, categoría o número de parada.
              </Text>
            </View>
          ) : (
            matches.map((place) => (
              <Pressable
                accessibilityLabel={`${place.name}, ${CATEGORY_LABELS[place.category]}`}
                accessibilityRole="button"
                key={place.id}
                onPress={() => {
                  setShowSuggestions(false);
                  onSelect(place);
                }}
                style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}
                testID={`suggestion-${place.id}`}
              >
                <View style={styles.suggestionCopy}>
                  <Text numberOfLines={1} style={styles.suggestionName}>
                    {place.name}
                  </Text>
                  <Text style={styles.suggestionCategory}>
                    {CATEGORY_LABELS[place.category]}
                  </Text>
                </View>
                <Text accessibilityElementsHidden style={styles.arrow}>
                  ›
                </Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 5,
  },
  searchField: {
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
  searchIcon: {
    color: colors.universityRed,
    fontSize: 28,
    lineHeight: 30,
  },
  input: {
    flex: 1,
    minHeight: 54,
    color: colors.ink,
    fontSize: 15,
  },
  clearButton: {
    minWidth: 36,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    color: colors.muted,
    fontSize: 28,
    lineHeight: 32,
  },
  suggestions: {
    position: 'absolute',
    top: 66,
    left: 0,
    right: 0,
    maxHeight: 288,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
  },
  suggestion: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: '#F7ECEF',
  },
  suggestionCopy: {
    flex: 1,
    gap: 3,
  },
  suggestionName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  suggestionCategory: {
    color: colors.muted,
    fontSize: 12,
  },
  arrow: {
    color: colors.universityRed,
    fontSize: 26,
    marginLeft: 12,
  },
  emptyState: {
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  helperText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
});
