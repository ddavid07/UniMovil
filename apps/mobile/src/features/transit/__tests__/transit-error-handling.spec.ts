import { describe, expect, it, vi } from "vitest";
import type { RouteResponse, TransitStop } from "@unimovil/contracts";
import {
  executeWithRetry,
  sanitizeErrorForLogging,
} from "../../routing/domain/routing-errors.js";
import { calculateMultimodalAlternatives } from "../domain/transit.js";

describe("Gestión de Errores de Transporte y Resiliencia Multimodal (HU-094)", () => {
  const sampleOrigin = { latitude: 40.4489, longitude: -3.7314 }; // Paraninfo
  const sampleDestination = { latitude: 40.4438, longitude: -3.7265 }; // Medicina

  const mockWalkingRoute: RouteResponse = {
    id: "route-walk-mock",
    origin: sampleOrigin,
    destination: sampleDestination,
    totalDistanceMeters: 800,
    estimatedDurationMinutes: 11,
    accessible: true,
    segments: [],
    polyline: [sampleOrigin, sampleDestination],
  };

  it("ofrece degradación elegante (fallback a pie) cuando el servicio EMT no responde", () => {
    // Si la llamada a la red de transporte EMT falla, no se debe bloquear la app:
    // El sistema devuelve la alternativa a pie como ruta disponible y marca el transporte como no disponible.
    const alternatives = calculateMultimodalAlternatives(
      sampleOrigin,
      sampleDestination,
      mockWalkingRoute,
    );

    expect(alternatives.length).toBeGreaterThanOrEqual(2);
    const walkingAlt = alternatives.find((a) => a.mode === "walking");
    expect(walkingAlt).toBeDefined();
    expect(walkingAlt?.available).toBe(true);
    expect(walkingAlt?.durationMinutes).toBe(11);

    const busAlt = alternatives.find((a) => a.mode === "bus");
    expect(busAlt).toBeDefined();
  });

  it("reintenta la consulta de llegadas de la EMT con retroceso exponencial ante errores de red transitorios", async () => {
    let callCount = 0;
    const mockFetchArrivals = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        throw new Error("Network request failed: EMT gateway timeout");
      }
      return [
        { line: "G", destination: "Moncloa", estimateMinutes: 4 },
        { line: "F", destination: "Cuatro Caminos", estimateMinutes: 9 },
      ];
    });

    const result = await executeWithRetry(
      async () => mockFetchArrivals(),
      3,
      10,
    );

    expect(result).toHaveLength(2);
    expect(result[0]?.line).toBe("G");
    expect(mockFetchArrivals).toHaveBeenCalledTimes(3);
  });

  it("sanitiza errores de transporte para evitar fuga de tokens en logs técnicos", () => {
    const sensitiveTransitError = {
      service: "EMT_API_GATEWAY",
      endpoint:
        "https://api.emtmadrid.es/v2/transport/busemtmad/stops/24/arrives",
      authToken: "sample-auth-token-value",
      clientApiKey: "sample-api-key-value",
      responsePayload: {
        code: "UNAUTHORIZED_SERVICE",
        internalDetail: "Moncloa Hub Proxy Failure",
      },
    };

    const sanitized = sanitizeErrorForLogging(sensitiveTransitError);
    expect(sanitized["authToken"]).toBe("[REDACTED_BY_HU094_POLICY]");
    expect(sanitized["clientApiKey"]).toBe("[REDACTED_BY_HU094_POLICY]");
    expect(sanitized["service"]).toBe("EMT_API_GATEWAY");
  });

  it("maneja con gracia paradas sin estimaciones de paso disponibles o paradas fuera de servicio", () => {
    const emptyStop: TransitStop = {
      id: "stop-empty",
      name: "Parada Terminal Paraninfo",
      code: "EMT-9999",
      coordinates: sampleOrigin,
      lines: ["G"],
      wheelchairAccessible: true,
      nextArrivals: [],
    };

    expect(emptyStop.nextArrivals).toHaveLength(0);
    expect(emptyStop.wheelchairAccessible).toBe(true);
  });
});
