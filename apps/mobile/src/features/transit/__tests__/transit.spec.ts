import { describe, expect, it } from "vitest";
import type { RouteResponse } from "@unimovil/contracts";
import {
  buildMultimodalRoute,
  calculateMultimodalAlternatives,
  extractTransitSubPolyline,
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
    expect(bus?.unavailableReason).toContain(
      "No hay paradas de autobús conectadas",
    );
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

  describe("buildMultimodalRoute", () => {
    it("devuelve la ruta a pie intacta cuando el modo es walking", () => {
      const route = buildMultimodalRoute(dummyWalkingRoute, "walking");
      expect(route.mode).toBe("walking");
      expect(route.id).toBe(dummyWalkingRoute.id);
      expect(route.totalDistanceMeters).toBe(dummyWalkingRoute.totalDistanceMeters);
    });

    it("construye correctamente una ruta combinada de autobús con 3 tramos y polilínea", () => {
      const busRoute = buildMultimodalRoute(dummyWalkingRoute, "bus");
      expect(busRoute.mode).toBe("bus");
      expect(busRoute.id).toContain(":bus");
      expect(busRoute.segments).toHaveLength(3);
      expect(busRoute.segments[0]?.instruction).toContain("Caminar hasta la parada");
      expect(busRoute.segments[1]?.instruction).toContain("Tomar Autobús EMT");
      expect(busRoute.segments[2]?.instruction).toContain("hasta el destino");
      expect(busRoute.polyline.length).toBeGreaterThan(2);
    });

    it("construye correctamente una ruta en bicicleta", () => {
      const bikeRoute = buildMultimodalRoute(dummyWalkingRoute, "bicycle");
      expect(bikeRoute.mode).toBe("bicycle");
      expect(bikeRoute.id).toContain(":bicycle");
      expect(bikeRoute.segments).toHaveLength(1);
      expect(bikeRoute.segments[0]?.instruction).toContain("bicicleta BiciMAD");
    });

    it("devuelve ruta a pie si las paradas están vacías o la opción no está disponible", () => {
      const fallback = buildMultimodalRoute(dummyWalkingRoute, "bus", {
        stops: [],
      });
      expect(fallback.mode).toBe("walking");
    });
  });

  describe("extractTransitSubPolyline", () => {
    const sampleLine = [
      { latitude: 40.440, longitude: -3.720 }, // 0: South
      { latitude: 40.445, longitude: -3.722 }, // 1: Stop A
      { latitude: 40.448, longitude: -3.725 }, // 2: Intermediate
      { latitude: 40.450, longitude: -3.728 }, // 3: Stop B
      { latitude: 40.460, longitude: -3.735 }, // 4: Far North
    ];

    it("returns [fromStop, toStop] when line polyline is empty", () => {
      const from = { latitude: 40.445, longitude: -3.722 };
      const to = { latitude: 40.450, longitude: -3.728 };
      const res = extractTransitSubPolyline([], from, to);
      expect(res).toEqual([from, to]);
    });

    it("returns [fromStop, toStop] when origin and dest snap to the same index", () => {
      const from = { latitude: 40.4451, longitude: -3.7221 };
      const to = { latitude: 40.4452, longitude: -3.7222 };
      const res = extractTransitSubPolyline(sampleLine, from, to);
      expect(res).toEqual([from, to]);
    });

    it("extracts forward sub-polyline without loop to far north or south", () => {
      const stopA = { latitude: 40.445, longitude: -3.722 };
      const stopB = { latitude: 40.450, longitude: -3.728 };
      const res = extractTransitSubPolyline(sampleLine, stopA, stopB);

      // Should include stopA (or index 1), index 2, stopB (or index 3)
      // and NOT include index 0 (South) or index 4 (Far North)
      expect(res.length).toBeGreaterThanOrEqual(3);
      expect(res).not.toContainEqual(sampleLine[0]);
      expect(res).not.toContainEqual(sampleLine[4]);
      expect(res[0]).toEqual(stopA);
      expect(res[res.length - 1]).toEqual(stopB);
    });

    it("extracts reverse sub-polyline correctly when traveling opposite line definition", () => {
      const stopB = { latitude: 40.450, longitude: -3.728 };
      const stopA = { latitude: 40.445, longitude: -3.722 };
      const res = extractTransitSubPolyline(sampleLine, stopB, stopA);

      expect(res.length).toBeGreaterThanOrEqual(3);
      expect(res).not.toContainEqual(sampleLine[0]);
      expect(res).not.toContainEqual(sampleLine[4]);
      expect(res[0]).toEqual(stopB);
      expect(res[res.length - 1]).toEqual(stopA);
    });
  });
});
