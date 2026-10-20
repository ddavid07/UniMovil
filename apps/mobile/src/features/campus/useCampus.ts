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

interface Exploration {
  query: string;
  categories: readonly PlaceCategory[];
  selectedId: string | null;
}
const EMPTY: readonly Place[] = [];

export function useCampus(
  repository: PlacesRepository = localPlacesRepository,
) {
  const { catalog, retry } = useCatalog(repository);
  const [exploration, setExploration] = useState<Exploration>({
    query: "",
    categories: PLACE_CATEGORIES,
    selectedId: null,
  });
  const places = catalog.status === "ready" ? catalog.places : EMPTY;
  const index = useMemo(() => createSearchIndex(places), [places]);
  const visible = useMemo(
    () => findPlaces(index, exploration.query, exploration.categories),
    [index, exploration.query, exploration.categories],
  );
  const selected = retainSelection(visible, exploration.selectedId);
  function update(change: (state: Exploration) => Exploration) {
    setExploration((state) => {
      const next = change(state);
      const available = findPlaces(index, next.query, next.categories);
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
    reset: () =>
      update((state) => ({
        ...state,
        query: "",
        categories: PLACE_CATEGORIES,
      })),
    select: (id: string | null) =>
      update((state) => ({ ...state, selectedId: id })),
    retry,
  };
}
