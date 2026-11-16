import type {
  Announcement,
  AuditEntry,
  Incident,
  ManagedPlace,
} from "../types.ts";

export const INITIAL_ANNOUNCEMENTS: readonly Announcement[] = [
  {
    id: "ann-2026-001",
    title: "Corte nocturno del túnel peatonal de Medicina por obras",
    description:
      "Con motivo de labores de pavimentación y mejora de drenaje, el paso inferior de acceso a Medicina permanecerá cerrado entre las 22:00 y las 06:00. Se recomienda el itinerario accesible exterior por Avda. Complutense.",
    priority: "urgente",
    scope: "building",
    targetLocation: "Facultad de Medicina - Paso Inferior",
    status: "published",
    publishedBy: "@admin.campus",
    createdAt: "2026-11-16T14:00:00.000Z",
    expiresAt: "2026-11-20T23:59:00.000Z",
  },
  {
    id: "ann-2026-002",
    title: "Servicio especial de refuerzo EMT Línea G por periodo de exámenes",
    description:
      "La EMT Madrid incrementa la frecuencia de paso de la Línea G a intervalos de 4-6 minutos en horario punta para facilitar el acceso a las bibliotecas de Moncloa y aularios del Paraninfo.",
    priority: "alta",
    scope: "transit",
    targetLocation: "Línea G (Moncloa - Ciudad Universitaria)",
    status: "published",
    publishedBy: "@admin.campus",
    createdAt: "2026-11-16T10:00:00.000Z",
    expiresAt: "2026-12-05T23:59:00.000Z",
  },
  {
    id: "ann-2026-003",
    title: "Habilitación temporal de plazas PMR adicionales en Paraninfo",
    description:
      "Se han señalizado 6 plazas de aparcamiento reservado de alta accesibilidad junto a la rotonda este de Paraninfo durante las obras de Odontología.",
    priority: "informativa",
    scope: "campus",
    targetLocation: "Aparcamiento PMR Paraninfo",
    status: "published",
    publishedBy: "@pablopr06",
    createdAt: "2026-11-15T09:00:00.000Z",
    expiresAt: "2026-11-30T23:59:00.000Z",
  },
];

export const INITIAL_MANAGED_PLACES: readonly ManagedPlace[] = [
  {
    id: "osm-way-15431484",
    name: "Facultad de Medicina",
    category: "building",
    coordinates: { latitude: 40.4439292, longitude: -3.7240836 },
    aliases: ["Medicina UCM"],
    accessibility: "yes",
    status: "active",
    source: {
      url: "https://www.openstreetmap.org/way/15431484",
      checkedAt: "2026-10-20",
      license: "ODbL-1.0",
    },
    description: "Pabellón principal y aulario de la Facultad de Medicina.",
  },
  {
    id: "osm-way-15431483",
    name: "Facultad de Farmacia",
    category: "building",
    coordinates: { latitude: 40.4453376, longitude: -3.7263201 },
    aliases: ["Farmacia UCM"],
    accessibility: "yes",
    status: "active",
    source: {
      url: "https://www.openstreetmap.org/way/15431483",
      checkedAt: "2026-10-20",
      license: "ODbL-1.0",
    },
    description: "Edificio principal y laboratorios de Farmacia.",
  },
  {
    id: "osm-way-15431473",
    name: "Facultad de Ciencias Biológicas y Ciencias Geológicas",
    category: "building",
    coordinates: { latitude: 40.4489638, longitude: -3.7259546 },
    aliases: ["Biológicas", "Geológicas"],
    accessibility: "yes",
    status: "active",
    source: {
      url: "https://www.openstreetmap.org/way/15431473",
      checkedAt: "2026-10-20",
      license: "ODbL-1.0",
    },
    description: "Complejo docente e investigador de Ciencias Biológicas.",
  },
  {
    id: "osm-way-15431478",
    name: "Facultad de Odontología",
    category: "building",
    coordinates: { latitude: 40.4447814, longitude: -3.7230198 },
    aliases: ["Odontología UCM", "Clínica Odontológica"],
    accessibility: "limited",
    status: "maintenance",
    statusReason:
      "Obras de sustitución de plataforma elevadora en el acceso este.",
    source: {
      url: "https://www.openstreetmap.org/way/15431478",
      checkedAt: "2026-10-20",
      license: "ODbL-1.0",
    },
    description: "Aulario y clínica universitaria de Odontología.",
  },
  {
    id: "osm-way-15431470",
    name: "Facultad de Informática",
    category: "building",
    coordinates: { latitude: 40.4523, longitude: -3.7335 },
    aliases: ["FDI", "Informática UCM"],
    accessibility: "yes",
    status: "active",
    source: {
      url: "https://www.openstreetmap.org/way/15431470",
      checkedAt: "2026-10-20",
      license: "ODbL-1.0",
    },
    description: "Facultad de Informática y laboratorios docentes.",
  },
  {
    id: "osm-node-101",
    name: "Metro Ciudad Universitaria (Línea 6)",
    category: "transport",
    coordinates: { latitude: 40.4452, longitude: -3.7258 },
    aliases: ["Metro Moncloa Campus", "L6 Metro"],
    accessibility: "yes",
    status: "active",
    source: {
      url: "https://www.openstreetmap.org/node/101",
      checkedAt: "2026-10-20",
      license: "ODbL-1.0",
    },
    description: "Estación de metro con ascensores directos a andenes.",
  },
];

export const INITIAL_INCIDENTS: readonly Incident[] = [
  {
    id: "inc-2026-001",
    title: "Avería en plataforma elevadora de Odontología",
    description:
      "Plataforma salvaescaleras averiada en el acceso este. Requiere sustitución de motor hidráulico.",
    type: "rampa_averiada",
    severity: "alta",
    coordinates: { latitude: 40.44478, longitude: -3.72302 },
    status: "en_curso",
    reportedAt: "2026-11-16T09:30:00.000Z",
  },
  {
    id: "inc-2026-002",
    title: "Zanja y obras en vial de acceso a Medicina",
    description:
      "Zanja señalizada en acera peatonal derecha por canalizaciones eléctricas.",
    type: "obra",
    severity: "alta",
    coordinates: { latitude: 40.4435, longitude: -3.727 },
    status: "reportada",
    reportedAt: "2026-11-15T08:30:00.000Z",
  },
  {
    id: "inc-2026-003",
    title: "Corte de acera en Paraninfo por poda de arbolado",
    description:
      "Paso peatonal desviado temporalmente a la calzada con conos y señalización.",
    type: "acera_cortada",
    severity: "media",
    coordinates: { latitude: 40.4485, longitude: -3.731 },
    status: "resuelta",
    reportedAt: "2026-11-14T11:00:00.000Z",
    resolvedAt: "2026-11-16T12:00:00.000Z",
  },
];

export const INITIAL_AUDIT_LOGS: readonly AuditEntry[] = [
  {
    id: "audit-008",
    resource: "place",
    resourceId: "osm-way-15431484",
    action: "STATUS_CHANGE",
    author: "@admin.campus",
    timestamp: "2026-11-16T17:54:21.000Z",
    summary:
      'Actualizado lugar "Facultad de Medicina" (Estado: active, Accesibilidad: yes).',
    details: {
      previousStatus: "maintenance",
      newStatus: "active",
      previousAccessibility: "limited",
      newAccessibility: "yes",
    },
  },
  {
    id: "audit-007",
    resource: "place",
    resourceId: "osm-way-15431484",
    action: "STATUS_CHANGE",
    author: "@admin.campus",
    timestamp: "2026-11-16T17:54:03.000Z",
    summary:
      'Actualizado lugar "Facultad de Medicina" (Estado: maintenance, Accesibilidad: limited).',
    details: {
      previousStatus: "active",
      newStatus: "maintenance",
      previousAccessibility: "yes",
      newAccessibility: "limited",
    },
  },
  {
    id: "audit-006",
    resource: "place",
    resourceId: "osm-way-15431478",
    action: "STATUS_CHANGE",
    author: "@pablopr06",
    timestamp: "2026-11-16T17:30:03.000Z",
    summary:
      'Actualizado lugar "Facultad de Odontología" (Estado: maintenance, Accesibilidad: limited).',
    details: {
      previousStatus: "active",
      newStatus: "maintenance",
      previousAccessibility: "no",
      newAccessibility: "limited",
      reason: "Obras de sustitución de plataforma elevadora en el acceso este.",
    },
  },
  {
    id: "audit-005",
    resource: "incident",
    resourceId: "inc-2026-002",
    action: "STATUS_CHANGE",
    author: "@admin.campus",
    timestamp: "2026-11-16T15:30:00.000Z",
    summary:
      "Incidencia inc-2026-002 pasada a estado 'en_curso' con señalización de obra.",
    details: {
      previousStatus: "reportada",
      newStatus: "en_curso",
    },
  },
  {
    id: "audit-004",
    resource: "incident",
    resourceId: "inc-2026-003",
    action: "STATUS_CHANGE",
    author: "@pablopr06",
    timestamp: "2026-11-16T12:00:00.000Z",
    summary: "Incidencia inc-2026-003 marcada como 'resuelta'.",
    details: {
      previousStatus: "en_curso",
      newStatus: "resuelta",
    },
  },
  {
    id: "audit-001",
    resource: "place",
    resourceId: "osm-node-101",
    action: "STATUS_CHANGE",
    author: "@admin.campus",
    timestamp: "2026-11-16T08:30:00.000Z",
    summary:
      "Verificación periódica de operatividad de ascensores de Metro Ciudad Universitaria.",
    details: {
      previousStatus: "active",
      newStatus: "active",
      previousAccessibility: "yes",
      newAccessibility: "yes",
    },
  },
];
