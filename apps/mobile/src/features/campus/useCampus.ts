import { useCatalog } from "./useCatalog";
import { useMemo, useState } from "react";
import {
  PLACE_CATEGORIES,
  type Place,
  type PlaceCategory,
} from "@unimovil/contracts";
import {
  localPlacesRepository,
  type PlacesRepository,
} from "./data/repository";
import {
  createSearchIndex,
  findPlaces,
  MAX_QUERY_LENGTH,
  retainSelection,
} from "./domain/places";
import {
  defaultFavoritesStore,
  type FavoritesStore,
} from "../favorites/domain/favorites-store";

interface Exploration {
  query: string;
  categories: readonly PlaceCategory[];
  selectedId: string | null;
  onlyFavorites: boolean;
}
const EMPTY: readonly Place[] = [];

function resolveVisiblePlaces(
  index: ReturnType<typeof createSearchIndex>,
  exploration: Exploration,
  favoritesStore: FavoritesStore,
): readonly Place[] {
  const matched = findPlaces(index, exploration.query, exploration.categories);
  return exploration.onlyFavorites
    ? favoritesStore.filterFavoritePlaces(matched)
    : matched;
}

export function useCampus(
  repository: PlacesRepository = localPlacesRepository,
  favoritesStore: FavoritesStore = defaultFavoritesStore,
) {
  const { catalog, retry } = useCatalog(repository);
  const [favoritesVersion, setFavoritesVersion] = useState(0);
  const [exploration, setExploration] = useState<Exploration>({
    query: "",
    categories: PLACE_CATEGORIES,
    selectedId: null,
    onlyFavorites: false,
  });
  const places = catalog.status === "ready" ? catalog.places : EMPTY;
  const index = useMemo(() => createSearchIndex(places), [places]);
  const visible = useMemo(
    () => resolveVisiblePlaces(index, exploration, favoritesStore),
    [index, exploration, favoritesVersion, favoritesStore],
  );
  const selected = retainSelection(visible, exploration.selectedId);
  function update(change: (state: Exploration) => Exploration) {
    setExploration((state) => {
      const next = change(state);
      const available = resolveVisiblePlaces(index, next, favoritesStore);
      return {
        ...next,
        selectedId: retainSelection(available, next.selectedId)?.id ?? null,
      };
    });
  }
  return {
    catalog,
    places,
    visible,
    selected,
    ...exploration,
    setQuery: (query: string) =>
      update((state) => ({
        ...state,
        query: query.slice(0, MAX_QUERY_LENGTH),
      })),
    toggleCategory: (category: PlaceCategory) =>
      update((state) => ({
        ...state,
        categories: state.categories.includes(category)
          ? state.categories.filter((item) => item !== category)
          : [...state.categories, category],
      })),
    toggleOnlyFavorites: () =>
      update((state) => ({
        ...state,
        onlyFavorites: !state.onlyFavorites,
      })),
    isFavorite: (targetId: string) => favoritesStore.isFavorite(targetId),
    toggleFavorite: (place: Place) => {
      favoritesStore.toggleFavorite(place);
      setFavoritesVersion((v) => v + 1);
    },
    reset: () =>
      update((state) => ({
        ...state,
        query: "",
        categories: PLACE_CATEGORIES,
        onlyFavorites: false,
      })),
    select: (id: string | null) =>
      update((state) => ({ ...state, selectedId: id })),
    retry,
  };
}
