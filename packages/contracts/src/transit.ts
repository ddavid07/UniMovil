import type { Coordinates } from "./places.js";

export interface NextArrival {
  readonly line: string;
  readonly destination: string;
  readonly estimateMinutes: number;
}

export interface TransitStop {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly coordinates: Coordinates;
  readonly lines: readonly string[];
  readonly wheelchairAccessible: boolean;
  readonly nextArrivals?: readonly NextArrival[];
}

export interface TransitLine {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly operator: string;
  readonly color: string;
  readonly textColor: string;
  readonly origin: string;
  readonly destination: string;
  readonly frequency: string;
  readonly stops: readonly TransitStop[];
  readonly polyline: readonly Coordinates[];
}

export type TransportMode = "walking" | "bus" | "bicycle";

export interface MultimodalAlternative {
  readonly mode: TransportMode;
  readonly label: string;
  readonly durationMinutes: number;
  readonly distanceMeters: number;
  readonly accessible: boolean;
  readonly transfers: number;
  readonly available: boolean;
  readonly unavailableReason?: string;
  readonly lineCode?: string;
  readonly originStop?: string;
  readonly destinationStop?: string;
  readonly walkingToStopMinutes?: number;
  readonly transitRideMinutes?: number;
  readonly walkingFromStopMinutes?: number;
  readonly isRecommended?: boolean;
}
