export const PLACE_CATEGORIES = [
  'building',
  'transport',
  'parking',
  'bicycle',
  'service',
  'entrance',
] as const;

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export interface PlaceCoordinates {
  latitude: number;
  longitude: number;
}

export interface PlaceSource {
  url: string;
  license: 'ODbL-1.0' | 'Open Data Commons Attribution License';
  checkedAt: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  coordinates: PlaceCoordinates;
  aliases: readonly string[];
  source: PlaceSource;
}

export const CATEGORY_LABELS: Readonly<Record<PlaceCategory, string>> = {
  building: 'Edificios',
  transport: 'Transporte',
  parking: 'Aparcamientos',
  bicycle: 'Bicicletas',
  service: 'Servicios',
  entrance: 'Accesos',
};

export const CATEGORY_SYMBOLS: Readonly<Record<PlaceCategory, string>> = {
  building: 'E',
  transport: 'T',
  parking: 'P',
  bicycle: 'B',
  service: 'S',
  entrance: 'A',
};

export function filterPlacesByCategories(
  places: readonly Place[],
  activeCategories: ReadonlySet<PlaceCategory>,
): readonly Place[] {
  return places.filter((place) => activeCategories.has(place.category));
}

export function togglePlaceCategory(
  activeCategories: ReadonlySet<PlaceCategory>,
  category: PlaceCategory,
): ReadonlySet<PlaceCategory> {
  const nextCategories = new Set(activeCategories);

  if (nextCategories.has(category)) {
    nextCategories.delete(category);
  } else {
    nextCategories.add(category);
  }

  return nextCategories;
}

const CATEGORY_SEARCH_TERMS: Readonly<Record<PlaceCategory, readonly string[]>> = {
  building: ['facultad', 'edificio', 'escuela'],
  transport: ['autobús', 'bus', 'metro', 'parada'],
  parking: ['aparcamiento', 'parking'],
  bicycle: ['bici', 'bicicleta'],
  service: ['biblioteca', 'bibliotecas', 'servicio', 'servicios'],
  entrance: ['entrada', 'acceso'],
};

export const MIN_QUERY_LENGTH = 2;
export const MAX_QUERY_LENGTH = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parsePlaces(value: unknown): readonly Place[] {
  if (!Array.isArray(value)) {
    throw new Error('El catálogo de lugares no tiene un formato válido.');
  }

  const ids = new Set<string>();

  return value.map((item, index): Place => {
    if (!isRecord(item) || !isRecord(item.coordinates) || !isRecord(item.source)) {
      throw new Error(`El lugar en la posición ${index + 1} no está completo.`);
    }

    const { id, name, category, aliases } = item;
    const { latitude, longitude } = item.coordinates;
    const { url, license, checkedAt } = item.source;

    if (
      typeof id !== 'string' ||
      id.trim() === '' ||
      ids.has(id) ||
      typeof name !== 'string' ||
      name.trim() === '' ||
      !PLACE_CATEGORIES.includes(category as PlaceCategory) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Number(latitude) < -90 ||
      Number(latitude) > 90 ||
      Number(longitude) < -180 ||
      Number(longitude) > 180 ||
      !Array.isArray(aliases) ||
      !aliases.every((alias) => typeof alias === 'string') ||
      typeof url !== 'string' ||
      !url.startsWith('https://www.openstreetmap.org/') ||
      license !== 'ODbL-1.0' ||
      typeof checkedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)
    ) {
      throw new Error(`El lugar en la posición ${index + 1} contiene datos inválidos.`);
    }

    ids.add(id);

    return {
      id,
      name,
      category: category as PlaceCategory,
      coordinates: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      aliases: [...aliases],
      source: {
        url,
        license,
        checkedAt,
      },
    };
  });
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

interface SearchEntry {
  place: Place;
  name: string;
  searchableText: string;
}

export function createSearchIndex(places: readonly Place[]): readonly SearchEntry[] {
  return places.map((place) => ({
    place,
    name: normalizeSearchText(place.name),
    searchableText: normalizeSearchText(
      [
        place.name,
        ...place.aliases,
        CATEGORY_LABELS[place.category],
        ...CATEGORY_SEARCH_TERMS[place.category],
      ].join(' '),
    ),
  }));
}

function rank(entry: SearchEntry, query: string): number {
  if (entry.name === query) return 0;
  if (entry.name.startsWith(query)) return 1;
  return 2;
}

export function searchPlaces(
  index: readonly SearchEntry[],
  rawQuery: string,
): readonly Place[] {
  const query = normalizeSearchText(rawQuery.slice(0, MAX_QUERY_LENGTH));

  if (Array.from(query).length < MIN_QUERY_LENGTH) return [];

  const terms = query.split(' ');

  return index
    .filter((entry) => terms.every((term) => entry.searchableText.includes(term)))
    .sort(
      (first, second) =>
        rank(first, query) - rank(second, query) ||
        first.name.localeCompare(second.name, 'es') ||
        first.place.id.localeCompare(second.place.id),
    )
    .map((entry) => entry.place);
}
