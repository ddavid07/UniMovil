import { describe, expect, it } from "vitest";
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

  describe("filterPlaces (HU-070 / HU-071)", () => {
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

    it("filters places ignoring accents/diacritics (e.g. 'informatica' matches 'Informática')", () => {
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

    it("filters places by category (HU-071)", () => {
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
        "@pablopr06",
        "Reparación de rampa exterior",
      );

      const target = updatedPlaces.find((p) => p.id === "osm-way-15431484");
      expect(target?.status).toBe("maintenance");
      expect(target?.statusReason).toBe("Reparación de rampa exterior");
      expect(target?.lastModifiedBy).toBe("@pablopr06");
      expect(target?.lastModifiedAt).toBeDefined();

      expect(auditEntry.resource).toBe("place");
      expect(auditEntry.resourceId).toBe("osm-way-15431484");
      expect(auditEntry.action).toBe("STATUS_CHANGE");
      expect(auditEntry.author).toBe("@pablopr06");
      expect(auditEntry.summary).toContain("Medicina");
    });

    it("updates place accessibility alongside status", () => {
      const { updatedPlaces, auditEntry } = updatePlaceStatus(
        INITIAL_MANAGED_PLACES,
        "osm-way-15431484",
        "active",
        "@pablopr06",
        "Rampa reparada y verificada",
        "yes",
      );

      const target = updatedPlaces.find((p) => p.id === "osm-way-15431484");
      expect(target?.accessibility).toBe("yes");
      expect(auditEntry.details?.newAccessibility).toBe("yes");
    });

    it("throws an error when placeId does not exist", () => {
      expect(() =>
        updatePlaceStatus(
          INITIAL_MANAGED_PLACES,
          "non-existent-id",
          "active",
          "@pablopr06",
        ),
      ).toThrow("Place not found: non-existent-id");
    });
  });

  describe("filterIncidents", () => {
    it("returns all incidents when filter is empty", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, {});
      expect(result.length).toBe(INITIAL_INCIDENTS.length);
    });

    it("filters incidents by status", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, {
        status: "resuelta",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("inc-2026-003");
    });

    it("filters incidents by severity", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, {
        severity: "media",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("inc-2026-003");
    });

    it("filters incidents by type", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, {
        type: "rampa_averiada",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("inc-2026-001");
    });

    it("filters incidents by query in title or description", () => {
      const result = filterIncidents(INITIAL_INCIDENTS, {
        query: "zanja",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("inc-2026-002");
    });
  });

  describe("updateIncidentStatus", () => {
    it("updates incident status on a valid transition and generates audit entry", () => {
      const { updatedIncidents, auditEntry } = updateIncidentStatus(
        INITIAL_INCIDENTS,
        "inc-2026-002",
        "en_curso",
        "@pablopr06",
        "Señalización instalada",
      );

      const target = updatedIncidents.find((i) => i.id === "inc-2026-002");
      expect(target?.status).toBe("en_curso");
      expect(target?.updatedAt).toBeDefined();

      expect(auditEntry.resource).toBe("incident");
      expect(auditEntry.resourceId).toBe("inc-2026-002");
      expect(auditEntry.author).toBe("@pablopr06");
      expect(auditEntry.details?.newStatus).toBe("en_curso");
    });

    it("sets resolvedAt when transitioning to 'resuelta'", () => {
      const { updatedIncidents } = updateIncidentStatus(
        INITIAL_INCIDENTS,
        "inc-2026-002",
        "resuelta",
        "@pablopr06",
      );

      const target = updatedIncidents.find((i) => i.id === "inc-2026-002");
      expect(target?.status).toBe("resuelta");
      expect(target?.resolvedAt).toBeDefined();
    });

    it("throws when transitioning to an invalid next status", () => {
      expect(() =>
        updateIncidentStatus(
          INITIAL_INCIDENTS,
          "inc-2026-003", // already "resuelta"
          "reportada", // invalid transition from resuelta
          "@pablopr06",
        ),
      ).toThrow("Invalid incident transition from resuelta to reportada");
    });

    it("throws when incident does not exist", () => {
      expect(() =>
        updateIncidentStatus(
          INITIAL_INCIDENTS,
          "non-existent-inc",
          "en_curso",
          "@pablopr06",
        ),
      ).toThrow("Incident not found: non-existent-inc");
    });
  });

  describe("filterAuditEntries (HU-097)", () => {
    const mockLogs = [
      {
        id: "a-1",
        resource: "place" as const,
        resourceId: "p-1",
        action: "STATUS_CHANGE" as const,
        author: "@admin.campus",
        timestamp: "2026-11-16T12:00:00Z",
        summary: "Updated place",
      },
      {
        id: "a-2",
        resource: "incident" as const,
        resourceId: "i-1",
        action: "STATUS_CHANGE" as const,
        author: "@pablopr06",
        timestamp: "2026-11-16T13:00:00Z",
        summary: "Updated incident",
      },
    ];

    it("returns all entries when resource is 'all' and query is empty", () => {
      expect(filterAuditEntries(mockLogs, "all")).toHaveLength(2);
    });

    it("filters by resource", () => {
      const res = filterAuditEntries(mockLogs, "place");
      expect(res).toHaveLength(1);
      expect(res[0]?.id).toBe("a-1");
    });

    it("filters by author query", () => {
      const res = filterAuditEntries(mockLogs, "all", "pablo");
      expect(res).toHaveLength(1);
      expect(res[0]?.author).toBe("@pablopr06");
    });
  });

  describe("filterAnnouncements (HU-057)", () => {
    it("returns all announcements when filter is empty", () => {
      const result = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {});
      expect(result.length).toBe(INITIAL_ANNOUNCEMENTS.length);
    });

    it("filters announcements by query match in title", () => {
      const result = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {
        query: "tunel",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("ann-2026-001");
    });

    it("filters announcements by query match in description", () => {
      const result = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {
        query: "drenaje",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("ann-2026-001");
    });

    it("filters announcements by priority", () => {
      const result = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {
        priority: "urgente",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("ann-2026-001");
    });

    it("filters announcements by scope", () => {
      const result = filterAnnouncements(INITIAL_ANNOUNCEMENTS, {
        scope: "transit",
      });
      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe("ann-2026-002");
    });
  });

  describe("createAnnouncement (HU-057)", () => {
    it("creates a new published announcement and records an audit log", () => {
      const { updatedAnnouncements, auditEntry } = createAnnouncement(
        INITIAL_ANNOUNCEMENTS,
        {
          title: "Corte imprevisto de pasarela en Paraninfo",
          description: "Trabajos de emergencia en la estructura de la pasarela.",
          priority: "urgente",
          scope: "campus",
          targetLocation: "Pasarela Paraninfo Norte",
          status: "published",
          publishedBy: "@pablopr06",
        },
        "@pablopr06",
      );

      expect(updatedAnnouncements.length).toBe(
        INITIAL_ANNOUNCEMENTS.length + 1,
      );
      const created = updatedAnnouncements[0];
      expect(created?.title).toBe(
        "Corte imprevisto de pasarela en Paraninfo",
      );
      expect(created?.priority).toBe("urgente");
      expect(created?.publishedBy).toBe("@pablopr06");

      expect(auditEntry.resource).toBe("announcement");
      expect(auditEntry.action).toBe("CREATE");
      expect(auditEntry.author).toBe("@pablopr06");
      expect(auditEntry.summary).toContain("Corte imprevisto de pasarela");
    });

    it("throws an error when title is empty or whitespace", () => {
      expect(() =>
        createAnnouncement(
          INITIAL_ANNOUNCEMENTS,
          {
            title: "   ",
            description: "Descripción válida",
            priority: "alta",
            scope: "campus",
            status: "published",
            publishedBy: "@pablopr06",
          },
          "@pablopr06",
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
            publishedBy: "@pablopr06",
          },
          "@pablopr06",
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
        "@pablopr06",
        "Obras finalizadas antes de lo previsto",
      );

      const target = updatedAnnouncements.find((a) => a.id === "ann-2026-001");
      expect(target?.status).toBe("archived");

      expect(auditEntry.resource).toBe("announcement");
      expect(auditEntry.resourceId).toBe("ann-2026-001");
      expect(auditEntry.action).toBe("STATUS_CHANGE");
      expect(auditEntry.author).toBe("@pablopr06");
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
        "@pablopr06",
      );

      expect(() =>
        archiveAnnouncement(
          updatedAnnouncements,
          "ann-2026-001",
          "@pablopr06",
        ),
      ).toThrow("Announcement already archived: ann-2026-001");
    });

    it("throws an error when announcement does not exist", () => {
      expect(() =>
        archiveAnnouncement(
          INITIAL_ANNOUNCEMENTS,
          "non-existent-announcement",
          "@pablopr06",
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
          publishedBy: "@pablopr06",
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
          publishedBy: "@pablopr06",
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
          publishedBy: "@pablopr06",
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
          publishedBy: "@pablopr06",
          createdAt: "2026-11-16T08:00:00.000Z",
          expiresAt: "2026-11-30T12:00:00.000Z",
        },
        referenceDate,
      );
      expect(active).toBe(false);
    });
  });
});
