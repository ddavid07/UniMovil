import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from "@nestjs/common";
import type {
  RouteRequest,
  RouteResponse,
  RoutingErrorResponse,
} from "@unimovil/contracts";
import { MONCLOA_CAMPUS_EDGES, MONCLOA_CAMPUS_NODES } from "./campus-graph.js";
import { RoutesService, RoutingServiceException } from "./routes.service.js";

@Controller("routes")
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get("health")
  public healthCheck() {
    return {
      status: "ok",
      campus: "Moncloa",
      nodesCount: MONCLOA_CAMPUS_NODES.length,
      edgesCount: MONCLOA_CAMPUS_EDGES.length,
    };
  }

  @Post("calculate")
  @HttpCode(HttpStatus.OK)
  public calculateRoute(@Body() request: RouteRequest): RouteResponse {
    try {
      return this.routesService.calculateRoute(request);
    } catch (err) {
      if (err instanceof RoutingServiceException) {
        const errorPayload: RoutingErrorResponse = {
          error: true,
          code: err.code,
          message: err.message,
          userMessage: err.userMessage,
          recommendedAction: err.recommendedAction,
          retryable: err.retryable,
          timestamp: new Date().toISOString(),
        };

        switch (err.code) {
          case "INVALID_COORDINATES":
          case "ORIGIN_OUT_OF_BOUNDS":
          case "DESTINATION_OUT_OF_BOUNDS":
          case "IDENTICAL_POINTS":
            throw new BadRequestException(errorPayload);
          case "NO_ROUTE_FOUND":
          case "NO_ACCESSIBLE_ROUTE":
            throw new NotFoundException(errorPayload);
          default:
            throw new InternalServerErrorException(errorPayload);
        }
      }

      throw new InternalServerErrorException({
        error: true,
        code: "SERVER_ERROR",
        message: "Error interno del servidor al procesar la ruta.",
        userMessage: "Ha ocurrido un error inesperado al calcular la ruta.",
        recommendedAction: "Inténtelo de nuevo más tarde.",
        retryable: true,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
