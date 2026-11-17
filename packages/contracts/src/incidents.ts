import type { Coordinates } from "./places.js";

export const INCIDENT_STATUSES = [
  "recibida",
  "en_revision",
  "en_proceso",
  "resuelta",
  "cerrada",
] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_PRIORITIES = [
  "baja",
  "media",
  "alta",
  "urgente",
] as const;

export type IncidentPriority = (typeof INCIDENT_PRIORITIES)[number];

export const INCIDENT_CATEGORIES = [
  "rampa",
  "ascensor",
  "acera",
  "obstaculo",
  "alumbrado",
  "transporte",
  "otro",
] as const;

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];

export interface Incident {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: IncidentCategory;
  readonly priority: IncidentPriority;
  readonly status: IncidentStatus;
  readonly locationName: string;
  readonly coordinates?: Coordinates | undefined;
  readonly reportedBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly resolutionNote?: string | undefined;
  readonly assignedTo?: string | undefined;
}

const TRANSITIONS = new Map<IncidentStatus, readonly IncidentStatus[]>([
  ["recibida", ["en_revision", "cerrada"]],
  ["en_revision", ["en_proceso", "cerrada"]],
  ["en_proceso", ["resuelta", "en_revision"]],
  ["resuelta", ["cerrada", "en_proceso"]],
  ["cerrada", ["recibida", "en_revision"]],
]);

export function isValidIncidentTransition(
  current: IncidentStatus,
  next: IncidentStatus,
): boolean {
  if (current === next) return true;
  const target = TRANSITIONS.get(current);
  return target ? target.includes(next) : false;
}

function requireText(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `Invalid incident: ${fieldName} must be a non-empty string`,
    );
  }
  return value.trim();
}

function requireCategory(value: unknown): IncidentCategory {
  const found = INCIDENT_CATEGORIES.find((item) => item === value);
  if (!found) {
    throw new Error(`Invalid incident: unknown category "${String(value)}"`);
  }
  return found;
}

function requirePriority(value: unknown): IncidentPriority {
  const found = INCIDENT_PRIORITIES.find((item) => item === value);
  if (!found) {
    throw new Error(`Invalid incident: unknown priority "${String(value)}"`);
  }
  return found;
}

function requireStatus(value: unknown): IncidentStatus {
  const found = INCIDENT_STATUSES.find((item) => item === value);
  if (!found) {
    throw new Error(`Invalid incident: unknown status "${String(value)}"`);
  }
  return found;
}

function requireIsoDate(value: unknown, fieldName: string): string {
  const str = requireText(value, fieldName);
  if (Number.isNaN(Date.parse(str))) {
    throw new Error(
      `Invalid incident: ${fieldName} must be a valid ISO date string`,
    );
  }
  return str;
}

function parseCoordinates(raw: unknown): Coordinates | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return undefined;
  }
  const coords = raw as Record<string, unknown>;
  if (
    typeof coords.latitude === "number" &&
    typeof coords.longitude === "number"
  ) {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  }
  return undefined;
}

export function parseIncident(raw: unknown): Incident {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Invalid incident: expected an object");
  }

  const record = raw as Record<string, unknown>;
  const id = requireText(record.id, "id");
  const title = requireText(record.title, "title");
  const description = requireText(record.description, "description");
  const category = requireCategory(record.category);
  const priority = requirePriority(record.priority);
  const status = requireStatus(record.status);
  const locationName = requireText(record.locationName, "locationName");
  const reportedBy = requireText(record.reportedBy, "reportedBy");
  const createdAt = requireIsoDate(record.createdAt, "createdAt");
  const updatedAt = requireIsoDate(record.updatedAt, "updatedAt");
  const coordinates = parseCoordinates(record.coordinates);
  const resolutionNote =
    typeof record.resolutionNote === "string"
      ? record.resolutionNote.trim()
      : undefined;
  const assignedTo =
    typeof record.assignedTo === "string" && record.assignedTo.trim().length > 0
      ? record.assignedTo.trim()
      : undefined;

  return {
    id,
    title,
    description,
    category,
    priority,
    status,
    locationName,
    coordinates,
    reportedBy,
    createdAt,
    updatedAt,
    resolutionNote,
    assignedTo,
  };
}
