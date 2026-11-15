import { fireEvent, render, screen } from "@testing-library/react-native";
import type { RouteResponse } from "@unimovil/contracts";
import { RouteSheet } from "./RouteSheet";

const mockRouteStandard: RouteResponse = {
  id: "route-std-1",
  origin: { latitude: 40.4442, longitude: -3.7262 },
  destination: { latitude: 40.4455, longitude: -3.7275 },
  totalDistanceMeters: 350,
  estimatedDurationMinutes: 5,
  accessible: false,
  segments: [
    {
      id: "seg-1",
      sourceNodeId: "metro",
      targetNodeId: "escalinata",
      instruction: "Avanza por Paseo de Ruperto Chapí",
      distanceMeters: 200,
      durationSeconds: 160,
      isAccessible: true,
      hasStairs: false,
      hasRamp: false,
      pathCoordinates: [],
    },
    {
      id: "seg-2",
      sourceNodeId: "escalinata",
      targetNodeId: "medicina",
      instruction: "Sube por la escalinata hacia la entrada",
      distanceMeters: 150,
      durationSeconds: 120,
      isAccessible: false,
      hasStairs: true,
      hasRamp: false,
      pathCoordinates: [],
    },
  ],
  polyline: [
    { latitude: 40.4442, longitude: -3.7262 },
    { latitude: 40.4455, longitude: -3.7275 },
  ],
};

const mockRoutePmr: RouteResponse = {
  ...mockRouteStandard,
  id: "route-pmr-1",
  accessible: true,
  totalDistanceMeters: 420,
  estimatedDurationMinutes: 6,
  segments: [
    {
      id: "seg-pmr-1",
      sourceNodeId: "metro",
      targetNodeId: "rampa",
      instruction: "Toma el sendero adaptado y rampa suave",
      distanceMeters: 420,
      durationSeconds: 320,
      isAccessible: true,
      hasStairs: false,
      hasRamp: true,
      pathCoordinates: [],
    },
  ],
};

describe("RouteSheet Component (HU-023 - TDD Tema 3)", () => {
  it("no renderiza nada si no hay ruta activa", async () => {
    const { toJSON } = await render(<RouteSheet route={null} onClose={jest.fn()} />);
    expect(toJSON()).toBeNull();
  });

  it("muestra el resumen de duración, distancia y pasos de la ruta estándar", async () => {
    const onClose = jest.fn();
    await render(<RouteSheet route={mockRouteStandard} onClose={onClose} />);

    expect(screen.getByText("Itinerario peatonal")).toBeTruthy();
    expect(screen.getByText("5 min")).toBeTruthy();
    expect(screen.getByText("350 m")).toBeTruthy();
    expect(screen.getByText("Ruta con escaleras")).toBeTruthy();
    expect(screen.getByText("Avanza por Paseo de Ruperto Chapí")).toBeTruthy();
    expect(screen.getByText("Sube por la escalinata hacia la entrada")).toBeTruthy();
  });

  it("muestra distintivo de accesibilidad PMR y badge de rampa", async () => {
    await render(<RouteSheet route={mockRoutePmr} onClose={jest.fn()} />);

    expect(screen.getByText("Ruta accesible PMR")).toBeTruthy();
    expect(screen.getByText("6 min")).toBeTruthy();
    expect(screen.getAllByText("420 m").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Toma el sendero adaptado y rampa suave")).toBeTruthy();
  });

  it("invoca onClose al pulsar 'Cerrar ruta'", async () => {
    const onClose = jest.fn();
    await render(<RouteSheet route={mockRouteStandard} onClose={onClose} />);

    await fireEvent.press(screen.getByRole("button", { name: "Cerrar ruta" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
