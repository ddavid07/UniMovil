import { Injectable } from "@nestjs/common";
import {
  isWithinCampusBounds,
  type Coordinates,
  type RouteRequest,
  type RouteResponse,
  type RouteSegment,
  type RoutingErrorCode,
} from "@unimovil/contracts";
import {
  MONCLOA_CAMPUS_EDGES,
  MONCLOA_CAMPUS_NODES,
  type CampusEdge,
  type CampusNode,
} from "./campus-graph.js";

export class RoutingServiceException extends Error {
  constructor(
    public readonly code: RoutingErrorCode,
    public readonly userMessage: string,
    public readonly recommendedAction: string,
    public readonly retryable: boolean = false,
  ) {
    super(userMessage);
    this.name = "RoutingServiceException";
  }
}

interface DijkstraStep {
  readonly distance: number;
  readonly previousNode: string | null;
  readonly edgeUsed: CampusEdge | null;
}

@Injectable()
export class RoutesService {
  private readonly nodes: readonly CampusNode[] = MONCLOA_CAMPUS_NODES;
  private readonly edges: readonly CampusEdge[] = MONCLOA_CAMPUS_EDGES;

  /**
   * Velocidad media de paso peatonal: 4.5 km/h = 1.25 m/s.
   */
  private static readonly WALKING_SPEED_METERS_PER_SECOND = 1.25;

  public calculateRoute(request: RouteRequest): RouteResponse {
    // 1. Decisión / Predicado 1: Coordenadas sintácticamente válidas
    if (
      !request ||
      !this.isValidCoordinate(request.origin) ||
      !this.isValidCoordinate(request.destination)
    ) {
      throw new RoutingServiceException(
        "INVALID_COORDINATES",
        "Las coordenadas de origen o destino no son válidas.",
        "Seleccione un punto válido en el mapa o use el buscador.",
        false,
      );
    }

    const { origin, destination, accessibleOnly = false } = request;

    // 2. Decisión / Predicado 2: Origen dentro del Campus de Moncloa
    if (!isWithinCampusBounds(origin)) {
      throw new RoutingServiceException(
        "ORIGIN_OUT_OF_BOUNDS",
        "El punto de origen se encuentra fuera de los límites del campus de Moncloa.",
        "Seleccione un origen dentro de Ciudad Universitaria.",
        false,
      );
    }

    // 3. Decisión / Predicado 3: Destino dentro del Campus de Moncloa
    if (!isWithinCampusBounds(destination)) {
      throw new RoutingServiceException(
        "DESTINATION_OUT_OF_BOUNDS",
        "El destino se encuentra fuera de los límites del campus de Moncloa.",
        "Seleccione un destino dentro de Ciudad Universitaria.",
        false,
      );
    }

    // 4. Decisión / Predicado 4: Puntos idénticos o distancia menor a 5 metros
    const directDistance = this.haversineDistanceMeters(origin, destination);
    if (directDistance < 5) {
      throw new RoutingServiceException(
        "IDENTICAL_POINTS",
        "El origen y el destino son el mismo punto.",
        "Seleccione dos lugares diferentes para calcular una ruta.",
        false,
      );
    }

    // Localizar nodos más cercanos en el grafo de Moncloa
    const startNode = this.findNearestNode(origin);
    const targetNode = this.findNearestNode(destination);

    // 5. Ejecutar Dijkstra con o sin filtro PMR
    const routeSolution = this.runDijkstra(
      startNode.id,
      targetNode.id,
      accessibleOnly,
    );

    // 6. Decisión / Predicado 5: Verificar si se halló camino
    if (!routeSolution) {
      // 7. Decisión / Predicado 6: Comprobar si existe camino sin restricción PMR
      if (accessibleOnly) {
        const standardSolution = this.runDijkstra(
          startNode.id,
          targetNode.id,
          false,
        );
        if (standardSolution) {
          throw new RoutingServiceException(
            "NO_ACCESSIBLE_ROUTE",
            "No se ha encontrado una ruta adaptada sin barreras arquitectónicas hasta el destino seleccionado.",
            "Desactive el conmutador de accesibilidad PMR si puede salvar escaleras o elija un acceso alternativo.",
            false,
          );
        }
      }

      throw new RoutingServiceException(
        "NO_ROUTE_FOUND",
        "No existe ningún itinerario peatonal conectado entre los puntos seleccionados.",
        "Compruebe que ambos puntos están en zonas habilitadas para peatones.",
        false,
      );
    }

    // Ensamblar respuesta con métricas y pasos (HU-021, HU-023, HU-024)
    return this.assembleResponse(
      origin,
      destination,
      accessibleOnly,
      routeSolution,
    );
  }

  private runDijkstra(
    startNodeId: string,
    targetNodeId: string,
    accessibleOnly: boolean,
  ): { totalDistance: number; edges: CampusEdge[] } | null {
    if (startNodeId === targetNodeId) {
      return { totalDistance: 0, edges: [] };
    }

    const distances: Map<string, DijkstraStep> = new Map();
    const unvisited: Set<string> = new Set();

    for (const node of this.nodes) {
      distances.set(node.id, {
        distance: node.id === startNodeId ? 0 : Infinity,
        previousNode: null,
        edgeUsed: null,
      });
      unvisited.add(node.id);
    }

    while (unvisited.size > 0) {
      // Obtener nodo no visitado con menor distancia
      let currentId: string | null = null;
      let minDistance = Infinity;

      for (const id of unvisited) {
        const step = distances.get(id);
        if (step && step.distance < minDistance) {
          minDistance = step.distance;
          currentId = id;
        }
      }

      if (!currentId || minDistance === Infinity) {
        break;
      }

      if (currentId === targetNodeId) {
        break;
      }

      unvisited.delete(currentId);

      // Explorar aristas adyacentes (bidireccionales)
      const outgoingEdges = this.getAdjacentEdges(currentId, accessibleOnly);

      for (const edge of outgoingEdges) {
        const neighborId =
          edge.source === currentId ? edge.target : edge.source;
        if (!unvisited.has(neighborId)) {
          continue;
        }

        const tentativeDistance = minDistance + edge.distanceMeters;
        const currentNeighborStep = distances.get(neighborId);

        if (
          currentNeighborStep &&
          tentativeDistance < currentNeighborStep.distance
        ) {
          distances.set(neighborId, {
            distance: tentativeDistance,
            previousNode: currentId,
            edgeUsed: edge,
          });
        }
      }
    }

    const targetStep = distances.get(targetNodeId);
    if (!targetStep || targetStep.distance === Infinity) {
      return null;
    }

    // Reconstruir camino hacia atrás
    const pathEdges: CampusEdge[] = [];
    let curr = targetNodeId;

    while (curr !== startNodeId) {
      const step = distances.get(curr);
      if (!step || !step.edgeUsed || !step.previousNode) {
        break;
      }
      pathEdges.unshift(step.edgeUsed);
      curr = step.previousNode;
    }

    return {
      totalDistance: targetStep.distance,
      edges: pathEdges,
    };
  }

  private getAdjacentEdges(
    nodeId: string,
    accessibleOnly: boolean,
  ): CampusEdge[] {
    return this.edges.filter((edge) => {
      const connects = edge.source === nodeId || edge.target === nodeId;
      if (!connects) {
        return false;
      }
      if (accessibleOnly && edge.hasStairs && !edge.hasRamp) {
        return false;
      }
      return true;
    });
  }

  private findNearestNode(coords: Coordinates): CampusNode {
    let nearest: CampusNode = MONCLOA_CAMPUS_NODES[0] as CampusNode;
    let minDistance = Infinity;

    for (const node of this.nodes) {
      const dist = this.haversineDistanceMeters(coords, node.coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = node;
      }
    }

    return nearest;
  }

  public haversineDistanceMeters(
    coord1: Coordinates,
    coord2: Coordinates,
  ): number {
    const earthRadiusMeters = 6371000;
    const lat1Rad = (coord1.latitude * Math.PI) / 180;
    const lat2Rad = (coord2.latitude * Math.PI) / 180;
    const deltaLatRad = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const deltaLonRad = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLonRad / 2) *
        Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(earthRadiusMeters * c);
  }

  private isValidCoordinate(c: Coordinates | undefined | null): boolean {
    return (
      Boolean(c) &&
      typeof c?.latitude === "number" &&
      typeof c?.longitude === "number" &&
      !Number.isNaN(c?.latitude) &&
      !Number.isNaN(c?.longitude)
    );
  }

  private assembleResponse(
    origin: Coordinates,
    destination: Coordinates,
    accessible: boolean,
    solution: { totalDistance: number; edges: CampusEdge[] },
  ): RouteResponse {
    const segments: RouteSegment[] = [];
    const polyline: Coordinates[] = [origin];

    for (const edge of solution.edges) {
      const durationSeconds = Math.round(
        edge.distanceMeters / RoutesService.WALKING_SPEED_METERS_PER_SECOND,
      );

      segments.push({
        id: edge.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        instruction: edge.instruction,
        distanceMeters: edge.distanceMeters,
        durationSeconds,
        isAccessible: !edge.hasStairs || edge.hasRamp,
        hasStairs: edge.hasStairs,
        hasRamp: edge.hasRamp,
        pathCoordinates: edge.path,
      });

      for (const pt of edge.path) {
        polyline.push(pt);
      }
    }

    polyline.push(destination);

    const totalDistanceMeters =
      solution.totalDistance > 0
        ? solution.totalDistance
        : this.haversineDistanceMeters(origin, destination);

    const estimatedDurationMinutes = Math.max(
      1,
      Math.round(
        totalDistanceMeters /
          (RoutesService.WALKING_SPEED_METERS_PER_SECOND * 60),
      ),
    );

    return {
      id: `route-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      origin,
      destination,
      totalDistanceMeters,
      estimatedDurationMinutes,
      accessible,
      segments,
      polyline,
    };
  }
}
