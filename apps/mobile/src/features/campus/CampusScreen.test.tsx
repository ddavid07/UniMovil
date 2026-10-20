import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import { parsePlaces } from "@unimovil/contracts";
import { CampusScreen } from "./CampusScreen";
import catalog from "./data/catalog.json";

beforeEach(() => {
  process.env.EXPO_PUBLIC_MAP_MODE = "fixture";
});
afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.EXPO_PUBLIC_MAP_MODE;
});
describe("recorrido móvil del campus", () => {
  it("ofrece sugerencias mientras se escribe y distingue datos ausentes", async () => {
    process.env.EXPO_PUBLIC_MAPTILER_KEY = "public_test_configuration";
    try {
      await render(<CampusScreen />);
      await screen.findByRole("button", { name: "Ver lugares (24)" });
      await fireEvent.changeText(
        screen.getByLabelText("Buscar lugares"),
        "1690",
      );
      await fireEvent.press(
        screen.getByRole("button", { name: /^Sugerencia:/ }),
      );
      expect(screen.getByText("Sin descripción publicada.")).toBeTruthy();
      await fireEvent.press(
        screen.getByRole("button", { name: "Cerrar ficha" }),
      );
    } finally {
      delete process.env.EXPO_PUBLIC_MAPTILER_KEY;
    }
  });
  it("consulta un lugar desde la búsqueda, conserva criterios al cerrar y recupera una consulta vacía", async () => {
    await render(<CampusScreen />);
    await screen.findByRole("button", { name: "Ver lugares (24)" });
    await fireEvent.changeText(
      screen.getByLabelText("Buscar lugares"),
      "odontologia",
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Ver lugares (1)" }),
    );
    await fireEvent.press(
      screen.getByRole("button", {
        name: /^Facultad de Odontología, Edificios/,
      }),
    );
    expect(
      screen.getByRole("header", { name: "Facultad de Odontología" }),
    ).toBeTruthy();
    expect(screen.getByText(/Sin información de accesibilidad/)).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Cerrar ficha" }));
    expect(screen.getByLabelText("Buscar lugares").props.value).toBe(
      "odontologia",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Buscar lugares"),
      "inexistente",
    );
    expect(screen.getByText(/No hay coincidencias/)).toBeTruthy();
    await fireEvent.press(
      screen.getByRole("button", { name: "Ver lugares (0)" }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Restablecer búsqueda y filtros" }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Volver al mapa" }),
    );
    expect(
      screen.getByRole("button", { name: "Ver lugares (24)" }),
    ).toBeTruthy();
  });
  it("combina filtro y búsqueda, mostrando estado accesible", async () => {
    jest.replaceProperty(Platform, "OS", "ios");
    await render(<CampusScreen />);
    await screen.findByRole("button", { name: "Ver lugares (24)" });
    await fireEvent.press(screen.getByRole("checkbox", { name: "Edificios" }));
    expect(
      screen.getByRole("checkbox", { name: "Edificios" }).props
        .accessibilityState.checked,
    ).toBe(false);
    await fireEvent.changeText(
      screen.getByLabelText("Buscar lugares"),
      "medicina",
    );
    expect(
      screen.getByRole("button", { name: "Ver lugares (1)" }),
    ).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Restablecer" }));
    expect(
      screen.getByRole("button", { name: "Ver lugares (24)" }),
    ).toBeTruthy();
  });
  it("permite consultar fuentes y recuperar un error al abrir el navegador", async () => {
    const open = jest
      .spyOn(Linking, "openURL")
      .mockRejectedValueOnce(new Error("No browser"))
      .mockResolvedValueOnce(undefined);
    await render(<CampusScreen />);
    await screen.findByRole("button", { name: "Ver lugares (24)" });
    await fireEvent.changeText(
      screen.getByLabelText("Buscar lugares"),
      "biologicas edificios",
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Ver lugares (1)" }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: /^Facultad de Ciencias Biológicas/ }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Consultar fuente en OpenStreetMap" }),
    );
    expect(await screen.findByRole("alert")).toBeTruthy();
    await fireEvent.press(
      screen.getByRole("button", { name: "Consultar fuente en OpenStreetMap" }),
    );
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(open).toHaveBeenLastCalledWith(
      "https://www.openstreetmap.org/way/15431473",
    );
  });
  it("muestra carga, error de catálogo y recuperación sin simular éxito", async () => {
    const list = jest
      .fn()
      .mockRejectedValueOnce(new Error("Invalid catalog"))
      .mockResolvedValueOnce(parsePlaces(catalog));
    await render(<CampusScreen repository={{ list }} />);
    await screen.findByText("No se pudo cargar el catálogo.");
    await fireEvent.press(
      screen.getByRole("button", { name: "Reintentar catálogo" }),
    );
    expect(
      await screen.findByRole("button", { name: "Ver lugares (24)" }),
    ).toBeTruthy();
  });
});
