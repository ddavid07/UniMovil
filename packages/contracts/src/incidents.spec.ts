import { describe, expect, it } from "vitest";
import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  INCIDENT_TYPES,
  validateIncidentReport,
} from "./incidents.js";

describe("Contratos de Incidencias (packages/contracts)", () => {
  const validCoords = { latitude: 40.45, longitude: -3.725 };

  it("exporta los dominios de valores válidos para tipos, severidades y estados", () => {
    expect(INCIDENT_TYPES).toContain("obra");
    expect(INCIDENT_TYPES).toContain("rampa_averiada");
    expect(INCIDENT_SEVERITIES).toContain("critica");
    expect(INCIDENT_STATUSES).toContain("en_curso");
  });

  it("acepta un reporte de incidencia perfectamente válido dentro del campus", () => {
    const input = {
      title: "Obras en vial de acceso a Medicina",
      description:
        "Acera levantada y zanja señalizada por canalizaciones eléctricas.",
      type: "obra",
      severity: "alta",
      coordinates: validCoords,
    };

    const result = validateIncidentReport(input);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toBeDefined();
    expect(result.data?.title).toBe("Obras en vial de acceso a Medicina");
    expect(result.data?.reportedAt).toBeDefined();
  });

  it("rechaza entradas que no son objetos o son nulas", () => {
    expect(validateIncidentReport(null).isValid).toBe(false);
    expect(validateIncidentReport("string").isValid).toBe(false);
    expect(validateIncidentReport(undefined).isValid).toBe(false);
  });

  it("valida longitudes límite de título (mínimo 3, máximo 80)", () => {
    const shortTitle = {
      title: "Ab",
      description: "Descripción válida para el reporte.",
      type: "desvio",
      severity: "baja",
      coordinates: validCoords,
    };
    const resShort = validateIncidentReport(shortTitle);
    expect(resShort.isValid).toBe(false);
    expect(resShort.errors.some((e) => e.code === "ERR_TITLE_TOO_SHORT")).toBe(
      true,
    );

    const longTitle = {
      title: "A".repeat(81),
      description: "Descripción válida para el reporte.",
      type: "desvio",
      severity: "baja",
      coordinates: validCoords,
    };
    const resLong = validateIncidentReport(longTitle);
    expect(resLong.isValid).toBe(false);
    expect(resLong.errors.some((e) => e.code === "ERR_TITLE_TOO_LONG")).toBe(
      true,
    );
  });

  it("valida campos de descripción (requerida, longitud y patrones)", () => {
    const emptyDesc = {
      title: "Título válido",
      description: "   ",
      type: "obra",
      severity: "media",
      coordinates: validCoords,
    };
    expect(
      validateIncidentReport(emptyDesc).errors.some(
        (e) => e.code === "ERR_DESCRIPTION_REQUIRED",
      ),
    ).toBe(true);

    const shortDesc = {
      title: "Título válido",
      description: "Hola",
      type: "obra",
      severity: "media",
      coordinates: validCoords,
    };
    expect(
      validateIncidentReport(shortDesc).errors.some(
        (e) => e.code === "ERR_DESCRIPTION_TOO_SHORT",
      ),
    ).toBe(true);

    const longDesc = {
      title: "Título válido",
      description: "A".repeat(501),
      type: "obra",
      severity: "media",
      coordinates: validCoords,
    };
    expect(
      validateIncidentReport(longDesc).errors.some(
        (e) => e.code === "ERR_DESCRIPTION_TOO_LONG",
      ),
    ).toBe(true);

    const xssDesc = {
      title: "Título válido",
      description: "Descripción con iframe <iframe src='evil.com'></iframe>",
      type: "obra",
      severity: "media",
      coordinates: validCoords,
    };
    expect(
      validateIncidentReport(xssDesc).errors.some(
        (e) => e.code === "ERR_TITLE_INVALID_CHARS",
      ),
    ).toBe(true);
  });

  it("valida severidades y ausencia de coordenadas", () => {
    const badSeverity = {
      title: "Título válido",
      description: "Descripción válida.",
      type: "obra",
      severity: "inexistente",
      coordinates: validCoords,
    };
    expect(
      validateIncidentReport(badSeverity).errors.some(
        (e) => e.code === "ERR_SEVERITY_INVALID",
      ),
    ).toBe(true);

    const missingCoords = {
      title: "Título válido",
      description: "Descripción válida.",
      type: "obra",
      severity: "alta",
    };
    expect(
      validateIncidentReport(missingCoords).errors.some(
        (e) => e.code === "ERR_COORDINATES_REQUIRED",
      ),
    ).toBe(true);
  });

  it("rechaza secuencias potencialmente maliciosas o scripts", () => {
    const xssInput = {
      title: "Aviso <script>alert('hack')</script>",
      description: "Texto con intento de inyección javascript:alert(1)",
      type: "obra",
      severity: "media",
      coordinates: validCoords,
    };
    const result = validateIncidentReport(xssInput);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.code === "ERR_TITLE_INVALID_CHARS"),
    ).toBe(true);
  });

  it("rechaza coordenadas fuera del perímetro de Moncloa", () => {
    const outOfBoundsInput = {
      title: "Incidencia en el centro de Madrid",
      description: "Obras frente a la Puerta del Sol.",
      type: "obra",
      severity: "media",
      coordinates: { latitude: 40.4168, longitude: -3.7038 },
    };
    const result = validateIncidentReport(outOfBoundsInput);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.code === "ERR_COORDINATES_OUT_OF_CAMPUS"),
    ).toBe(true);
  });
});
