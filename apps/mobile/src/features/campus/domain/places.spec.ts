import { describe, expect, it } from "vitest";
import { parsePlaces, PLACE_CATEGORIES } from "@unimovil/contracts";
import catalog from "../data/catalog.json";
import {
  campusBounds,
  createSearchIndex,
  findPlaces,
  normalize,
  retainSelection,
} from "./places";

const places = parsePlaces(catalog);
const index = createSearchIndex(places);
describe("exploración del campus", () => {
  it("normaliza mayúsculas, tildes y espacios", () =>
    expect(normalize("  ODONTOLOGÍA   UCM ")).toBe("odontologia ucm"));
  it("consulta vacía incluye todas las categorías activas", () => {
    expect(findPlaces(index, "", PLACE_CATEGORIES)).toHaveLength(24);
    expect(findPlaces(index, "", [])).toEqual([]);
  });
  it("busca nombre, alias y categoría combinando términos", () => {
    expect(findPlaces(index, "odontologia", PLACE_CATEGORIES)[0]?.name).toBe(
      "Facultad de Odontología",
    );
    expect(findPlaces(index, "1690", PLACE_CATEGORIES)[0]?.id).toBe(
      "osm-node-1439701481",
    );
    expect(
      findPlaces(index, "servicios biologicas", PLACE_CATEGORIES)[0]?.id,
    ).toBe("osm-node-412911553");
    expect(findPlaces(index, "odonto medicina", PLACE_CATEGORIES)).toEqual([]);
    expect(findPlaces(index, "odontologia", ["service"])).toEqual([]);
  });
  it("ordena coincidencia exacta, prefijos y coincidencias parciales con desempate estable", () => {
    const first = places[0]!;
    const ranked = createSearchIndex([
      { ...first, id: "d", name: "Una biblioteca", aliases: [] },
      {
        ...first,
        id: "c",
        name: "Ciencias",
        aliases: ["Biblioteca de ciencias"],
      },
      { ...first, id: "b", name: "Biblioteca central", aliases: [] },
      { ...first, id: "a", name: "Biblioteca", aliases: [] },
      { ...first, id: "e", name: "Biblioteca", aliases: [] },
    ]);
    expect(
      findPlaces(ranked, "biblioteca", PLACE_CATEGORIES).map(
        (place) => place.id,
      ),
    ).toEqual(["a", "e", "b", "c", "d"]);
  });
  it("aplica todas las combinaciones de categorías sin mutar el catálogo", () => {
    for (let mask = 0; mask < 64; mask += 1) {
      const categories = PLACE_CATEGORIES.filter((_, bit) => mask & (1 << bit));
      expect(findPlaces(index, "", categories)).toHaveLength(
        categories.length * 4,
      );
    }
    expect(places).toHaveLength(24);
  });
  it("limita la entrada de búsqueda y devuelve cero resultados de forma explícita", () => {
    expect(findPlaces(index, "x".repeat(101), PLACE_CATEGORIES)).toEqual([]);
    expect(findPlaces(index, "no existe", PLACE_CATEGORIES)).toEqual([]);
  });
  it("conserva solo una selección todavía visible", () => {
    expect(retainSelection(places, places[0]!.id)).toBe(places[0]);
    expect(retainSelection([], places[0]!.id)).toBeNull();
    expect(retainSelection(places, null)).toBeNull();
  });
  it("calcula encuadre oeste/sur/este/norte con margen", () => {
    const [west, south, east, north] = campusBounds(places);
    expect(
      places.every(
        (place) =>
          place.coordinates.longitude > west &&
          place.coordinates.longitude < east &&
          place.coordinates.latitude > south &&
          place.coordinates.latitude < north,
      ),
    ).toBe(true);
    expect(() => campusBounds([])).toThrow();
  });
});
