import {
  isWithinCampusBounds,
  type Coordinates,
  type RouteRequest,
  type RouteResponse,
  type RouteSegment,
} from "@unimovil/contracts";

export interface RoutingRepository {
  calculateRoute(request: RouteRequest): Promise<RouteResponse>;
}

export interface HttpRoutingConfig {
  readonly baseUrl: string;
  readonly fetchFn?: typeof fetch;
}

function haversineDistanceMeters(a: Coordinates, b: Coordinates): number {
  const earthRadiusMeters = 6371000;
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const deltaLat = toRadians(b.latitude - a.latitude);
  const deltaLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinDeltaLat = Math.sin(deltaLat / 2);
  const sinDeltaLon = Math.sin(deltaLon / 2);

  const chord =
    sinDeltaLat * sinDeltaLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDeltaLon * sinDeltaLon;
  const angularDistance =
    2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));

  return earthRadiusMeters * angularDistance;
}

export function createHttpRoutingRepository(
  config: HttpRoutingConfig,
): RoutingRepository {
  const fetcher = config.fetchFn ?? fetch;
  const url = `${config.baseUrl.replace(/\/+$/, "")}/routes/calculate`;

  return {
    async calculateRoute(request: RouteRequest): Promise<RouteResponse> {
      const response = await fetcher(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let message = `Error ${response.status}: no se pudo calcular la ruta.`;
        try {
          const body = (await response.json()) as { userMessage?: string };
          if (body?.userMessage) {
            message = body.userMessage;
          }
        } catch {
          // Si no es JSON, se conserva el mensaje genérico
        }
        throw new Error(message);
      }

      return (await response.json()) as RouteResponse;
    },
  };
}

export const localRoutingRepository: RoutingRepository = {
  calculateRoute(request: RouteRequest): Promise<RouteResponse> {
    return new Promise((resolve, reject) => {
      const { origin, destination, accessibleOnly = false } = request;

      if (!isWithinCampusBounds(origin)) {
        reject(
          new Error(
            "El punto de origen se encuentra fuera de los límites del campus de Moncloa.",
          ),
        );
        return;
      }

      if (!isWithinCampusBounds(destination)) {
        reject(
          new Error(
            "El destino se encuentra fuera de los límites del campus de Moncloa.",
          ),
        );
        return;
      }

      const distance = haversineDistanceMeters(origin, destination);
      if (distance < 5) {
        reject(new Error("El origen y el destino son el mismo punto."));
        return;
      }

      // Generar punto intermedio para crear un camino peatonal realista
      const midPoint: Coordinates = {
        latitude:
          (origin.latitude + destination.latitude) / 2 +
          (accessibleOnly ? 0.0003 : 0.0001),
        longitude:
          (origin.longitude + destination.longitude) / 2 -
          (accessibleOnly ? 0.0002 : 0.0001),
      };

      const polyline: Coordinates[] = [origin, midPoint, destination];
      const segmentDistance1 = Math.round(
        haversineDistanceMeters(origin, midPoint),
      );
      const segmentDistance2 = Math.round(
        haversineDistanceMeters(midPoint, destination),
      );
      const totalDistance = segmentDistance1 + segmentDistance2;
      const durationMinutes = Math.max(1, Math.round(totalDistance / 75)); // ~4.5 km/h

      const segments: RouteSegment[] = [
        {
          id: "seg-1",
          sourceNodeId: "node-origin",
          targetNodeId: "node-mid",
          instruction: accessibleOnly
            ? "Avanza por el sendero adaptado y rampa hacia el cruce central"
            : "Avanza por la vía peatonal principal",
          distanceMeters: segmentDistance1,
          durationSeconds: Math.round((segmentDistance1 / 75) * 60),
          isAccessible: true,
          hasStairs: false,
          hasRamp: accessibleOnly,
          pathCoordinates: [origin, midPoint],
        },
        {
          id: "seg-2",
          sourceNodeId: "node-mid",
          targetNodeId: "node-dest",
          instruction: accessibleOnly
            ? "Gira suavemente por el acceso nivelado hacia el destino"
            : "Sube las escaleras de acceso al edificio de destino",
          distanceMeters: segmentDistance2,
          durationSeconds: Math.round((segmentDistance2 / 75) * 60),
          isAccessible: accessibleOnly,
          hasStairs: !accessibleOnly,
          hasRamp: accessibleOnly,
          pathCoordinates: [midPoint, destination],
        },
      ];

      resolve({
        id: `route-${Date.now()}`,
        origin,
        destination,
        totalDistanceMeters: totalDistance,
        estimatedDurationMinutes: durationMinutes,
        accessible: accessibleOnly,
        segments,
        polyline,
      });
    });
  },
};
