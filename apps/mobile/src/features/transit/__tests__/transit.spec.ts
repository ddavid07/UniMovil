import { describe, expect, it } from "vitest";
import type { RouteResponse } from "@unimovil/contracts";
import {
  calculateMultimodalAlternatives,
  findNearestStop,
  haversineMeters,
} from "../domain/transit";
import {
  CAMPUS_TRANSIT_LINES,
  CAMPUS_TRANSIT_STOPS,
} from "../data/transit-data";

describe("Transit Domain (Sprint 3 Multimodal)", () => {
  const dummyWalkingRoute: RouteResponse = {
    id: "route-walk-1",
    origin: { latitude: 40.44328, longitude: -3.72725 }, // Metro Ciudad Universitaria
    destination: { latitude: 40.452, longitude: -3.7335 }, // Paraninfo / Informática
    totalDistanceMeters: 1350,
    estimatedDurationMinutes: 18,
    accessible: true,
    segments: [],
    polyline: [
      { latitude: 40.44328, longitude: -3.72725 },
      { latitude: 40.452, longitude: -3.7335 },
    ],
  };

  it("calculates accurate haversine distance in meters", () => {
    // Distance between Metro (40.44328, -3.72725) and Ciencias Info (40.44538, -3.72763) ~235m
    const d = haversineMeters(
      { latitude: 40.44328, longitude: -3.72725 },
      { latitude: 40.44538, longitude: -3.72763 },
    );
    expect(d).toBeGreaterThan(200);
    expect(d).toBeLessThan(300);
  });

  it("finds the nearest transit stop to a given coordinate", () => {
    const nearest = findNearestStop(
      { latitude: 40.4433, longitude: -3.7273 },
      CAMPUS_TRANSIT_STOPS,
    );
    expect(nearest).not.toBeNull();
    expect(nearest?.stop.code).toBe("1688");
    expect(nearest?.distanceMeters).toBeLessThan(50);
  });

  it("returns null when stops array is empty", () => {
    const nearest = findNearestStop(
      { latitude: 40.4433, longitude: -3.7273 },
      [],
    );
    expect(nearest).toBeNull();
  });

  it("generates 3 multimodal alternatives for a standard campus route", () => {
    const alternatives = calculateMultimodalAlternatives(
      dummyWalkingRoute.origin,
      dummyWalkingRoute.destination,
      dummyWalkingRoute,
      {
        lines: CAMPUS_TRANSIT_LINES,
        stops: CAMPUS_TRANSIT_STOPS,
      },
    );

    expect(alternatives).toHaveLength(3);

    const walking = alternatives.find((a) => a.mode === "walking");
    expect(walking).toBeDefined();
    expect(walking?.durationMinutes).toBe(18);
    expect(walking?.distanceMeters).toBe(1350);
    expect(walking?.available).toBe(true);

    const bus = alternatives.find((a) => a.mode === "bus");
    expect(bus).toBeDefined();
    expect(bus?.available).toBe(true);
    expect(bus?.lineCode).toBe("G");
    expect(bus?.durationMinutes).toBeLessThan(18); // Bus is faster than 18 min walking
    expect(bus?.isRecommended).toBe(true);

    const bike = alternatives.find((a) => a.mode === "bicycle");
    expect(bike).toBeDefined();
    expect(bike?.available).toBe(true);
    expect(bike?.durationMinutes).toBeLessThan(18);
  });

  it("marks bus as unavailable when route is very short (< 300 meters)", () => {
    const shortRoute: RouteResponse = {
      ...dummyWalkingRoute,
      totalDistanceMeters: 180,
      estimatedDurationMinutes: 2,
    };

    const alternatives = calculateMultimodalAlternatives(
      shortRoute.origin,
      { latitude: 40.444, longitude: -3.727 },
      shortRoute,
      {
        lines: CAMPUS_TRANSIT_LINES,
        stops: CAMPUS_TRANSIT_STOPS,
      },
    );

    const bus = alternatives.find((a) => a.mode === "bus");
    expect(bus?.available).toBe(false);
    expect(bus?.unavailableReason).toContain("distancia corta");
  });

  it("marks bicycle as unavailable when accessibleOnly is requested", () => {
    const alternatives = calculateMultimodalAlternatives(
      dummyWalkingRoute.origin,
      dummyWalkingRoute.destination,
      dummyWalkingRoute,
      {
        accessibleOnly: true,
        lines: CAMPUS_TRANSIT_LINES,
        stops: CAMPUS_TRANSIT_STOPS,
      },
    );

    const bike = alternatives.find((a) => a.mode === "bicycle");
    expect(bike?.available).toBe(false);
    expect(bike?.unavailableReason).toContain("PMR");
  });

  it("marks bus as unavailable when origin and destination are at the same stop", () => {
    const sameStopRoute: RouteResponse = {
      ...dummyWalkingRoute,
      origin: { latitude: 40.44328, longitude: -3.72725 },
      destination: { latitude: 40.4433, longitude: -3.7272 },
      totalDistanceMeters: 450,
    };

    const alternatives = calculateMultimodalAlternatives(
      sameStopRoute.origin,
      sameStopRoute.destination,
      sameStopRoute,
      {
        lines: CAMPUS_TRANSIT_LINES,
        stops: CAMPUS_TRANSIT_STOPS,
      },
    );

    const bus = alternatives.find((a) => a.mode === "bus");
    expect(bus?.available).toBe(false);
    expect(bus?.unavailableReason).toContain("No hay paradas de autobús conectadas");
  });

  it("marks bus as unavailable when accessibleOnly is true and stop is not accessible", () => {
    // Route from Gregorio del Amo (inaccessible stop 3276) to Paraninfo
    const inaccessibleStopRoute: RouteResponse = {
      ...dummyWalkingRoute,
      origin: { latitude: 40.44572, longitude: -3.72184 },
      destination: { latitude: 40.452, longitude: -3.7335 },
      totalDistanceMeters: 1400,
    };

    const alternatives = calculateMultimodalAlternatives(
      inaccessibleStopRoute.origin,
      inaccessibleStopRoute.destination,
      inaccessibleStopRoute,
      {
        accessibleOnly: true,
        lines: CAMPUS_TRANSIT_LINES,
        stops: CAMPUS_TRANSIT_STOPS,
      },
    );

    const bus = alternatives.find((a) => a.mode === "bus");
    expect(bus?.available).toBe(false);
    expect(bus?.unavailableReason).toContain("sin adaptación PMR");
  });
});
