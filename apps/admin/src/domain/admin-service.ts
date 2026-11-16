import {
  createAuditEntry,
  isValidIncidentTransition,
  type AuditEntry,
  type AuditResource,
  type Incident,
  type IncidentSeverity,
  type IncidentStatus,
  type IncidentType,
  type PlaceCategory,
} from "@unimovil/contracts";
import type {
  Announcement,
  AnnouncementPriority,
  AnnouncementScope,
  AnnouncementStatus,
  ManagedPlace,
  PlaceOperationalStatus,
} from "../types.ts";

export interface PlaceFilterParams {
  readonly query?: string | undefined;
  readonly category?: PlaceCategory | "all" | undefined;
  readonly accessibility?: ManagedPlace["accessibility"] | "all" | undefined;
  readonly status?: PlaceOperationalStatus | "all" | undefined;
}

export function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

function matchesPlaceQuery(
  place: ManagedPlace,
  normalizedQuery: string,
): boolean {
  if (normalizedQuery.length === 0) return true;
  const nameMatch = normalizeText(place.name).includes(normalizedQuery);
  const aliasMatch = place.aliases.some((alias) =>
    normalizeText(alias).includes(normalizedQuery),
  );
  const descMatch = place.description
    ? normalizeText(place.description).includes(normalizedQuery)
    : false;
  return nameMatch || aliasMatch || descMatch;
}

export function filterPlaces(
  places: readonly ManagedPlace[],
  params: PlaceFilterParams,
): readonly ManagedPlace[] {
  const normalizedQuery = normalizeText(params.query ?? "");
  const categoryFilter = params.category ?? "all";
  const accessFilter = params.accessibility ?? "all";
  const statusFilter = params.status ?? "all";

  return places.filter((place) => {
    if (!matchesPlaceQuery(place, normalizedQuery)) return false;
    if (categoryFilter !== "all" && place.category !== categoryFilter)
      return false;
    if (accessFilter !== "all" && place.accessibility !== accessFilter)
      return false;
    if (statusFilter !== "all" && place.status !== statusFilter) return false;
    return true;
  });
}

export function updatePlaceStatus(
  places: readonly ManagedPlace[],
  placeId: string,
  newStatus: PlaceOperationalStatus,
  author: string,
  reason?: string | undefined,
  newAccessibility?: ManagedPlace["accessibility"] | undefined,
): {
  readonly updatedPlaces: readonly ManagedPlace[];
  readonly auditEntry: AuditEntry;
} {
  const targetIndex = places.findIndex((p) => p.id === placeId);
  // eslint-disable-next-line security/detect-object-injection
  const current = places[targetIndex];
  if (targetIndex === -1 || !current) {
    throw new Error(`Place not found: ${placeId}`);
  }

  const updatedAccessibility = newAccessibility ?? current.accessibility;

  const updated: ManagedPlace = {
    ...current,
    status: newStatus,
    accessibility: updatedAccessibility,
    statusReason: reason ? reason.trim() : undefined,
    lastModifiedBy: author.trim(),
    lastModifiedAt: new Date().toISOString(),
  };

  const updatedPlaces = [
    ...places.slice(0, targetIndex),
    updated,
    ...places.slice(targetIndex + 1),
  ];

  const auditEntry = createAuditEntry({
    resource: "place",
    resourceId: placeId,
    action: "STATUS_CHANGE",
    author,
    summary: `Actualizado lugar "${current.name}" (Estado: ${newStatus}, Accesibilidad: ${updatedAccessibility}).`,
    details: {
      previousStatus: current.status,
      newStatus,
      previousAccessibility: current.accessibility,
      newAccessibility: updatedAccessibility,
      reason: reason?.trim(),
    },
  });

  return { updatedPlaces, auditEntry };
}

export interface IncidentFilterParams {
  readonly query?: string | undefined;
  readonly status?: IncidentStatus | "all" | undefined;
  readonly severity?: IncidentSeverity | "all" | undefined;
  readonly type?: IncidentType | "all" | undefined;
}

function matchesIncidentQuery(
  incident: Incident,
  normalizedQuery: string,
): boolean {
  if (normalizedQuery.length === 0) return true;
  const titleMatch = normalizeText(incident.title).includes(normalizedQuery);
  const descMatch = normalizeText(incident.description).includes(
    normalizedQuery,
  );
  return titleMatch || descMatch;
}

export function filterIncidents(
  incidents: readonly Incident[],
  params: IncidentFilterParams,
): readonly Incident[] {
  const normalizedQuery = normalizeText(params.query ?? "");
  const statusFilter = params.status ?? "all";
  const severityFilter = params.severity ?? "all";
  const typeFilter = params.type ?? "all";

  return incidents.filter((inc) => {
    if (!matchesIncidentQuery(inc, normalizedQuery)) return false;
    if (statusFilter !== "all" && inc.status !== statusFilter) return false;
    if (severityFilter !== "all" && inc.severity !== severityFilter)
      return false;
    if (typeFilter !== "all" && inc.type !== typeFilter) return false;
    return true;
  });
}

export function updateIncidentStatus(
  incidents: readonly Incident[],
  incidentId: string,
  newStatus: IncidentStatus,
  author: string,
  resolutionNote?: string | undefined,
): {
  readonly updatedIncidents: readonly Incident[];
  readonly auditEntry: AuditEntry;
} {
  const targetIndex = incidents.findIndex((i) => i.id === incidentId);
  // eslint-disable-next-line security/detect-object-injection
  const current = incidents[targetIndex];
  if (targetIndex === -1 || !current) {
    throw new Error(`Incident not found: ${incidentId}`);
  }

  if (!isValidIncidentTransition(current.status, newStatus)) {
    throw new Error(
      `Invalid incident transition from ${current.status} to ${newStatus}`,
    );
  }

  const now = new Date().toISOString();
  const updated: Incident = {
    ...current,
    status: newStatus,
    updatedAt: now,
    ...(newStatus === "resuelta" ? { resolvedAt: now } : {}),
  };

  const updatedIncidents = [
    ...incidents.slice(0, targetIndex),
    updated,
    ...incidents.slice(targetIndex + 1),
  ];

  const auditEntry = createAuditEntry({
    resource: "incident",
    resourceId: incidentId,
    action: "STATUS_CHANGE",
    author,
    summary: `Incidencia ${incidentId} actualizada a estado "${newStatus}".`,
    details: {
      previousStatus: current.status,
      newStatus,
      resolutionNote: resolutionNote?.trim(),
    },
  });

  return { updatedIncidents, auditEntry };
}

export function filterAuditEntries(
  entries: readonly AuditEntry[],
  resource: AuditResource | "all",
  authorQuery?: string | undefined,
): readonly AuditEntry[] {
  const normAuthor = normalizeText(authorQuery ?? "");

  return entries.filter((entry) => {
    if (resource !== "all" && entry.resource !== resource) return false;
    if (
      normAuthor.length > 0 &&
      !normalizeText(entry.author).includes(normAuthor)
    )
      return false;
    return true;
  });
}

export interface AnnouncementFilterParams {
  readonly query?: string | undefined;
  readonly priority?: AnnouncementPriority | "all" | undefined;
  readonly scope?: AnnouncementScope | "all" | undefined;
  readonly status?: AnnouncementStatus | "all" | undefined;
}

function matchesAnnouncementQuery(
  announcement: Announcement,
  normalizedQuery: string,
): boolean {
  if (normalizedQuery.length === 0) return true;
  const titleMatch = normalizeText(announcement.title).includes(
    normalizedQuery,
  );
  const descMatch = normalizeText(announcement.description).includes(
    normalizedQuery,
  );
  const locMatch = announcement.targetLocation
    ? normalizeText(announcement.targetLocation).includes(normalizedQuery)
    : false;
  return titleMatch || descMatch || locMatch;
}

export function filterAnnouncements(
  announcements: readonly Announcement[],
  params: AnnouncementFilterParams,
): readonly Announcement[] {
  const normQuery = normalizeText(params.query ?? "");
  const priorityFilter = params.priority ?? "all";
  const scopeFilter = params.scope ?? "all";
  const statusFilter = params.status ?? "all";

  return announcements.filter((ann) => {
    if (!matchesAnnouncementQuery(ann, normQuery)) return false;
    if (priorityFilter !== "all" && ann.priority !== priorityFilter)
      return false;
    if (scopeFilter !== "all" && ann.scope !== scopeFilter) return false;
    if (statusFilter !== "all" && ann.status !== statusFilter) return false;
    return true;
  });
}

export function createAnnouncement(
  announcements: readonly Announcement[],
  input: Omit<Announcement, "id" | "createdAt">,
  author: string,
): {
  readonly updatedAnnouncements: readonly Announcement[];
  readonly auditEntry: AuditEntry;
} {
  if (!input.title || input.title.trim().length === 0) {
    throw new Error("El título del aviso no puede estar vacío");
  }
  if (!input.description || input.description.trim().length === 0) {
    throw new Error("La descripción del aviso no puede estar vacía");
  }
  if (!author || author.trim().length === 0) {
    throw new Error("El autor del aviso no puede estar vacío");
  }

  const id = `ann-2026-${String(announcements.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();

  const newAnnouncement: Announcement = {
    ...input,
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    publishedBy: author,
    createdAt: now,
  };

  const updatedAnnouncements = [newAnnouncement, ...announcements];

  const auditEntry = createAuditEntry({
    resource: "announcement",
    resourceId: id,
    action: "CREATE",
    author,
    summary: `Publicado aviso de campus "${newAnnouncement.title}" (Prioridad: ${newAnnouncement.priority}, Ámbito: ${newAnnouncement.scope}).`,
    details: {
      priority: newAnnouncement.priority,
      scope: newAnnouncement.scope,
      targetLocation: newAnnouncement.targetLocation,
      expiresAt: newAnnouncement.expiresAt,
    },
  });

  return { updatedAnnouncements, auditEntry };
}

export function archiveAnnouncement(
  announcements: readonly Announcement[],
  announcementId: string,
  author: string,
  reason?: string | undefined,
): {
  readonly updatedAnnouncements: readonly Announcement[];
  readonly auditEntry: AuditEntry;
} {
  const targetIndex = announcements.findIndex((a) => a.id === announcementId);
  // eslint-disable-next-line security/detect-object-injection
  const current = announcements[targetIndex];
  if (targetIndex === -1 || !current) {
    throw new Error(`Announcement not found: ${announcementId}`);
  }

  if (current.status === "archived") {
    throw new Error(`Announcement already archived: ${announcementId}`);
  }

  const updated: Announcement = {
    ...current,
    status: "archived",
  };

  const updatedAnnouncements = [
    ...announcements.slice(0, targetIndex),
    updated,
    ...announcements.slice(targetIndex + 1),
  ];

  const auditEntry = createAuditEntry({
    resource: "announcement",
    resourceId: announcementId,
    action: "STATUS_CHANGE",
    author,
    summary: `Aviso "${current.title}" archivado por ${author}.`,
    details: {
      previousStatus: current.status,
      newStatus: "archived",
      reason: reason?.trim(),
    },
  });

  return { updatedAnnouncements, auditEntry };
}

export function isAnnouncementActive(
  announcement: Announcement,
  referenceDate: Date = new Date(),
): boolean {
  if (announcement.status !== "published") {
    return false;
  }
  if (!announcement.expiresAt) {
    return true;
  }
  const expiry = new Date(announcement.expiresAt).getTime();
  return !Number.isNaN(expiry) && expiry > referenceDate.getTime();
}
