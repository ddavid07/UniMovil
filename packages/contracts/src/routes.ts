import type { Coordinates } from "./places.js";
import type { TransportMode } from "./transit.js";

export type { Coordinates };

export interface RouteRequest {
  readonly origin: Coordinates;
  readonly destination: Coordinates;
  readonly accessibleOnly?: boolean;
  readonly preference?: "fastest" | "accessible";
}

export interface RouteSegment {
  readonly id: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly instruction: string;
  readonly distanceMeters: number;
  readonly durationSeconds: number;
  readonly isAccessible: boolean;
  readonly hasStairs: boolean;
  readonly hasRamp: boolean;
  readonly pathCoordinates: readonly Coordinates[];
}

export interface RouteResponse {
  readonly id: string;
  readonly origin: Coordinates;
  readonly destination: Coordinates;
  readonly totalDistanceMeters: number;
  readonly estimatedDurationMinutes: number;
  readonly accessible: boolean;
  readonly segments: readonly RouteSegment[];
  readonly polyline: readonly Coordinates[];
  readonly mode?: TransportMode;
}

export const ROUTING_ERROR_CODES = [
  "INVALID_COORDINATES",
  "ORIGIN_OUT_OF_BOUNDS",
  "DESTINATION_OUT_OF_BOUNDS",
  "IDENTICAL_POINTS",
  "NO_ROUTE_FOUND",
  "NO_ACCESSIBLE_ROUTE",
  "NETWORK_ERROR",
  "SERVER_ERROR",
] as const;

export type RoutingErrorCode = (typeof ROUTING_ERROR_CODES)[number];

export interface RoutingErrorResponse {
  readonly error: true;
  readonly code: RoutingErrorCode;
  readonly message: string;
  readonly userMessage: string;
  readonly recommendedAction: string;
  readonly retryable: boolean;
  readonly timestamp: string;
}

export const CAMPUS_BOUNDS = {
  minLatitude: 40.435,
  maxLatitude: 40.46,
  minLongitude: -3.738,
  maxLongitude: -3.715,
} as const;

export function isWithinCampusBounds(coords: Coordinates): boolean {
  if (
    typeof coords.latitude !== "number" ||
    typeof coords.longitude !== "number" ||
    Number.isNaN(coords.latitude) ||
    Number.isNaN(coords.longitude)
  ) {
    return false;
  }
  return (
    coords.latitude >= CAMPUS_BOUNDS.minLatitude &&
    coords.latitude <= CAMPUS_BOUNDS.maxLatitude &&
    coords.longitude >= CAMPUS_BOUNDS.minLongitude &&
    coords.longitude <= CAMPUS_BOUNDS.maxLongitude
  );
}
