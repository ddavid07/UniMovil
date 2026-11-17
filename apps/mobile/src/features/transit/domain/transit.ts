import type {
  Coordinates,
  MultimodalAlternative,
  RouteResponse,
  RouteSegment,
  TransitLine,
  TransitStop,
  TransportMode,
} from "@unimovil/contracts";
import {
  CAMPUS_TRANSIT_LINES,
  CAMPUS_TRANSIT_STOPS,
} from "../data/transit-data";

export function haversineMeters(c1: Coordinates, c2: Coordinates): number {
  const earthRadiusMeters = 6371000;
  const lat1Rad = (c1.latitude * Math.PI) / 180;
  const lat2Rad = (c2.latitude * Math.PI) / 180;
  const deltaLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const deltaLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusMeters * c);
}

export function findNearestStop(
  coords: Coordinates,
  stops: readonly TransitStop[],
): { stop: TransitStop; distanceMeters: number } | null {
  const [firstStop] = stops;
  if (!firstStop) return null;

  let bestStop = firstStop;
  let minDistance = haversineMeters(coords, firstStop.coordinates);

  for (const s of stops) {
    const d = haversineMeters(coords, s.coordinates);
    if (d < minDistance) {
      minDistance = d;
      bestStop = s;
    }
  }

  return { stop: bestStop, distanceMeters: minDistance };
}

function computeBusAlternative(
  origin: Coordinates,
  destination: Coordinates,
  walkingDistance: number,
  lines: readonly TransitLine[],
  stops: readonly TransitStop[],
  accessibleOnly: boolean,
): MultimodalAlternative {
  if (walkingDistance < 300) {
    return {
      mode: "bus",
      label: "Autobús EMT",
      durationMinutes: 0,
      distanceMeters: walkingDistance,
      accessible: true,
      transfers: 0,
      available: false,
      unavailableReason: "Para esta distancia corta es más rápido ir a pie",
    };
  }

  const originNearest = findNearestStop(origin, stops);
  const destNearest = findNearestStop(destination, stops);

  if (
    !originNearest ||
    !destNearest ||
    originNearest.stop.id === destNearest.stop.id
  ) {
    return {
      mode: "bus",
      label: "Autobús EMT",
      durationMinutes: 0,
      distanceMeters: walkingDistance,
      accessible: true,
      transfers: 0,
      available: false,
      unavailableReason:
        "No hay paradas de autobús conectadas para este trayecto",
    };
  }

  const commonLine =
    lines.find(
      (l) =>
        l.stops.some((s) => s.id === originNearest.stop.id) &&
        l.stops.some((s) => s.id === destNearest.stop.id),
    ) ?? lines[0];

  const walkToStopMins = Math.max(
    1,
    Math.round(originNearest.distanceMeters / 75),
  );
  const walkFromStopMins = Math.max(
    1,
    Math.round(destNearest.distanceMeters / 75),
  );
  const waitMins = 3;
  const transitMins = 4;
  const totalDuration =
    walkToStopMins + waitMins + transitMins + walkFromStopMins;

  const accessible =
    originNearest.stop.wheelchairAccessible &&
    destNearest.stop.wheelchairAccessible;

  if (accessibleOnly && !accessible) {
    return {
      mode: "bus",
      label: `Autobús EMT ${commonLine ? commonLine.name : ""}`.trim(),
      durationMinutes: totalDuration,
      distanceMeters: walkingDistance + 100,
      accessible: false,
      transfers: 0,
      available: false,
      unavailableReason: "Parada de origen o destino sin adaptación PMR",
    };
  }

  return {
    mode: "bus",
    label: `Autobús EMT ${commonLine ? commonLine.name : "Línea G"}`.trim(),
    durationMinutes: totalDuration,
    distanceMeters: walkingDistance + 150,
    accessible,
    transfers: 0,
    available: true,
    lineCode: commonLine?.code ?? "G",
    originStop: originNearest.stop.name,
    destinationStop: destNearest.stop.name,
    walkingToStopMinutes: walkToStopMins,
    transitRideMinutes: transitMins,
    walkingFromStopMinutes: walkFromStopMins,
    isRecommended: totalDuration < Math.round(walkingDistance / 75),
  };
}

function computeBikeAlternative(
  walkingDistance: number,
  accessibleOnly: boolean,
): MultimodalAlternative {
  if (accessibleOnly) {
    return {
      mode: "bicycle",
      label: "Bicicleta · BiciMAD",
      durationMinutes: 0,
      distanceMeters: walkingDistance,
      accessible: false,
      transfers: 0,
      available: false,
      unavailableReason: "No adaptado para movilidad reducida (PMR)",
    };
  }

  const bikeDuration = Math.max(2, Math.round(walkingDistance / 250) + 2);

  return {
    mode: "bicycle",
    label: "Bicicleta · BiciMAD",
    durationMinutes: bikeDuration,
    distanceMeters: walkingDistance,
    accessible: false,
    transfers: 0,
    available: true,
  };
}

export function calculateMultimodalAlternatives(
  origin: Coordinates,
  destination: Coordinates,
  walkingRoute: RouteResponse,
  options?: {
    accessibleOnly?: boolean;
    lines?: readonly TransitLine[];
    stops?: readonly TransitStop[];
  },
): readonly MultimodalAlternative[] {
  const accessibleOnly = options?.accessibleOnly ?? false;
  const lines = options?.lines ?? CAMPUS_TRANSIT_LINES;
  const stops = options?.stops ?? CAMPUS_TRANSIT_STOPS;

  const walkingDurationMinutes =
    walkingRoute.mode && walkingRoute.mode !== "walking"
      ? Math.max(1, Math.round(walkingRoute.totalDistanceMeters / 75))
      : walkingRoute.estimatedDurationMinutes;

  const walkingAlternative: MultimodalAlternative = {
    mode: "walking",
    label: "A pie",
    durationMinutes: walkingDurationMinutes,
    distanceMeters: walkingRoute.totalDistanceMeters,
    accessible: walkingRoute.accessible,
    transfers: 0,
    available: true,
    isRecommended: walkingRoute.totalDistanceMeters <= 500,
  };

  const busAlternative = computeBusAlternative(
    origin,
    destination,
    walkingRoute.totalDistanceMeters,
    lines,
    stops,
    accessibleOnly,
  );

  const bikeAlternative = computeBikeAlternative(
    walkingRoute.totalDistanceMeters,
    accessibleOnly,
  );

  return [walkingAlternative, busAlternative, bikeAlternative];
}

function findNearestCoordinateIndex(
  polyline: readonly Coordinates[],
  target: Coordinates,
): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let idx = 0; idx < polyline.length; idx++) {
    const pt = polyline[idx]!;
    const dist = haversineMeters(pt, target);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = idx;
    }
  }
  return bestIdx;
}

export function extractTransitSubPolyline(
  linePolyline: readonly Coordinates[],
  fromStop: Coordinates,
  toStop: Coordinates,
): Coordinates[] {
  if (!linePolyline || linePolyline.length === 0) {
    return [fromStop, toStop];
  }

  const fromIdx = findNearestCoordinateIndex(linePolyline, fromStop);
  const toIdx = findNearestCoordinateIndex(linePolyline, toStop);

  if (fromIdx === toIdx) {
    return [fromStop, toStop];
  }

  const sliced =
    fromIdx < toIdx
      ? linePolyline.slice(fromIdx, toIdx + 1)
      : linePolyline.slice(toIdx, fromIdx + 1).slice().reverse();

  const result: Coordinates[] = [fromStop];
  for (const pt of sliced) {
    const last = result[result.length - 1]!;
    if (
      Math.abs(last.latitude - pt.latitude) > 0.00001 ||
      Math.abs(last.longitude - pt.longitude) > 0.00001
    ) {
      result.push(pt);
    }
  }
  const last = result[result.length - 1]!;
  if (
    Math.abs(last.latitude - toStop.latitude) > 0.00001 ||
    Math.abs(last.longitude - toStop.longitude) > 0.00001
  ) {
    result.push(toStop);
  }

  return result;
}

export function combinePolylines(
  paths: ReadonlyArray<readonly Coordinates[]>,
): Coordinates[] {
  const result: Coordinates[] = [];
  for (const path of paths) {
    for (const pt of path) {
      if (
        result.length === 0 ||
        result[result.length - 1]!.latitude !== pt.latitude ||
        result[result.length - 1]!.longitude !== pt.longitude
      ) {
        result.push(pt);
      }
    }
  }
  return result;
}

export interface MultimodalRouteOptions {
  lines?: readonly TransitLine[];
  stops?: readonly TransitStop[];
  accessibleOnly?: boolean;
  walkToStopPolyline?: readonly Coordinates[];
  busRidePolyline?: readonly Coordinates[];
  walkFromStopPolyline?: readonly Coordinates[];
}

export async function fetchMultimodalBusLegs(
  origin: Coordinates,
  destination: Coordinates,
  originStop: Coordinates,
  destStop: Coordinates,
  fetchFn: typeof fetch = fetch,
  timeoutMs: number = 3000,
): Promise<{
  walkToStopPolyline?: Coordinates[];
  busRidePolyline?: Coordinates[];
  walkFromStopPolyline?: Coordinates[];
} | null> {
  if (!fetchFn) return null;

  async function fetchLeg(
    from: Coordinates,
    to: Coordinates,
    profile: "foot" | "driving",
  ): Promise<Coordinates[] | null> {
    try {
      const url = `https://router.project-osrm.org/route/v1/${profile}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
      let signal: AbortSignal | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;
      if (typeof AbortController !== "undefined") {
        const controller = new AbortController();
        signal = controller.signal;
        timer = setTimeout(() => controller.abort(), timeoutMs);
      }
      const fetchOpts: RequestInit = {
        headers: { Accept: "application/json" },
        ...(signal ? { signal } : {}),
      };
      const res = await fetchFn(url, fetchOpts);
      if (timer) clearTimeout(timer);
      if (!res.ok) return null;
      const json = (await res.json()) as {
        code?: string;
        routes?: Array<{
          geometry?: { coordinates?: Array<[number, number]> };
        }>;
      };
      if (json.code !== "Ok" || !json.routes?.[0]?.geometry?.coordinates) {
        return null;
      }
      return json.routes[0].geometry.coordinates.map(([lon, lat]) => ({
        latitude: lat,
        longitude: lon,
      }));
    } catch {
      return null;
    }
  }

  try {
    const [walkTo, busRide, walkFrom] = await Promise.all([
      fetchLeg(origin, originStop, "foot"),
      fetchLeg(originStop, destStop, "driving"),
      fetchLeg(destStop, destination, "foot"),
    ]);

    return {
      ...(walkTo ? { walkToStopPolyline: walkTo } : {}),
      ...(busRide ? { busRidePolyline: busRide } : {}),
      ...(walkFrom ? { walkFromStopPolyline: walkFrom } : {}),
    };
  } catch {
    return null;
  }
}

export function buildMultimodalRoute(
  baseRoute: RouteResponse,
  mode: TransportMode,
  options?: MultimodalRouteOptions,
): RouteResponse {
  if (mode === "walking") {
    return {
      ...baseRoute,
      mode: "walking",
    };
  }

  const lines = options?.lines ?? CAMPUS_TRANSIT_LINES;
  const stops = options?.stops ?? CAMPUS_TRANSIT_STOPS;
  const accessibleOnly = options?.accessibleOnly ?? false;

  const alternatives = calculateMultimodalAlternatives(
    baseRoute.origin,
    baseRoute.destination,
    baseRoute,
    { accessibleOnly, lines, stops },
  );

  const alternative = alternatives.find((alt) => alt.mode === mode);
  if (!alternative || !alternative.available) {
    return {
      ...baseRoute,
      mode: "walking",
    };
  }

  if (mode === "bus") {
    const originNearest = findNearestStop(baseRoute.origin, stops);
    const destNearest = findNearestStop(baseRoute.destination, stops);
    if (!originNearest || !destNearest) {
      return {
        ...baseRoute,
        mode: "walking",
      };
    }
    const commonLine = lines.find(
      (l) =>
        l.stops.some((s) => s.id === originNearest.stop.id) &&
        l.stops.some((s) => s.id === destNearest.stop.id),
    );
    if (!commonLine) {
      return {
        ...baseRoute,
        mode: "walking",
      };
    }

    const defaultBusRide = extractTransitSubPolyline(
      commonLine?.polyline ?? [],
      originNearest.stop.coordinates,
      destNearest.stop.coordinates,
    );

    const walkToPath =
      options?.walkToStopPolyline && options.walkToStopPolyline.length > 0
        ? options.walkToStopPolyline
        : [baseRoute.origin, originNearest.stop.coordinates];

    const busRidePath =
      options?.busRidePolyline && options.busRidePolyline.length > 0
        ? options.busRidePolyline
        : defaultBusRide;

    const walkFromPath =
      options?.walkFromStopPolyline && options.walkFromStopPolyline.length > 0
        ? options.walkFromStopPolyline
        : [destNearest.stop.coordinates, baseRoute.destination];

    const busPolyline = combinePolylines([
      walkToPath,
      busRidePath,
      walkFromPath,
    ]);

    const segments: RouteSegment[] = [
      {
        id: "seg-bus-walk-to",
        sourceNodeId: "origin",
        targetNodeId: originNearest.stop.id,
        instruction: `Caminar hasta la parada ${alternative.originStop ?? originNearest.stop.name} (${alternative.walkingToStopMinutes ?? 2} min)`,
        distanceMeters: Math.round((alternative.walkingToStopMinutes ?? 2) * 75),
        durationSeconds: (alternative.walkingToStopMinutes ?? 2) * 60,
        isAccessible: alternative.accessible,
        hasStairs: false,
        hasRamp: false,
        pathCoordinates: walkToPath,
      },
      {
        id: "seg-bus-ride",
        sourceNodeId: originNearest.stop.id,
        targetNodeId: destNearest.stop.id,
        instruction: `Tomar ${alternative.label} hasta ${alternative.destinationStop ?? destNearest.stop.name} (${alternative.transitRideMinutes ?? 4} min)`,
        distanceMeters: Math.max(100, alternative.distanceMeters - 200),
        durationSeconds: (alternative.transitRideMinutes ?? 4) * 60,
        isAccessible: alternative.accessible,
        hasStairs: false,
        hasRamp: false,
        pathCoordinates: busRidePath,
      },
      {
        id: "seg-bus-walk-from",
        sourceNodeId: destNearest.stop.id,
        targetNodeId: "destination",
        instruction: `Caminar desde ${alternative.destinationStop ?? destNearest.stop.name} hasta el destino (${alternative.walkingFromStopMinutes ?? 1} min)`,
        distanceMeters: Math.round((alternative.walkingFromStopMinutes ?? 1) * 75),
        durationSeconds: (alternative.walkingFromStopMinutes ?? 1) * 60,
        isAccessible: alternative.accessible,
        hasStairs: false,
        hasRamp: false,
        pathCoordinates: walkFromPath,
      },
    ];

    return {
      id: `${baseRoute.id}:bus`,
      origin: baseRoute.origin,
      destination: baseRoute.destination,
      totalDistanceMeters: alternative.distanceMeters,
      estimatedDurationMinutes: alternative.durationMinutes,
      accessible: alternative.accessible,
      segments,
      polyline: busPolyline,
      mode: "bus",
    };
  }

  // mode === "bicycle"
  const bikeSegments: RouteSegment[] = [
    {
      id: "seg-bike-ride",
      sourceNodeId: "origin",
      targetNodeId: "destination",
      instruction: `Trayecto en bicicleta BiciMAD por la calzada y ciclocalles del campus (${alternative.durationMinutes} min)`,
      distanceMeters: alternative.distanceMeters,
      durationSeconds: alternative.durationMinutes * 60,
      isAccessible: false,
      hasStairs: false,
      hasRamp: false,
      pathCoordinates: baseRoute.polyline,
    },
  ];

  return {
    id: `${baseRoute.id}:bicycle`,
    origin: baseRoute.origin,
    destination: baseRoute.destination,
    totalDistanceMeters: alternative.distanceMeters,
    estimatedDurationMinutes: alternative.durationMinutes,
    accessible: false,
    segments: bikeSegments,
    polyline: baseRoute.polyline,
    mode: "bicycle",
  };
}
