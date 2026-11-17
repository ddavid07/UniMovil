import { describe, expect, it } from "vitest";
import {
  createAuditEntry,
  parseAuditEntry,
  type AuditAction,
  type AuditResource,
} from "./audit.js";

describe("Audit Contracts (HU-097)", () => {
  describe("createAuditEntry", () => {
    it("creates a valid audit entry with default timestamp and id", () => {
      const entry = createAuditEntry({
        resource: "place",
        resourceId: "fac-informatica",
        action: "UPDATE",
        author: "@charliefox06",
        summary: "Updated accessibility ramp information",
      });

      expect(entry.id).toBeDefined();
      expect(entry.resource).toBe("place");
      expect(entry.resourceId).toBe("fac-informatica");
      expect(entry.action).toBe("UPDATE");
      expect(entry.author).toBe("@charliefox06");
      expect(entry.summary).toBe("Updated accessibility ramp information");
      expect(new Date(entry.timestamp).getTime()).not.toBeNaN();
    });

    it("redacts sensitive keys from details to guarantee security and privacy", () => {
      const entry = createAuditEntry({
        resource: "incident",
        resourceId: "inc-101",
        action: "STATUS_CHANGE",
        author: "admin@ucm.es",
        summary: "Resolved incident with technician",
        details: {
          note: "Fixed lock",
          adminPassword: "supersecret123",
          authToken: "example-token",
          safeField: 42,
          nested: {
            apiKey: "nested-secret",
            safeValue: "visible",
          },
          list: [{ refreshToken: "array-secret" }],
        },
      });

      expect(entry.details?.note).toBe("Fixed lock");
      expect(entry.details?.safeField).toBe(42);
      expect(entry.details?.adminPassword).toBe("[REDACTED]");
      expect(entry.details?.authToken).toBe("[REDACTED]");
      expect(entry.details?.nested).toEqual({
        apiKey: "[REDACTED]",
        safeValue: "visible",
      });
      expect(entry.details?.list).toEqual([{ refreshToken: "[REDACTED]" }]);
    });

    it("throws when author is empty", () => {
      expect(() =>
        createAuditEntry({
          resource: "place",
          resourceId: "fac-informatica",
          action: "CREATE",
          author: "   ",
          summary: "test",
        }),
      ).toThrow("Audit author must be a non-empty string");
    });

    it("throws when resourceId is empty", () => {
      expect(() =>
        createAuditEntry({
          resource: "place",
          resourceId: "",
          action: "CREATE",
          author: "@charliefox06",
          summary: "test",
        }),
      ).toThrow("Audit resourceId must be a non-empty string");
    });

    it("throws when summary is empty", () => {
      expect(() =>
        createAuditEntry({
          resource: "place",
          resourceId: "fac-1",
          action: "CREATE",
          author: "@charliefox06",
          summary: "",
        }),
      ).toThrow("Audit summary must be a non-empty string");
    });

    it("throws for invalid resource or action", () => {
      expect(() =>
        createAuditEntry({
          resource: "invalid_res" as unknown as AuditResource,
          resourceId: "fac-1",
          action: "CREATE",
          author: "@charliefox06",
          summary: "test",
        }),
      ).toThrow("Invalid audit resource");

      expect(() =>
        createAuditEntry({
          resource: "place",
          resourceId: "fac-1",
          action: "HACK" as unknown as AuditAction,
          author: "@charliefox06",
          summary: "test",
        }),
      ).toThrow("Invalid audit action");
    });
  });

  describe("parseAuditEntry", () => {
    it("parses a valid audit record correctly", () => {
      const raw = {
        id: "audit-01",
        resource: "incident",
        resourceId: "inc-01",
        action: "STATUS_CHANGE",
        author: "@charliefox06",
        timestamp: "2026-11-16T12:00:00.000Z",
        summary: "Marcada como resuelta",
        details: { status: "resuelta" },
      };

      const parsed = parseAuditEntry(raw);
      expect(parsed).toEqual(raw);
    });

    it("rejects non-object or missing required fields", () => {
      expect(() => parseAuditEntry(null)).toThrow("expected an object");
      expect(() => parseAuditEntry("string")).toThrow("expected an object");

      expect(() => parseAuditEntry({ resource: "place" })).toThrow(
        "id must be a non-empty string",
      );
      expect(() =>
        parseAuditEntry({
          id: "1",
          resource: "bad",
          resourceId: "1",
          action: "CREATE",
          author: "a",
          timestamp: "2026-11-16T12:00:00Z",
          summary: "s",
        }),
      ).toThrow("Invalid audit resource");

      expect(() =>
        parseAuditEntry({
          id: "1",
          resource: "place",
          resourceId: "1",
          action: "CREATE",
          author: "a",
          timestamp: "invalid-date",
          summary: "s",
        }),
      ).toThrow("valid ISO date string");
    });
  });
});
