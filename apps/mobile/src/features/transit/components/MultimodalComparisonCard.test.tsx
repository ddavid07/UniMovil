import { fireEvent, render, screen } from "@testing-library/react-native";
import type { MultimodalAlternative } from "@unimovil/contracts";
import { MultimodalComparisonCard } from "./MultimodalComparisonCard";

const mockAlternatives: readonly MultimodalAlternative[] = [
  {
    mode: "walking",
    label: "A pie",
    durationMinutes: 15,
    distanceMeters: 1100,
    accessible: true,
    transfers: 0,
    available: true,
  },
  {
    mode: "bus",
    label: "Autobús EMT Línea G",
    durationMinutes: 7,
    distanceMeters: 1250,
    accessible: true,
    transfers: 0,
    available: true,
    lineCode: "G",
    originStop: "Metro Ciudad Universitaria",
    destinationStop: "Paraninfo - Filosofía",
    walkingToStopMinutes: 2,
    transitRideMinutes: 4,
    walkingFromStopMinutes: 1,
    isRecommended: true,
  },
  {
    mode: "bicycle",
    label: "Bicicleta · BiciMAD",
    durationMinutes: 5,
    distanceMeters: 1100,
    accessible: false,
    transfers: 0,
    available: false,
    unavailableReason: "No adaptado para movilidad reducida (PMR)",
  },
];

describe("MultimodalComparisonCard (HU-022 - Sprint 3)", () => {
  it("renderiza la comparativa y las opciones disponibles", async () => {
    await render(<MultimodalComparisonCard alternatives={mockAlternatives} />);

    expect(screen.getByText("Comparativa multimodal")).toBeTruthy();
    expect(screen.getByText("Opción recomendada")).toBeTruthy();
    expect(screen.getByText("Autobús")).toBeTruthy();
    expect(screen.getByText("A pie")).toBeTruthy();
    expect(screen.getByText("Bicicleta")).toBeTruthy();
  });

  it("muestra el desglose de tramos para la opción de autobús seleccionada", async () => {
    const onSelectMode = jest.fn();
    await render(
      <MultimodalComparisonCard
        alternatives={mockAlternatives}
        selectedMode="bus"
        onSelectMode={onSelectMode}
      />,
    );

    expect(screen.getByText("Desglose del trayecto EMT:")).toBeTruthy();
    expect(
      screen.getByText(/2 min a pie hasta Metro Ciudad Universitaria/),
    ).toBeTruthy();
    expect(screen.getByText(/4 min en Autobús EMT Línea G/)).toBeTruthy();
  });

  it("permite cambiar de modo al pulsar sobre otra alternativa", async () => {
    const onSelectMode = jest.fn();
    await render(
      <MultimodalComparisonCard
        alternatives={mockAlternatives}
        selectedMode="bus"
        onSelectMode={onSelectMode}
      />,
    );

    const walkingBtn = screen.getByLabelText(/Modo A pie/);
    fireEvent.press(walkingBtn);

    expect(onSelectMode).toHaveBeenCalledWith("walking");
    expect(screen.getByText("15 min")).toBeTruthy();
  });

  it("muestra advertencia y motivo cuando se selecciona una opción no disponible", async () => {
    await render(
      <MultimodalComparisonCard
        alternatives={mockAlternatives}
        selectedMode="bicycle"
      />,
    );

    expect(screen.getByText("Opción no disponible")).toBeTruthy();
    expect(
      screen.getByText("No adaptado para movilidad reducida (PMR)"),
    ).toBeTruthy();
  });
});
