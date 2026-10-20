import type { Place } from "@unimovil/contracts";

/**
 * Catálogo inicial de datos de referencia para el campus de Moncloa (UCM).
 * Coordenadas WGS84 contrastadas para las facultades y servicios principales.
 */
export const CAMPUS_PLACES: Place[] = [
  {
    id: "fdi",
    name: "Facultad de Informática",
    shortName: "FDI",
    category: "faculty",
    description:
      "Facultad de Informática de la UCM. Centro docente e investigador en ingeniería informática.",
    coordinates: {
      latitude: 40.4526,
      longitude: -3.7335,
    },
    address: "Calle del Prof. José García Santesmases, 9, 28040 Madrid",
    openingHours: "Lunes a Viernes de 08:00 a 21:30",
    contactEmail: "secretaria_alumnos@fdi.ucm.es",
    websiteUrl: "https://informatica.ucm.es",
    hasAccessibleAccess: true,
    accessPoints: [
      {
        id: "fdi-p1",
        name: "Entrada principal (con rampa)",
        coordinates: { latitude: 40.4526, longitude: -3.7335 },
        isAccessible: true,
        hasRamp: true,
        hasElevator: true,
      },
      {
        id: "fdi-p2",
        name: "Entrada trasera aparcamiento",
        coordinates: { latitude: 40.4531, longitude: -3.734 },
        isAccessible: true,
        hasRamp: true,
      },
    ],
  },
  {
    id: "matematicas",
    name: "Facultad de Ciencias Matemáticas",
    shortName: "Matemáticas",
    category: "faculty",
    description:
      "Facultad de Matemáticas de la UCM. Formación e investigación matemática y estadística.",
    coordinates: {
      latitude: 40.4497,
      longitude: -3.7259,
    },
    address: "Plaza de Ciencias, 3, 28040 Madrid",
    openingHours: "Lunes a Viernes de 08:00 a 21:00",
    contactEmail: "secre.alumnos@mat.ucm.es",
    websiteUrl: "https://matematicas.ucm.es",
    hasAccessibleAccess: true,
    accessPoints: [
      {
        id: "mat-p1",
        name: "Entrada principal Plaza de Ciencias",
        coordinates: { latitude: 40.4497, longitude: -3.7259 },
        isAccessible: true,
        hasRamp: true,
        hasElevator: true,
      },
    ],
  },
  {
    id: "fisicas",
    name: "Facultad de Ciencias Físicas",
    shortName: "Físicas",
    category: "faculty",
    description: "Facultad de Ciencias Físicas de la UCM.",
    coordinates: {
      latitude: 40.4509,
      longitude: -3.7255,
    },
    address: "Plaza de Ciencias, 1, 28040 Madrid",
    openingHours: "Lunes a Viernes de 08:00 a 21:00",
    hasAccessibleAccess: true,
    accessPoints: [
      {
        id: "fis-p1",
        name: "Entrada principal",
        coordinates: { latitude: 40.4509, longitude: -3.7255 },
        isAccessible: true,
        hasRamp: true,
        hasElevator: true,
      },
    ],
  },
  {
    id: "quimicas",
    name: "Facultad de Ciencias Químicas",
    shortName: "Químicas",
    category: "faculty",
    description: "Facultad de Ciencias Químicas de la UCM.",
    coordinates: {
      latitude: 40.4503,
      longitude: -3.7275,
    },
    address: "Avenida Complutense, s/n, 28040 Madrid",
    openingHours: "Lunes a Viernes de 08:00 a 21:00",
    hasAccessibleAccess: true,
    accessPoints: [
      {
        id: "qui-p1",
        name: "Entrada principal Avenida Complutense",
        coordinates: { latitude: 40.4503, longitude: -3.7275 },
        isAccessible: true,
        hasRamp: true,
      },
    ],
  },
  {
    id: "medicina",
    name: "Facultad de Medicina",
    shortName: "Medicina",
    category: "faculty",
    description:
      "Facultad de Medicina y Pabellón de Gobierno de Ciencias de la Salud.",
    coordinates: {
      latitude: 40.4429,
      longitude: -3.728,
    },
    address: "Plaza de Ramón y Cajal, s/n, 28040 Madrid",
    openingHours: "Lunes a Viernes de 08:00 a 21:00",
    hasAccessibleAccess: true,
    accessPoints: [
      {
        id: "med-p1",
        name: "Entrada Ramón y Cajal",
        coordinates: { latitude: 40.4429, longitude: -3.728 },
        isAccessible: true,
        hasRamp: true,
        hasElevator: true,
      },
    ],
  },
  {
    id: "zambrano",
    name: "Biblioteca María Zambrano",
    shortName: "Bibl. María Zambrano",
    category: "library",
    description:
      "Biblioteca central y sala de estudio principal del campus de Moncloa.",
    coordinates: {
      latitude: 40.4402,
      longitude: -3.7196,
    },
    address: "Calle del Prof. Aranguren, s/n, 28040 Madrid",
    openingHours: "Lunes a Domingo de 09:00 a 21:00 (ampliado en exámenes)",
    hasAccessibleAccess: true,
    accessPoints: [
      {
        id: "zam-p1",
        name: "Entrada accesible Calle Profesor Aranguren",
        coordinates: { latitude: 40.4402, longitude: -3.7196 },
        isAccessible: true,
        hasRamp: true,
        hasElevator: true,
      },
    ],
  },
  {
    id: "metro-ciudad-universitaria",
    name: "Estación de Metro Ciudad Universitaria",
    shortName: "Metro Cdad. Universitaria",
    category: "transport",
    description:
      "Estación de Metro de Madrid (Línea 6, Circular) y cabecera de autobuses de la EMT.",
    coordinates: {
      latitude: 40.4438,
      longitude: -3.7261,
    },
    address: "Avenida Complutense, 28040 Madrid",
    openingHours: "Lunes a Domingo de 06:00 a 01:30",
    hasAccessibleAccess: true,
    accessPoints: [
      {
        id: "metro-ascensor",
        name: "Ascensores de acceso a andenes y vestíbulo",
        coordinates: { latitude: 40.4438, longitude: -3.7261 },
        isAccessible: true,
        hasElevator: true,
      },
    ],
  },
  {
    id: "paraninfo",
    name: "Complejo Deportivo Zona Sur (Paraninfo)",
    shortName: "Deportes Paraninfo",
    category: "sports",
    description:
      "Pistas de atletismo, campos deportivos, piscina y actividades deportivas de la UCM.",
    coordinates: {
      latitude: 40.4447,
      longitude: -3.7323,
    },
    address: "Avenida de Juan de Herrera, s/n, 28040 Madrid",
    openingHours: "Lunes a Sábado de 09:00 a 21:00",
    hasAccessibleAccess: true,
    accessPoints: [
      {
        id: "par-p1",
        name: "Entrada principal Avenida Juan de Herrera",
        coordinates: { latitude: 40.4447, longitude: -3.7323 },
        isAccessible: true,
        hasRamp: true,
      },
    ],
  },
];
