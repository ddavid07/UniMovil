import { PLACE_CATEGORIES, type Place, type PlaceCategory } from "./places.js";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("El catálogo contiene un objeto inválido.");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 500) {
    throw new Error("El catálogo contiene un texto inválido.");
  }
  return value.trim();
}

function coordinate(value: unknown, minimum: number, maximum: number): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new Error("Coordenadas fuera del área de Moncloa.");
  }
  return value;
}

function category(value: unknown): PlaceCategory {
  const found = PLACE_CATEGORIES.find((item) => item === value);
  if (!found) throw new Error("Categoría desconocida.");
  return found;
}

function accessibility(value: unknown): Place["accessibility"] {
  if (
    value === "unknown" ||
    value === "yes" ||
    value === "no" ||
    value === "limited"
  )
    return value;
  throw new Error("Estado de accesibilidad inválido.");
}

function checkedDate(value: unknown): string {
  const checkedAt = text(value);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(checkedAt) ||
    !Number.isFinite(Date.parse(checkedAt)) ||
    new Date(checkedAt).toISOString().slice(0, 10) !== checkedAt
  ) {
    throw new Error("Fecha de comprobación inválida.");
  }
  return checkedAt;
}

function source(value: unknown): Place["source"] {
  const item = record(value);
  const url = new URL(text(item.url));
  if (
    url.protocol !== "https:" ||
    url.hostname !== "www.openstreetmap.org" ||
    url.port ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    !/^\/(node|way|relation)\/\d+$/.test(url.pathname)
  ) {
    throw new Error("Fuente OSM inválida.");
  }
  const checkedAt = checkedDate(item.checkedAt);
  if (item.license !== "ODbL-1.0")
    throw new Error("Licencia del catálogo inválida.");
  return Object.freeze({ url: url.href, checkedAt, license: "ODbL-1.0" });
}

function parsePlace(value: unknown): Place {
  const item = record(value);
  const point = record(item.coordinates);
  if (!Array.isArray(item.aliases) || item.aliases.length > 20)
    throw new Error("Alias inválidos.");
  const id = text(item.id);
  if (!/^osm-(node|way|relation)-\d+$/.test(id))
    throw new Error("Identificador inválido.");
  const result: Place = {
    id,
    name: text(item.name),
    category: category(item.category),
    coordinates: Object.freeze({
      latitude: coordinate(point.latitude, 40.43, 40.47),
      longitude: coordinate(point.longitude, -3.76, -3.7),
    }),
    aliases: Object.freeze(Array.from(item.aliases, text)),
    accessibility: accessibility(item.accessibility),
    source: source(item.source),
    ...(item.description === undefined
      ? {}
      : { description: text(item.description) }),
  };
  const expected = result.source.url
    .replace("https://www.openstreetmap.org/", "osm-")
    .replace("/", "-");
  if (result.id !== expected)
    throw new Error("La fuente no corresponde al identificador.");
  return Object.freeze(result);
}

export function parsePlaces(value: unknown): readonly Place[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 10_000)
    throw new Error("Catálogo vacío o inválido.");
  const places = Array.from(value, parsePlace);
  if (new Set(places.map((place) => place.id)).size !== places.length)
    throw new Error("Identificadores duplicados.");
  return Object.freeze(places);
}
