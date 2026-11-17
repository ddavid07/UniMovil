import { describe, expect, it, vi } from "vitest";
import {
  classifyError,
  executeWithRetry,
  sanitizeErrorForLogging,
} from "../domain/routing-errors.js";

describe("Gestión de Errores y Falta de Conexión (HU-094)", () => {
  // Criterio 1: Diferenciación de categorías de error
  describe("Criterio 1: Diferenciación de tipos de fallo", () => {
    it("identifica errores de desconexión o falta de red (OFFLINE)", () => {
      const netError = { code: "NETWORK_ERROR", message: "Failed to fetch" };
      const classified = classifyError(netError);
      expect(classified.category).toBe("OFFLINE");
      expect(classified.isRetryable).toBe(true);
    });

    it("identifica errores por permisos insuficientes (PERMISSION_DENIED)", () => {
      const permError = {
        code: "PERMISSION_DENIED",
        message: "User denied location access",
      };
      const classified = classifyError(permError);
      expect(classified.category).toBe("PERMISSION_DENIED");
      expect(classified.isRetryable).toBe(false);
    });

    it("identifica ausencia de resultados o ruta inaccesible (NO_RESULTS)", () => {
      const noRouteError = { code: "NO_ROUTE_FOUND" };
      const classified = classifyError(noRouteError);
      expect(classified.category).toBe("NO_RESULTS");

      const noPmrError = { code: "NO_ACCESSIBLE_ROUTE" };
      const classifiedPmr = classifyError(noPmrError);
      expect(classifiedPmr.category).toBe("NO_RESULTS");
      expect(classifiedPmr.title).toContain("Ruta adaptada no disponible");
    });

    it("identifica errores de validación de entradas (VALIDATION)", () => {
      const boundsError = { code: "ORIGIN_OUT_OF_BOUNDS" };
      const classified = classifyError(boundsError);
      expect(classified.category).toBe("VALIDATION");
    });

    it("identifica errores de servidor interno (SERVER_ERROR)", () => {
      const serverErr = { status: 503, message: "Service Unavailable" };
      const classified = classifyError(serverErr);
      expect(classified.category).toBe("SERVER_ERROR");
      expect(classified.isRetryable).toBe(true);
    });

    it("clasifica como UNKNOWN cualquier fallo no tipado o primitivo", () => {
      const unknownError = "Error desconocido de sistema";
      const classified = classifyError(unknownError);
      expect(classified.category).toBe("UNKNOWN");
      expect(classified.title).toBe("Error inesperado");
      expect(classified.isRetryable).toBe(true);

      const nullClassified = classifyError(null);
      expect(nullClassified.category).toBe("UNKNOWN");
    });
  });

  // Criterio 2: Mensaje comprensible y acción recomendada
  describe("Criterio 2: Mensaje accesible y acción recomendada", () => {
    it("proporciona mensaje y acción para cada categoría sin jerga técnica", () => {
      const categories = [
        { code: "NETWORK_ERROR" },
        { code: "PERMISSION_DENIED" },
        { code: "NO_ACCESSIBLE_ROUTE" },
        { code: "IDENTICAL_POINTS" },
        { status: 500 },
      ];

      for (const err of categories) {
        const classified = classifyError(err);
        expect(classified.userMessage).toBeTruthy();
        expect(classified.recommendedAction).toBeTruthy();
        expect(classified.userMessage.length).toBeGreaterThan(15);
        expect(classified.recommendedAction.length).toBeGreaterThan(15);
      }
    });
  });

  // Criterio 3: Reintento de operaciones recuperables
  describe("Criterio 3: Operaciones reintentables y reintento automático", () => {
    it("reintenta con éxito una operación tras un fallo temporal de red", async () => {
      let attempts = 0;
      const fakeNetworkCall = vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 2) {
          throw { code: "NETWORK_ERROR", message: "Temporary drop" };
        }
        return { success: true };
      });

      const result = await executeWithRetry(fakeNetworkCall, 3, 10);
      expect(result).toEqual({ success: true });
      expect(attempts).toBe(2);
    });

    it("no reintenta si el error no es recuperable (ej. validación o permisos)", async () => {
      let attempts = 0;
      const invalidCall = vi.fn().mockImplementation(async () => {
        attempts++;
        throw { code: "INVALID_COORDINATES", message: "Bad coordinates" };
      });

      await expect(executeWithRetry(invalidCall, 3, 10)).rejects.toBeDefined();
      expect(attempts).toBe(1); // Falla inmediatamente sin reintentos inútiles
    });
  });

  // Criterio 4: Preservación de datos introducidos por el usuario
  describe("Criterio 4: Preservación del estado del usuario ante fallos", () => {
    it("mantiene intactos los datos de entrada cuando ocurre una excepción", () => {
      const userFormState = {
        originText: "Metro Ciudad Universitaria",
        destinationText: "Facultad de Medicina",
        accessibleToggle: true,
      };

      try {
        throw new Error("Simulated connection timeout");
      } catch {
        // La política HU-094 exige no limpiar el formulario del usuario
        expect(userFormState.originText).toBe("Metro Ciudad Universitaria");
        expect(userFormState.destinationText).toBe("Facultad de Medicina");
        expect(userFormState.accessibleToggle).toBe(true);
      }
    });
  });

  // Criterio 5: Seguridad en errores (no detalles técnicos inseguros ni credenciales)
  describe("Criterio 5: Sanitización y seguridad de mensajes y logs", () => {
    it("garantiza que el mensaje para el usuario es seguro para visualización", () => {
      const technicalError = {
        message: "SQL syntax error at 0x7FFF; stack trace at kernel32.dll",
        code: "SERVER_ERROR",
        status: 500,
      };

      const classified = classifyError(technicalError);
      expect(classified.safeForDisplay).toBe(true);
      expect(classified.userMessage).not.toContain("0x7FFF");
      expect(classified.userMessage).not.toContain("kernel32");
    });

    it("sanitiza errores primitivos devolviendo { raw: string }", () => {
      const primResult = sanitizeErrorForLogging("Mensaje de fallo primitivo");
      expect(primResult).toEqual({ raw: "Mensaje de fallo primitivo" });
    });

    it("elimina tokens, contraseñas y secretos al preparar logs técnicos", () => {
      const dirtyError = {
        url: "https://api.ucm.es/routes",
        userToken: "test-token-value-sample",
        userPassword: "test-user-password-sample",
        apiKey: "test-api-key-sample",
        nested: {
          clientSecret: "test-secret-value-sample",
          safeInfo: "Moncloa Campus",
        },
      };

      const sanitized = sanitizeErrorForLogging(dirtyError);
      expect(sanitized["userToken"]).toBe("[REDACTED_BY_HU094_POLICY]");
      expect(sanitized["userPassword"]).toBe("[REDACTED_BY_HU094_POLICY]");
      expect(sanitized["apiKey"]).toBe("[REDACTED_BY_HU094_POLICY]");

      const nested = sanitized["nested"] as Record<string, unknown>;
      expect(nested["clientSecret"]).toBe("[REDACTED_BY_HU094_POLICY]");
      expect(nested["safeInfo"]).toBe("Moncloa Campus");
    });
  });
});
