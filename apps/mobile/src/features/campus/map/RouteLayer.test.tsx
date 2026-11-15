import { render } from "@testing-library/react-native";
import type { RouteResponse } from "@unimovil/contracts";
import { RouteLayer } from "./RouteLayer";

const mockRoute: RouteResponse = {
  id: "route-map-test",
  origin: { latitude: 40.4442, longitude: -3.7262 },
  destination: { latitude: 40.4455, longitude: -3.7275 },
  totalDistanceMeters: 250,
  estimatedDurationMinutes: 3,
  accessible: true,
  segments: [],
  polyline: [
    { latitude: 40.4442, longitude: -3.7262 },
    { latitude: 40.4455, longitude: -3.7275 },
  ],
};

describe("RouteLayer MapLibre Component (HU-021 - TDD Tema 3)", () => {
  it("no renderiza fuentes ni capas cuando no hay ruta activa", async () => {
    const { toJSON } = await render(<RouteLayer route={null} />);
    expect(toJSON()).toBeNull();
  });

  it("renderiza GeoJSONSource con la polilínea cuando hay ruta activa", async () => {
    const { toJSON } = await render(<RouteLayer route={mockRoute} />);
    expect(toJSON()).not.toBeNull();
  });
});
