import type {
  Place,
  PlaceCategory,
  PlaceSearchParams,
} from "@unimovil/contracts";
import { LOCAL_CAMPUS_PLACES } from "../data/mockPlaces";

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export const placesService = {
  /**
   * Filtra la lista de lugares según los criterios del usuario (HU-012, HU-013).
   */
  getPlaces(params?: PlaceSearchParams): Place[] {
    let results = LOCAL_CAMPUS_PLACES;

    if (params?.category) {
      results = results.filter((p) => p.category === params.category);
    }

    if (params?.onlyAccessible) {
      results = results.filter((p) => p.hasAccessibleAccess);
    }

    if (params?.query && params.query.trim().length > 0) {
      const q = normalizeText(params.query);
      results = results.filter(
        (p) =>
          normalizeText(p.name).includes(q) ||
          (p.shortName && normalizeText(p.shortName).includes(q)) ||
          normalizeText(p.description).includes(q) ||
          (p.address && normalizeText(p.address).includes(q)),
      );
    }

    return results;
  },

  /**
   * Obtiene el detalle de un lugar por su id (HU-014).
   */
  getPlaceById(id: string): Place | undefined {
    return LOCAL_CAMPUS_PLACES.find((p) => p.id === id);
  },
};
