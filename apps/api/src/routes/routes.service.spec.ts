import { describe, expect, it } from "vitest";
import { CAMPUS_BOUNDS, type RouteRequest } from "@unimovil/contracts";
import { RoutesService, RoutingServiceException } from "./routes.service.js";

describe("RoutesService — Batería de Pruebas Unitarias (Tema 3)", () => {
  const service = new RoutesService();

  // Coordenadas conocidas del campus de Moncloa
  const coordsMetro = { latitude: 40.4442, longitude: -3.7262 };
  const coordsMedicina = { latitude: 40.4455, longitude: -3.7275 };
  const coordsEstudiantes = { latitude: 40.446, longitude: -3.725 };
  const coordsDerecho = { latitude: 40.4502, longitude: -3.731 };
  const coordsFilosofia = { latitude: 40.4515, longitude: -3.7325 };
  const coordsMiradorInaccesible = { latitude: 40.4485, longitude: -3.7295 };

  // =========================================================================
  // 1. PRUEBAS DE CAJA BLANCA (Método del Camino Básico y Complejidad de McCabe)
  // =========================================================================
  describe("1. Pruebas de Caja Blanca — Camino Básico y Complejidad Ciclomática V(G)", () => {
    /**
     * Complejidad ciclomática del método calculateRoute:
     * V(G) = P + 1 = 6 predicados + 1 = 7 caminos independientes
     * V(G) = Aristas - Nodos + 2 = 7
     */

    // Camino 1: Predicado 1 es FALSO -> Coordenadas inválidas (INVALID_COORDINATES)
    it("Camino Independiente 1: Lanza INVALID_COORDINATES si las coordenadas son nulas o NaN", () => {
      const invalidRequest: RouteRequest = {
        origin: { latitude: NaN, longitude: -3.7262 },
        destination: coordsMedicina,
      };

      expect(() => service.calculateRoute(invalidRequest)).toThrow(
        RoutingServiceException,
      );
      try {
        service.calculateRoute(invalidRequest);
      } catch (e) {
        const err = e as RoutingServiceException;
        expect(err.code).toBe("INVALID_COORDINATES");
        expect(err.retryable).toBe(false);
      }
    });

    // Camino 2: Predicado 2 es FALSO -> Origen fuera de límites (ORIGIN_OUT_OF_BOUNDS)
    it("Camino Independiente 2: Lanza ORIGIN_OUT_OF_BOUNDS si el origen está fuera de Moncloa", () => {
      const outOfBoundsOrigin: RouteRequest = {
        origin: { latitude: 40.41, longitude: -3.7 }, // Centro de Madrid / Gran Vía
        destination: coordsMedicina,
      };

      expect(() => service.calculateRoute(outOfBoundsOrigin)).toThrow(
        RoutingServiceException,
      );
      try {
        service.calculateRoute(outOfBoundsOrigin);
      } catch (e) {
        const err = e as RoutingServiceException;
        expect(err.code).toBe("ORIGIN_OUT_OF_BOUNDS");
      }
    });

    // Camino 3: Predicado 3 es FALSO -> Destino fuera de límites (DESTINATION_OUT_OF_BOUNDS)
    it("Camino Independiente 3: Lanza DESTINATION_OUT_OF_BOUNDS si el destino está fuera de Moncloa", () => {
      const outOfBoundsDest: RouteRequest = {
        origin: coordsMetro,
        destination: { latitude: 40.5, longitude: -3.65 }, // Chamartín
      };

      expect(() => service.calculateRoute(outOfBoundsDest)).toThrow(
        RoutingServiceException,
      );
      try {
        service.calculateRoute(outOfBoundsDest);
      } catch (e) {
        const err = e as RoutingServiceException;
        expect(err.code).toBe("DESTINATION_OUT_OF_BOUNDS");
      }
    });

    // Camino 4: Predicado 4 es VERDADERO -> Puntos idénticos (IDENTICAL_POINTS)
    it("Camino Independiente 4: Lanza IDENTICAL_POINTS si origen y destino son el mismo punto", () => {
      const identicalRequest: RouteRequest = {
        origin: coordsMetro,
        destination: { latitude: 40.4442, longitude: -3.7262 },
      };

      expect(() => service.calculateRoute(identicalRequest)).toThrow(
        RoutingServiceException,
      );
      try {
        service.calculateRoute(identicalRequest);
      } catch (e) {
        const err = e as RoutingServiceException;
        expect(err.code).toBe("IDENTICAL_POINTS");
      }
    });

    // Camino 5: Predicado 5 es VERDADERO y Predicado 6 es FALSO -> Sin camino accesible para PMR (NO_ACCESSIBLE_ROUTE)
    it("Camino Independiente 5: Lanza NO_ACCESSIBLE_ROUTE si existe ruta a pie pero no adaptada a PMR", () => {
      const pmrImpossibleRequest: RouteRequest = {
        origin: coordsMedicina,
        destination: coordsMiradorInaccesible,
        accessibleOnly: true,
      };

      expect(() => service.calculateRoute(pmrImpossibleRequest)).toThrow(
        RoutingServiceException,
      );
      try {
        service.calculateRoute(pmrImpossibleRequest);
      } catch (e) {
        const err = e as RoutingServiceException;
        expect(err.code).toBe("NO_ACCESSIBLE_ROUTE");
        expect(err.userMessage).toContain("barreras arquitectónicas");
      }
    });

    // Camino 6: Cálculo exitoso con desvío adaptado por rampa homologada (accessibleOnly = true)
    it("Camino Independiente 6: Calcula ruta accesible rodeando escaleras por rampa suave", () => {
      const accessibleRequest: RouteRequest = {
        origin: coordsMetro,
        destination: coordsMedicina,
        accessibleOnly: true,
      };

      const result = service.calculateRoute(accessibleRequest);
      expect(result).toBeDefined();
      expect(result.accessible).toBe(true);

      // Debe usar el nodo rampa y evitar la escalinata
      const usedStairs = result.segments.some((s) => s.hasStairs && !s.hasRamp);
      expect(usedStairs).toBe(false);

      const usedRamp = result.segments.some((s) => s.hasRamp);
      expect(usedRamp).toBe(true);
      expect(result.totalDistanceMeters).toBeGreaterThan(0);
      expect(result.estimatedDurationMinutes).toBeGreaterThanOrEqual(1);
    });

    // Camino 7: Cálculo estándar exitoso por el camino más directo con escaleras (accessibleOnly = false)
    it("Camino Independiente 7: Calcula ruta peatonal más rápida permitiendo escaleras", () => {
      const standardRequest: RouteRequest = {
        origin: coordsMetro,
        destination: coordsMedicina,
        accessibleOnly: false,
      };

      const result = service.calculateRoute(standardRequest);
      expect(result).toBeDefined();
      expect(result.accessible).toBe(false);

      // Por escalinata es más directo (170 m vs 240 m por rampa)
      const usedStairs = result.segments.some((s) => s.hasStairs);
      expect(usedStairs).toBe(true);
      expect(result.totalDistanceMeters).toBeLessThan(200);
    });

    // Prueba de estructura de control: Bucles de Dijkstra (Prueba de Bucles)
    it("Prueba de bucles: resuelve correctamente rutas multietapa con múltiples iteraciones del grafo", () => {
      const multiHopRequest: RouteRequest = {
        origin: coordsMetro,
        destination: coordsFilosofia, // Recorre Metro -> Farmacia -> Derecho -> Filosofía
        accessibleOnly: false,
      };

      const result = service.calculateRoute(multiHopRequest);
      expect(result.segments.length).toBeGreaterThanOrEqual(3);
      expect(result.polyline.length).toBeGreaterThan(3);
      expect(result.estimatedDurationMinutes).toBeGreaterThanOrEqual(5);
    });

    it("resuelve ruta directa cuando los puntos difieren > 5m pero caen en el mismo nodo más cercano", () => {
      const closePointsRequest: RouteRequest = {
        origin: { latitude: 40.4442, longitude: -3.7262 }, // Metro
        destination: { latitude: 40.44428, longitude: -3.72628 }, // ~12 metros del Metro
      };

      const result = service.calculateRoute(closePointsRequest);
      expect(result).toBeDefined();
      expect(result.segments).toHaveLength(0);
      expect(result.totalDistanceMeters).toBeGreaterThan(5);
      expect(result.estimatedDurationMinutes).toBe(1);
    });

    it("lanza NO_ROUTE_FOUND si no existe conexión en el grafo", () => {
      // Mock de runDijkstra retornando null
      const serviceAny = service as unknown as {
        runDijkstra: () => null;
      };
      const origRun = serviceAny.runDijkstra;
      serviceAny.runDijkstra = () => null;

      try {
        expect(() =>
          service.calculateRoute({
            origin: coordsMetro,
            destination: coordsFilosofia,
            accessibleOnly: false,
          }),
        ).toThrowError(/No existe ningún itinerario/);
      } finally {
        serviceAny.runDijkstra = origRun;
      }
    });
  });

  // =========================================================================
  // 2. PRUEBAS DE CAJA NEGRA (Partición Equivalente y Valores Límite)
  // =========================================================================
  describe("2. Pruebas de Caja Negra — Partición Equivalente y Valores Límite", () => {
    // Clases de Equivalencia Válidas (CE-V)
    describe("Partición Equivalente: Clases Válidas (CE-V)", () => {
      it("CE-V1: Ruta directa peatonal llana sin escaleras (Metro -> Estudiantes)", () => {
        const req: RouteRequest = {
          origin: coordsMetro,
          destination: coordsEstudiantes,
          accessibleOnly: true,
        };
        const res = service.calculateRoute(req);
        expect(res.totalDistanceMeters).toBeGreaterThan(150);
        expect(res.segments.every((s) => !s.hasStairs)).toBe(true);
      });

      it("CE-V2: Ruta con escaleras permitidas (Metro -> Mirador Inaccesible con PMR=false)", () => {
        const req: RouteRequest = {
          origin: coordsMedicina,
          destination: coordsMiradorInaccesible,
          accessibleOnly: false,
        };
        const res = service.calculateRoute(req);
        expect(res.segments.some((s) => s.hasStairs)).toBe(true);
      });

      it("CE-V3: Ruta con indicación paso a paso comprensible (HU-023)", () => {
        const req: RouteRequest = {
          origin: coordsMetro,
          destination: coordsDerecho,
        };
        const res = service.calculateRoute(req);
        expect(res.segments.length).toBeGreaterThan(0);
        res.segments.forEach((seg) => {
          expect(seg.instruction).toBeTruthy();
          expect(typeof seg.instruction).toBe("string");
          expect(seg.durationSeconds).toBeGreaterThan(0);
        });
      });
    });

    // Clases de Equivalencia No Válidas (CE-NV) conforme a HU-094
    describe("Partición Equivalente: Clases No Válidas (CE-NV)", () => {
      it("CE-NV1: Coordenadas indefinidas o con campos faltantes", () => {
        // @ts-expect-error probando entrada inválida
        expect(() => service.calculateRoute({})).toThrow(
          RoutingServiceException,
        );
      });

      it("CE-NV2: Coordenadas de origen fuera del campus norte", () => {
        const req: RouteRequest = {
          origin: { latitude: 40.48, longitude: -3.725 },
          destination: coordsMedicina,
        };
        expect(() => service.calculateRoute(req)).toThrowError(
          /fuera de los límites/,
        );
      });

      it("CE-NV3: Coordenadas de destino fuera del campus sur", () => {
        const req: RouteRequest = {
          origin: coordsMetro,
          destination: { latitude: 40.42, longitude: -3.725 },
        };
        expect(() => service.calculateRoute(req)).toThrowError(
          /fuera de los límites/,
        );
      });

      it("CE-NV4: Distancia entre origen y destino menor al umbral de 5 metros", () => {
        const req: RouteRequest = {
          origin: { latitude: 40.4442, longitude: -3.7262 },
          destination: { latitude: 40.444201, longitude: -3.726201 }, // ~1 metro
        };
        expect(() => service.calculateRoute(req)).toThrowError(/mismo punto/i);
      });
    });

    // Análisis de Valores Límite (VL)
    describe("Análisis de Valores Límite (VL)", () => {
      it("VL-1: Coordenadas en la frontera exacta del Bounding Box (Límite Válido)", () => {
        const originExactBorder = {
          latitude: CAMPUS_BOUNDS.minLatitude,
          longitude: CAMPUS_BOUNDS.minLongitude,
        };
        const destExactBorder = {
          latitude: CAMPUS_BOUNDS.maxLatitude,
          longitude: CAMPUS_BOUNDS.maxLongitude,
        };

        const res = service.calculateRoute({
          origin: originExactBorder,
          destination: destExactBorder,
        });

        expect(res).toBeDefined();
        expect(res.totalDistanceMeters).toBeGreaterThan(500);
      });

      it("VL-2: Coordenadas a 0.0001 grados por fuera del límite (Límite Inválido)", () => {
        const justOutsideOrigin = {
          latitude: CAMPUS_BOUNDS.minLatitude - 0.0001,
          longitude: -3.7262,
        };

        expect(() =>
          service.calculateRoute({
            origin: justOutsideOrigin,
            destination: coordsMedicina,
          }),
        ).toThrow(RoutingServiceException);
      });

      it("VL-3: Cálculo de distancia euclídea/haversine exacta entre puntos de prueba", () => {
        const dZero = service.haversineDistanceMeters(coordsMetro, coordsMetro);
        expect(dZero).toBe(0);

        const dReal = service.haversineDistanceMeters(
          coordsMetro,
          coordsMedicina,
        );
        expect(dReal).toBeGreaterThan(100);
        expect(dReal).toBeLessThan(300);
      });
    });
  });
});
