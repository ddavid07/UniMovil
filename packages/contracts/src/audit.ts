export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DEACTIVATE",
  "STATUS_CHANGE",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_RESOURCES = [
  "place",
  "route",
  "schedule",
  "accessibility",
  "announcement",
  "incident",
] as const;

export type AuditResource = (typeof AUDIT_RESOURCES)[number];

export interface AuditEntry {
  readonly id: string;
  readonly resource: AuditResource;
  readonly resourceId: string;
  readonly action: AuditAction;
  readonly author: string;
  readonly timestamp: string;
  readonly summary: string;
  readonly details?: Record<string, unknown> | undefined;
}

const SENSITIVE_KEY_PATTERN = /(password|secret|token|bearer|credential|key|auth)/i;

function requireText(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Audit ${fieldName} must be a non-empty string`);
  }
  return value.trim();
}

function requireResource(value: unknown): AuditResource {
  const found = AUDIT_RESOURCES.find((item) => item === value);
  if (!found) {
    throw new Error(`Invalid audit resource: ${String(value)}`);
  }
  return found;
}

function requireAction(value: unknown): AuditAction {
  const found = AUDIT_ACTIONS.find((item) => item === value);
  if (!found) {
    throw new Error(`Invalid audit action: ${String(value)}`);
  }
  return found;
}

function requireIsoDate(value: unknown): string {
  const str = requireText(value, "timestamp");
  if (Number.isNaN(Date.parse(str))) {
    throw new Error("Audit timestamp must be a valid ISO date string");
  }
  return str;
}

function sanitizeDetails(details?: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return undefined;
  }
  const entries = Object.entries(details).map(([k, v]): [string, unknown] => [
    k,
    SENSITIVE_KEY_PATTERN.test(k) ? "[REDACTED]" : v,
  ]);
  return Object.fromEntries(entries);
}

export function createAuditEntry(params: {
  id?: string | undefined;
  resource: AuditResource;
  resourceId: string;
  action: AuditAction;
  author: string;
  summary: string;
  timestamp?: string | undefined;
  details?: Record<string, unknown> | undefined;
}): AuditEntry {
  const resource = requireResource(params.resource);
  const action = requireAction(params.action);
  const author = requireText(params.author, "author");
  const resourceId = requireText(params.resourceId, "resourceId");
  const summary = requireText(params.summary, "summary");
  const timestamp = params.timestamp ? requireIsoDate(params.timestamp) : new Date().toISOString();

  return {
    id: params.id ?? `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    resource,
    resourceId,
    action,
    author,
    timestamp,
    summary,
    details: sanitizeDetails(params.details),
  };
}

export function parseAuditEntry(raw: unknown): AuditEntry {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Invalid audit entry: expected an object");
  }

  const record = raw as Record<string, unknown>;
  const id = requireText(record.id, "id");
  const resource = requireResource(record.resource);
  const resourceId = requireText(record.resourceId, "resourceId");
  const action = requireAction(record.action);
  const author = requireText(record.author, "author");
  const timestamp = requireIsoDate(record.timestamp);
  const summary = requireText(record.summary, "summary");

  return {
    id,
    resource,
    resourceId,
    action,
    author,
    timestamp,
    summary,
    details: sanitizeDetails(record.details as Record<string, unknown> | undefined),
  };
}
