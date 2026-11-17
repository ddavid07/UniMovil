import { describe, expect, it } from "vitest";
import {
  CAMPUS_TRANSIT_LINES,
  CAMPUS_TRANSIT_STOPS,
} from "../data/transit-data.js";
import { transitLinesGeoJSON, transitStopsGeoJSON } from "../map/geojson.js";
import {
  formatDistance,
  formatDuration,
} from "../../routing/domain/routing.js";
import { haversineMeters } from "../domain/transit.js";

describe("Pruebas de Regresión: Rendimiento y Coexistencia Multimodal", () => {
  const originMoncloa = { latitude: 40.4435, longitude: -3.727 };
  const destinationParaninfo = { latitude: 40.4489, longitude: -3.7314 };

  describe("1. Integridad de los Cálculos Peatonales del Sprint 2 (No Regresión)", () => {
    it("mantiene intactos los cálculos de formateo de distancias y duraciones", () => {
      expect(formatDistance(350)).toBe("350 m");
      expect(formatDistance(1250)).toBe("1,3 km");
      expect(formatDuration(0)).toBe("< 1 min");
      expect(formatDuration(1)).toBe("1 min");
      expect(formatDuration(6)).toBe("6 min");
      expect(formatDuration(62)).toBe("1 h 2 min");
    });

    it("el cálculo de distancia euclídea/haversine base devuelve valores consistentes", () => {
      const distance = haversineMeters(originMoncloa, destinationParaninfo);
      expect(distance).toBeGreaterThan(500);
      expect(distance).toBeLessThan(1200);
    });
  });

  describe("2. Rendimiento y Carga de Capas Cartográficas de la EMT", () => {
    it("las líneas G y F de la EMT contienen catálogo oficial de paradas y polilíneas válidas", () => {
      expect(CAMPUS_TRANSIT_LINES.length).toBeGreaterThanOrEqual(2);
      const lineG = CAMPUS_TRANSIT_LINES.find((l) => l.code === "G");
      const lineF = CAMPUS_TRANSIT_LINES.find((l) => l.code === "F");

      expect(lineG).toBeDefined();
      expect(lineF).toBeDefined();
      expect(lineG?.stops.length).toBeGreaterThan(0);
      expect(lineG?.polyline.length).toBeGreaterThan(0);
    });

    it("la conversión a GeoJSON de paradas y líneas se ejecuta en menos de 50 ms (Rendimiento)", () => {
      const start = performance.now();

      // Ejecutar conversión múltiple para simular repintados continuos del mapa
      for (let i = 0; i < 50; i++) {
        const stopsGeoJSON = transitStopsGeoJSON(CAMPUS_TRANSIT_STOPS);
        const linesGeoJSON = transitLinesGeoJSON(CAMPUS_TRANSIT_LINES);
        expect(stopsGeoJSON.features.length).toBe(CAMPUS_TRANSIT_STOPS.length);
        expect(linesGeoJSON.features.length).toBe(CAMPUS_TRANSIT_LINES.length);
      }

      const elapsed = performance.now() - start;
      // 50 ciclos de conversión de capas cartográficas deben tardar menos de 200 ms
      expect(elapsed).toBeLessThan(200);
    });

    it("no hay colisión de identificadores entre paradas EMT y elementos de campus", () => {
      const stopIds = CAMPUS_TRANSIT_STOPS.map((s) => s.id);
      const uniqueIds = new Set(stopIds);
      expect(uniqueIds.size).toBe(stopIds.length);
      // Todos los identificadores de paradas siguen el prefijo de transporte
      for (const id of stopIds) {
        expect(id).toMatch(/^(stop-|emt-)/);
      }
    });
  });
});
