import type {
  AuditAction,
  AuditEntry,
  AuditResource,
  Coordinates,
  Incident,
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
  Place,
  PlaceCategory,
} from "@unimovil/contracts";

export type PlaceOperationalStatus = "active" | "inactive" | "maintenance";

export interface ManagedPlace extends Place {
  readonly status: PlaceOperationalStatus;
  readonly statusReason?: string | undefined;
  readonly lastModifiedBy?: string | undefined;
  readonly lastModifiedAt?: string | undefined;
}

export type {
  AuditAction,
  AuditEntry,
  AuditResource,
  Coordinates,
  Incident,
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
  Place,
  PlaceCategory,
};
