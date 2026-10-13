import { Controller, Get, Param, Query } from "@nestjs/common";
import type { PlaceCategory, PlaceDetailResponse, PlaceListResponse } from "@unimovil/contracts";
import { PlacesService } from "./places.service.js";

@Controller("places")
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  /**
   * GET /places
   * Lista general de lugares del campus con filtros opcionales.
   * Ejemplo: /places?category=faculty&accessible=true
   */
  @Get()
  findAll(
    @Query("category") category?: PlaceCategory,
    @Query("accessible") accessible?: string,
    @Query("q") query?: string,
  ): PlaceListResponse {
    return this.placesService.findAll({
      category,
      onlyAccessible: accessible === "true",
      query,
    });
  }

  /**
   * GET /places/search
   * Búsqueda predictiva para la app móvil (HU-013).
   * Ejemplo: /places/search?q=informatica
   */
  @Get("search")
  search(
    @Query("q") query: string = "",
    @Query("category") category?: PlaceCategory,
    @Query("accessible") accessible?: string,
  ): PlaceListResponse {
    return this.placesService.search(query, category, accessible === "true");
  }

  /**
   * GET /places/:id
   * Consulta la ficha detallada de un lugar (HU-014).
   * Ejemplo: /places/fdi
   */
  @Get(":id")
  findOne(@Param("id") id: string): PlaceDetailResponse {
    return this.placesService.findOne(id);
  }
}
