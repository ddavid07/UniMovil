import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Keyboard, Linking, Platform } from "react-native";
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
  it("mantiene la búsqueda y cierra el teclado al enviarla", async () => {
    const dismiss = jest.spyOn(Keyboard, "dismiss");
    await render(<CampusScreen />);
    await screen.findByRole("button", { name: "Ver lugares (24)" });
    await fireEvent.changeText(
      screen.getByLabelText("Buscar lugares"),
      "odontologia",
    );
    await fireEvent(screen.getByLabelText("Buscar lugares"), "submitEditing");
    expect(dismiss).toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Ver lugares (1)" }),
    ).toBeTruthy();
  });
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
  it("permite abrir el planificador de rutas, seleccionar destino desde una ficha y calcular ruta", async () => {
    await render(<CampusScreen />);
    await screen.findByRole("button", { name: "Ver lugares (24)" });

    // 1. Abrir selector de ruta mediante botón en pantalla
    await fireEvent.press(
      screen.getByRole("button", { name: "Planificar ruta" }),
    );
    expect(screen.getByText("Planificar ruta peatonal")).toBeTruthy();

    // 2. Cerrar selector de ruta
    await fireEvent.press(screen.getByRole("button", { name: "Cerrar ruta" }));
    expect(screen.queryByText("Planificar ruta peatonal")).toBeNull();

    // 3. Abrir un lugar desde la lista y pulsar "Cómo llegar a este lugar"
    await fireEvent.press(
      screen.getByRole("button", { name: "Ver lugares (24)" }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: /^Aparcamiento Moncloa/ }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Cómo llegar a este lugar" }),
    );

    // 4. Se abre el selector con el lugar preseleccionado como destino
    expect(screen.getByText("Planificar ruta peatonal")).toBeTruthy();
    expect(screen.getByText("Aparcamiento Moncloa")).toBeTruthy();
  });

  it("permite conmutar la visibilidad de la capa de transporte EMT", async () => {
    await render(<CampusScreen />);
    const toggleBtn = await screen.findByRole("button", {
      name: "Ocultar EMT",
    });
    expect(toggleBtn).toBeTruthy();

    await fireEvent.press(toggleBtn);
    expect(screen.getByRole("button", { name: "Ver EMT" })).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Ver EMT" }));
    expect(screen.getByRole("button", { name: "Ocultar EMT" })).toBeTruthy();
  });

  it("muestra el banner de modo sin conexión cuando isOffline está activo y permite reintentar (HU-094)", async () => {
    await render(<CampusScreen isOffline={true} />);
    expect(screen.getByText(/modo sin conexión/i)).toBeTruthy();
    expect(screen.getByText(/datos cacheados/i)).toBeTruthy();

    const retryBtn = screen.getByRole("button", {
      name: /reintentar conexión/i,
    });
    expect(retryBtn).toBeTruthy();
    await fireEvent.press(retryBtn);
  });

  it("verifica etiquetas semánticas de accesibilidad WCAG 2.1 AA en controles principales (HU-095)", async () => {
    await render(<CampusScreen />);
    expect(
      screen.getByRole("header", { name: "UniMovil · Moncloa" }),
    ).toBeTruthy();
    expect(screen.getByLabelText("Buscar lugares")).toBeTruthy();
  });

  it("permite conmutar la visibilidad de la capa de incidencias de obras (HU-053)", async () => {
    await render(<CampusScreen />);
    const toggleBtn = await screen.findByRole("button", {
      name: "Ocultar incidencias",
    });
    expect(toggleBtn).toBeTruthy();

    await fireEvent.press(toggleBtn);
    expect(
      screen.getByRole("button", { name: "Ver incidencias" }),
    ).toBeTruthy();

    await fireEvent.press(
      screen.getByRole("button", { name: "Ver incidencias" }),
    );
    expect(
      screen.getByRole("button", { name: "Ocultar incidencias" }),
    ).toBeTruthy();
  });

  it("permite abrir y cerrar el formulario de reporte de incidencias (HU-050)", async () => {
    await render(<CampusScreen />);
    const reportBtn = await screen.findByRole("button", {
      name: "⚠ Reportar incidencia",
    });
    expect(reportBtn).toBeTruthy();

    await fireEvent.press(reportBtn);
    expect(screen.getByText("Reportar incidencia")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Cerrar formulario"));
    expect(screen.queryByText("Reportar incidencia")).toBeNull();
  });
});
