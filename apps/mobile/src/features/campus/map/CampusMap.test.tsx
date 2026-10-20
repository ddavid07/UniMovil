import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { parsePlaces } from "@unimovil/contracts";
import {
  LogManager,
  TransformRequestManager,
} from "@maplibre/maplibre-react-native";
import { CampusMap } from "./CampusMap";
import catalog from "../data/catalog.json";

const places = parsePlaces(catalog);
const props = {
  places,
  allPlaces: places,
  selected: null,
  onSelect: jest.fn(),
  mode: "fixture" as const,
};
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});
describe("adaptador nativo (eventos simulados en pruebas de componentes)", () => {
  it("configura cabeceras y filtrado de logs antes de montar el mapa", async () => {
    const map = jest.requireMock<{ Map: jest.Mock }>(
      "@maplibre/maplibre-react-native",
    ).Map;
    map.mockClear();
    jest.mocked(TransformRequestManager.addHeader).mockClear();
    jest.mocked(LogManager.onLog).mockClear();
    await render(<CampusMap {...props} />);
    const firstMapRender = map.mock.invocationCallOrder[0]!;
    expect(
      jest.mocked(TransformRequestManager.addHeader).mock
        .invocationCallOrder[0],
    ).toBeLessThan(firstMapRender);
    expect(
      jest.mocked(LogManager.onLog).mock.invocationCallOrder[0],
    ).toBeLessThan(firstMapRender);
  });
  it("ofrece zoom accesible y respeta los límites de cámara", async () => {
    const camera = jest.requireMock<{ __camera: { zoomTo: jest.Mock } }>(
      "@maplibre/maplibre-react-native",
    ).__camera;
    camera.zoomTo.mockClear();
    await render(<CampusMap {...props} />);
    await fireEvent(screen.getByTestId("campus-map"), "regionDidChange", {
      nativeEvent: { center: [-3.73, 40.44], zoom: 18.5 },
    });
    await fireEvent.press(screen.getByRole("button", { name: "Acercar mapa" }));
    expect(camera.zoomTo).toHaveBeenLastCalledWith(19, { duration: 250 });
    for (let step = 0; step < 12; step += 1)
      await fireEvent.press(
        screen.getByRole("button", { name: "Alejar mapa" }),
      );
    expect(camera.zoomTo).toHaveBeenLastCalledWith(10, { duration: 250 });
  });
  it("mantiene la lista disponible cuando falta configuración", async () => {
    await render(<CampusMap {...props} mode="live" />);
    expect(screen.getByText(/Falta configurar el proveedor/)).toBeTruthy();
  });
  it("procesa carga, selección válida, eventos ajenos y recuperación", async () => {
    const onSelect = jest.fn();
    const view = await render(<CampusMap {...props} onSelect={onSelect} />);
    await fireEvent(screen.getByTestId("campus-map"), "didFinishLoadingMap");
    expect(screen.getByText("Mapa cargado")).toBeTruthy();
    await fireEvent(screen.getByTestId("campus-map"), "regionDidChange", {
      nativeEvent: { center: [-3.73, 40.44], zoom: 14 },
    });
    expect(
      screen.getByText("Vista del mapa: -3.73000,40.44000,14.00000"),
    ).toBeTruthy();
    await fireEvent.press(
      screen.getByRole("button", { name: "Centrar campus" }),
    );
    const stopPropagation = jest.fn();
    await fireEvent(screen.getByTestId("map-source"), "press", {
      nativeEvent: { features: [{ properties: { id: places[0]!.id } }] },
      stopPropagation,
    });
    expect(onSelect).toHaveBeenCalledWith(places[0]!.id);
    expect(stopPropagation).toHaveBeenCalled();
    for (const features of [
      [],
      [{}],
      [{ properties: { id: 5 } }],
      [{ properties: { id: "unknown" } }],
    ]) {
      await fireEvent(screen.getByTestId("map-source"), "press", {
        nativeEvent: { features },
        stopPropagation,
      });
    }
    expect(onSelect).toHaveBeenCalledTimes(1);
    await view.rerender(<CampusMap {...props} selected={places[0]!} />);
    await fireEvent(screen.getByTestId("campus-map"), "didFailLoadingMap");
    await fireEvent.press(
      screen.getByRole("button", { name: "Reintentar mapa" }),
    );
    expect(screen.getByText("Cargando mapa…")).toBeTruthy();
    await fireEvent(screen.getByTestId("campus-map"), "didFinishLoadingMap");
    expect(screen.getByText("Mapa cargado")).toBeTruthy();
  });
  it("detecta timeout, permite carga tardía y limpia suscripciones", async () => {
    jest.useFakeTimers();
    const view = await render(<CampusMap {...props} />);
    await act(() => jest.advanceTimersByTime(15_000));
    expect(screen.getByText(/No se pudo cargar el mapa/)).toBeTruthy();
    await fireEvent(screen.getByTestId("campus-map"), "didFinishLoadingMap");
    await view.unmount();
    expect(TransformRequestManager.removeHeader).toHaveBeenCalledWith(
      "unimovil-user-agent",
    );
  });
  it("registra errores nativos sin copiar mensajes que puedan contener claves", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(
      <CampusMap {...props} mode="live" apiKey="public_testing_key" />,
    );
    await fireEvent(screen.getByTestId("campus-map"), "regionDidChange", {
      nativeEvent: { center: [-3.73, 40.44], zoom: 14 },
    });
    const handler = jest.mocked(LogManager.onLog).mock.calls.at(-1)![0];
    expect(
      handler({
        level: "error",
        tag: "HTTP",
        message: "https://api.maptiler.com?key=private",
      }),
    ).toBe(true);
    expect(warn).toHaveBeenCalledWith("MapLibre", "error", "HTTP");
  });
});
