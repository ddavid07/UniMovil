import { describe, expect, it } from "vitest";
import type { RouteResponse } from "@unimovil/contracts";
import {
  buildRouteGeoJson,
  formatDistance,
  formatDuration,
} from "../domain/routing.js";

describe("Frontend Routing Utilities & GeoJSON Formatter", () => {
  describe("formatDistance", () => {
    it("formatea distancias cortas en metros", () => {
      expect(formatDistance(0)).toBe("0 m");
      expect(formatDistance(45)).toBe("45 m");
      expect(formatDistance(320.4)).toBe("320 m");
      expect(formatDistance(999)).toBe("999 m");
    });

    it("formatea distancias a partir de 1000 m en kilómetros con coma decimal", () => {
      expect(formatDistance(1000)).toBe("1,0 km");
      expect(formatDistance(1250)).toBe("1,3 km");
      expect(formatDistance(3500)).toBe("3,5 km");
    });

    it("gestiona valores negativos o no finitos devolviendo 0 m", () => {
      expect(formatDistance(-50)).toBe("0 m");
      expect(formatDistance(Infinity)).toBe("0 m");
      expect(formatDistance(NaN)).toBe("0 m");
    });
  });

  describe("formatDuration", () => {
    it("formatea duraciones menores a 1 minuto", () => {
      expect(formatDuration(0)).toBe("< 1 min");
      expect(formatDuration(-5)).toBe("< 1 min");
    });

    it("formatea duraciones en minutos", () => {
      expect(formatDuration(1)).toBe("1 min");
      expect(formatDuration(14)).toBe("14 min");
      expect(formatDuration(59)).toBe("59 min");
    });

    it("formatea duraciones de una o varias horas completas", () => {
      expect(formatDuration(60)).toBe("1 h");
      expect(formatDuration(120)).toBe("2 h");
    });

    it("formatea duraciones mixtas en horas y minutos", () => {
      expect(formatDuration(75)).toBe("1 h 15 min");
      expect(formatDuration(130)).toBe("2 h 10 min");
    });
  });

  describe("buildRouteGeoJson", () => {
    const mockRoute: RouteResponse = {
      id: "route-test-123",
      origin: { latitude: 40.4442, longitude: -3.7262 },
      destination: { latitude: 40.4455, longitude: -3.7275 },
      totalDistanceMeters: 240,
      estimatedDurationMinutes: 3,
      accessible: true,
      segments: [],
      polyline: [
        { latitude: 40.4442, longitude: -3.7262 },
        { latitude: 40.445, longitude: -3.7268 },
        { latitude: 40.4455, longitude: -3.7275 },
      ],
    };

    it("construye un objeto GeoJSON Feature LineString válido", () => {
      const geojson = buildRouteGeoJson(mockRoute);
      expect(geojson.type).toBe("Feature");
      expect(geojson.geometry.type).toBe("LineString");
      expect(geojson.geometry.coordinates).toHaveLength(3);

      // En estándar GeoJSON el orden es [longitude, latitude]
      expect(geojson.geometry.coordinates[0]).toEqual([-3.7262, 40.4442]);
      expect(geojson.geometry.coordinates[2]).toEqual([-3.7275, 40.4455]);
    });

    it("conserva las propiedades de metadatos de la ruta", () => {
      const geojson = buildRouteGeoJson(mockRoute);
      expect(geojson.properties.id).toBe("route-test-123");
      expect(geojson.properties.distanceMeters).toBe(240);
      expect(geojson.properties.durationMinutes).toBe(3);
      expect(geojson.properties.accessible).toBe(true);
    });
  });
});
