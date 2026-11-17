import { fireEvent, render, screen } from "@testing-library/react-native";
import type { Place } from "@unimovil/contracts";
import { RouteSelector } from "./RouteSelector";

const mockPlaces: readonly Place[] = [
  {
    id: "metro-cu",
    name: "Metro Ciudad Universitaria",
    category: "transport",
    coordinates: { latitude: 40.4442, longitude: -3.7262 },
    aliases: [],
    accessibility: "yes",
    source: {
      url: "https://osm.org",
      checkedAt: "2026-10-01",
      license: "ODbL-1.0",
    },
  },
  {
    id: "fac-medicina",
    name: "Facultad de Medicina",
    category: "building",
    coordinates: { latitude: 40.4455, longitude: -3.7275 },
    aliases: [],
    accessibility: "limited",
    source: {
      url: "https://osm.org",
      checkedAt: "2026-10-01",
      license: "ODbL-1.0",
    },
  },
  {
    id: "fac-derecho",
    name: "Facultad de Derecho",
    category: "building",
    coordinates: { latitude: 40.4502, longitude: -3.731 },
    aliases: [],
    accessibility: "yes",
    source: {
      url: "https://osm.org",
      checkedAt: "2026-10-01",
      license: "ODbL-1.0",
    },
  },
];

describe("RouteSelector Component (HU-020 - TDD Tema 3)", () => {
  it("renderiza campos de origen y destino con sus valores o placeholders", async () => {
    const onSelectOrigin = jest.fn();
    const onSelectDestination = jest.fn();
    const onSwap = jest.fn();
    const onTogglePmr = jest.fn();
    const onCalculate = jest.fn();
    const onClose = jest.fn();

    await render(
      <RouteSelector
        places={mockPlaces}
        origin={null}
        destination={null}
        accessibleOnly={false}
        loading={false}
        error={null}
        onSelectOrigin={onSelectOrigin}
        onSelectDestination={onSelectDestination}
        onSwap={onSwap}
        onTogglePmr={onTogglePmr}
        onCalculate={onCalculate}
        onClose={onClose}
      />,
    );

    expect(screen.getByText("Planificar ruta peatonal")).toBeTruthy();
    expect(screen.getByText("Seleccionar origen")).toBeTruthy();
    expect(screen.getByText("Seleccionar destino")).toBeTruthy();
    expect(screen.getByText("Ruta accesible (PMR)")).toBeTruthy();
  });

  it("permite intercambiar origen y destino mediante el botón swap", async () => {
    const onSwap = jest.fn();

    await render(
      <RouteSelector
        places={mockPlaces}
        origin={mockPlaces[0]!}
        destination={mockPlaces[1]!}
        accessibleOnly={false}
        loading={false}
        error={null}
        onSelectOrigin={jest.fn()}
        onSelectDestination={jest.fn()}
        onSwap={onSwap}
        onTogglePmr={jest.fn()}
        onCalculate={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Metro Ciudad Universitaria")).toBeTruthy();
    expect(screen.getByText("Facultad de Medicina")).toBeTruthy();

    await fireEvent.press(
      screen.getByRole("button", { name: "Intercambiar origen y destino" }),
    );
    expect(onSwap).toHaveBeenCalledTimes(1);
  });

  it("conmuta la opción de ruta accesible PMR", async () => {
    const onTogglePmr = jest.fn();

    await render(
      <RouteSelector
        places={mockPlaces}
        origin={mockPlaces[0]!}
        destination={mockPlaces[1]!}
        accessibleOnly={false}
        loading={false}
        error={null}
        onSelectOrigin={jest.fn()}
        onSelectDestination={jest.fn()}
        onSwap={jest.fn()}
        onTogglePmr={onTogglePmr}
        onCalculate={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    const pmrSwitch = screen.getByLabelText("Ruta accesible (PMR)");
    await fireEvent(pmrSwitch, "valueChange", true);
    expect(onTogglePmr).toHaveBeenCalledWith(true);
  });

  it("ejecuta el cálculo al pulsar 'Calcular ruta'", async () => {
    const onCalculate = jest.fn();

    await render(
      <RouteSelector
        places={mockPlaces}
        origin={mockPlaces[0]!}
        destination={mockPlaces[1]!}
        accessibleOnly={false}
        loading={false}
        error={null}
        onSelectOrigin={jest.fn()}
        onSelectDestination={jest.fn()}
        onSwap={jest.fn()}
        onTogglePmr={jest.fn()}
        onCalculate={onCalculate}
        onClose={jest.fn()}
      />,
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "Calcular ruta" }),
    );
    expect(onCalculate).toHaveBeenCalledTimes(1);
  });

  it("muestra alerta visual cuando existe un error clasificado (HU-094)", async () => {
    await render(
      <RouteSelector
        places={mockPlaces}
        origin={mockPlaces[0]!}
        destination={mockPlaces[0]!}
        accessibleOnly={false}
        loading={false}
        error={{
          category: "VALIDATION",
          title: "Puntos idénticos",
          userMessage: "El origen y el destino no pueden ser iguales.",
          recommendedAction: "Seleccione dos lugares diferentes.",
          isRetryable: false,
          safeForDisplay: true,
        }}
        onSelectOrigin={jest.fn()}
        onSelectDestination={jest.fn()}
        onSwap={jest.fn()}
        onTogglePmr={jest.fn()}
        onCalculate={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Puntos idénticos")).toBeTruthy();
    expect(
      screen.getByText("El origen y el destino no pueden ser iguales."),
    ).toBeTruthy();
  });

  it("abre el modal de selección de origen y permite seleccionar un lugar", async () => {
    const onSelectOrigin = jest.fn();

    await render(
      <RouteSelector
        places={mockPlaces}
        origin={null}
        destination={mockPlaces[1]!}
        accessibleOnly={false}
        loading={false}
        error={null}
        onSelectOrigin={onSelectOrigin}
        onSelectDestination={jest.fn()}
        onSwap={jest.fn()}
        onTogglePmr={jest.fn()}
        onCalculate={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "Seleccionar origen" }),
    );
    expect(screen.getByText("Seleccionar punto de partida")).toBeTruthy();

    await fireEvent.press(
      screen.getByRole("button", { name: "Metro Ciudad Universitaria" }),
    );
    expect(onSelectOrigin).toHaveBeenCalledWith(mockPlaces[0]);
  });

  it("abre el modal de selección de destino y permite elegir un lugar", async () => {
    const onSelectDestination = jest.fn();

    await render(
      <RouteSelector
        places={mockPlaces}
        origin={mockPlaces[0]!}
        destination={null}
        accessibleOnly={false}
        loading={false}
        error={null}
        onSelectOrigin={jest.fn()}
        onSelectDestination={onSelectDestination}
        onSwap={jest.fn()}
        onTogglePmr={jest.fn()}
        onCalculate={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "Seleccionar destino" }),
    );
    expect(
      screen.getAllByText("Seleccionar destino").length,
    ).toBeGreaterThanOrEqual(1);

    await fireEvent.press(
      screen.getByRole("button", { name: "Facultad de Medicina" }),
    );
    expect(onSelectDestination).toHaveBeenCalledWith(mockPlaces[1]);
  });

  it("cierra el modal de selección al pulsar Cerrar", async () => {
    await render(
      <RouteSelector
        places={mockPlaces}
        origin={null}
        destination={null}
        accessibleOnly={false}
        loading={false}
        error={null}
        onSelectOrigin={jest.fn()}
        onSelectDestination={jest.fn()}
        onSwap={jest.fn()}
        onTogglePmr={jest.fn()}
        onCalculate={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "Seleccionar origen" }),
    );
    expect(screen.getByText("Seleccionar punto de partida")).toBeTruthy();

    await fireEvent.press(
      screen.getByRole("button", { name: "Cerrar lista de lugares" }),
    );
    expect(screen.queryByText("Seleccionar punto de partida")).toBeNull();
  });

  it("invoca onClose al pulsar el botón de cerrar en la cabecera", async () => {
    const onClose = jest.fn();
    await render(
      <RouteSelector
        places={mockPlaces}
        origin={null}
        destination={null}
        accessibleOnly={false}
        loading={false}
        error={null}
        onSelectOrigin={jest.fn()}
        onSelectDestination={jest.fn()}
        onSwap={jest.fn()}
        onTogglePmr={jest.fn()}
        onCalculate={jest.fn()}
        onClose={onClose}
      />,
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "Cerrar selector de ruta" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
