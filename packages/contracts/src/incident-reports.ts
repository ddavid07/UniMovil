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
export type IncidentReportStatus = "reportada" | "en_curso" | "resuelta";

export interface IncidentReportInput {
  readonly title: string;
  readonly description: string;
  readonly type: IncidentType;
  readonly severity: IncidentSeverity;
  readonly coordinates: Coordinates;
  readonly reportedAt?: string | undefined;
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
  readonly data?: IncidentReportInput | undefined;
  readonly errors: readonly IncidentValidationError[];
}

const DANGEROUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /<iframe/i,
  /onerror\s*=/i,
  /onload\s*=/i,
];

function addError(
  errors: IncidentValidationError[],
  field: string,
  code: IncidentErrorCode,
  message: string,
): void {
  errors.push({ field, code, message });
}

function validateText(
  value: unknown,
  field: "title" | "description",
  minimum: number,
  maximum: number,
  codes: {
    required: IncidentErrorCode;
    tooShort: IncidentErrorCode;
    tooLong: IncidentErrorCode;
    unsafe: IncidentErrorCode;
  },
  errors: IncidentValidationError[],
): string {
  const text = typeof value === "string" ? value.trim() : "";
  const label = field === "title" ? "El título" : "La descripción";
  if (!text)
    addError(
      errors,
      field,
      codes.required,
      field === "title"
        ? "El título de la incidencia es obligatorio."
        : "La descripción de la incidencia es obligatoria.",
    );
  else if (text.length < minimum)
    addError(
      errors,
      field,
      codes.tooShort,
      `${label} debe contener al menos ${minimum} caracteres.`,
    );
  else if (text.length > maximum)
    addError(
      errors,
      field,
      codes.tooLong,
      `${label} no puede exceder ${maximum} caracteres.`,
    );
  if (DANGEROUS_PATTERNS.some((pattern) => pattern.test(text))) {
    addError(
      errors,
      field,
      codes.unsafe,
      `${label} contiene secuencias no permitidas.`,
    );
  }
  return text;
}

function validateCoordinates(
  value: unknown,
  errors: IncidentValidationError[],
): Coordinates | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    addError(
      errors,
      "coordinates",
      "ERR_COORDINATES_REQUIRED",
      "Las coordenadas de la incidencia son obligatorias.",
    );
    return undefined;
  }
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.latitude !== "number" ||
    !Number.isFinite(raw.latitude) ||
    typeof raw.longitude !== "number" ||
    !Number.isFinite(raw.longitude)
  ) {
    addError(
      errors,
      "coordinates",
      "ERR_COORDINATES_INVALID",
      "Las coordenadas deben ser valores numéricos válidos.",
    );
    return undefined;
  }
  const coordinates = { latitude: raw.latitude, longitude: raw.longitude };
  if (!isWithinCampusBounds(coordinates)) {
    addError(
      errors,
      "coordinates",
      "ERR_COORDINATES_OUT_OF_CAMPUS",
      "La ubicación indicada queda fuera del perímetro del campus de Moncloa.",
    );
    return undefined;
  }
  return coordinates;
}

function validateChoice<T extends string>(
  value: unknown,
  options: readonly T[],
  field: "type" | "severity",
  code: IncidentErrorCode,
  errors: IncidentValidationError[],
): T | undefined {
  if (typeof value === "string" && options.includes(value as T)) {
    return value as T;
  }
  addError(errors, field, code, `El valor de ${field} no es válido.`);
  return undefined;
}

function invalidResult(
  errors: readonly IncidentValidationError[],
): IncidentValidationResult {
  return { isValid: false, errors };
}

export function validateIncidentReport(
  input: unknown,
): IncidentValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return invalidResult([
      {
        field: "root",
        code: "ERR_TITLE_REQUIRED",
        message: "Los datos de la incidencia deben ser un objeto válido.",
      },
    ]);
  }

  const raw = input as Record<string, unknown>;
  const errors: IncidentValidationError[] = [];
  const title = validateText(
    raw.title,
    "title",
    3,
    80,
    {
      required: "ERR_TITLE_REQUIRED",
      tooShort: "ERR_TITLE_TOO_SHORT",
      tooLong: "ERR_TITLE_TOO_LONG",
      unsafe: "ERR_TITLE_INVALID_CHARS",
    },
    errors,
  );
  const description = validateText(
    raw.description,
    "description",
    5,
    500,
    {
      required: "ERR_DESCRIPTION_REQUIRED",
      tooShort: "ERR_DESCRIPTION_TOO_SHORT",
      tooLong: "ERR_DESCRIPTION_TOO_LONG",
      unsafe: "ERR_TITLE_INVALID_CHARS",
    },
    errors,
  );
  const type = validateChoice(
    raw.type,
    INCIDENT_TYPES,
    "type",
    "ERR_TYPE_INVALID",
    errors,
  );
  const severity = validateChoice(
    raw.severity,
    INCIDENT_SEVERITIES,
    "severity",
    "ERR_SEVERITY_INVALID",
    errors,
  );
  const coordinates = validateCoordinates(raw.coordinates, errors);

  if (errors.length > 0 || !type || !severity || !coordinates) {
    return invalidResult(errors);
  }
  return {
    isValid: true,
    errors: [],
    data: {
      title,
      description,
      type,
      severity,
      coordinates,
      reportedAt:
        typeof raw.reportedAt === "string"
          ? raw.reportedAt
          : new Date().toISOString(),
    },
  };
}
