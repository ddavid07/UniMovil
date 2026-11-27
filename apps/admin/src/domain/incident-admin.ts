import {
  ALLOWED_INCIDENT_TRANSITIONS,
  validateIncidentTransition,
  type AccountRole,
  type AdminIncidentDetail,
  type AuditAction,
  type AuditEntityType,
  type AuditOutcome,
  type AuditReasonCode,
  type ClosureKind,
  type IncidentCategory,
  type IncidentPriority,
  type IncidentStatus,
  type IncidentVisibility,
} from '@unimovil/contracts';

export const CATEGORY_LABELS: Readonly<Record<IncidentCategory, string>> = {
  access_obstruction: 'Obstáculo en un acceso',
  lift_or_elevator: 'Ascensor o elevador',
  adapted_access_or_service: 'Acceso o servicio adaptado',
  parking: 'Aparcamiento',
  bicycle_resource: 'Recurso para bicicletas',
  other: 'Otro problema de movilidad',
};

export const STATUS_LABELS: Readonly<Record<IncidentStatus, string>> = {
  received: 'Recibida',
  under_review: 'En revisión',
  in_progress: 'En proceso',
  resolved: 'Resuelta',
  closed: 'Cerrada',
};

export const PRIORITY_LABELS: Readonly<Record<IncidentPriority, string>> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
};

export const VISIBILITY_LABELS: Readonly<Record<IncidentVisibility, string>> = {
  private: 'Privada',
  published: 'Publicada',
};

export const ROLE_LABELS: Readonly<Record<AccountRole, string>> = {
  user: 'Usuario registrado',
  manager: 'Gestor',
  admin: 'Administrador',
};

export const AUDIT_ACTION_LABELS: Readonly<Record<AuditAction, string>> = {
  update_incident: 'Clasificación o asignación',
  transition_incident: 'Cambio de estado',
  publish_incident: 'Publicación aprobada',
  unpublish_incident: 'Retirada de publicación',
  access_evidence: 'Acceso a evidencia privada',
  access_denied: 'Acceso denegado',
};

export const AUDIT_OUTCOME_LABELS: Readonly<Record<AuditOutcome, string>> = {
  success: 'Aceptada',
  rejected: 'Rechazada',
};

export const AUDIT_ENTITY_LABELS: Readonly<Record<AuditEntityType, string>> = {
  incident: 'Incidencia',
  incident_attachment: 'Evidencia privada',
  audit_log: 'Auditoría',
};

export const AUDIT_REASON_LABELS: Readonly<Record<AuditReasonCode, string>> = {
  FORBIDDEN_ROLE: 'Rol insuficiente',
  INVALID_TRANSITION: 'Transición no permitida',
  MISSING_ASSIGNEE: 'Falta persona gestora asignada',
  MISSING_REASON: 'Falta motivo obligatorio',
  MISSING_RESPONSE: 'Falta respuesta al informante',
  MISSING_DUPLICATE_TARGET: 'Falta incidencia principal',
  SELF_DUPLICATE: 'Duplicado sobre sí misma',
  INVALID_CLOSURE_KIND: 'Tipo de cierre no válido',
  INVALID_ASSIGNEE_ROLE: 'La cuenta asignada no es gestora',
  UNASSIGNED_IN_PROGRESS: 'Caso en proceso sin responsable',
  INVALID_PUBLIC_PROJECTION: 'Proyección pública incompleta',
  CONFLICT_REVISION: 'Conflicto de revisión concurrente',
  NOT_FOUND: 'Elemento no encontrado',
  VALIDATION_ERROR: 'Validación rechazada',
};

export function formatLocalDateTime(value: string | null): string {
  if (!value) return 'No disponible';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

export function formatUtcTimestamp(value: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

export function getAllowedTargetStatuses(
  currentStatus: IncidentStatus,
): readonly IncidentStatus[] {
  return ALLOWED_INCIDENT_TRANSITIONS[currentStatus];
}

export interface TransitionFormDraft {
  toStatus: IncidentStatus;
  closureKind: ClosureKind;
  duplicateOfIncidentId: string;
  reason: string;
  informantResponse: string;
}

export function validateTransitionDraft(
  incident: Pick<AdminIncidentDetail, 'id' | 'status' | 'assignedTo'>,
  draft: TransitionFormDraft,
): string | null {
  const result = validateIncidentTransition({
    incidentId: incident.id,
    currentStatus: incident.status,
    toStatus: draft.toStatus,
    assignedTo: incident.assignedTo,
    closureKind: draft.toStatus === 'closed' ? draft.closureKind : undefined,
    duplicateOfIncidentId:
      draft.toStatus === 'closed' && draft.closureKind === 'duplicate'
        ? draft.duplicateOfIncidentId.trim() || null
        : undefined,
    reason: draft.reason,
    informantResponse: draft.informantResponse,
  });
  return result.ok ? null : result.message;
}

export function validatePublicationDraft(
  visibility: IncidentVisibility,
  publicSummary: string,
  approximateZone: string,
): string | null {
  if (visibility !== 'published') return null;
  if (!publicSummary.trim()) {
    return 'Debes aprobar un resumen público seguro antes de publicar.';
  }
  if (!approximateZone.trim()) {
    return 'Debes indicar una zona aproximada segura antes de publicar.';
  }
  return null;
}

export function canAccessAuditLog(role: AccountRole): boolean {
  return role === 'admin';
}

export function canOperateManagementQueue(role: AccountRole): boolean {
  return role === 'manager' || role === 'admin';
}
