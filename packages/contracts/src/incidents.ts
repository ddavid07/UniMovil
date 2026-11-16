import type { Coordinates } from "./places.js";
import { isWithinCampusBounds } from "./routes.js";

export const INCIDENT_TYPES = [
  "obra",
  "desvio",
  "rampa_averiada",
  "acera_cortada",
  "obstaculo_temporal",
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const INCIDENT_SEVERITIES = [
  "baja",
  "media",
  "alta",
  "critica",
] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_STATUSES = ["reportada", "en_curso", "resuelta"] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface IncidentReportInput {
  readonly title: string;
  readonly description: string;
  readonly type: IncidentType;
  readonly severity: IncidentSeverity;
  readonly coordinates: Coordinates;
  readonly reportedAt?: string;
}

export interface Incident {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: IncidentType;
  readonly severity: IncidentSeverity;
  readonly coordinates: Coordinates;
  readonly status: IncidentStatus;
  readonly reportedAt: string;
  readonly updatedAt?: string;
  readonly resolvedAt?: string;
}

export const INCIDENT_ERROR_CODES = [
  "ERR_TITLE_REQUIRED",
  "ERR_TITLE_TOO_SHORT",
  "ERR_TITLE_TOO_LONG",
  "ERR_TITLE_INVALID_CHARS",
  "ERR_DESCRIPTION_REQUIRED",
  "ERR_DESCRIPTION_TOO_SHORT",
  "ERR_DESCRIPTION_TOO_LONG",
  "ERR_TYPE_INVALID",
  "ERR_SEVERITY_INVALID",
  "ERR_COORDINATES_REQUIRED",
  "ERR_COORDINATES_INVALID",
  "ERR_COORDINATES_OUT_OF_CAMPUS",
] as const;

export type IncidentErrorCode = (typeof INCIDENT_ERROR_CODES)[number];

export interface IncidentValidationError {
  readonly field: string;
  readonly code: IncidentErrorCode;
  readonly message: string;
}

export interface IncidentValidationResult {
  readonly isValid: boolean;
  readonly data?: IncidentReportInput;
  readonly errors: readonly IncidentValidationError[];
}

const DANGEROUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /<iframe/i,
  /onerror\s*=/i,
  /onload\s*=/i,
];

function validateTitleField(
  rawTitle: unknown,
  errors: IncidentValidationError[],
): void {
  if (typeof rawTitle !== "string" || rawTitle.trim().length === 0) {
    errors.push({
      field: "title",
      code: "ERR_TITLE_REQUIRED",
      message: "El título de la incidencia es obligatorio.",
    });
    return;
  }
  const trimmed = rawTitle.trim();
  if (trimmed.length < 3) {
    errors.push({
      field: "title",
      code: "ERR_TITLE_TOO_SHORT",
      message: "El título debe contener al menos 3 caracteres.",
    });
  } else if (trimmed.length > 80) {
    errors.push({
      field: "title",
      code: "ERR_TITLE_TOO_LONG",
      message: "El título no puede exceder los 80 caracteres.",
    });
  }
  if (DANGEROUS_PATTERNS.some((pat) => pat.test(trimmed))) {
    errors.push({
      field: "title",
      code: "ERR_TITLE_INVALID_CHARS",
      message:
        "El título contiene secuencias de texto o scripts no permitidos.",
    });
  }
}

function validateDescriptionField(
  rawDesc: unknown,
  errors: IncidentValidationError[],
): void {
  if (typeof rawDesc !== "string" || rawDesc.trim().length === 0) {
    errors.push({
      field: "description",
      code: "ERR_DESCRIPTION_REQUIRED",
      message: "La descripción de la incidencia es obligatoria.",
    });
    return;
  }
  const trimmed = rawDesc.trim();
  if (trimmed.length < 5) {
    errors.push({
      field: "description",
      code: "ERR_DESCRIPTION_TOO_SHORT",
      message: "La descripción debe contener al menos 5 caracteres.",
    });
  } else if (trimmed.length > 500) {
    errors.push({
      field: "description",
      code: "ERR_DESCRIPTION_TOO_LONG",
      message: "La descripción no puede exceder los 500 caracteres.",
    });
  }
  if (DANGEROUS_PATTERNS.some((pat) => pat.test(trimmed))) {
    errors.push({
      field: "description",
      code: "ERR_TITLE_INVALID_CHARS",
      message: "La descripción contiene secuencias de texto no permitidas.",
    });
  }
}

function validateTypeAndSeverity(
  rawType: unknown,
  rawSeverity: unknown,
  errors: IncidentValidationError[],
): void {
  if (
    typeof rawType !== "string" ||
    !INCIDENT_TYPES.includes(rawType as IncidentType)
  ) {
    errors.push({
      field: "type",
      code: "ERR_TYPE_INVALID",
      message: `El tipo de incidencia no es válido. Valores admitidos: ${INCIDENT_TYPES.join(", ")}.`,
    });
  }
  if (
    typeof rawSeverity !== "string" ||
    !INCIDENT_SEVERITIES.includes(rawSeverity as IncidentSeverity)
  ) {
    errors.push({
      field: "severity",
      code: "ERR_SEVERITY_INVALID",
      message: `La severidad no es válida. Valores admitidos: ${INCIDENT_SEVERITIES.join(", ")}.`,
    });
  }
}

function validateCoordinatesField(
  rawCoords: unknown,
  errors: IncidentValidationError[],
): void {
  if (!rawCoords || typeof rawCoords !== "object") {
    errors.push({
      field: "coordinates",
      code: "ERR_COORDINATES_REQUIRED",
      message: "Las coordenadas de la incidencia son obligatorias.",
    });
    return;
  }
  const coordsObj = rawCoords as Record<string, unknown>;
  const lat = coordsObj["latitude"];
  const lng = coordsObj["longitude"];
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    Number.isNaN(lat) ||
    Number.isNaN(lng)
  ) {
    errors.push({
      field: "coordinates",
      code: "ERR_COORDINATES_INVALID",
      message: "Las coordenadas deben ser valores numéricos válidos.",
    });
    return;
  }
  const coords: Coordinates = { latitude: lat, longitude: lng };
  if (!isWithinCampusBounds(coords)) {
    errors.push({
      field: "coordinates",
      code: "ERR_COORDINATES_OUT_OF_CAMPUS",
      message:
        "La ubicación indicada queda fuera del perímetro del campus de Moncloa.",
    });
  }
}

export function validateIncidentReport(
  input: unknown,
): IncidentValidationResult {
  const errors: IncidentValidationError[] = [];
  if (!input || typeof input !== "object") {
    return {
      isValid: false,
      errors: [
        {
          field: "root",
          code: "ERR_TITLE_REQUIRED",
          message: "Los datos de la incidencia deben ser un objeto válido.",
        },
      ],
    };
  }

  const raw = input as Record<string, unknown>;
  validateTitleField(raw["title"], errors);
  validateDescriptionField(raw["description"], errors);
  validateTypeAndSeverity(raw["type"], raw["severity"], errors);
  validateCoordinatesField(raw["coordinates"], errors);

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const rawCoords = raw["coordinates"] as Record<string, unknown>;
  const validData: IncidentReportInput = {
    title: (raw["title"] as string).trim(),
    description: (raw["description"] as string).trim(),
    type: raw["type"] as IncidentType,
    severity: raw["severity"] as IncidentSeverity,
    coordinates: {
      latitude: rawCoords["latitude"] as number,
      longitude: rawCoords["longitude"] as number,
    },
    reportedAt:
      typeof raw["reportedAt"] === "string"
        ? (raw["reportedAt"] as string)
        : new Date().toISOString(),
  };

  return {
    isValid: true,
    data: validData,
    errors: [],
  };
}
