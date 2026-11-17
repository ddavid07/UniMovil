import { describe, expect, it } from "vitest";
import { CAMPUS_BOUNDS, validateIncidentReport } from "@unimovil/contracts";

describe("Pruebas de Caja Negra: Particiones Equivalentes y Valores Límite (Incidencias)", () => {
  const validCampusCoords = { latitude: 40.449, longitude: -3.728 };

  describe("1. Clases de Equivalencia Válidas (CE-V)", () => {
    it("[CE-V1] Acepta título con caracteres acentuados y longitud estándar", () => {
      const input = {
        title: "Reparación de alcantarillado en vial principal",
        description: "Operarios trabajando en zanja de canalización.",
        type: "obra",
        severity: "media",
        coordinates: validCampusCoords,
      };

      const result = validateIncidentReport(input);
      expect(result.isValid).toBe(true);
      expect(result.data?.title).toBe(
        "Reparación de alcantarillado en vial principal",
      );
    });

    it("[CE-V2] Acepta todos los tipos de incidencia contemplados en el dominio", () => {
      const types = [
        "obra",
        "desvio",
        "rampa_averiada",
        "acera_cortada",
        "obstaculo_temporal",
      ] as const;

      for (const incidentType of types) {
        const input = {
          title: `Incidencia de prueba ${incidentType}`,
          description: "Descripción detallada dentro del rango permitido.",
          type: incidentType,
          severity: "baja",
          coordinates: validCampusCoords,
        };
        const result = validateIncidentReport(input);
        expect(result.isValid).toBe(true);
        expect(result.data?.type).toBe(incidentType);
      }
    });

    it("[CE-V3] Acepta todas las severidades válidas", () => {
      const severities = ["baja", "media", "alta", "critica"] as const;

      for (const sev of severities) {
        const input = {
          title: "Incidencia con severidad válida",
          description: "Descripción detallada de la prueba de severidad.",
          type: "desvio",
          severity: sev,
          coordinates: validCampusCoords,
        };
        const result = validateIncidentReport(input);
        expect(result.isValid).toBe(true);
        expect(result.data?.severity).toBe(sev);
      }
    });

    it("[CE-V4] Acepta coordenadas interiores al campus de Moncloa", () => {
      const interiorCoords = [
        { latitude: 40.442, longitude: -3.73 }, // Sur-Oeste
        { latitude: 40.455, longitude: -3.72 }, // Norte-Este
        { latitude: 40.448, longitude: -3.725 }, // Centro Ciudad Universitaria
      ];

      for (const coords of interiorCoords) {
        const input = {
          title: "Ubicación interior campus",
          description: "Prueba de coordenada geográfica interna.",
          type: "obstaculo_temporal",
          severity: "media",
          coordinates: coords,
        };
        const result = validateIncidentReport(input);
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe("2. Clases de Equivalencia No Válidas (CE-NV)", () => {
    it("[CE-NV1] Rechaza título vacío o constituido únicamente por espacios en blanco", () => {
      const input = {
        title: "    ",
        description: "Descripción de prueba para título vacío.",
        type: "obra",
        severity: "media",
        coordinates: validCampusCoords,
      };
      const result = validateIncidentReport(input);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === "ERR_TITLE_REQUIRED")).toBe(
        true,
      );
    });

    it("[CE-NV2] Rechaza textos que contienen scripts maliciosos o secuencias XSS", () => {
      const dangerousInputs = [
        "<script>fetch('https://malicious.org')</script>",
        "javascript:alert(1)",
        "<iframe src='evil.com'></iframe>",
      ];

      for (const badText of dangerousInputs) {
        const input = {
          title: badText,
          description: "Descripción normal.",
          type: "obra",
          severity: "alta",
          coordinates: validCampusCoords,
        };
        const result = validateIncidentReport(input);
        expect(result.isValid).toBe(false);
        expect(
          result.errors.some((e) => e.code === "ERR_TITLE_INVALID_CHARS"),
        ).toBe(true);
      }
    });

    it("[CE-NV3] Rechaza tipos de incidencia no contemplados en el dominio", () => {
      const input = {
        title: "Incidencia con tipo desconocido",
        description: "Descripción adecuada.",
        type: "bache_autopista",
        severity: "baja",
        coordinates: validCampusCoords,
      };
      const result = validateIncidentReport(input);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === "ERR_TYPE_INVALID")).toBe(
        true,
      );
    });

    it("[CE-NV4] Rechaza severidades no admitidas", () => {
      const input = {
        title: "Incidencia con severidad inválida",
        description: "Descripción adecuada.",
        type: "obra",
        severity: "urgente_inmediata",
        coordinates: validCampusCoords,
      };
      const result = validateIncidentReport(input);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === "ERR_SEVERITY_INVALID")).toBe(
        true,
      );
    });

    it("[CE-NV5] Rechaza coordenadas manifiestamente externas al campus de Moncloa", () => {
      const outsideCoords = [
        { latitude: 40.4168, longitude: -3.7038 }, // Puerta del Sol (Madrid centro)
        { latitude: 41.3879, longitude: 2.16992 }, // Barcelona
        { latitude: 0, longitude: 0 }, // Isla Null
      ];

      for (const coords of outsideCoords) {
        const input = {
          title: "Incidencia lejana",
          description: "Prueba de coordenada geográfica externa.",
          type: "obra",
          severity: "media",
          coordinates: coords,
        };
        const result = validateIncidentReport(input);
        expect(result.isValid).toBe(false);
        expect(
          result.errors.some((e) => e.code === "ERR_COORDINATES_OUT_OF_CAMPUS"),
        ).toBe(true);
      }
    });

    it("[CE-NV6] Rechaza coordenadas nulas, incompletas o que contienen NaN", () => {
      const invalidCoords = [
        { latitude: NaN, longitude: -3.725 },
        { latitude: 40.445, longitude: undefined },
        null,
      ];

      for (const coords of invalidCoords) {
        const input = {
          title: "Incidencia con coordenadas corruptas",
          description: "Descripción adecuada.",
          type: "obra",
          severity: "media",
          coordinates: coords,
        };
        const result = validateIncidentReport(input);
        expect(result.isValid).toBe(false);
      }
    });
  });

  describe("3. Análisis de Valores Límite (VL)", () => {
    it("[VL1/VL2] Longitud de título en frontera inferior (longitud 2 es inválida, 3 es válida)", () => {
      const boundaryLen2 = {
        title: "AB",
        description: "Descripción válida para la prueba.",
        type: "desvio",
        severity: "baja",
        coordinates: validCampusCoords,
      };
      expect(validateIncidentReport(boundaryLen2).isValid).toBe(false);

      const boundaryLen3 = {
        title: "ABC",
        description: "Descripción válida para la prueba.",
        type: "desvio",
        severity: "baja",
        coordinates: validCampusCoords,
      };
      expect(validateIncidentReport(boundaryLen3).isValid).toBe(true);
    });

    it("[VL3/VL4] Longitud de título en frontera superior (longitud 80 es válida, 81 es inválida)", () => {
      const boundaryLen80 = {
        title: "T".repeat(80),
        description: "Descripción válida para la prueba.",
        type: "desvio",
        severity: "baja",
        coordinates: validCampusCoords,
      };
      expect(validateIncidentReport(boundaryLen80).isValid).toBe(true);

      const boundaryLen81 = {
        title: "T".repeat(81),
        description: "Descripción válida para la prueba.",
        type: "desvio",
        severity: "baja",
        coordinates: validCampusCoords,
      };
      expect(validateIncidentReport(boundaryLen81).isValid).toBe(false);
    });

    it("[VL5/VL6] Longitud de descripción en fronteras (4 inválida, 5 válida, 500 válida, 501 inválida)", () => {
      const desc4 = {
        title: "Título de prueba",
        description: "1234",
        type: "obra",
        severity: "media",
        coordinates: validCampusCoords,
      };
      expect(validateIncidentReport(desc4).isValid).toBe(false);

      const desc5 = {
        title: "Título de prueba",
        description: "12345",
        type: "obra",
        severity: "media",
        coordinates: validCampusCoords,
      };
      expect(validateIncidentReport(desc5).isValid).toBe(true);

      const desc500 = {
        title: "Título de prueba",
        description: "D".repeat(500),
        type: "obra",
        severity: "media",
        coordinates: validCampusCoords,
      };
      expect(validateIncidentReport(desc500).isValid).toBe(true);

      const desc501 = {
        title: "Título de prueba",
        description: "D".repeat(501),
        type: "obra",
        severity: "media",
        coordinates: validCampusCoords,
      };
      expect(validateIncidentReport(desc501).isValid).toBe(false);
    });

    it("[VL7/VL8] Coordenadas geográficas en el límite exacto del bounding box de Moncloa", () => {
      // Bounding box definido: lat [40.440, 40.460], lng [-3.738, -3.715]
      const exactSouthWest = {
        latitude: CAMPUS_BOUNDS.minLatitude,
        longitude: CAMPUS_BOUNDS.minLongitude,
      };
      const reportSW = {
        title: "Vértice Suroeste Moncloa",
        description: "Incidencia en el límite suroeste.",
        type: "obra",
        severity: "baja",
        coordinates: exactSouthWest,
      };
      expect(validateIncidentReport(reportSW).isValid).toBe(true);

      const justBeyondSouth = {
        latitude: CAMPUS_BOUNDS.minLatitude - 0.0001,
        longitude: CAMPUS_BOUNDS.minLongitude,
      };
      const reportJustBeyond = {
        title: "Punto fuera por 10 metros",
        description: "Incidencia exterior inmediata.",
        type: "obra",
        severity: "baja",
        coordinates: justBeyondSouth,
      };
      expect(validateIncidentReport(reportJustBeyond).isValid).toBe(false);
    });
  });
});
