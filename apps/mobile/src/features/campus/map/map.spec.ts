import { describe, expect, it } from "vitest";
import { parsePlaces } from "@unimovil/contracts";
import catalog from "../data/catalog.json";
import { placesGeoJSON } from "./geojson";
import { mapMode, mapStyle } from "./map-style";
describe("adaptador cartográfico", () => {
  it("convierte coordenadas a GeoJSON sin invertir ejes", () => {
    const result = placesGeoJSON(parsePlaces(catalog));
    expect(result.features).toHaveLength(24);
    expect(result.features[0]?.geometry.coordinates).toEqual([
      -3.7259546, 40.4489638,
    ]);
    expect(result.features[0]?.properties?.id).toBe("osm-way-15431473");
    expect(placesGeoJSON([]).features).toEqual([]);
  });
  it("resuelve solo los modos de prueba conocidos", () => {
    expect(mapMode(undefined)).toBe("live");
    expect(mapMode("other")).toBe("live");
    expect(mapMode("fixture")).toBe("fixture");
    expect(mapMode("fixture-error")).toBe("fixture-error");
  });
  it("usa teselas raster públicas de OpenStreetMap sin clave", () => {
    expect(mapStyle("live", 0)).toMatchObject({
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [{ id: "osm", type: "raster", source: "osm" }],
    });
  });
  it("mantiene el mapa de pruebas sin red y permite recuperar el fallo inicial", () => {
    expect(mapStyle("fixture", 0)).toMatchObject({
      version: 8,
      sources: {},
    });
    expect(mapStyle("fixture-error", 0)).toBe(
      "https://127.0.0.1:1/unavailable-style.json",
    );
    expect(mapStyle("fixture-error", 1)).toMatchObject({
      version: 8,
    });
  });
});
