import { z } from 'zod';

export const accountRoles = ['user', 'manager', 'admin'] as const;
export type AccountRole = (typeof accountRoles)[number];

export const staffRoles = ['manager', 'admin'] as const;
export type StaffRole = (typeof staffRoles)[number];

export const incidentCategories = [
  'access_obstruction',
  'lift_or_elevator',
  'adapted_access_or_service',
  'parking',
  'bicycle_resource',
  'other',
] as const;

export const incidentStatuses = [
  'received',
  'under_review',
  'in_progress',
  'resolved',
  'closed',
] as const;

export const activeIncidentStatuses = [
  'received',
  'under_review',
  'in_progress',
] as const;

export const incidentPriorities = ['low', 'normal', 'high'] as const;
export const incidentVisibilities = ['private', 'published'] as const;
export const closureKinds = ['duplicate', 'invalid', 'resolved'] as const;
export const confirmationOutcomes = ['still_active', 'resolved'] as const;

export type IncidentCategory = (typeof incidentCategories)[number];
export type IncidentStatus = (typeof incidentStatuses)[number];
export type IncidentPriority = (typeof incidentPriorities)[number];
export type IncidentVisibility = (typeof incidentVisibilities)[number];
export type ClosureKind = (typeof closureKinds)[number];
export type ConfirmationOutcome = (typeof confirmationOutcomes)[number];

export const auditActions = [
  'update_incident',
  'transition_incident',
  'publish_incident',
  'unpublish_incident',
  'access_evidence',
  'access_denied',
] as const;

export const auditOutcomes = ['success', 'rejected'] as const;

export const auditEntityTypes = [
  'incident',
  'incident_attachment',
  'audit_log',
] as const;

export const auditReasonCodes = [
  'FORBIDDEN_ROLE',
  'INVALID_TRANSITION',
  'MISSING_ASSIGNEE',
  'MISSING_REASON',
  'MISSING_RESPONSE',
  'MISSING_DUPLICATE_TARGET',
  'SELF_DUPLICATE',
  'INVALID_CLOSURE_KIND',
  'INVALID_ASSIGNEE_ROLE',
  'UNASSIGNED_IN_PROGRESS',
  'INVALID_PUBLIC_PROJECTION',
  'CONFLICT_REVISION',
  'NOT_FOUND',
  'VALIDATION_ERROR',
] as const;

export type AuditAction = (typeof auditActions)[number];
export type AuditOutcome = (typeof auditOutcomes)[number];
export type AuditEntityType = (typeof auditEntityTypes)[number];
export type AuditReasonCode = (typeof auditReasonCodes)[number];

/**
 * Allowed status transitions defined in HU-055 for Sprint 8.
 * Closed incidents are terminal; resolved incidents can be reopened to under_review.
 */
export const ALLOWED_INCIDENT_TRANSITIONS: Readonly<
  Record<IncidentStatus, readonly IncidentStatus[]>
> = {
  received: ['under_review', 'closed'],
  under_review: ['in_progress', 'resolved', 'closed'],
  in_progress: ['resolved', 'closed'],
  resolved: ['under_review', 'closed'],
  closed: [],
};

export interface IncidentTransitionCheckInput {
  incidentId: string;
  currentStatus: IncidentStatus;
  toStatus: IncidentStatus;
  assignedTo: string | null;
  closureKind?: ClosureKind;
  duplicateOfIncidentId?: string | null;
  reason?: string | null;
  informantResponse?: string | null;
}

export type IncidentTransitionValidationResult =
  | { ok: true; normalizedClosureKind: ClosureKind | null }
  | { ok: false; reasonCode: AuditReasonCode; message: string };

/**
 * Validates whether an operational incident status transition satisfies all HU-055
 * state machine rules and preconditions without mutating visibility.
 */
export function validateIncidentTransition(
  input: IncidentTransitionCheckInput,
): IncidentTransitionValidationResult {
  const allowedTargets = ALLOWED_INCIDENT_TRANSITIONS[input.currentStatus];
  if (!allowedTargets.includes(input.toStatus)) {
    return {
      ok: false,
      reasonCode: 'INVALID_TRANSITION',
      message:
        input.currentStatus === 'closed'
          ? 'Una incidencia cerrada es terminal y no admite nuevas transiciones.'
          : 'La transición de estado solicitada no está permitida.',
    };
  }

  const trimmedReason = input.reason?.trim() ?? '';
  const trimmedResponse = input.informantResponse?.trim() ?? '';

  if (input.toStatus === 'in_progress' && !input.assignedTo) {
    return {
      ok: false,
      reasonCode: 'MISSING_ASSIGNEE',
      message:
        'La incidencia debe tener una persona gestora asignada antes de pasar a en proceso.',
    };
  }

  if (input.toStatus === 'resolved' && !trimmedResponse) {
    return {
      ok: false,
      reasonCode: 'MISSING_RESPONSE',
      message:
        'Resolver una incidencia requiere una respuesta comprensible para el informante.',
    };
  }

  if (input.currentStatus === 'resolved' && input.toStatus === 'under_review') {
    if (!trimmedReason) {
      return {
        ok: false,
        reasonCode: 'MISSING_REASON',
        message: 'Reabrir una incidencia resuelta requiere indicar el motivo.',
      };
    }
    if (!trimmedResponse) {
      return {
        ok: false,
        reasonCode: 'MISSING_RESPONSE',
        message:
          'Reabrir una incidencia resuelta requiere una respuesta comprensible para el informante.',
      };
    }
  }

  if (input.toStatus === 'closed') {
    if (input.currentStatus === 'resolved') {
      if (input.closureKind && input.closureKind !== 'resolved') {
        return {
          ok: false,
          reasonCode: 'INVALID_CLOSURE_KIND',
          message: 'Un caso resuelto solo se cierra como gestión finalizada.',
        };
      }
      if (!trimmedResponse) {
        return {
          ok: false,
          reasonCode: 'MISSING_RESPONSE',
          message:
            'Cerrar una incidencia resuelta exige una respuesta indicando que la gestión ha terminado.',
        };
      }
      return { ok: true, normalizedClosureKind: 'resolved' };
    }

    if (input.closureKind !== 'duplicate' && input.closureKind !== 'invalid') {
      return {
        ok: false,
        reasonCode: 'INVALID_CLOSURE_KIND',
        message:
          'El cierre desde este estado solo se permite por duplicidad o invalidez.',
      };
    }
    if (!trimmedReason) {
      return {
        ok: false,
        reasonCode: 'MISSING_REASON',
        message:
          'Cerrar una incidencia por duplicidad o invalidez exige indicar un motivo comprensible.',
      };
    }
    if (input.closureKind === 'duplicate') {
      if (!input.duplicateOfIncidentId) {
        return {
          ok: false,
          reasonCode: 'MISSING_DUPLICATE_TARGET',
          message:
            'Cerrar una incidencia como duplicada requiere vincular la incidencia principal.',
        };
      }
      if (input.duplicateOfIncidentId === input.incidentId) {
        return {
          ok: false,
          reasonCode: 'SELF_DUPLICATE',
          message: 'Una incidencia no puede vincularse como duplicado de sí misma.',
        };
      }
    }
    return { ok: true, normalizedClosureKind: input.closureKind };
  }

  return { ok: true, normalizedClosureKind: null };
}

export const adminIncidentQueueQuerySchema = z
  .object({
    status: z.enum(incidentStatuses).optional(),
    category: z.enum(incidentCategories).optional(),
    assignedTo: z
      .union([z.literal('unassigned'), z.literal('me'), z.string().uuid()])
      .optional(),
    visibility: z.enum(incidentVisibilities).optional(),
    includeClosedOrResolved: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const adminIncidentUpdateSchema = z
  .object({
    expectedRevision: z.number().int().min(1),
    category: z.enum(incidentCategories).optional(),
    managementPriority: z.enum(incidentPriorities).nullable().optional(),
    assignedTo: z.string().uuid().nullable().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.category !== undefined ||
      value.managementPriority !== undefined ||
      value.assignedTo !== undefined,
    { message: 'Debe indicarse al menos un campo para actualizar.' },
  );

export const adminIncidentTransitionSchema = z
  .object({
    expectedRevision: z.number().int().min(1),
    toStatus: z.enum(incidentStatuses),
    closureKind: z.enum(closureKinds).optional(),
    duplicateOfIncidentId: z.string().uuid().nullable().optional(),
    reason: z.string().trim().min(1).max(1000).optional(),
    informantResponse: z.string().trim().min(1).max(2000).optional(),
  })
  .strict();

export const adminIncidentPublicationSchema = z
  .object({
    expectedRevision: z.number().int().min(1),
    visibility: z.enum(incidentVisibilities),
    publicSummary: z.string().trim().min(1).max(2000).optional(),
    approximateZone: z.string().trim().min(1).max(160).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.visibility === 'published') {
      if (!value.publicSummary) {
        context.addIssue({
          code: 'custom',
          path: ['publicSummary'],
          message:
            'Publicar una incidencia requiere aprobar un resumen público seguro.',
        });
      }
      if (!value.approximateZone) {
        context.addIssue({
          code: 'custom',
          path: ['approximateZone'],
          message:
            'Publicar una incidencia requiere indicar una zona aproximada segura.',
        });
      }
    }
  });

export const incidentConfirmationSchema = z
  .object({
    outcome: z.enum(confirmationOutcomes),
  })
  .strict();

export const auditQuerySchema = z
  .object({
    actorId: z.string().uuid().optional(),
    action: z.enum(auditActions).optional(),
    entityType: z.enum(auditEntityTypes).optional(),
    entityId: z.string().trim().min(1).max(128).optional(),
    outcome: z.enum(auditOutcomes).optional(),
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export type AdminIncidentQueueQuery = z.infer<typeof adminIncidentQueueQuerySchema>;
export type AdminIncidentUpdateInput = z.infer<typeof adminIncidentUpdateSchema>;
export type AdminIncidentTransitionInput = z.infer<
  typeof adminIncidentTransitionSchema
>;
export type AdminIncidentPublicationInput = z.infer<
  typeof adminIncidentPublicationSchema
>;
export type IncidentConfirmationInput = z.infer<typeof incidentConfirmationSchema>;
export type AuditQueryInput = z.infer<typeof auditQuerySchema>;

export interface ManagerSummary {
  userId: string;
  displayLabel: string;
}

export interface ConfirmationSummary {
  stillActiveCount: number;
  resolvedCount: number;
  totalActiveCount: number;
  lastConfirmedAt: string | null;
}

export interface AdminIncidentAttachment {
  id: string;
  contentType: string;
  byteSize: number;
  createdAt: string;
}

export interface IncidentStatusHistoryItem {
  id: string;
  fromStatus: IncidentStatus;
  toStatus: IncidentStatus;
  actorId: string | null;
  closureKind: ClosureKind | null;
  reason: string | null;
  informantResponse: string | null;
  incidentRevision: number;
  createdAt: string;
}

export interface AdminIncidentSummary {
  id: string;
  publicId: string;
  category: IncidentCategory;
  perceivedPriority: IncidentPriority | null;
  managementPriority: IncidentPriority | null;
  status: IncidentStatus;
  visibility: IncidentVisibility;
  assignedTo: string | null;
  revision: number;
  publishedRevision: number | null;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminIncidentDetail extends AdminIncidentSummary {
  description: string;
  publicSummary: string | null;
  approximateZone: string | null;
  duplicateOfIncidentId: string | null;
  closureReason: string | null;
  latitude: number;
  longitude: number;
  attachments: readonly AdminIncidentAttachment[];
  statusHistory: readonly IncidentStatusHistoryItem[];
  confirmationSummary: ConfirmationSummary;
}

export interface AuditFieldChange {
  before: string | number | null;
  after: string | number | null;
}

export interface AuditEventRecord {
  id: string;
  occurredAt: string;
  actorId: string;
  actorRole: AccountRole;
  action: AuditAction;
  outcome: AuditOutcome;
  reasonCode: AuditReasonCode | null;
  entityType: AuditEntityType;
  entityId: string;
  incidentRevision: number | null;
  changes: Readonly<Record<string, AuditFieldChange>>;
}
