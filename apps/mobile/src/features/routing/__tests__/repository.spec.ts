import { describe, expect, it, vi } from "vitest";
import type { RouteRequest, RouteResponse } from "@unimovil/contracts";
import {
  createHttpRoutingRepository,
  localRoutingRepository,
} from "../data/repository.js";

describe("RoutingRepository (TDD - Tema 3)", () => {
  const origin = { latitude: 40.4442, longitude: -3.7262 };
  const destination = { latitude: 40.4455, longitude: -3.7275 };

  describe("localRoutingRepository", () => {
    it("calcula una ruta estándar exitosa entre Metro y Medicina", async () => {
      const request: RouteRequest = {
        origin,
        destination,
        accessibleOnly: false,
      };

      const result = await localRoutingRepository.calculateRoute(request);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^route-/);
      expect(result.origin).toEqual(origin);
      expect(result.destination).toEqual(destination);
      expect(result.totalDistanceMeters).toBeGreaterThan(0);
      expect(result.estimatedDurationMinutes).toBeGreaterThan(0);
      expect(result.segments.length).toBeGreaterThan(0);
      expect(result.polyline.length).toBeGreaterThanOrEqual(2);
    });

    it("calcula una ruta accesible PMR cuando accessibleOnly es true", async () => {
      const request: RouteRequest = {
        origin,
        destination,
        accessibleOnly: true,
      };

      const result = await localRoutingRepository.calculateRoute(request);

      expect(result.accessible).toBe(true);
      expect(result.segments.every((s) => !s.hasStairs)).toBe(true);
    });

    it("lanza error cuando origen y destino son idénticos (partición de equivalencia)", async () => {
      const request: RouteRequest = {
        origin,
        destination: origin,
      };

      await expect(
        localRoutingRepository.calculateRoute(request),
      ).rejects.toThrow("El origen y el destino son el mismo punto");
    });

    it("lanza error cuando el origen está fuera de los límites del campus", async () => {
      const request: RouteRequest = {
        origin: { latitude: 41.0, longitude: -3.7 },
        destination,
      };

      await expect(
        localRoutingRepository.calculateRoute(request),
      ).rejects.toThrow("origen se encuentra fuera");
    });

    it("lanza error cuando el destino está fuera de los límites del campus", async () => {
      const request: RouteRequest = {
        origin,
        destination: { latitude: 39.0, longitude: -3.7 },
      };

      await expect(
        localRoutingRepository.calculateRoute(request),
      ).rejects.toThrow("destino se encuentra fuera");
    });

    it("calcula ruta exitosamente hacia el Parking de Bellas Artes y lugares del sur del campus", async () => {
      const coordsMedicina = { latitude: 40.4428, longitude: -3.7275 };
      const coordsBellasArtes = { latitude: 40.4392759, longitude: -3.7335048 };

      const result = await localRoutingRepository.calculateRoute({
        origin: coordsMedicina,
        destination: coordsBellasArtes,
        accessibleOnly: false,
      });

      expect(result).toBeDefined();
      expect(result.totalDistanceMeters).toBeGreaterThan(0);
      expect(result.segments.length).toBe(2);
    });

    it("valida que los lugares del catálogo oficial pueden calcular rutas entre sí sin fallos de límites", async () => {
      const catalog = (await import("../../campus/data/catalog.json")).default;
      for (let i = 0; i < Math.min(catalog.length, 6); i++) {
        for (let j = 0; j < Math.min(catalog.length, 6); j++) {
          if (i === j) continue;
          const originPlace = catalog[i];
          const destPlace = catalog[j];
          if (!originPlace || !destPlace) continue;
          const route = await localRoutingRepository.calculateRoute({
            origin: originPlace.coordinates,
            destination: destPlace.coordinates,
          });
          expect(route.totalDistanceMeters).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("createHttpRoutingRepository", () => {
    it("realiza una petición POST al endpoint y devuelve la ruta deserializada", async () => {
      const mockResponse: RouteResponse = {
        id: "route-http-test",
        origin,
        destination,
        totalDistanceMeters: 170,
        estimatedDurationMinutes: 2,
        accessible: true,
        segments: [],
        polyline: [origin, destination],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const repo = createHttpRoutingRepository({
        baseUrl: "https://api.unimovil.ucm.es",
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      const result = await repo.calculateRoute({ origin, destination });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.unimovil.ucm.es/routes/calculate",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin, destination }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("lanza un error de servidor cuando la respuesta HTTP no es ok", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: true,
            code: "NO_ROUTE_FOUND",
            userMessage: "No existe camino",
          }),
      });

      const repo = createHttpRoutingRepository({
        baseUrl: "https://api.unimovil.ucm.es",
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      await expect(
        repo.calculateRoute({ origin, destination }),
      ).rejects.toThrow("No existe camino");
    });
  });

  describe("createOsrmRoutingRepository", () => {
    it("calcula polilínea real siguiendo viales mediante respuesta de OSRM", async () => {
      const mockOsrmData = {
        code: "Ok",
        routes: [
          {
            distance: 520,
            duration: 416,
            geometry: {
              coordinates: [
                [-3.7262, 40.4442],
                [-3.7268, 40.445],
                [-3.7272, 40.4453],
                [-3.7275, 40.4455],
              ],
            },
            legs: [
              {
                steps: [
                  {
                    name: "Avenida Complutense",
                    distance: 300,
                    duration: 240,
                    maneuver: { type: "depart" },
                    geometry: {
                      coordinates: [
                        [-3.7262, 40.4442],
                        [-3.7268, 40.445],
                      ],
                    },
                  },
                  {
                    name: "Plaza de Ramón y Cajal",
                    distance: 220,
                    duration: 176,
                    maneuver: { type: "turn" },
                    geometry: {
                      coordinates: [
                        [-3.7268, 40.445],
                        [-3.7275, 40.4455],
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockOsrmData),
      });

      const { createOsrmRoutingRepository } = await import(
        "../data/repository.js"
      );
      const repo = createOsrmRoutingRepository({
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      const result = await repo.calculateRoute({ origin, destination });

      expect(mockFetch).toHaveBeenCalled();
      expect(result.polyline.length).toBe(4);
      expect(result.polyline[0]).toEqual({ latitude: 40.4442, longitude: -3.7262 });
      expect(result.polyline[3]).toEqual({ latitude: 40.4455, longitude: -3.7275 });
      expect(result.segments.length).toBe(2);
      expect(result.segments[0]?.instruction).toContain("Avenida Complutense");
    });

    it("recurre airosamente al repositorio local si la llamada a OSRM falla", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network timeout"));

      const { createOsrmRoutingRepository } = await import(
        "../data/repository.js"
      );
      const repo = createOsrmRoutingRepository({
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      const result = await repo.calculateRoute({ origin, destination });

      expect(result).toBeDefined();
      expect(result.totalDistanceMeters).toBeGreaterThan(0);
      expect(result.segments.length).toBe(2);
    });

    it("ajusta a caminos y viales con OSRM cuando se solicita ruta accesible PMR garantizando accesibilidad", async () => {
      const mockOsrmData = {
        code: "Ok",
        routes: [
          {
            distance: 450,
            duration: 360,
            geometry: {
              coordinates: [
                [-3.7262, 40.4442],
                [-3.7268, 40.445],
                [-3.7275, 40.4455],
              ],
            },
            legs: [{ steps: [] }],
          },
        ],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockOsrmData),
      });

      const { createOsrmRoutingRepository } = await import(
        "../data/repository.js"
      );
      const repo = createOsrmRoutingRepository({
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      const result = await repo.calculateRoute({
        origin,
        destination,
        accessibleOnly: true,
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result.accessible).toBe(true);
      expect(result.polyline.length).toBe(3);
      expect(result.segments.every((s) => s.isAccessible && !s.hasStairs)).toBe(
        true,
      );
    });
  });
});
