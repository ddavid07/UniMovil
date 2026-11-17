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
        const error = new Error(
          "El punto de origen se encuentra fuera de los límites del campus de Moncloa.",
        );
        Object.assign(error, {
          code: "ORIGIN_OUT_OF_BOUNDS",
          userMessage:
            "El punto de origen se encuentra fuera de los límites del campus de Moncloa.",
          recommendedAction:
            "Seleccione un origen dentro de Ciudad Universitaria.",
        });
        reject(error);
        return;
      }

      if (!isWithinCampusBounds(destination)) {
        const error = new Error(
          "El destino se encuentra fuera de los límites del campus de Moncloa.",
        );
        Object.assign(error, {
          code: "DESTINATION_OUT_OF_BOUNDS",
          userMessage:
            "El destino se encuentra fuera de los límites del campus de Moncloa.",
          recommendedAction:
            "Seleccione un destino dentro de Ciudad Universitaria.",
        });
        reject(error);
        return;
      }

      const distance = haversineDistanceMeters(origin, destination);
      if (distance < 5) {
        const error = new Error("El origen y el destino son el mismo punto.");
        Object.assign(error, {
          code: "IDENTICAL_POINTS",
          userMessage: "El origen y el destino son el mismo punto.",
          recommendedAction:
            "Seleccione dos lugares diferentes en el campus.",
        });
        reject(error);
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

export interface OsrmRoutingConfig {
  readonly baseUrl?: string | undefined;
  readonly fetchFn?: typeof fetch | undefined;
  readonly fallbackRepository?: RoutingRepository | undefined;
  readonly timeoutMs?: number | undefined;
}

export function createOsrmRoutingRepository(
  config?: OsrmRoutingConfig,
): RoutingRepository {
  const fetcher =
    config?.fetchFn ?? (typeof fetch !== "undefined" ? fetch : undefined);
  const fallback = config?.fallbackRepository ?? localRoutingRepository;
  const baseUrl = config?.baseUrl ?? "https://router.project-osrm.org";
  const timeoutMs = config?.timeoutMs ?? 3000;

  return {
    async calculateRoute(request: RouteRequest): Promise<RouteResponse> {
      const { origin, destination, accessibleOnly = false } = request;

      if (!isWithinCampusBounds(origin)) {
        const error = new Error(
          "El punto de origen se encuentra fuera de los límites del campus de Moncloa.",
        );
        Object.assign(error, {
          code: "ORIGIN_OUT_OF_BOUNDS",
          userMessage:
            "El punto de origen se encuentra fuera de los límites del campus de Moncloa.",
          recommendedAction:
            "Seleccione un origen dentro de Ciudad Universitaria.",
        });
        throw error;
      }

      if (!isWithinCampusBounds(destination)) {
        const error = new Error(
          "El destino se encuentra fuera de los límites del campus de Moncloa.",
        );
        Object.assign(error, {
          code: "DESTINATION_OUT_OF_BOUNDS",
          userMessage:
            "El destino se encuentra fuera de los límites del campus de Moncloa.",
          recommendedAction:
            "Seleccione un destino dentro de Ciudad Universitaria.",
        });
        throw error;
      }

      const distance = haversineDistanceMeters(origin, destination);
      if (distance < 5) {
        const error = new Error("El origen y el destino son el mismo punto.");
        Object.assign(error, {
          code: "IDENTICAL_POINTS",
          userMessage: "El origen y el destino son el mismo punto.",
          recommendedAction:
            "Seleccione dos lugares diferentes en el campus.",
        });
        throw error;
      }

      if (!fetcher) {
        return fallback.calculateRoute(request);
      }

      try {
        const url = `${baseUrl}/route/v1/foot/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson&steps=true`;

        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        let signal: AbortSignal | undefined;
        if (typeof AbortController !== "undefined") {
          const controller = new AbortController();
          signal = controller.signal;
          timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        }

        const fetchOptions: RequestInit = {
          headers: { Accept: "application/json" },
          ...(signal ? { signal } : {}),
        };

        const response = await fetcher(url, fetchOptions);

        if (timeoutId) clearTimeout(timeoutId);

        if (!response.ok) {
          return fallback.calculateRoute(request);
        }

        const data = (await response.json()) as {
          code?: string;
          routes?: Array<{
            distance?: number;
            duration?: number;
            geometry?: {
              coordinates?: Array<[number, number]>;
            };
            legs?: Array<{
              steps?: Array<{
                name?: string;
                distance?: number;
                duration?: number;
                geometry?: {
                  coordinates?: Array<[number, number]>;
                };
              }>;
            }>;
          }>;
        };

        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
          return fallback.calculateRoute(request);
        }

        const routeData = data.routes[0];
        const rawCoords = routeData?.geometry?.coordinates;
        if (!rawCoords || !Array.isArray(rawCoords) || rawCoords.length < 2) {
          return fallback.calculateRoute(request);
        }

        const polyline: Coordinates[] = rawCoords.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        }));

        const totalDistanceMeters = Math.round(routeData.distance ?? distance);
        const estimatedDurationMinutes = Math.max(
          1,
          Math.round(totalDistanceMeters / 75),
        );

        const rawSteps = routeData.legs?.[0]?.steps ?? [];
        let segments: RouteSegment[];

        if (rawSteps.length > 0) {
          segments = rawSteps.map((step, index) => {
            const stepCoords: Coordinates[] = (
              step.geometry?.coordinates ?? []
            ).map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
            const stepName = step.name?.trim();
            const instruction =
              index === 0
                ? stepName
                  ? `Sal por ${stepName}`
                  : "Avanza por la vía peatonal de salida"
                : index === rawSteps.length - 1
                  ? stepName
                    ? `Llegada a ${stepName}`
                    : "Llegada al destino en el campus"
                  : stepName
                    ? `Avanza por ${stepName}`
                    : "Continúa por el sendero peatonal";

            return {
              id: `seg-osrm-${index}`,
              sourceNodeId: `node-step-${index}`,
              targetNodeId: `node-step-${index + 1}`,
              instruction,
              distanceMeters: Math.round(step.distance ?? 0),
              durationSeconds: Math.round(step.duration ?? 0),
              isAccessible: true,
              hasStairs: false,
              hasRamp: accessibleOnly,
              pathCoordinates: stepCoords.length > 0 ? stepCoords : polyline,
            };
          });
        } else {
          segments = [
            {
              id: "seg-osrm-1",
              sourceNodeId: "node-origin",
              targetNodeId: "node-dest",
              instruction: accessibleOnly
                ? "Avanza por los senderos adaptados y viales accesibles del campus"
                : "Avanza por los senderos y viales peatonales del campus",
              distanceMeters: totalDistanceMeters,
              durationSeconds: estimatedDurationMinutes * 60,
              isAccessible: true,
              hasStairs: false,
              hasRamp: accessibleOnly,
              pathCoordinates: polyline,
            },
          ];
        }

        return {
          id: `route-osrm-${Date.now()}`,
          origin,
          destination,
          totalDistanceMeters,
          estimatedDurationMinutes,
          accessible: accessibleOnly,
          segments,
          polyline,
          mode: "walking",
        };
      } catch {
        return fallback.calculateRoute(request);
      }
    },
  };
}

export const defaultRoutingRepository: RoutingRepository =
  createOsrmRoutingRepository();
