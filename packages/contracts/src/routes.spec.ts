import { describe, expect, it } from "vitest";
import {
  CAMPUS_BOUNDS,
  isWithinCampusBounds,
  ROUTING_ERROR_CODES,
  type Coordinates,
} from "./routes.js";

describe("Routing Contracts & Bounds Validation", () => {
  it("defines standard campus boundaries", () => {
    expect(CAMPUS_BOUNDS.minLatitude).toBeLessThan(CAMPUS_BOUNDS.maxLatitude);
    expect(CAMPUS_BOUNDS.minLongitude).toBeLessThan(CAMPUS_BOUNDS.maxLongitude);
  });

  it("validates coordinates inside campus bounds", () => {
    const centralCoords: Coordinates = { latitude: 40.45, longitude: -3.725 };
    expect(isWithinCampusBounds(centralCoords)).toBe(true);
  });

  it("validates boundary limits exactly", () => {
    expect(
      isWithinCampusBounds({
        latitude: CAMPUS_BOUNDS.minLatitude,
        longitude: CAMPUS_BOUNDS.minLongitude,
      }),
    ).toBe(true);
    expect(
      isWithinCampusBounds({
        latitude: CAMPUS_BOUNDS.maxLatitude,
        longitude: CAMPUS_BOUNDS.maxLongitude,
      }),
    ).toBe(true);
  });

  it("rejects coordinates outside campus bounds", () => {
    expect(isWithinCampusBounds({ latitude: 40.4, longitude: -3.725 })).toBe(
      false,
    );
    expect(isWithinCampusBounds({ latitude: 40.5, longitude: -3.725 })).toBe(
      false,
    );
    expect(isWithinCampusBounds({ latitude: 40.45, longitude: -3.74 })).toBe(
      false,
    );
    expect(isWithinCampusBounds({ latitude: 40.45, longitude: -3.71 })).toBe(
      false,
    );
  });

  it("rejects non-numeric or NaN coordinates", () => {
    expect(isWithinCampusBounds({ latitude: NaN, longitude: -3.725 })).toBe(
      false,
    );
    expect(isWithinCampusBounds({ latitude: 40.45, longitude: NaN })).toBe(
      false,
    );
  });

  it("contains all expected routing error codes for HU-094", () => {
    expect(ROUTING_ERROR_CODES).toContain("INVALID_COORDINATES");
    expect(ROUTING_ERROR_CODES).toContain("ORIGIN_OUT_OF_BOUNDS");
    expect(ROUTING_ERROR_CODES).toContain("DESTINATION_OUT_OF_BOUNDS");
    expect(ROUTING_ERROR_CODES).toContain("IDENTICAL_POINTS");
    expect(ROUTING_ERROR_CODES).toContain("NO_ROUTE_FOUND");
    expect(ROUTING_ERROR_CODES).toContain("NO_ACCESSIBLE_ROUTE");
    expect(ROUTING_ERROR_CODES).toContain("NETWORK_ERROR");
    expect(ROUTING_ERROR_CODES).toContain("SERVER_ERROR");
  });
});
