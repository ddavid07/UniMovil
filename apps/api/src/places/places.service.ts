import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  PlaceDetailResponse,
  PlaceListResponse,
  PlaceSearchParams,
  PlaceSummary,
} from "@unimovil/contracts";
import { CAMPUS_PLACES } from "./places.data.js";

@Injectable()
export class PlacesService {
  /**
   * Obtiene la lista resumida de lugares con filtros opcionales (categoría, accesibilidad).
   */
  findAll(params?: PlaceSearchParams): PlaceListResponse {
    let places = CAMPUS_PLACES;

    if (params?.category) {
      places = places.filter((p) => p.category === params.category);
    }

    if (params?.onlyAccessible) {
      places = places.filter((p) => p.hasAccessibleAccess);
    }

    if (params?.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      places = places.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortName?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    const items: PlaceSummary[] = places.map((p) => ({
      id: p.id,
      name: p.name,
      shortName: p.shortName,
      category: p.category,
      coordinates: p.coordinates,
      hasAccessibleAccess: p.hasAccessibleAccess,
    }));

    return {
      items,
      total: items.length,
    };
  }

  /**
   * Obtiene la ficha detallada de un lugar por su identificador único (HU-014).
   */
  findOne(id: string): PlaceDetailResponse {
    const place = CAMPUS_PLACES.find((p) => p.id === id);
    if (!place) {
      throw new NotFoundException(`Lugar con identificador '${id}' no encontrado.`);
    }

    return { place };
  }

  /**
   * Búsqueda rápida predictiva para el buscador móvil (HU-013).
   */
  search(query: string, category?: string, onlyAccessible?: boolean): PlaceListResponse {
    return this.findAll({
      query,
      category: category as PlaceSearchParams["category"],
      onlyAccessible,
    });
  }
}
