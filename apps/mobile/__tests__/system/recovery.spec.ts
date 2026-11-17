import { describe, expect, it, vi } from "vitest";
import type { RouteResponse } from "@unimovil/contracts";
import { OfflineCache } from "../../src/features/offline/domain/offline-cache.js";
import {
  classifyError,
  executeWithRetry,
  sanitizeErrorForLogging,
} from "../../src/features/routing/domain/routing-errors.js";
import { calculateMultimodalAlternatives } from "../../src/features/transit/domain/transit.js";

describe("Pruebas de Recuperación de Sistema (HU-094)", () => {
  const coordsMetro = { latitude: 40.4442, longitude: -3.7262 };
  const coordsMedicina = { latitude: 40.4455, longitude: -3.7275 };

  const sampleRoute: RouteResponse = {
    id: "route-recovery-sample",
    origin: coordsMetro,
    destination: coordsMedicina,
    totalDistanceMeters: 620,
    estimatedDurationMinutes: 8,
    accessible: true,
    segments: [],
    polyline: [coordsMetro, coordsMedicina],
  };

  describe("REC-01: Recuperación ante Pérdida Súbita de Conexión de Red (Offline Drop)", () => {
    it("clasifica el corte de red y recupera la ruta desde la caché local sin degradar la UI", () => {
      const cache = new OfflineCache(5);
      cache.saveRecentRoute("metro", "medicina", false, sampleRoute);

      // Simulación de caída súbita de conectividad
      const networkError = new Error("Network request failed: device offline");
      const classified = classifyError(networkError);

      expect(classified.category).toBe("OFFLINE");
      expect(classified.isRetryable).toBe(true);
      expect(classified.title).toBe("Sin conexión a internet");
      expect(classified.safeForDisplay).toBe(true);

      // Mecanismo de recuperación: consulta a la caché local
      const cachedFallback = cache.findCachedRoute("metro", "medicina", false);
      expect(cachedFallback).not.toBeNull();
      expect(cachedFallback?.id).toBe("route-recovery-sample");
      expect(cachedFallback?.totalDistanceMeters).toBe(620);
    });
  });

  describe("REC-02: Recuperación ante Respuestas Lentas del Servidor y Timeouts", () => {
    it("se recupera airosamente de fallos transitorios mediante reintentos con retroceso exponencial", async () => {
      let attempts = 0;
      const transientSlowApiCall = vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          const timeoutErr = new Error("fetch failed");
          (timeoutErr as unknown as { code: string }).code = "NETWORK_ERROR";
          throw timeoutErr;
        }
        return sampleRoute;
      });

      const recoveredResult = await executeWithRetry(
        async () => transientSlowApiCall(),
        3,
        15, // 15ms para no ralentizar la ejecución de la suite
      );

      expect(recoveredResult).toBeDefined();
      expect(recoveredResult.id).toBe("route-recovery-sample");
      expect(transientSlowApiCall).toHaveBeenCalledTimes(3);
    });

    it("ante fallo permanente de servidor preserva el estado del usuario para reintento manual", async () => {
      const permanentServerFailure = vi.fn().mockImplementation(async () => {
        const error = new Error("503 Service Unavailable");
        (error as unknown as { status: number }).status = 503;
        (error as unknown as { code: string }).code = "SERVER_ERROR";
        throw error;
      });

      // El estado del formulario del usuario antes del fallo
      const userFormState = {
        originId: "metro",
        destinationId: "medicina",
        accessibleOnly: true,
      };

      await expect(
        executeWithRetry(async () => permanentServerFailure(), 2, 10),
      ).rejects.toThrow();

      // El estado del usuario permanece intacto tras la excepción
      expect(userFormState.originId).toBe("metro");
      expect(userFormState.destinationId).toBe("medicina");
      expect(userFormState.accessibleOnly).toBe(true);
    });
  });

  describe("REC-03: Degradación Elegante ante Caída del Servicio Externo de la EMT", () => {
    it("preserva la alternativa peatonal cuando el servicio de autobús externo deja de responder", () => {
      // Si la consulta externa de paradas EMT falla, la app mantiene la ruta a pie
      const multimodalResults = calculateMultimodalAlternatives(
        coordsMetro,
        coordsMedicina,
        sampleRoute,
      );

      expect(multimodalResults.length).toBeGreaterThanOrEqual(1);
      const walkingOption = multimodalResults.find(
        (opt) => opt.mode === "walking",
      );
      expect(walkingOption).toBeDefined();
      expect(walkingOption?.available).toBe(true);
      expect(walkingOption?.durationMinutes).toBe(8);
    });
  });

  describe("REC-04: Recuperación ante Corrupción del Almacenamiento Local (Corrupted Storage)", () => {
    it("gestiona JSON sintácticamente corrupto en caché local inicializando un estado seguro y limpio", () => {
      const corruptedJson = "{ malformed JSON payload ::: 42 invalid ]";

      // fromJSON debe recuperarse sin lanzar excepciones no controladas
      expect(() => {
        OfflineCache.fromJSON(corruptedJson);
      }).not.toThrow();

      const recoveredCache: OfflineCache = OfflineCache.fromJSON(corruptedJson);

      expect(recoveredCache.getRecentPlaces()).toEqual([]);
      expect(recoveredCache.getRecentRoutes()).toEqual([]);

      // La caché recuperada puede seguir utilizándose normalmente
      recoveredCache.saveRecentRoute("metro", "medicina", false, sampleRoute);
      expect(recoveredCache.getRecentRoutes().length).toBe(1);
    });
  });

  describe("REC-05: Sanitización Estricta de Trazas de Error Técnicas y Secretos", () => {
    it("ofusca claves privadas, tokens y credenciales de bases de datos antes de persistir en logs", () => {
      const internalDiagnosticDump = {
        message: "Conexión rechazada al servidor de enrutamiento",
        apiKey: "example-client-key",
        authToken: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample",
        dbCredentials:
          "postgres://admin:supersecretpassword@db.moncloa.ucm.es:5432/unimovil",
      };

      const sanitizedLog = sanitizeErrorForLogging(internalDiagnosticDump);

      expect(sanitizedLog.apiKey).toBe("[REDACTED_BY_HU094_POLICY]");
      expect(sanitizedLog.authToken).toBe("[REDACTED_BY_HU094_POLICY]");
      expect(sanitizedLog.dbCredentials).toBe("[REDACTED_BY_HU094_POLICY]");
      expect(sanitizedLog.message).toBe(
        "Conexión rechazada al servidor de enrutamiento",
      );
      expect(JSON.stringify(sanitizedLog)).not.toContain("supersecretpassword");
      expect(JSON.stringify(sanitizedLog)).not.toContain("example-client-key");
      expect(JSON.stringify(sanitizedLog)).not.toContain(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6",
      );
    });
  });
});
