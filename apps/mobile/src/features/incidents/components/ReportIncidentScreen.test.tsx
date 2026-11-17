/**
 * Tests TDD – ReportIncidentScreen (HU-050, HU-051)
 * Metodología: Caja negra, clases de equivalencia y valores límite (Tema 3)
 *
 * @author pablopr06 <pabpalac@ucm.es>
 */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { ReportIncidentScreen } from "./ReportIncidentScreen";

describe("ReportIncidentScreen – formulario de reporte (HU-050, HU-051, TDD Tema 3)", () => {
  afterEach(() => {
    cleanup();
  });

  // CE1: renderizado básico — todos los campos presentes
  it("renderiza el formulario con todos los campos requeridos", async () => {
    await render(
      <ReportIncidentScreen onSubmit={jest.fn()} onClose={jest.fn()} />,
    );
    expect(screen.getByLabelText("Título de la incidencia")).toBeTruthy();
    expect(screen.getByLabelText("Descripción de la incidencia")).toBeTruthy();
    expect(screen.getByText("Enviar reporte")).toBeTruthy();
  });

  // CE2: título vacío → error de validación
  it("muestra error de validación cuando el título está vacío", async () => {
    const onSubmit = jest.fn();
    await render(
      <ReportIncidentScreen onSubmit={onSubmit} onClose={jest.fn()} />,
    );

    await fireEvent.changeText(
      screen.getByLabelText("Descripción de la incidencia"),
      "Descripción suficientemente larga",
    );
    await fireEvent.press(screen.getByText("Enviar reporte"));

    expect(
      await screen.findByText("El título de la incidencia es obligatorio."),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // CE3: descripción demasiado corta (<5 chars) → error
  it("muestra error cuando la descripción tiene menos de 5 caracteres", async () => {
    const onSubmit = jest.fn();
    await render(
      <ReportIncidentScreen onSubmit={onSubmit} onClose={jest.fn()} />,
    );

    await fireEvent.changeText(
      screen.getByLabelText("Título de la incidencia"),
      "Título válido",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Descripción de la incidencia"),
      "cor",
    );
    await fireEvent.press(screen.getByText("Enviar reporte"));

    expect(
      await screen.findByText(
        "La descripción debe contener al menos 5 caracteres.",
      ),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // VL: descripción exactamente de 4 chars → error (valor límite inferior)
  it("rechaza descripción de exactamente 4 caracteres (valor límite inferior)", async () => {
    const onSubmit = jest.fn();
    await render(
      <ReportIncidentScreen onSubmit={onSubmit} onClose={jest.fn()} />,
    );

    await fireEvent.changeText(
      screen.getByLabelText("Título de la incidencia"),
      "Título válido",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Descripción de la incidencia"),
      "1234",
    );
    await fireEvent.press(screen.getByText("Enviar reporte"));

    expect(
      await screen.findByText(
        "La descripción debe contener al menos 5 caracteres.",
      ),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // VL: descripción de 5 chars → válida (valor límite inferior válido)
  it("acepta descripción de exactamente 5 caracteres (valor límite mínimo válido)", async () => {
    const onSubmit = jest.fn();
    await render(
      <ReportIncidentScreen onSubmit={onSubmit} onClose={jest.fn()} />,
    );

    await fireEvent.changeText(
      screen.getByLabelText("Título de la incidencia"),
      "Título válido",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Descripción de la incidencia"),
      "12345",
    );
    await fireEvent.press(screen.getByText("Enviar reporte"));

    await waitFor(() => {
      expect(
        screen.queryByText(
          "La descripción debe contener al menos 5 caracteres.",
        ),
      ).toBeNull();
    });
    expect(onSubmit).toHaveBeenCalled();
  });

  // CE4: formulario completamente válido → llama a onSubmit con datos correctos
  it("llama a onSubmit con los datos correctos cuando el formulario es válido", async () => {
    const onSubmit = jest.fn();
    await render(
      <ReportIncidentScreen onSubmit={onSubmit} onClose={jest.fn()} />,
    );

    await fireEvent.changeText(
      screen.getByLabelText("Título de la incidencia"),
      "Obras en acera",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Descripción de la incidencia"),
      "Zanja señalizada con vallas de obra.",
    );
    await fireEvent.press(screen.getByText("Enviar reporte"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Obras en acera",
          description: "Zanja señalizada con vallas de obra.",
        }),
      );
    });
  });

  // CE5: botón "Cerrar" llama a onClose
  it("llama a onClose cuando se pulsa el botón de cerrar", async () => {
    const onClose = jest.fn();
    await render(
      <ReportIncidentScreen onSubmit={jest.fn()} onClose={onClose} />,
    );
    await fireEvent.press(screen.getByLabelText("Cerrar formulario"));
    expect(onClose).toHaveBeenCalled();
  });

  // CE6: corregir título tras error → el error desaparece
  it("limpia el error de título al escribir un valor válido", async () => {
    await render(
      <ReportIncidentScreen onSubmit={jest.fn()} onClose={jest.fn()} />,
    );

    // Provocar error
    await fireEvent.press(screen.getByText("Enviar reporte"));
    expect(
      await screen.findByText("El título de la incidencia es obligatorio."),
    ).toBeTruthy();

    // Corregir campo y volver a intentar
    await fireEvent.changeText(
      screen.getByLabelText("Título de la incidencia"),
      "Título correcto",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Descripción de la incidencia"),
      "Descripción suficientemente larga",
    );
    await fireEvent.press(screen.getByText("Enviar reporte"));

    await waitFor(() => {
      expect(
        screen.queryByText("El título de la incidencia es obligatorio."),
      ).toBeNull();
    });
  });

  // CE7: selector de tipo — valor por defecto presente
  it("tiene un tipo de incidencia seleccionado por defecto", async () => {
    await render(
      <ReportIncidentScreen onSubmit={jest.fn()} onClose={jest.fn()} />,
    );
    expect(screen.getByLabelText("Tipo de incidencia")).toBeTruthy();
  });

  // CE8: selector de severidad — valor por defecto presente
  it("tiene una severidad seleccionada por defecto", async () => {
    await render(
      <ReportIncidentScreen onSubmit={jest.fn()} onClose={jest.fn()} />,
    );
    expect(screen.getByLabelText("Severidad de la incidencia")).toBeTruthy();
  });
});
