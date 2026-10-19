/**
 * Coordenadas geográficas estándar (WGS84).
 */
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Categorías principales de lugares en el campus de Moncloa.
 */
export type PlaceCategory =
  | "faculty"        // Facultades (Informática, Matemáticas, etc.)
  | "library"        // Bibliotecas
  | "cafeteria"      // Cafeterías y comedores universitarios
  | "sports"         // Instalaciones deportivas (Paraninfo, piscina)
  | "administration" // Rectorado, secretarías, gestión
  | "transport"      // Paradas de autobús EMT, metro Ciudad Universitaria
  | "service";       // Reprografía, cajeros, atención al estudiante

/**
 * Puntos de acceso y entradas a un edificio o recinto.
 */
export interface AccessPoint {
  id: string;
  name: string;
  coordinates: GeoCoordinates;
  isAccessible: boolean; // Adaptado para personas con movilidad reducida (PMR)
  hasRamp?: boolean | undefined;
  hasElevator?: boolean | undefined;
}

/**
 * Modelo completo de un Lugar en el campus (HU-014).
 */
export interface Place {
  id: string;
  name: string;
  shortName?: string | undefined;
  category: PlaceCategory;
  description: string;
  coordinates: GeoCoordinates;
  address?: string | undefined;
  openingHours?: string | undefined;
  contactEmail?: string | undefined;
  websiteUrl?: string | undefined;
  accessPoints: AccessPoint[];
  hasAccessibleAccess: boolean;
}

/**
 * Resumen ligero de un lugar para listas y marcadores en mapa (HU-010, HU-013).
 */
export interface PlaceSummary {
  id: string;
  name: string;
  shortName?: string | undefined;
  category: PlaceCategory;
  coordinates: GeoCoordinates;
  hasAccessibleAccess: boolean;
}

/**
 * Parámetros para la búsqueda y filtrado de lugares (HU-012, HU-013).
 */
export interface PlaceSearchParams {
  query?: string | undefined;
  category?: PlaceCategory | undefined;
  onlyAccessible?: boolean | undefined;
}

/**
 * Respuestas estándar de la API de lugares.
 */
export interface PlaceListResponse {
  items: PlaceSummary[];
  total: number;
}

export interface PlaceDetailResponse {
  place: Place;
}
