import { describe, expect, it } from "vitest";
import {
  INCIDENT_STATUSES,
  isValidIncidentTransition,
  parseIncident,
} from "./incidents.js";

describe("Incident Contracts (HU-050 / HU-054 / HU-055)", () => {
  describe("isValidIncidentTransition", () => {
    it("allows transitioning from recibida to en_revision or cerrada", () => {
      expect(isValidIncidentTransition("recibida", "en_revision")).toBe(true);
      expect(isValidIncidentTransition("recibida", "cerrada")).toBe(true);
      expect(isValidIncidentTransition("recibida", "resuelta")).toBe(false);
    });

    it("allows transitioning from en_revision to en_proceso or cerrada", () => {
      expect(isValidIncidentTransition("en_revision", "en_proceso")).toBe(true);
      expect(isValidIncidentTransition("en_revision", "cerrada")).toBe(true);
      expect(isValidIncidentTransition("en_revision", "recibida")).toBe(false);
    });

    it("allows transitioning from en_proceso to resuelta or back to en_revision", () => {
      expect(isValidIncidentTransition("en_proceso", "resuelta")).toBe(true);
      expect(isValidIncidentTransition("en_proceso", "en_revision")).toBe(true);
    });

    it("allows transitioning from resuelta to cerrada or reopening to en_proceso", () => {
      expect(isValidIncidentTransition("resuelta", "cerrada")).toBe(true);
      expect(isValidIncidentTransition("resuelta", "en_proceso")).toBe(true);
    });

    it("allows self transitions (no change)", () => {
      for (const status of INCIDENT_STATUSES) {
        expect(isValidIncidentTransition(status, status)).toBe(true);
      }
    });
  });

  describe("parseIncident", () => {
    const validRaw = {
      id: "inc-2026-001",
      title: "Rampa bloqueada con obras en Facultad de Informática",
      description: "No se puede acceder a la puerta principal con silla de ruedas.",
      category: "rampa",
      priority: "alta",
      status: "recibida",
      locationName: "Facultad de Informática - Entrada Principal",
      coordinates: { latitude: 40.4523, longitude: -3.7335 },
      reportedBy: "estudiante.pmr@ucm.es",
      createdAt: "2026-11-16T10:00:00.000Z",
      updatedAt: "2026-11-16T10:00:00.000Z",
      resolutionNote: undefined,
    };

    it("parses valid incident correctly", () => {
      const parsed = parseIncident(validRaw);
      expect(parsed.id).toBe("inc-2026-001");
      expect(parsed.category).toBe("rampa");
      expect(parsed.priority).toBe("alta");
      expect(parsed.status).toBe("recibida");
      expect(parsed.coordinates?.latitude).toBe(40.4523);
    });

    it("rejects non-object", () => {
      expect(() => parseIncident("invalid")).toThrow("expected an object");
    });

    it("rejects invalid status", () => {
      expect(() =>
        parseIncident({
          ...validRaw,
          status: "inexistente",
        })
      ).toThrow('unknown status "inexistente"');
    });

    it("rejects invalid category", () => {
      expect(() =>
        parseIncident({
          ...validRaw,
          category: "comida",
        })
      ).toThrow('unknown category "comida"');
    });

    it("rejects invalid timestamps", () => {
      expect(() =>
        parseIncident({
          ...validRaw,
          createdAt: "not-a-date",
        })
      ).toThrow("valid ISO date string");
    });
  });
});
