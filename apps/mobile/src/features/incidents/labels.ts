import type { IncidentCategory, IncidentStatus } from '@unimovil/contracts';

export const INCIDENT_CATEGORY_LABELS: Readonly<Record<IncidentCategory, string>> = {
  access_obstruction: 'Obstáculo en un acceso',
  lift_or_elevator: 'Ascensor o elevador',
  adapted_access_or_service: 'Acceso o servicio adaptado',
  parking: 'Aparcamiento',
  bicycle_resource: 'Recurso para bicicletas',
  other: 'Otro problema de movilidad',
};

export const INCIDENT_STATUS_LABELS: Readonly<Record<IncidentStatus, string>> = {
  received: 'Recibida',
  under_review: 'En revisión',
  in_progress: 'En proceso',
  resolved: 'Resuelta',
  closed: 'Cerrada',
};
