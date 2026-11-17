/**
 * Matriz de Trazabilidad de Requisitos (RTM) de UniMovil.
 *
 * Vincula de forma bidireccional cada Historia de Usuario del Product Backlog
 * con sus correspondientes suites de pruebas automatizadas y categorías de verificación,
 * según los principios de la teoría de pruebas del software orientado a objetos.
 */

export type TestCategory =
  | "UNIT"
  | "INTEGRATION"
  | "BLACK_BOX"
  | "REGRESSION"
  | "SYSTEM"
  | "RECOVERY"
  | "SECURITY";

export type Priority = "ALTA" | "MEDIA" | "BAJA";

export type QualityGateStatus = "PASSED" | "FAILED" | "PENDING";

export interface StoryTraceabilityEntry {
  readonly id: string;
  readonly title: string;
  readonly epic: string;
  readonly priority: Priority;
  readonly sprint: 1 | 2 | 3 | 4;
  readonly acceptanceCriteriaCount: number;
  readonly testFiles: readonly string[];
  readonly testCategories: readonly TestCategory[];
  readonly status: QualityGateStatus;
}

export interface TraceabilityMetrics {
  readonly totalStories: number;
  readonly coveredStories: number;
  readonly coveragePercentage: number;
  readonly storiesBySprint: Readonly<Record<1 | 2 | 3 | 4, number>>;
  readonly storiesByCategory: Readonly<Record<TestCategory, number>>;
  readonly allQualityGatesPassed: boolean;
}

export interface TraceabilityValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly totalVerified: number;
  readonly coveragePercentage: number;
}

export const REQUIREMENT_TRACEABILITY_MATRIX: readonly StoryTraceabilityEntry[] =
  [
    // Épica 01: Acceso y cuentas
    {
      id: "HU-001",
      title: "Consultar información pública sin registrarse",
      epic: "01 - Acceso y cuentas",
      priority: "ALTA",
      sprint: 1,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/campus/domain/places.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-002",
      title: "Crear una cuenta",
      epic: "01 - Acceso y cuentas",
      priority: "ALTA",
      sprint: 1,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "packages/testing/src/security-audit.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
      ],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-003",
      title: "Iniciar y cerrar sesión",
      epic: "01 - Acceso y cuentas",
      priority: "ALTA",
      sprint: 1,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "packages/testing/src/security-audit.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
      ],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-004",
      title: "Recuperar el acceso a la cuenta",
      epic: "01 - Acceso y cuentas",
      priority: "MEDIA",
      sprint: 1,
      acceptanceCriteriaCount: 4,
      testFiles: ["packages/testing/src/security-audit.spec.ts"],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-005",
      title: "Gestionar los datos del perfil",
      epic: "01 - Acceso y cuentas",
      priority: "MEDIA",
      sprint: 1,
      acceptanceCriteriaCount: 4,
      testFiles: ["packages/testing/src/security-audit.spec.ts"],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-006",
      title: "Eliminar una cuenta",
      epic: "01 - Acceso y cuentas",
      priority: "BAJA",
      sprint: 1,
      acceptanceCriteriaCount: 4,
      testFiles: ["packages/testing/src/security-audit.spec.ts"],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-007",
      title: "Gestionar permisos del dispositivo",
      epic: "01 - Acceso y cuentas",
      priority: "ALTA",
      sprint: 1,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/routing/__tests__/error-handling.spec.ts",
        "apps/mobile/__tests__/system/recovery.spec.ts",
      ],
      testCategories: ["UNIT", "RECOVERY"],
      status: "PASSED",
    },

    // Épica 02: Mapa, búsqueda y lugares
    {
      id: "HU-010",
      title: "Consultar el mapa del campus",
      epic: "02 - Mapa, búsqueda y lugares",
      priority: "ALTA",
      sprint: 1,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/mobile/src/features/campus/map/map.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-011",
      title: "Mostrar la ubicación actual",
      epic: "02 - Mapa, búsqueda y lugares",
      priority: "ALTA",
      sprint: 1,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/campus/map/map.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-012",
      title: "Filtrar categorías del mapa",
      epic: "02 - Mapa, búsqueda y lugares",
      priority: "MEDIA",
      sprint: 1,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/campus/domain/places.spec.ts",
        "apps/mobile/src/features/campus/map/map.spec.ts",
      ],
      testCategories: ["UNIT"],
      status: "PASSED",
    },
    {
      id: "HU-013",
      title: "Buscar lugares",
      epic: "02 - Mapa, búsqueda y lugares",
      priority: "ALTA",
      sprint: 1,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/mobile/src/features/campus/domain/places.spec.ts",
        "packages/contracts/src/parse-places.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "BLACK_BOX", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-014",
      title: "Consultar la ficha de un lugar",
      epic: "02 - Mapa, búsqueda y lugares",
      priority: "ALTA",
      sprint: 1,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/mobile/src/features/campus/data/repository.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-015",
      title: "Consultar servicios cercanos",
      epic: "02 - Mapa, búsqueda y lugares",
      priority: "MEDIA",
      sprint: 1,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/campus/domain/places.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-016",
      title: "Consultar cierres y restricciones en el mapa",
      epic: "02 - Mapa, búsqueda y lugares",
      priority: "MEDIA",
      sprint: 3,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/incidents/__tests__/thread-integration.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["INTEGRATION", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-017",
      title: "Compartir un lugar o una ubicación",
      epic: "02 - Mapa, búsqueda y lugares",
      priority: "BAJA",
      sprint: 2,
      acceptanceCriteriaCount: 3,
      testFiles: ["apps/mobile/__tests__/system/use-cases.spec.ts"],
      testCategories: ["SYSTEM"],
      status: "PASSED",
    },

    // Épica 03: Rutas y transporte
    {
      id: "HU-020",
      title: "Introducir origen y destino",
      epic: "03 - Rutas y transporte",
      priority: "ALTA",
      sprint: 2,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/mobile/src/features/routing/__tests__/routing.spec.ts",
        "apps/api/src/routes/routes.controller.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "INTEGRATION", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-021",
      title: "Consultar una ruta a pie",
      epic: "03 - Rutas y transporte",
      priority: "ALTA",
      sprint: 2,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/api/src/routes/routes.service.spec.ts",
        "apps/mobile/src/features/routing/__tests__/routing.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "REGRESSION", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-022",
      title: "Consultar rutas con diferentes medios",
      epic: "03 - Rutas y transporte",
      priority: "ALTA",
      sprint: 3,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/mobile/src/features/transit/__tests__/transit.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-023",
      title: "Consultar indicaciones paso a paso",
      epic: "03 - Rutas y transporte",
      priority: "ALTA",
      sprint: 2,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/api/src/routes/routes.service.spec.ts",
        "apps/mobile/src/features/routing/__tests__/routing.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-024",
      title: "Consultar una ruta accesible",
      epic: "03 - Rutas y transporte",
      priority: "ALTA",
      sprint: 2,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/api/src/routes/routes.service.spec.ts",
        "apps/mobile/src/features/routing/__tests__/routing.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-025",
      title: "Comparar y ajustar alternativas",
      epic: "03 - Rutas y transporte",
      priority: "MEDIA",
      sprint: 3,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/transit/__tests__/transit.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-026",
      title: "Consultar una línea de autobús",
      epic: "03 - Rutas y transporte",
      priority: "ALTA",
      sprint: 3,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "packages/contracts/src/transit.spec.ts",
        "apps/mobile/src/features/transit/map/geojson.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-027",
      title: "Consultar una parada",
      epic: "03 - Rutas y transporte",
      priority: "ALTA",
      sprint: 3,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "packages/contracts/src/transit.spec.ts",
        "apps/mobile/src/features/transit/__tests__/transit.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-028",
      title: "Consultar información en tiempo real",
      epic: "03 - Rutas y transporte",
      priority: "MEDIA",
      sprint: 3,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/transit/__tests__/transit-error-handling.spec.ts",
        "apps/mobile/__tests__/system/recovery.spec.ts",
      ],
      testCategories: ["INTEGRATION", "RECOVERY"],
      status: "PASSED",
    },
    {
      id: "HU-029",
      title: "Guardar y consultar rutas recientes",
      epic: "03 - Rutas y transporte",
      priority: "MEDIA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/offline/domain/offline-cache.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },

    // Épica 04: Accesibilidad y recursos
    {
      id: "HU-040",
      title: "Configurar preferencias de accesibilidad",
      epic: "04 - Accesibilidad y recursos",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/routing/__tests__/routing.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-041",
      title: "Consultar accesos y servicios adaptados",
      epic: "04 - Accesibilidad y recursos",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/api/src/routes/routes.service.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-042",
      title: "Consultar aparcamientos",
      epic: "04 - Accesibilidad y recursos",
      priority: "MEDIA",
      sprint: 2,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/campus/domain/places.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-043",
      title: "Consultar recursos para bicicletas y patinetes",
      epic: "04 - Accesibilidad y recursos",
      priority: "MEDIA",
      sprint: 2,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/campus/domain/places.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-044",
      title: "Consultar puntos de carga y mantenimiento",
      epic: "04 - Accesibilidad y recursos",
      priority: "BAJA",
      sprint: 2,
      acceptanceCriteriaCount: 3,
      testFiles: ["apps/mobile/src/features/campus/domain/places.spec.ts"],
      testCategories: ["UNIT"],
      status: "PASSED",
    },
    {
      id: "HU-045",
      title: "Consultar recursos cercanos por categoría",
      epic: "04 - Accesibilidad y recursos",
      priority: "MEDIA",
      sprint: 2,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/campus/domain/places.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },

    // Épica 05: Incidencias y comunicaciones
    {
      id: "HU-050",
      title: "Comunicar una incidencia",
      epic: "05 - Incidencias y comunicaciones",
      priority: "ALTA",
      sprint: 3,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "packages/contracts/src/incidents.spec.ts",
        "apps/mobile/src/features/incidents/__tests__/black-box-incidents.spec.ts",
        "apps/mobile/src/features/incidents/__tests__/thread-integration.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "BLACK_BOX", "INTEGRATION", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-051",
      title: "Adjuntar evidencias a una incidencia",
      epic: "05 - Incidencias y comunicaciones",
      priority: "MEDIA",
      sprint: 3,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "packages/contracts/src/incidents.spec.ts",
        "apps/mobile/src/features/incidents/__tests__/black-box-incidents.spec.ts",
      ],
      testCategories: ["UNIT", "BLACK_BOX"],
      status: "PASSED",
    },
    {
      id: "HU-052",
      title: "Consultar mis incidencias",
      epic: "05 - Incidencias y comunicaciones",
      priority: "ALTA",
      sprint: 3,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/incidents/__tests__/thread-integration.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["INTEGRATION", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-053",
      title: "Consultar incidencias públicas",
      epic: "05 - Incidencias y comunicaciones",
      priority: "ALTA",
      sprint: 3,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/mobile/src/features/incidents/__tests__/thread-integration.spec.ts",
        "apps/mobile/src/features/incidents/map/geojson.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["INTEGRATION", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-054",
      title: "Gestionar una incidencia",
      epic: "05 - Incidencias y comunicaciones",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/mobile/src/features/incidents/__tests__/thread-integration.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["INTEGRATION", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-055",
      title: "Actualizar el estado de una incidencia",
      epic: "05 - Incidencias y comunicaciones",
      priority: "ALTA",
      sprint: 3,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/mobile/src/features/incidents/__tests__/thread-integration.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["INTEGRATION", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-056",
      title: "Confirmar o reabrir una incidencia",
      epic: "05 - Incidencias y comunicaciones",
      priority: "MEDIA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/incidents/__tests__/thread-integration.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["INTEGRATION", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-057",
      title: "Publicar un aviso",
      epic: "05 - Incidencias y comunicaciones",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "packages/contracts/src/incidents.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SECURITY", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-058",
      title: "Consultar avisos",
      epic: "05 - Incidencias y comunicaciones",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: ["apps/mobile/__tests__/system/use-cases.spec.ts"],
      testCategories: ["SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-059",
      title: "Administrar un aviso",
      epic: "05 - Incidencias y comunicaciones",
      priority: "MEDIA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/api/test/security-endpoints.spec.ts",
        "packages/testing/src/security-audit.spec.ts",
      ],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },

    // Épica 06: Personalización y notificaciones
    {
      id: "HU-060",
      title: "Guardar favoritos",
      epic: "06 - Personalización y notificaciones",
      priority: "ALTA",
      sprint: 2,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/offline/domain/offline-cache.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-061",
      title: "Consultar búsquedas y rutas recientes",
      epic: "06 - Personalización y notificaciones",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/offline/domain/offline-cache.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-062",
      title: "Configurar preferencias de movilidad",
      epic: "06 - Personalización y notificaciones",
      priority: "MEDIA",
      sprint: 3,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/transit/__tests__/transit.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-063",
      title: "Configurar notificaciones",
      epic: "06 - Personalización y notificaciones",
      priority: "MEDIA",
      sprint: 3,
      acceptanceCriteriaCount: 4,
      testFiles: ["apps/mobile/__tests__/system/use-cases.spec.ts"],
      testCategories: ["SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-064",
      title: "Recibir una notificación relevante",
      epic: "06 - Personalización y notificaciones",
      priority: "MEDIA",
      sprint: 3,
      acceptanceCriteriaCount: 4,
      testFiles: ["apps/mobile/__tests__/system/use-cases.spec.ts"],
      testCategories: ["SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-065",
      title: "Cambiar idioma y preferencias de presentación",
      epic: "06 - Personalización y notificaciones",
      priority: "BAJA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: ["apps/mobile/__tests__/system/use-cases.spec.ts"],
      testCategories: ["SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-066",
      title: "Compartir una ruta",
      epic: "06 - Personalización y notificaciones",
      priority: "BAJA",
      sprint: 2,
      acceptanceCriteriaCount: 3,
      testFiles: ["apps/mobile/__tests__/system/use-cases.spec.ts"],
      testCategories: ["SYSTEM"],
      status: "PASSED",
    },

    // Épica 07: Administración y datos
    {
      id: "HU-070",
      title: "Gestionar edificios y lugares",
      epic: "07 - Administración y datos",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "packages/contracts/src/parse-places.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
      ],
      testCategories: ["BLACK_BOX", "SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-071",
      title: "Gestionar puntos y categorías",
      epic: "07 - Administración y datos",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "packages/contracts/src/parse-places.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
      ],
      testCategories: ["BLACK_BOX", "SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-072",
      title: "Gestionar transporte y paradas",
      epic: "07 - Administración y datos",
      priority: "MEDIA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "packages/contracts/src/transit.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
      ],
      testCategories: ["UNIT", "SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-073",
      title: "Gestionar accesibilidad",
      epic: "07 - Administración y datos",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/api/src/routes/routes.service.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
      ],
      testCategories: ["UNIT", "SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-074",
      title: "Importar datos externos",
      epic: "07 - Administración y datos",
      priority: "MEDIA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "packages/contracts/src/parse-places.spec.ts",
        "packages/testing/src/security-audit.spec.ts",
      ],
      testCategories: ["BLACK_BOX", "SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-075",
      title: "Consultar el estado de los datos",
      epic: "07 - Administración y datos",
      priority: "MEDIA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/api/src/routes/routes.controller.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
      ],
      testCategories: ["INTEGRATION", "SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-076",
      title: "Gestionar usuarios y roles",
      epic: "07 - Administración y datos",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: ["apps/api/test/security-endpoints.spec.ts"],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-077",
      title: "Consultar auditoría administrativa",
      epic: "07 - Administración y datos",
      priority: "MEDIA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/api/test/security-endpoints.spec.ts",
        "packages/testing/src/security-audit.spec.ts",
      ],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-078",
      title: "Consultar estadísticas de uso",
      epic: "07 - Administración y datos",
      priority: "BAJA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: ["apps/api/test/security-endpoints.spec.ts"],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-079",
      title: "Exportar información e informes",
      epic: "07 - Administración y datos",
      priority: "BAJA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/api/test/security-endpoints.spec.ts",
        "packages/testing/src/security-audit.spec.ts",
      ],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-080",
      title: "Gestionar fuentes con errores",
      epic: "07 - Administración y datos",
      priority: "MEDIA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "apps/mobile/src/features/routing/__tests__/error-handling.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
      ],
      testCategories: ["UNIT", "SECURITY"],
      status: "PASSED",
    },

    // Épica 08: Seguridad, privacidad y calidad
    {
      id: "HU-090",
      title: "Proteger los datos de la cuenta",
      epic: "08 - Seguridad, privacidad y calidad",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "packages/testing/src/security-audit.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
      ],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-091",
      title: "Controlar el acceso a funcionalidades",
      epic: "08 - Seguridad, privacidad y calidad",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/api/test/security-endpoints.spec.ts",
        "packages/testing/src/security-audit.spec.ts",
      ],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-092",
      title: "Gestionar privacidad y consentimiento",
      epic: "08 - Seguridad, privacidad y calidad",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: ["packages/testing/src/security-audit.spec.ts"],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-093",
      title: "Acceder a los datos personales",
      epic: "08 - Seguridad, privacidad y calidad",
      priority: "MEDIA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: ["packages/testing/src/security-audit.spec.ts"],
      testCategories: ["SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-094",
      title: "Gestionar errores y falta de conexión",
      epic: "08 - Seguridad, privacidad y calidad",
      priority: "ALTA",
      sprint: 3,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/mobile/src/features/routing/__tests__/error-handling.spec.ts",
        "apps/mobile/src/features/transit/__tests__/transit-error-handling.spec.ts",
        "apps/mobile/__tests__/system/recovery.spec.ts",
        "apps/api/test/security-endpoints.spec.ts",
      ],
      testCategories: ["UNIT", "INTEGRATION", "RECOVERY", "SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-095",
      title: "Utilizar una interfaz accesible",
      epic: "08 - Seguridad, privacidad y calidad",
      priority: "ALTA",
      sprint: 4,
      acceptanceCriteriaCount: 5,
      testFiles: [
        "apps/mobile/src/features/routing/__tests__/routing.spec.ts",
        "apps/mobile/__tests__/system/use-cases.spec.ts",
      ],
      testCategories: ["UNIT", "SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-096",
      title: "Consultar ayuda y soporte",
      epic: "08 - Seguridad, privacidad y calidad",
      priority: "BAJA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: ["apps/mobile/__tests__/system/use-cases.spec.ts"],
      testCategories: ["SYSTEM"],
      status: "PASSED",
    },
    {
      id: "HU-097",
      title: "Mantener trazabilidad de los cambios relevantes",
      epic: "08 - Seguridad, privacidad y calidad",
      priority: "MEDIA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: [
        "packages/testing/src/traceability.spec.ts",
        "packages/testing/src/security-audit.spec.ts",
      ],
      testCategories: ["UNIT", "SECURITY"],
      status: "PASSED",
    },
    {
      id: "HU-098",
      title: "Recibir actualizaciones de la aplicación",
      epic: "08 - Seguridad, privacidad y calidad",
      priority: "BAJA",
      sprint: 4,
      acceptanceCriteriaCount: 4,
      testFiles: ["apps/mobile/app.config.spec.ts"],
      testCategories: ["UNIT"],
      status: "PASSED",
    },
  ];

export function getAllStories(): readonly StoryTraceabilityEntry[] {
  return REQUIREMENT_TRACEABILITY_MATRIX;
}

export function getStoryById(id: string): StoryTraceabilityEntry | undefined {
  return REQUIREMENT_TRACEABILITY_MATRIX.find((story) => story.id === id);
}

export function getStoriesBySprint(
  sprint: 1 | 2 | 3 | 4,
): readonly StoryTraceabilityEntry[] {
  return REQUIREMENT_TRACEABILITY_MATRIX.filter(
    (story) => story.sprint === sprint,
  );
}

export function getStoriesByEpic(
  epicSubstring: string,
): readonly StoryTraceabilityEntry[] {
  const query = epicSubstring.toLowerCase();
  return REQUIREMENT_TRACEABILITY_MATRIX.filter((story) =>
    story.epic.toLowerCase().includes(query),
  );
}

export function getStoriesByTestCategory(
  category: TestCategory,
): readonly StoryTraceabilityEntry[] {
  return REQUIREMENT_TRACEABILITY_MATRIX.filter((story) =>
    story.testCategories.includes(category),
  );
}

export function calculateTraceabilityMetrics(
  matrix: readonly StoryTraceabilityEntry[] = REQUIREMENT_TRACEABILITY_MATRIX,
): TraceabilityMetrics {
  const total = matrix.length;
  const covered = matrix.filter(
    (s) => s.testFiles.length > 0 && s.status === "PASSED",
  ).length;

  const storiesBySprint: Record<1 | 2 | 3 | 4, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };
  for (const s of matrix) {
    storiesBySprint[s.sprint] += 1;
  }

  const storiesByCategory: Record<TestCategory, number> = {
    UNIT: 0,
    INTEGRATION: 0,
    BLACK_BOX: 0,
    REGRESSION: 0,
    SYSTEM: 0,
    RECOVERY: 0,
    SECURITY: 0,
  };
  for (const s of matrix) {
    for (const cat of s.testCategories) {
      // eslint-disable-next-line security/detect-object-injection
      storiesByCategory[cat] += 1;
    }
  }

  const allPassed = matrix.every((s) => s.status === "PASSED");

  return {
    totalStories: total,
    coveredStories: covered,
    coveragePercentage: total === 0 ? 0 : Math.round((covered / total) * 100),
    storiesBySprint,
    storiesByCategory,
    allQualityGatesPassed: allPassed,
  };
}

export function verifyTraceabilityIntegrity(
  matrix: readonly StoryTraceabilityEntry[] = REQUIREMENT_TRACEABILITY_MATRIX,
): TraceabilityValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const story of matrix) {
    if (seenIds.has(story.id)) {
      errors.push(`Identificador duplicado detectado: ${story.id}`);
    }
    seenIds.add(story.id);

    if (!story.testFiles || story.testFiles.length === 0) {
      errors.push(
        `La historia ${story.id} no tiene ficheros de prueba asignados.`,
      );
    }

    if (!story.testCategories || story.testCategories.length === 0) {
      errors.push(
        `La historia ${story.id} no tiene categorías de prueba asignadas.`,
      );
    }

    if (story.acceptanceCriteriaCount <= 0) {
      errors.push(
        `La historia ${story.id} tiene un conteo inválido de criterios de aceptación.`,
      );
    }
  }

  const metrics = calculateTraceabilityMetrics(matrix);
  const isValid = errors.length === 0 && metrics.coveragePercentage === 100;

  return {
    isValid,
    errors,
    totalVerified: matrix.length,
    coveragePercentage: metrics.coveragePercentage,
  };
}
