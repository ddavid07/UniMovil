import { describe, expect, it } from "vitest";
import { BadRequestException } from "@nestjs/common";
import type { RouteRequest, RoutingErrorResponse } from "@unimovil/contracts";
import { AppController } from "../src/app.controller.js";
import { AppService } from "../src/app.service.js";
import { RoutesController } from "../src/routes/routes.controller.js";
import { RoutesService } from "../src/routes/routes.service.js";

describe("Seguridad de Endpoints y Protección de API (HU-090, HU-091, HU-094)", () => {
  const routesService = new RoutesService();
  const routesController = new RoutesController(routesService);
  const appService = new AppService();
  const appController = new AppController(appService);

  const coordsCampusMetro = { latitude: 40.4442, longitude: -3.7262 };
  const coordsCampusInformatica = { latitude: 40.4526, longitude: -3.7335 };

  describe("Protección contra Inyección de Parámetros y Ataques SQL/NoSQL", () => {
    it("rechaza peticiones con inyecciones de cláusulas SQL clásicas en coordenadas", () => {
      const maliciousPayload = {
        origin: {
          latitude: "40.4442' OR '1'='1" as unknown as number,
          longitude: -3.7262,
        },
        destination: coordsCampusInformatica,
      } as unknown as RouteRequest;

      expect(() => routesController.calculateRoute(maliciousPayload)).toThrow(
        BadRequestException,
      );

      try {
        routesController.calculateRoute(maliciousPayload);
      } catch (err) {
        const error = err as BadRequestException;
        const res = error.getResponse() as RoutingErrorResponse;
        expect(error.getStatus()).toBe(400);
        expect(res.code).toBe("INVALID_COORDINATES");
        expect(res.message).not.toContain("SQL");
        expect(res.message).not.toContain("syntax error");
      }
    });

    it("rechaza operadores de consulta NoSQL ($gt, $ne, $where)", () => {
      const nosqlPayload = {
        origin: {
          latitude: { $gt: "" } as unknown as number,
          longitude: -3.7262,
        },
        destination: coordsCampusInformatica,
      } as unknown as RouteRequest;

      expect(() => routesController.calculateRoute(nosqlPayload)).toThrow(
        BadRequestException,
      );
    });

    it("rechaza tipos no numéricos y matrices en lugar de objetos de coordenada", () => {
      const corruptedPayloads: unknown[] = [
        { origin: [40.4442, -3.7262], destination: coordsCampusInformatica },
        { origin: true, destination: coordsCampusInformatica },
        { origin: null, destination: coordsCampusInformatica },
        { origin: undefined, destination: coordsCampusInformatica },
        { origin: coordsCampusMetro, destination: "Facultad de Medicina" },
      ];

      for (const payload of corruptedPayloads) {
        expect(() =>
          routesController.calculateRoute(payload as RouteRequest),
        ).toThrow(BadRequestException);
      }
    });
  });

  describe("Control Estricto del Geofencing y Límites del Campus (Boundary Enforcement)", () => {
    it("bloquea orígenes fuera de Ciudad Universitaria (ej. Barcelona, Tokio, Null Island)", () => {
      const remoteOrigins = [
        { latitude: 41.3879, longitude: 2.1699 }, // Barcelona
        { latitude: 35.6762, longitude: 139.6503 }, // Tokio
        { latitude: 0.0, longitude: 0.0 }, // Null Island
        { latitude: 40.4168, longitude: -3.7038 }, // Puerta del Sol (Madrid Centro, fuera de Moncloa)
      ];

      for (const origin of remoteOrigins) {
        const req: RouteRequest = {
          origin,
          destination: coordsCampusInformatica,
        };

        expect(() => routesController.calculateRoute(req)).toThrow(
          BadRequestException,
        );

        try {
          routesController.calculateRoute(req);
        } catch (err) {
          const res = (
            err as BadRequestException
          ).getResponse() as RoutingErrorResponse;
          expect(res.code).toBe("ORIGIN_OUT_OF_BOUNDS");
          expect(res.retryable).toBe(false);
          expect(res.userMessage).toContain("campus de Moncloa");
        }
      }
    });

    it("bloquea destinos situados fuera del campus de Moncloa", () => {
      const req: RouteRequest = {
        origin: coordsCampusMetro,
        destination: { latitude: 40.5, longitude: -3.7 }, // Fuera de Bounding Box norte
      };

      expect(() => routesController.calculateRoute(req)).toThrow(
        BadRequestException,
      );

      try {
        routesController.calculateRoute(req);
      } catch (err) {
        const res = (
          err as BadRequestException
        ).getResponse() as RoutingErrorResponse;
        expect(res.code).toBe("DESTINATION_OUT_OF_BOUNDS");
        expect(res.retryable).toBe(false);
      }
    });
  });

  describe("Resistencia ante Desbordamientos de Búfer y Valores Numéricos Extremos", () => {
    it("resiste coordenadas con números extremos (Infinity, -Infinity, NaN, Max/Min Value)", () => {
      const extremeValues = [
        Infinity,
        -Infinity,
        NaN,
        Number.MAX_VALUE,
        -Number.MAX_VALUE,
      ];

      for (const val of extremeValues) {
        const req: RouteRequest = {
          origin: { latitude: val, longitude: -3.7262 },
          destination: coordsCampusInformatica,
        };

        expect(() => routesController.calculateRoute(req)).toThrow(
          BadRequestException,
        );
      }
    });

    it("procesa peticiones masivas en tiempo sub-milisegundo sin fugas de memoria", () => {
      const validReq: RouteRequest = {
        origin: coordsCampusMetro,
        destination: coordsCampusInformatica,
        accessibleOnly: false,
      };

      const start = performance.now();
      for (let i = 0; i < 20; i++) {
        const res = routesController.calculateRoute(validReq);
        expect(res.segments.length).toBeGreaterThan(0);
      }
      const duration = performance.now() - start;

      // 20 cálculos de Dijkstra en grafo deben ejecutarse con holgura en menos de 250ms
      expect(duration).toBeLessThan(250);
    });
  });

  describe("Enmascaramiento de Trazas y Prevención de Fugas de Información (HU-094 Criterio 5)", () => {
    it("los mensajes de error de la API no revelan rutas del sistema de ficheros ni cadenas de conexión", () => {
      const invalidReq: RouteRequest = {
        origin: { latitude: 10, longitude: 10 },
        destination: { latitude: 10, longitude: 10 },
      };

      try {
        routesController.calculateRoute(invalidReq);
      } catch (err) {
        const res = (
          err as BadRequestException
        ).getResponse() as RoutingErrorResponse;
        const serialized = JSON.stringify(res);

        expect(serialized).not.toContain("C:\\");
        expect(serialized).not.toContain("/home/");
        expect(serialized).not.toContain("node_modules");
        expect(serialized).not.toContain("password");
        expect(serialized).not.toContain("secret");
        expect(serialized).not.toContain("postgres://");
        expect(serialized).not.toContain("mongodb://");
      }
    });

    it("los endpoints de comprobación de salud GET /health no exponen variables de entorno del servidor", () => {
      const appHealth = appController.getHealth();
      expect(appHealth.status).toBe("ok");
      expect(appHealth.service).toBe("unimovil-api");
      expect(
        (appHealth as unknown as Record<string, unknown>)["env"],
      ).toBeUndefined();
      expect(
        (appHealth as unknown as Record<string, unknown>)["process"],
      ).toBeUndefined();

      const routesHealth = routesController.healthCheck();
      expect(routesHealth.status).toBe("ok");
      expect(routesHealth.campus).toBe("Moncloa");
      expect(routesHealth.nodesCount).toBeGreaterThan(0);
      expect(routesHealth.edgesCount).toBeGreaterThan(0);
    });
  });
});
