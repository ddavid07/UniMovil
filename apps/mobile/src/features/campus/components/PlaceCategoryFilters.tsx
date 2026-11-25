import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/theme';
import {
  CATEGORY_LABELS,
  CATEGORY_SYMBOLS,
  PLACE_CATEGORIES,
  type PlaceCategory,
} from '../domain/places';

interface PlaceCategoryFiltersProps {
  activeCategories: ReadonlySet<PlaceCategory>;
  onToggle: (category: PlaceCategory) => void;
  onReset: () => void;
}

export function PlaceCategoryFilters({
  activeCategories,
  onToggle,
  onReset,
}: PlaceCategoryFiltersProps) {
  const allCategoriesActive = PLACE_CATEGORIES.every((category) =>
    activeCategories.has(category),
  );

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text accessibilityRole="header" style={styles.heading}>
            Categorías del mapa
          </Text>
          <Text style={styles.description}>La letra identifica el tipo de lugar.</Text>
        </View>
        <Pressable
          accessibilityLabel="Restablecer todas las categorías"
          accessibilityRole="button"
          accessibilityState={{ disabled: allCategoriesActive }}
          disabled={allCategoriesActive}
          onPress={onReset}
          style={({ pressed }) => [
            styles.resetButton,
            allCategoriesActive && styles.resetDisabled,
            pressed && styles.pressed,
          ]}
          testID="reset-category-filters"
        >
          <Text style={styles.resetText}>Restablecer</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.filters}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {PLACE_CATEGORIES.map((category) => {
          const isActive = activeCategories.has(category);

          return (
            <Pressable
              accessibilityLabel={`${CATEGORY_LABELS[category]}, ${isActive ? 'activa' : 'inactiva'}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isActive }}
              key={category}
              onPress={() => onToggle(category)}
              style={({ pressed }) => [
                styles.filter,
                isActive && styles.filterActive,
                pressed && styles.pressed,
              ]}
              testID={`category-filter-${category}`}
            >
              <View style={[styles.symbol, isActive && styles.symbolActive]}>
                <Text
                  accessibilityElementsHidden
                  style={[styles.symbolText, isActive && styles.symbolTextActive]}
                >
                  {CATEGORY_SYMBOLS[category]}
                </Text>
              </View>
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {CATEGORY_LABELS[category]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  headingRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headingCopy: {
    gap: 1,
  },
  heading: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: colors.muted,
    fontSize: 11,
  },
  resetButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#F2E3E7',
  },
  resetDisabled: {
    opacity: 0.55,
  },
  resetText: {
    color: colors.universityRedDark,
    fontSize: 12,
    fontWeight: '700',
  },
  filters: {
    gap: 7,
    paddingRight: 4,
  },
  filter: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  filterActive: {
    borderColor: colors.universityRed,
    backgroundColor: '#FFF7F8',
  },
  symbol: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#E9EEF1',
  },
  symbolActive: {
    backgroundColor: colors.universityRed,
  },
  symbolText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '800',
  },
  symbolTextActive: {
    color: colors.surface,
  },
  filterText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.universityRedDark,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
});
