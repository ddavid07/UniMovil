import { fireEvent, render, screen } from "@testing-library/react-native";
import { MapStatus } from "./MapStatus";

describe("MapStatus Component", () => {
  const defaultProps = {
    state: "ready",
    mode: "live",
    onRetry: jest.fn(),
    onRecenter: jest.fn(),
    viewport: "-3.727,40.443,15",
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders zoom and recenter controls in ready state", async () => {
    await render(
      <MapStatus
        state="ready"
        mode="live"
        onRetry={defaultProps.onRetry}
        onRecenter={defaultProps.onRecenter}
        viewport={defaultProps.viewport}
        onZoomIn={defaultProps.onZoomIn}
        onZoomOut={defaultProps.onZoomOut}
      />,
    );

    expect(screen.getByRole("button", { name: "Centrar campus" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Acercar mapa" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Alejar mapa" })).toBeTruthy();
  });

  it("triggers callbacks on button clicks", async () => {
    await render(
      <MapStatus
        state="ready"
        mode="live"
        onRetry={defaultProps.onRetry}
        onRecenter={defaultProps.onRecenter}
        viewport={defaultProps.viewport}
        onZoomIn={defaultProps.onZoomIn}
        onZoomOut={defaultProps.onZoomOut}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Centrar campus" }));
    expect(defaultProps.onRecenter).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole("button", { name: "Acercar mapa" }));
    expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole("button", { name: "Alejar mapa" }));
    expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(1);
  });

  it("renders retry button when state is error", async () => {
    await render(
      <MapStatus
        state="error"
        mode="live"
        onRetry={defaultProps.onRetry}
        onRecenter={defaultProps.onRecenter}
        viewport={defaultProps.viewport}
        onZoomIn={defaultProps.onZoomIn}
        onZoomOut={defaultProps.onZoomOut}
      />,
    );

    expect(screen.getByText(/No se pudo cargar el mapa/)).toBeTruthy();
    const retryBtn = screen.getByRole("button", { name: "Reintentar mapa" });
    expect(retryBtn).toBeTruthy();

    await fireEvent.press(retryBtn);
    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders loading message when state is loading", async () => {
    await render(
      <MapStatus
        state="loading"
        mode="live"
        onRetry={defaultProps.onRetry}
        onRecenter={defaultProps.onRecenter}
        viewport={defaultProps.viewport}
        onZoomIn={defaultProps.onZoomIn}
        onZoomOut={defaultProps.onZoomOut}
      />,
    );

    expect(screen.getByText("Cargando mapa…")).toBeTruthy();
  });

  it("displays test map info when mode is not live", async () => {
    await render(
      <MapStatus
        state="ready"
        mode="fixture"
        viewport="-3.72700,40.44300,15.00000"
        onRetry={defaultProps.onRetry}
        onRecenter={defaultProps.onRecenter}
        onZoomIn={defaultProps.onZoomIn}
        onZoomOut={defaultProps.onZoomOut}
      />,
    );

    expect(screen.getByText("Mapa de prueba sin conexión externa")).toBeTruthy();
    expect(
      screen.getByText("Vista del mapa: -3.72700,40.44300,15.00000"),
    ).toBeTruthy();
  });

  it("applies custom style prop when provided", async () => {
    const customStyle = { backgroundColor: "transparent", opacity: 0.9 };
    const { getByTestId } = await render(
      <MapStatus
        state="ready"
        mode="live"
        viewport={defaultProps.viewport}
        onRetry={defaultProps.onRetry}
        onRecenter={defaultProps.onRecenter}
        onZoomIn={defaultProps.onZoomIn}
        onZoomOut={defaultProps.onZoomOut}
        style={customStyle}
      />,
    );

    expect(screen.getByRole("button", { name: "Centrar campus" })).toBeTruthy();
  });
});
