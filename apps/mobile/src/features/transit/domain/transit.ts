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

  const walkingAlternative: MultimodalAlternative = {
    mode: "walking",
    label: "A pie",
    durationMinutes: walkingRoute.estimatedDurationMinutes,
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

export function buildMultimodalRoute(
  baseRoute: RouteResponse,
  mode: TransportMode,
  options?: {
    lines?: readonly TransitLine[];
    stops?: readonly TransitStop[];
  },
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
    const commonLine =
      lines.find(
        (l) =>
          l.stops.some((s) => s.id === originNearest.stop.id) &&
          l.stops.some((s) => s.id === destNearest.stop.id),
      ) ?? lines[0];

    const busPolyline: Coordinates[] = [
      baseRoute.origin,
      originNearest.stop.coordinates,
      ...(commonLine?.polyline ?? []),
      destNearest.stop.coordinates,
      baseRoute.destination,
    ];

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
        pathCoordinates: [baseRoute.origin, originNearest.stop.coordinates],
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
        pathCoordinates: commonLine?.polyline ?? [],
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
        pathCoordinates: [destNearest.stop.coordinates, baseRoute.destination],
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
