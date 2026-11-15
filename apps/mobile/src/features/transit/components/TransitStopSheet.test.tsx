import { fireEvent, render, screen } from "@testing-library/react-native";
import type { TransitStop } from "@unimovil/contracts";
import { TransitStopSheet } from "./TransitStopSheet";

const mockStop: TransitStop = {
  id: "emt-stop-1688",
  name: "Metro Ciudad Universitaria",
  code: "1688",
  coordinates: { latitude: 40.44328, longitude: -3.72725 },
  lines: ["G", "F", "82"],
  wheelchairAccessible: true,
  nextArrivals: [
    { line: "G", destination: "Paraninfo", estimateMinutes: 3 },
    { line: "F", destination: "Filosofía B", estimateMinutes: 0 },
  ],
};

describe("TransitStopSheet (HU-027 - Sprint 3)", () => {
  it("renderiza la información completa de la parada", async () => {
    const onClose = jest.fn();
    await render(<TransitStopSheet stop={mockStop} onClose={onClose} />);

    expect(screen.getByText("Metro Ciudad Universitaria")).toBeTruthy();
    expect(screen.getByText("Parada 1688")).toBeTruthy();
    expect(screen.getByText("EMT Madrid")).toBeTruthy();
    expect(screen.getByText("Parada adaptada para movilidad reducida (PMR)")).toBeTruthy();
    expect(screen.getAllByText("G").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("F").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("en 3 min")).toBeTruthy();
    expect(screen.getByText("Llegando")).toBeTruthy();
  });

  it("permite cerrar el modal pulsando en el botón cerrar", async () => {
    const onClose = jest.fn();
    await render(<TransitStopSheet stop={mockStop} onClose={onClose} />);

    const closeBtn = screen.getByLabelText("Cerrar ficha de parada");
    fireEvent.press(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("permite planificar ruta hasta la parada al pulsar el botón de acción", async () => {
    const onClose = jest.fn();
    const onPlanRoute = jest.fn();
    await render(
      <TransitStopSheet
        stop={mockStop}
        onClose={onClose}
        onPlanRouteToStop={onPlanRoute}
      />,
    );

    const planBtn = screen.getByLabelText("Planificar ruta hasta esta parada");
    fireEvent.press(planBtn);

    expect(onPlanRoute).toHaveBeenCalledWith(mockStop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("muestra estado sin adaptacion y mensaje vacio de llegadas cuando corresponde", async () => {
    const inaccessibleStop: TransitStop = {
      ...mockStop,
      wheelchairAccessible: false,
      nextArrivals: [],
    };

    await render(<TransitStopSheet stop={inaccessibleStop} onClose={jest.fn()} />);

    expect(
      screen.getByText("Parada sin adaptación de accesibilidad"),
    ).toBeTruthy();
    expect(
      screen.getByText("No hay estimaciones en tiempo real disponibles en este momento."),
    ).toBeTruthy();
  });
});
