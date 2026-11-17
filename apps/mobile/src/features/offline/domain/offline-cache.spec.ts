import { describe, expect, it } from "vitest";
import type { Place, RouteResponse } from "@unimovil/contracts";
import { OfflineCache } from "./offline-cache";

describe("OfflineCache (HU-094)", () => {
  const dummyPlace1: Place = {
    id: "fdi",
    name: "Facultad de Informática",
    category: "building",
    coordinates: { latitude: 40.4529, longitude: -3.7335 },
    accessibility: "yes",
    aliases: ["FDI"],
    source: {
      url: "https://osm.org",
      checkedAt: "2026-10-01",
      license: "ODbL-1.0",
    },
  };

  const dummyPlace2: Place = {
    id: "medicina",
    name: "Facultad de Medicina",
    category: "building",
    coordinates: { latitude: 40.4439, longitude: -3.7268 },
    accessibility: "yes",
    aliases: ["Medicina"],
    source: {
      url: "https://osm.org",
      checkedAt: "2026-10-01",
      license: "ODbL-1.0",
    },
  };

  const dummyRoute: RouteResponse = {
    id: "route-fdi-med",
    origin: dummyPlace1.coordinates,
    destination: dummyPlace2.coordinates,
    totalDistanceMeters: 1200,
    estimatedDurationMinutes: 16,
    accessible: true,
    segments: [
      {
        id: "seg-1",
        sourceNodeId: "node-1",
        targetNodeId: "node-2",
        instruction:
          "Camina hacia el sur por Calle del Profesor José García Santesmases",
        distanceMeters: 400,
        durationSeconds: 300,
        isAccessible: true,
        hasStairs: false,
        hasRamp: true,
        pathCoordinates: [dummyPlace1.coordinates, dummyPlace2.coordinates],
      },
    ],
    polyline: [dummyPlace1.coordinates, dummyPlace2.coordinates],
  };

  it("inicializa el caché vacío", () => {
    const cache = new OfflineCache();
    expect(cache.getRecentPlaces()).toHaveLength(0);
    expect(cache.getRecentRoutes()).toHaveLength(0);
  });

  it("almacena y recupera lugares recientes sin duplicar", () => {
    const cache = new OfflineCache(5);
    cache.saveRecentPlace(dummyPlace1);
    cache.saveRecentPlace(dummyPlace2);
    cache.saveRecentPlace(dummyPlace1); // Mueve al inicio

    const places = cache.getRecentPlaces();
    expect(places).toHaveLength(2);
    expect(places[0]?.id).toBe("fdi");
    expect(places[1]?.id).toBe("medicina");
  });

  it("respeta la capacidad máxima de lugares eliminando los menos recientes (LRU)", () => {
    const cache = new OfflineCache(2);
    cache.saveRecentPlace(dummyPlace1);
    cache.saveRecentPlace(dummyPlace2);
    const dummyPlace3: Place = {
      id: "farmacia",
      name: "Facultad de Farmacia",
      category: "building",
      coordinates: { latitude: 40.444, longitude: -3.728 },
      accessibility: "yes",
      aliases: [],
      source: {
        url: "https://osm.org",
        checkedAt: "2026-10-01",
        license: "ODbL-1.0",
      },
    };
    cache.saveRecentPlace(dummyPlace3);

    const places = cache.getRecentPlaces();
    expect(places).toHaveLength(2);
    expect(places.map((p) => p.id)).toEqual(["farmacia", "medicina"]);
  });

  it("almacena y recupera una ruta en caché según origen, destino y accesibilidad", () => {
    const cache = new OfflineCache();
    cache.saveRecentRoute("fdi", "medicina", true, dummyRoute);

    const cached = cache.findCachedRoute("fdi", "medicina", true);
    expect(cached).not.toBeNull();
    expect(cached?.totalDistanceMeters).toBe(1200);

    // Diferente accesibilidad no coincide
    const cachedNonPmr = cache.findCachedRoute("fdi", "medicina", false);
    expect(cachedNonPmr).toBeNull();
  });

  it("devuelve null si la ruta no existe en el caché", () => {
    const cache = new OfflineCache();
    expect(cache.findCachedRoute("a", "b", false)).toBeNull();
  });

  it("permite serializar a JSON y restaurar el estado completo", () => {
    const cache = new OfflineCache();
    cache.saveRecentPlace(dummyPlace1);
    cache.saveRecentRoute("fdi", "medicina", true, dummyRoute);

    const snapshot = cache.toJSON();
    const restored = OfflineCache.fromJSON(snapshot);

    expect(restored.getRecentPlaces()).toHaveLength(1);
    expect(restored.getRecentPlaces()[0]?.id).toBe("fdi");
    expect(restored.findCachedRoute("fdi", "medicina", true)?.id).toBe(
      "route-fdi-med",
    );
  });

  it("restaura un caché vacío de forma segura si el JSON está corrupto o es inválido", () => {
    const restored = OfflineCache.fromJSON("corrupted-json{");
    expect(restored.getRecentPlaces()).toHaveLength(0);
    expect(restored.getRecentRoutes()).toHaveLength(0);
  });

  it("permite limpiar el caché completo", () => {
    const cache = new OfflineCache();
    cache.saveRecentPlace(dummyPlace1);
    cache.saveRecentRoute("fdi", "medicina", true, dummyRoute);
    cache.clear();

    expect(cache.getRecentPlaces()).toHaveLength(0);
    expect(cache.getRecentRoutes()).toHaveLength(0);
  });
});
