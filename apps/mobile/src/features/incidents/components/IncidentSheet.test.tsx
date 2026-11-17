/**
 * Tests TDD – IncidentSheet (HU-053)
 * Metodología: Caja negra, clases de equivalencia y valores límite (Tema 3)
 *
 * @author pablopr06 <pabpalac@ucm.es>
 */
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";
import type { Incident } from "../domain/incidents";
import { IncidentSheet } from "./IncidentSheet";

const mockIncident: Incident = {
  id: "inc-sheet-01",
  title: "Obras en vial de acceso a Medicina",
  description:
    "Zanja señalizada en acera peatonal derecha por canalizaciones eléctricas.",
  type: "obra",
  severity: "alta",
  coordinates: { latitude: 40.4435, longitude: -3.727 },
  status: "reportada",
  reportedAt: "2026-11-14T09:00:00.000Z",
};

describe("IncidentSheet – ficha informativa de incidencia (HU-053, TDD Tema 3)", () => {
  afterEach(() => {
    cleanup();
  });

  // CE1: si incident es null → no renderiza nada
  it("no renderiza nada cuando incident es null", async () => {
    const { toJSON } = await render(
      <IncidentSheet incident={null} onClose={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  // CE2: renderiza título, descripción, tipo y severidad
  it("muestra los datos principales de la incidencia", async () => {
    await render(<IncidentSheet incident={mockIncident} onClose={jest.fn()} />);

    expect(screen.getByText("Obras en vial de acceso a Medicina")).toBeTruthy();
    expect(
      screen.getByText(
        "Zanja señalizada en acera peatonal derecha por canalizaciones eléctricas.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("⚠ Obra en curso")).toBeTruthy();
    expect(screen.getByText("Alta")).toBeTruthy();
    expect(screen.getByText("Reportada")).toBeTruthy();
  });

  // CE3: muestra coordenadas y aviso
  it("muestra la ubicación formateada y el aviso informativo", async () => {
    await render(<IncidentSheet incident={mockIncident} onClose={jest.fn()} />);

    expect(screen.getByText("40.443500, -3.727000")).toBeTruthy();
    expect(
      screen.getByText(/Información reportada por usuarios/i),
    ).toBeTruthy();
  });

  // CE4: permite cerrar el modal
  it("invoca onClose al pulsar 'Cerrar ficha de incidencia'", async () => {
    const onClose = jest.fn();
    await render(<IncidentSheet incident={mockIncident} onClose={onClose} />);

    await fireEvent.press(screen.getByLabelText("Cerrar ficha de incidencia"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // CE5: incidencia crítica muestra badge rojo de severidad
  it("muestra la severidad crítica y estado en curso correctamente", async () => {
    const criticalIncident: Incident = {
      ...mockIncident,
      id: "inc-sheet-02",
      type: "rampa_averiada",
      severity: "critica",
      status: "en_curso",
    };
    await render(
      <IncidentSheet incident={criticalIncident} onClose={jest.fn()} />,
    );

    expect(screen.getByText("⚠ Rampa averiada")).toBeTruthy();
    expect(screen.getByText("Crítica")).toBeTruthy();
    expect(screen.getByText("En curso")).toBeTruthy();
  });

  it("permite renderizar en modo embebido dentro del simulador", async () => {
    await render(
      <IncidentSheet
        incident={mockIncident}
        onClose={jest.fn()}
        embedded={true}
      />,
    );
    expect(screen.getByText(mockIncident.title)).toBeTruthy();
  });
});
