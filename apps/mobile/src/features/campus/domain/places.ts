import type { Place, PlaceCategory } from "@unimovil/contracts";

export const CATEGORY_LABELS: Readonly<Record<PlaceCategory, string>> = {
  building: "Edificios",
  transport: "Transporte",
  parking: "Aparcamientos",
  bicycle: "Bicicletas",
  service: "Servicios",
  entrance: "Accesos",
};
export const MAX_QUERY_LENGTH = 100;

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("es")
    .trim()
    .replace(/\s+/g, " ");
}

export function createSearchIndex(places: readonly Place[]) {
  return places.map((place) => ({
    place,
    name: normalize(place.name),
    aliases: place.aliases.map(normalize),
    text: normalize(
      [place.name, ...place.aliases, CATEGORY_LABELS[place.category]].join(" "),
    ),
  }));
}

export type SearchIndex = ReturnType<typeof createSearchIndex>;

function rank(entry: SearchIndex[number], query: string): number {
  if (entry.name === query) return 0;
  if ([entry.name, ...entry.aliases].some((name) => name.startsWith(query)))
    return 1;
  return 2;
}

export function findPlaces(
  index: SearchIndex,
  query: string,
  categories: readonly PlaceCategory[],
): readonly Place[] {
  const normalized = normalize(query.slice(0, MAX_QUERY_LENGTH));
  const terms = normalized.split(" ");
  const allowed = new Set(categories);
  return index
    .filter(
      (entry) =>
        allowed.has(entry.place.category) &&
        terms.every((term) => entry.text.includes(term)),
    )
    .sort(
      (a, b) =>
        rank(a, normalized) - rank(b, normalized) ||
        a.name.localeCompare(b.name, "es") ||
        a.place.id.localeCompare(b.place.id),
    )
    .map((entry) => entry.place);
}

export function retainSelection(
  places: readonly Place[],
  selectedId: string | null,
): Place | null {
  return places.find((place) => place.id === selectedId) ?? null;
}

export function campusBounds(
  places: readonly Place[],
): [number, number, number, number] {
  if (!places.length) throw new Error("El encuadre necesita lugares.");
  const latitudes = places.map((place) => place.coordinates.latitude);
  const longitudes = places.map((place) => place.coordinates.longitude);
  return [
    Math.min(...longitudes) - 0.001,
    Math.min(...latitudes) - 0.001,
    Math.max(...longitudes) + 0.001,
    Math.max(...latitudes) + 0.001,
  ];
}
