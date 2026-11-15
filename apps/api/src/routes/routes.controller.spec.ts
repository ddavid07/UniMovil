import { describe, expect, it } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { RouteRequest, RoutingErrorResponse } from "@unimovil/contracts";
import { RoutesController } from "./routes.controller.js";
import { RoutesService } from "./routes.service.js";

describe("RoutesController — Pruebas de Integración y Manejo de Errores (HU-094)", () => {
  const service = new RoutesService();
  const controller = new RoutesController(service);

  const coordsMetro = { latitude: 40.4442, longitude: -3.7262 };
  const coordsMedicina = { latitude: 40.4455, longitude: -3.7275 };
  const coordsMirador = { latitude: 40.4485, longitude: -3.7295 };

  it("responde exitosamente a la comprobación de salud GET /routes/health", () => {
    const health = controller.healthCheck();
    expect(health.status).toBe("ok");
    expect(health.campus).toBe("Moncloa");
    expect(health.nodesCount).toBeGreaterThan(5);
    expect(health.edgesCount).toBeGreaterThan(5);
  });

  it("calcula ruta válida a través de POST /routes/calculate", () => {
    const req: RouteRequest = {
      origin: coordsMetro,
      destination: coordsMedicina,
      accessibleOnly: true,
    };

    const res = controller.calculateRoute(req);
    expect(res).toBeDefined();
    expect(res.origin).toEqual(coordsMetro);
    expect(res.destination).toEqual(coordsMedicina);
    expect(res.totalDistanceMeters).toBeGreaterThan(0);
    expect(res.estimatedDurationMinutes).toBeGreaterThanOrEqual(1);
    expect(res.segments.length).toBeGreaterThan(0);
  });

  it("HU-094: mapea puntos idénticos a BadRequestException (HTTP 400) con payload de error", () => {
    const identicalReq: RouteRequest = {
      origin: coordsMetro,
      destination: coordsMetro,
    };

    expect(() => controller.calculateRoute(identicalReq)).toThrow(
      BadRequestException,
    );

    try {
      controller.calculateRoute(identicalReq);
    } catch (e) {
      const badReq = e as BadRequestException;
      const resp = badReq.getResponse() as RoutingErrorResponse;
      expect(badReq.getStatus()).toBe(400);
      expect(resp.error).toBe(true);
      expect(resp.code).toBe("IDENTICAL_POINTS");
      expect(resp.userMessage).toBeTruthy();
      expect(resp.recommendedAction).toBeTruthy();
      expect(resp.retryable).toBe(false);
      expect(resp.timestamp).toBeTruthy();
    }
  });

  it("HU-094: mapea origen fuera de límites a BadRequestException (HTTP 400)", () => {
    const outReq: RouteRequest = {
      origin: { latitude: 40.1, longitude: -3.7 },
      destination: coordsMedicina,
    };

    expect(() => controller.calculateRoute(outReq)).toThrow(
      BadRequestException,
    );
    try {
      controller.calculateRoute(outReq);
    } catch (e) {
      const badReq = e as BadRequestException;
      const resp = badReq.getResponse() as RoutingErrorResponse;
      expect(resp.code).toBe("ORIGIN_OUT_OF_BOUNDS");
    }
  });

  it("HU-094: mapea ruta inaccesible PMR a NotFoundException (HTTP 404) con acción recomendada", () => {
    const pmrReq: RouteRequest = {
      origin: coordsMedicina,
      destination: coordsMirador,
      accessibleOnly: true,
    };

    expect(() => controller.calculateRoute(pmrReq)).toThrow(NotFoundException);
    try {
      controller.calculateRoute(pmrReq);
    } catch (e) {
      const notFound = e as NotFoundException;
      const resp = notFound.getResponse() as RoutingErrorResponse;
      expect(notFound.getStatus()).toBe(404);
      expect(resp.code).toBe("NO_ACCESSIBLE_ROUTE");
      expect(resp.recommendedAction).toContain("PMR");
    }
  });
});
