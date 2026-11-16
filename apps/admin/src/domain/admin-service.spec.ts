import { describe, expect, it } from "vitest";
import {
  filterAuditEntries,
  filterIncidents,
  filterPlaces,
  updateIncidentStatus,
  updatePlaceStatus,
} from "./admin-service.ts";
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_INCIDENTS,
  INITIAL_MANAGED_PLACES,
} from "../data/initial-data.ts";

describe("Admin Service Domain Logic (UCM Tema 3 - Black-Box & White-Box)", () => {
  describe("filterPlaces (HU-070)", () => {
    it("returns all places when filter is empty", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, {});
      expect(result.length).toBe(INITIAL_MANAGED_PLACES.length);
    });

    it("filters places by name query (case-insensitive)", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, { query: "medicina" });
      expect(result.length).toBe(1);
      expect(result[0]?.name).toBe("Facultad de Medicina");
    });

    it("filters places ignoring accents/diacritics (e.g. 'informatica' matches 'Informática', 'odontologia' matches 'Odontología')", () => {
      const resultNoAccents = filterPlaces(INITIAL_MANAGED_PLACES, { query: "informatica" });
      expect(resultNoAccents.length).toBe(1);
      expect(resultNoAccents[0]?.name).toBe("Facultad de Informática");

      const resultOdonto = filterPlaces(INITIAL_MANAGED_PLACES, { query: "odontologia" });
      expect(resultOdonto.length).toBe(1);
      expect(resultOdonto[0]?.name).toBe("Facultad de Odontología");
    });

    it("filters places by alias match", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, { query: "FDI" });
      expect(result.length).toBe(1);
      expect(result[0]?.name).toBe("Facultad de Informática");
    });

    it("filters places by category", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, { category: "transport" });
      expect(result.length).toBe(1);
      expect(result[0]?.name).toContain("Metro");
    });

    it("filters places by accessibility status", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, { accessibility: "limited" });
      expect(result.length).toBe(1);
      expect(result[0]?.name).toBe("Facultad de Odontología");
    });

    it("filters places by operational status", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, { status: "maintenance" });
      expect(result.length).toBe(1);
      expect(result[0]?.name).toBe("Facultad de Odontología");
    });

    it("returns empty array when no places match query boundary", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, { query: "UniversidadDeAlcala" });
      expect(result).toEqual([]);
    });
  });

  describe("updatePlaceStatus (HU-070 / HU-097)", () => {
    it("updates place operational status and generates an audit log entry", () => {
      const { updatedPlaces, auditEntry } = updatePlaceStatus(
        INITIAL_MANAGED_PLACES,
        "osm-way-15431484",
        "maintenance",
        "@charliefox06",
        "Reparación de rampa exterior"
      );

      const target = updatedPlaces.find((p) => p.id === "osm-way-15431484");
      expect(target?.status).toBe("maintenance");
      expect(target?.statusReason).toBe("Reparación de rampa exterior");
      expect(target?.lastModifiedBy).toBe("@charliefox06");
      expect(target?.lastModifiedAt).toBeDefined();

      expect(auditEntry.resource).toBe("place");
      expect(auditEntry.resourceId).toBe("osm-way-15431484");
      expect(auditEntry.action).toBe("STATUS_CHANGE");
      expect(auditEntry.author).toBe("@charliefox06");
      expect(auditEntry.summary).toContain("Medicina");
    });

    it("updates place accessibility (HU-073) and operational status together", () => {
      const { updatedPlaces, auditEntry } = updatePlaceStatus(
        INITIAL_MANAGED_PLACES,
        "osm-way-15431484", // was "yes"
        "maintenance",
        "@charliefox06",
        "Avería en rampa principal",
        "limited"
      );

      const target = updatedPlaces.find((p) => p.id === "osm-way-15431484");
      expect(target?.status).toBe("maintenance");
      expect(target?.accessibility).toBe("limited");
      expect(auditEntry.details?.newAccessibility).toBe("limited");
    });

    it("throws when place id does not exist", () => {
      expect(() =>
        updatePlaceStatus(
          INITIAL_MANAGED_PLACES,
          "non-existent-id",
          "inactive",
          "@charliefox06"
        )
      ).toThrow("Place not found: non-existent-id");
    });
  });

  describe("filterIncidents (HU-050 / HU-054)", () => {
    it("filters incidents by status", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, { status: "en_proceso" });
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("inc-2026-001");
    });

    it("filters incidents by priority", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, { priority: "urgente" });
      expect(result.length).toBe(1);
      expect(result[0]?.title).toContain("Odontología");
    });

    it("filters incidents by category", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, { category: "alumbrado" });
      expect(result.length).toBe(1);
      expect(result[0]?.status).toBe("resuelta");
    });

    it("filters incidents by text query matching location", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, { query: "complutense" });
      expect(result.length).toBe(1);
      expect(result[0]?.locationName).toContain("Complutense");
    });

    it("filters incidents ignoring accents (e.g. 'rampa' or 'jardin' matches 'Jardín')", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, { query: "jardin" });
      expect(result.length).toBe(1);
      expect(result[0]?.title).toContain("Rampa provisional");
    });
  });

  describe("updateIncidentStatus (HU-054 / HU-055 / HU-097)", () => {
    it("successfully performs a valid status transition and emits audit record", () => {
      const { updatedIncidents, auditEntry } = updateIncidentStatus(
        INITIAL_INCIDENTS,
        "inc-2026-002",
        "en_revision",
        "@charliefox06",
        "Revisando con el conserje de Farmacia"
      );

      const target = updatedIncidents.find((i) => i.id === "inc-2026-002");
      expect(target?.status).toBe("en_revision");
      expect(target?.resolutionNote).toBe("Revisando con el conserje de Farmacia");

      expect(auditEntry.resource).toBe("incident");
      expect(auditEntry.resourceId).toBe("inc-2026-002");
      expect(auditEntry.action).toBe("STATUS_CHANGE");
      expect(auditEntry.author).toBe("@charliefox06");
    });

    it("allows reclassifying priority and assigning a technician or department (HU-054)", () => {
      const { updatedIncidents, auditEntry } = updateIncidentStatus(
        INITIAL_INCIDENTS,
        "inc-2026-002",
        "en_revision",
        "@admin.campus",
        "Asignada orden de trabajo urgente a Obras Campus",
        "urgente",
        "Mantenimiento UCM"
      );

      const target = updatedIncidents.find((i) => i.id === "inc-2026-002");
      expect(target?.priority).toBe("urgente");
      expect(target?.assignedTo).toBe("Mantenimiento UCM");
      expect(auditEntry.details?.previousPriority).toBe("alta");
      expect(auditEntry.details?.newPriority).toBe("urgente");
      expect(auditEntry.details?.assignedTo).toBe("Mantenimiento UCM");
    });

    it("throws an error when attempting an invalid status transition", () => {
      expect(() =>
        updateIncidentStatus(
          INITIAL_INCIDENTS,
          "inc-2026-002", // status: "recibida"
          "resuelta", // invalid transition: cannot jump directly from recibida to resuelta
          "@charliefox06"
        )
      ).toThrow('Invalid transition from "recibida" to "resuelta"');
    });

    it("throws when incident id does not exist", () => {
      expect(() =>
        updateIncidentStatus(
          INITIAL_INCIDENTS,
          "fake-incident-999",
          "en_revision",
          "@charliefox06"
        )
      ).toThrow("Incident not found: fake-incident-999");
    });
  });

  describe("filterAuditEntries (HU-097)", () => {
    it("filters audit entries by resource type", () => {
      const result = filterAuditEntries(INITIAL_AUDIT_LOGS, "place");
      expect(result.length).toBe(1);
      expect(result[0]?.resource).toBe("place");
    });

    it("filters audit entries by author query", () => {
      const result = filterAuditEntries(INITIAL_AUDIT_LOGS, "all", "charlie");
      expect(result.length).toBe(INITIAL_AUDIT_LOGS.length);
    });

    it("returns empty when author does not match", () => {
      const result = filterAuditEntries(INITIAL_AUDIT_LOGS, "all", "unknown_user");
      expect(result).toEqual([]);
    });
  });
});
