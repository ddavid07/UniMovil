import { describe, expect, it } from "vitest";
import {
  CAMPUS_TRANSIT_LINES,
  CAMPUS_TRANSIT_STOPS,
} from "../data/transit-data";
import { transitLinesGeoJSON, transitStopsGeoJSON } from "./geojson";

describe("Transit GeoJSON helpers", () => {
  it("converts transit lines to GeoJSON FeatureCollection", () => {
    const geojson = transitLinesGeoJSON(CAMPUS_TRANSIT_LINES);
    expect(geojson.type).toBe("FeatureCollection");
    expect(geojson.features).toHaveLength(CAMPUS_TRANSIT_LINES.length);
  });

  it("converts transit stops to GeoJSON FeatureCollection", () => {
    const geojson = transitStopsGeoJSON(CAMPUS_TRANSIT_STOPS);
    expect(geojson.type).toBe("FeatureCollection");
    expect(geojson.features).toHaveLength(CAMPUS_TRANSIT_STOPS.length);
  });
});
