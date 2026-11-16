import type {
  AuditAction,
  AuditEntry,
  AuditResource,
  Coordinates,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  Place,
  PlaceCategory,
} from "@unimovil/contracts";

export type PlaceOperationalStatus = "active" | "inactive" | "maintenance";

export type AnnouncementPriority = "urgente" | "alta" | "informativa";
export type AnnouncementScope = "campus" | "transit" | "building";
export type AnnouncementStatus = "draft" | "published" | "archived";

export interface Announcement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly priority: AnnouncementPriority;
  readonly scope: AnnouncementScope;
  readonly targetLocation?: string | undefined;
  readonly status: AnnouncementStatus;
  readonly publishedBy: string;
  readonly createdAt: string;
  readonly expiresAt?: string | undefined;
}

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
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  Place,
  PlaceCategory,
};
