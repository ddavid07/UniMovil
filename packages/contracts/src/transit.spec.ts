import { describe, expect, it } from "vitest";
import type {
  MultimodalAlternative,
  TransitLine,
  TransitStop,
} from "./transit.js";

describe("Transit contracts", () => {
  it("defines TransitStop shape with accessibility and arrivals", () => {
    const stop: TransitStop = {
      id: "emt-stop-1688",
      name: "Metro Ciudad Universitaria",
      code: "1688",
      coordinates: { latitude: 40.44328, longitude: -3.72725 },
      lines: ["G", "F", "82"],
      wheelchairAccessible: true,
      nextArrivals: [
        { line: "G", destination: "Paraninfo", estimateMinutes: 3 },
      ],
    };

    expect(stop.id).toBe("emt-stop-1688");
    expect(stop.code).toBe("1688");
    expect(stop.lines).toContain("G");
    expect(stop.wheelchairAccessible).toBe(true);
    expect(stop.nextArrivals?.[0]?.estimateMinutes).toBe(3);
  });

  it("defines TransitLine shape with operator and stops", () => {
    const line: TransitLine = {
      id: "emt-line-G",
      name: "Línea G",
      code: "G",
      operator: "EMT Madrid",
      color: "#005aa9",
      textColor: "#ffffff",
      origin: "Moncloa",
      destination: "Ciudad Universitaria",
      frequency: "4-7 min",
      stops: [],
      polyline: [{ latitude: 40.44328, longitude: -3.72725 }],
    };

    expect(line.code).toBe("G");
    expect(line.operator).toBe("EMT Madrid");
    expect(line.color).toBe("#005aa9");
  });

  it("defines MultimodalAlternative for walking and bus", () => {
    const alt: MultimodalAlternative = {
      mode: "bus",
      label: "Autobús EMT Línea G",
      durationMinutes: 7,
      distanceMeters: 1200,
      accessible: true,
      transfers: 0,
      available: true,
      lineCode: "G",
      originStop: "Metro Ciudad Universitaria",
      destinationStop: "Paraninfo",
      walkingToStopMinutes: 2,
      transitRideMinutes: 4,
      walkingFromStopMinutes: 1,
      isRecommended: true,
    };

    expect(alt.mode).toBe("bus");
    expect(alt.durationMinutes).toBe(7);
    expect(alt.isRecommended).toBe(true);
  });
});
