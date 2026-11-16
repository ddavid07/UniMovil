import { describe, expect, it } from "vitest";
import { parsePlaces } from "./parse-places.js";
import catalog from "../../../apps/mobile/src/features/campus/data/catalog.json";

const first = catalog[0]!;
const valid = () => structuredClone(first);
describe("catálogo de lugares", () => {
  it("valida todos los lugares sin alterar la entrada y congela el resultado", () => {
    const result = parsePlaces(catalog);
    expect(result).toHaveLength(24);
    expect(result[0]).toMatchObject(first);
    expect(result).not.toBe(catalog);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[0]?.coordinates)).toBe(true);
    expect(Object.isFrozen(result[0]?.source)).toBe(true);
    expect(Object.isFrozen(result[0]?.aliases)).toBe(true);
  });
  it.each([null, {}, [], [null], [false], [[]], new Array(10_001).fill(first)])(
    "rechaza estructura inválida",
    (value) => expect(() => parsePlaces(value)).toThrow(),
  );
  it.each([null, 4, "", " ", "x".repeat(501)])(
    "rechaza nombres inválidos",
    (name) => expect(() => parsePlaces([{ ...valid(), name }])).toThrow(),
  );
  it.each([{}, null, []])("rechaza coordenadas sin objeto", (coordinates) =>
    expect(() => parsePlaces([{ ...valid(), coordinates }])).toThrow(),
  );
  it.each([NaN, Infinity, -Infinity, null, "40.44", 40.42, 40.48])(
    "rechaza latitud inválida",
    (latitude) =>
      expect(() =>
        parsePlaces([
          { ...valid(), coordinates: { latitude, longitude: -3.73 } },
        ]),
      ).toThrow(),
  );
  it.each([-3.77, -3.69, NaN, null])("rechaza longitud inválida", (longitude) =>
    expect(() =>
      parsePlaces([
        { ...valid(), coordinates: { latitude: 40.44, longitude } },
      ]),
    ).toThrow(),
  );
  it("rechaza latitud y longitud intercambiadas", () =>
    expect(() =>
      parsePlaces([
        { ...valid(), coordinates: { latitude: -3.73, longitude: 40.44 } },
      ]),
    ).toThrow());
  it.each(["other", null, 0])("rechaza categoría inválida", (category) =>
    expect(() => parsePlaces([{ ...valid(), category }])).toThrow(),
  );
  it.each(["unknown", "yes", "no", "limited"])(
    "admite estado explícito %s",
    (accessibility) =>
      expect(
        parsePlaces([{ ...valid(), accessibility }])[0]?.accessibility,
      ).toBe(accessibility),
  );
  it.each([undefined, "maybe"])(
    "rechaza accesibilidad ambigua",
    (accessibility) =>
      expect(() => parsePlaces([{ ...valid(), accessibility }])).toThrow(),
  );
  it.each([undefined, "alias", new Array(21).fill("alias"), [null]])(
    "rechaza alias inválidos",
    (aliases) => expect(() => parsePlaces([{ ...valid(), aliases }])).toThrow(),
  );
  it("conserva alias, limpia textos y admite descripción ausente", () => {
    const place = { ...valid(), description: undefined };
    expect(
      parsePlaces([{ ...place, name: " Medicina ", aliases: [" Med "] }])[0],
    ).toMatchObject({ name: "Medicina", aliases: ["Med"] });
  });
  it.each(["oops", "osm-way-0x1"])("rechaza identificadores inválidos", (id) =>
    expect(() => parsePlaces([{ ...valid(), id }])).toThrow(),
  );
  it("rechaza identidades duplicadas o que no corresponden a la fuente", () => {
    expect(() => parsePlaces([first, first])).toThrow("duplicados");
    expect(() => parsePlaces([{ ...valid(), id: "osm-node-123" }])).toThrow(
      "corresponde",
    );
  });
  it.each([
    "http://www.openstreetmap.org/way/15431473",
    "https://evil.test/way/15431473",
    "https://www.openstreetmap.org:444/way/15431473",
    "https://www.openstreetmap.org/user/15431473",
    "https://www.openstreetmap.org/way/15431473?key=x",
    "https://www.openstreetmap.org/way/15431473#x",
    "https://user@www.openstreetmap.org/way/15431473",
    "https://:pass@www.openstreetmap.org/way/15431473",
    "broken",
  ])("rechaza fuentes no autorizadas", (url) =>
    expect(() =>
      parsePlaces([{ ...valid(), source: { ...first.source, url } }]),
    ).toThrow(),
  );
  it.each(["20/10/2026", "2026-13-01", "2026-02-30"])(
    "rechaza fechas inválidas",
    (checkedAt) =>
      expect(() =>
        parsePlaces([{ ...valid(), source: { ...first.source, checkedAt } }]),
      ).toThrow(),
  );
  it("rechaza una licencia no declarada", () =>
    expect(() =>
      parsePlaces([
        { ...valid(), source: { ...first.source, license: "unknown" } },
      ]),
    ).toThrow("Licencia"));
});
