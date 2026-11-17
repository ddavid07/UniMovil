import { describe, expect, it } from "vitest";
import type { AuditEntry } from "@unimovil/contracts";
import {
  archiveAnnouncement,
  createAnnouncement,
  filterAnnouncements,
  filterAuditEntries,
  filterIncidents,
  filterPlaces,
  isAnnouncementActive,
  normalizeText,
  updateIncidentStatus,
  updatePlaceStatus,
} from "./admin-service.ts";
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_INCIDENTS,
  INITIAL_MANAGED_PLACES,
} from "../data/initial-data.ts";

describe("Admin Service Domain Logic (UCM Tema 3 - Black-Box & White-Box)", () => {
  describe("normalizeText (Equivalence Partitioning & Diacritics - Tema 3)", () => {
    it("removes Spanish diacritics and converts to lowercase", () => {
      expect(normalizeText("Árbol")).toBe("arbol");
      expect(normalizeText("Éxito")).toBe("exito");
      expect(normalizeText("Índice")).toBe("indice");
      expect(normalizeText("Ópera")).toBe("opera");
      expect(normalizeText("Único")).toBe("unico");
      expect(normalizeText("Informática")).toBe("informatica");
      expect(normalizeText("Odontología")).toBe("odontologia");
    });

    it("handles strings with multiple consecutive spaces and trims edges", () => {
      expect(normalizeText("   Facultad    de Medicina   ")).toBe(
        "facultad    de medicina",
      );
    });

    it("handles empty string gracefully", () => {
      expect(normalizeText("")).toBe("");
      expect(normalizeText("   ")).toBe("");
    });
  });

  describe("filterPlaces (HU-070)", () => {
    it("returns all places when filter is empty", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, {});
      expect(result.length).toBe(INITIAL_MANAGED_PLACES.length);
    });

    it("filters places by name query (case-insensitive)", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, {
        query: "medicina",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.name).toBe("Facultad de Medicina");
    });

    it("filters places ignoring accents/diacritics (e.g. 'informatica' matches 'Informática', 'odontologia' matches 'Odontología')", () => {
      const resultNoAccents = filterPlaces(INITIAL_MANAGED_PLACES, {
        query: "informatica",
      });
      expect(resultNoAccents.length).toBe(1);
      expect(resultNoAccents[0]?.name).toBe("Facultad de Informática");

      const resultOdonto = filterPlaces(INITIAL_MANAGED_PLACES, {
        query: "odontologia",
      });
      expect(resultOdonto.length).toBe(1);
      expect(resultOdonto[0]?.name).toBe("Facultad de Odontología");
    });

    it("filters places by alias match", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, { query: "FDI" });
      expect(result.length).toBe(1);
      expect(result[0]?.name).toBe("Facultad de Informática");
    });

    it("filters places by category", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, {
        category: "transport",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.name).toContain("Metro");
    });

    it("filters places by accessibility status", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, {
        accessibility: "limited",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.name).toBe("Facultad de Odontología");
    });

    it("filters places by operational status", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, {
        status: "maintenance",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.name).toBe("Facultad de Odontología");
    });

    it("returns empty array when no places match query boundary", () => {
      const result = filterPlaces(INITIAL_MANAGED_PLACES, {
        query: "UniversidadDeAlcala",
      });
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
        "Reparación de rampa exterior",
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
        "limited",
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
          "@charliefox06",
        ),
      ).toThrow("Place not found: non-existent-id");
    });
  });

  describe("filterIncidents (HU-050 / HU-054)", () => {
    it("filters incidents by status", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, {
        status: "en_proceso",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("inc-2026-001");
    });

    it("filters incidents by priority", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, {
        priority: "urgente",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.title).toContain("Odontología");
    });

    it("filters incidents by category", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, {
        category: "alumbrado",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.status).toBe("resuelta");
    });

    it("filters incidents by text query matching location", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, {
        query: "complutense",
      });
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
        "Revisando con el conserje de Farmacia",
      );

      const target = updatedIncidents.find((i) => i.id === "inc-2026-002");
      expect(target?.status).toBe("en_revision");
      expect(target?.resolutionNote).toBe(
        "Revisando con el conserje de Farmacia",
      );

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
        "Mantenimiento UCM",
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
          "@charliefox06",
        ),
      ).toThrow('Invalid transition from "recibida" to "resuelta"');
    });

    it("throws when incident id does not exist", () => {
      expect(() =>
        updateIncidentStatus(
          INITIAL_INCIDENTS,
          "fake-incident-999",
          "en_revision",
          "@charliefox06",
        ),
      ).toThrow("Incident not found: fake-incident-999");
    });

    it("allows transitioning from en_proceso to resuelta with resolution note", () => {
      const { updatedIncidents, auditEntry } = updateIncidentStatus(
        INITIAL_INCIDENTS,
        "inc-2026-001", // status: "en_proceso"
        "resuelta",
        "@admin.campus",
        "Rampa provisional habilitada y señalizada",
      );

      const target = updatedIncidents.find((i) => i.id === "inc-2026-001");
      expect(target?.status).toBe("resuelta");
      expect(target?.resolutionNote).toBe(
        "Rampa provisional habilitada y señalizada",
      );
      expect(auditEntry.details?.previousStatus).toBe("en_proceso");
      expect(auditEntry.details?.newStatus).toBe("resuelta");
    });

    it("allows reopening an incident from resuelta to en_proceso when problem persists", () => {
      const { updatedIncidents, auditEntry } = updateIncidentStatus(
        INITIAL_INCIDENTS,
        "inc-2026-004", // status: "resuelta"
        "en_proceso",
        "@admin.campus",
        "Reabierta: la farola vuelve a parpadear tras la lluvia",
      );

      const target = updatedIncidents.find((i) => i.id === "inc-2026-004");
      expect(target?.status).toBe("en_proceso");
      expect(auditEntry.details?.previousStatus).toBe("resuelta");
      expect(auditEntry.details?.newStatus).toBe("en_proceso");
    });

    it("clears assignedTo when empty string is passed", () => {
      const { updatedIncidents } = updateIncidentStatus(
        INITIAL_INCIDENTS,
        "inc-2026-001",
        "en_proceso",
        "@admin.campus",
        "Desasignado para reasignación",
        undefined,
        "   ",
      );

      const target = updatedIncidents.find((i) => i.id === "inc-2026-001");
      expect(target?.assignedTo).toBeUndefined();
    });
  });

  describe("filterAuditEntries (HU-097)", () => {
    const TEST_AUDIT_LOGS: readonly AuditEntry[] = [
      {
        id: "test-001",
        resource: "place",
        resourceId: "osm-way-1",
        action: "STATUS_CHANGE",
        author: "@charliefox06",
        timestamp: "2026-11-16T10:00:00.000Z",
        summary: "Cambio lugar",
      },
      {
        id: "test-002",
        resource: "incident",
        resourceId: "inc-1",
        action: "STATUS_CHANGE",
        author: "@charliefox06",
        timestamp: "2026-11-16T11:00:00.000Z",
        summary: "Cambio incidencia",
      },
      {
        id: "test-003",
        resource: "place",
        resourceId: "osm-way-2",
        action: "STATUS_CHANGE",
        author: "@admin.campus",
        timestamp: "2026-11-16T12:00:00.000Z",
        summary: "Cambio accesibilidad",
      },
    ];

    it("filters audit entries by resource type", () => {
      const result = filterAuditEntries(TEST_AUDIT_LOGS, "place");
      expect(result.length).toBe(2);
      expect(result.every((r) => r.resource === "place")).toBe(true);
    });

    it("filters audit entries by author query", () => {
      const result = filterAuditEntries(TEST_AUDIT_LOGS, "all", "charlie");
      expect(result.length).toBe(2);
      expect(result.every((r) => r.author.includes("charlie"))).toBe(true);
    });

    it("returns empty when author does not match", () => {
      const result = filterAuditEntries(TEST_AUDIT_LOGS, "all", "unknown_user");
      expect(result).toEqual([]);
    });
  });

  describe("filterAnnouncements (HU-057 / HU-058)", () => {
    it("returns all announcements when filter is empty", () => {
      const result = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {});
      expect(result.length).toBe(INITIAL_ANNOUNCEMENTS.length);
    });

    it("filters announcements by query ignoring accents (e.g. 'tunel' matches 'túnel')", () => {
      const result = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {
        query: "tunel",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.title).toContain("túnel");
    });

    it("filters announcements by priority and scope", () => {
      const result = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {
        priority: "alta",
        scope: "transit",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.title).toContain("Línea G");
    });

    it("filters announcements by status (published vs archived)", () => {
      const published = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {
        status: "published",
      });
      expect(published.length).toBe(INITIAL_ANNOUNCEMENTS.length);

      const archived = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {
        status: "archived",
      });
      expect(archived.length).toBe(0);
    });

    it("filters announcements combining status, priority, and text search", () => {
      const combined = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {
        status: "published",
        priority: "alta",
        query: "refuerzo",
      });
      expect(combined.length).toBe(1);
      expect(combined[0]?.id).toBe("ann-2026-002");
    });
  });

  describe("createAnnouncement (HU-057)", () => {
    it("creates a new announcement and emits an audit record", () => {
      const { updatedAnnouncements, auditEntry } = createAnnouncement(
        INITIAL_ANNOUNCEMENTS,
        {
          title: "Cierre temporal de acceso este por graduación",
          description: "Se reservará el acceso este para comitiva académica.",
          priority: "alta",
          scope: "building",
          targetLocation: "Facultad de Informática",
          status: "published",
          publishedBy: "@admin.campus",
          expiresAt: "2026-11-25T20:00:00.000Z",
        },
        "@admin.campus",
      );

      expect(updatedAnnouncements.length).toBe(
        INITIAL_ANNOUNCEMENTS.length + 1,
      );
      expect(updatedAnnouncements[0]?.title).toBe(
        "Cierre temporal de acceso este por graduación",
      );
      expect(auditEntry.resource).toBe("announcement");
      expect(auditEntry.action).toBe("CREATE");
      expect(auditEntry.author).toBe("@admin.campus");
    });

    it("throws an error when title is empty", () => {
      expect(() =>
        createAnnouncement(
          INITIAL_ANNOUNCEMENTS,
          {
            title: "   ",
            description: "Descripción válida",
            priority: "alta",
            scope: "campus",
            status: "published",
            publishedBy: "@admin.campus",
          },
          "@admin.campus",
        ),
      ).toThrow("El título del aviso no puede estar vacío");
    });

    it("throws an error when description is empty or whitespace", () => {
      expect(() =>
        createAnnouncement(
          INITIAL_ANNOUNCEMENTS,
          {
            title: "Aviso válido",
            description: "   ",
            priority: "alta",
            scope: "campus",
            status: "published",
            publishedBy: "@admin.campus",
          },
          "@admin.campus",
        ),
      ).toThrow("La descripción del aviso no puede estar vacía");
    });

    it("throws an error when author is empty or whitespace", () => {
      expect(() =>
        createAnnouncement(
          INITIAL_ANNOUNCEMENTS,
          {
            title: "Aviso con autor vacío",
            description: "Descripción válida",
            priority: "informativa",
            scope: "campus",
            status: "published",
            publishedBy: "",
          },
          "   ",
        ),
      ).toThrow("El autor del aviso no puede estar vacío");
    });
  });

  describe("archiveAnnouncement (HU-057 / HU-097)", () => {
    it("archives an active announcement and generates an audit record", () => {
      const { updatedAnnouncements, auditEntry } = archiveAnnouncement(
        INITIAL_ANNOUNCEMENTS,
        "ann-2026-001",
        "@admin.campus",
        "Obras finalizadas antes de lo previsto",
      );

      const target = updatedAnnouncements.find((a) => a.id === "ann-2026-001");
      expect(target?.status).toBe("archived");

      expect(auditEntry.resource).toBe("announcement");
      expect(auditEntry.resourceId).toBe("ann-2026-001");
      expect(auditEntry.action).toBe("STATUS_CHANGE");
      expect(auditEntry.author).toBe("@admin.campus");
      expect(auditEntry.details?.previousStatus).toBe("published");
      expect(auditEntry.details?.newStatus).toBe("archived");
      expect(auditEntry.details?.reason).toBe(
        "Obras finalizadas antes de lo previsto",
      );
    });

    it("throws an error when announcement is already archived", () => {
      const { updatedAnnouncements } = archiveAnnouncement(
        INITIAL_ANNOUNCEMENTS,
        "ann-2026-001",
        "@admin.campus",
      );

      expect(() =>
        archiveAnnouncement(
          updatedAnnouncements,
          "ann-2026-001",
          "@admin.campus",
        ),
      ).toThrow("Announcement already archived: ann-2026-001");
    });

    it("throws an error when announcement does not exist", () => {
      expect(() =>
        archiveAnnouncement(
          INITIAL_ANNOUNCEMENTS,
          "non-existent-announcement",
          "@admin.campus",
        ),
      ).toThrow("Announcement not found: non-existent-announcement");
    });
  });

  describe("isAnnouncementActive (HU-057 / HU-058)", () => {
    const referenceDate = new Date("2026-11-16T12:00:00.000Z");

    it("returns true for a published announcement with future expiration", () => {
      const active = isAnnouncementActive(
        {
          id: "ann-test-1",
          title: "Aviso activo",
          description: "Desc",
          priority: "alta",
          scope: "campus",
          status: "published",
          publishedBy: "@admin.campus",
          createdAt: "2026-11-16T08:00:00.000Z",
          expiresAt: "2026-11-20T12:00:00.000Z",
        },
        referenceDate,
      );
      expect(active).toBe(true);
    });

    it("returns true for a published announcement without expiration date", () => {
      const active = isAnnouncementActive(
        {
          id: "ann-test-2",
          title: "Aviso indefinido",
          description: "Desc",
          priority: "informativa",
          scope: "campus",
          status: "published",
          publishedBy: "@admin.campus",
          createdAt: "2026-11-16T08:00:00.000Z",
        },
        referenceDate,
      );
      expect(active).toBe(true);
    });

    it("returns false for an expired announcement", () => {
      const active = isAnnouncementActive(
        {
          id: "ann-test-3",
          title: "Aviso caducado",
          description: "Desc",
          priority: "alta",
          scope: "campus",
          status: "published",
          publishedBy: "@admin.campus",
          createdAt: "2026-11-10T08:00:00.000Z",
          expiresAt: "2026-11-15T12:00:00.000Z",
        },
        referenceDate,
      );
      expect(active).toBe(false);
    });

    it("returns false for an archived announcement even if expiration is in the future", () => {
      const active = isAnnouncementActive(
        {
          id: "ann-test-4",
          title: "Aviso archivado",
          description: "Desc",
          priority: "alta",
          scope: "campus",
          status: "archived",
          publishedBy: "@admin.campus",
          createdAt: "2026-11-16T08:00:00.000Z",
          expiresAt: "2026-11-30T12:00:00.000Z",
        },
        referenceDate,
      );
      expect(active).toBe(false);
    });
  });
});
