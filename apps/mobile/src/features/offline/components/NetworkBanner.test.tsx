import { fireEvent, render, screen } from "@testing-library/react-native";
import { NetworkBanner } from "./NetworkBanner";

describe("NetworkBanner Component (HU-094 & HU-095)", () => {
  it("no muestra nada cuando está online (isOffline = false)", async () => {
    await render(<NetworkBanner isOffline={false} onRetry={() => {}} />);
    expect(screen.queryByText(/sin conexión/i)).toBeNull();
  });

  it("muestra el mensaje de modo sin conexión y el botón de reintento cuando isOffline = true", async () => {
    await render(<NetworkBanner isOffline={true} onRetry={() => {}} />);

    expect(screen.getByText(/modo sin conexión/i)).toBeTruthy();
    expect(screen.getByText(/datos cacheados/i)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /reintentar conexión/i }),
    ).toBeTruthy();
  });

  it("llama a onRetry al pulsar el botón de reintentar", async () => {
    let retried = false;
    await render(
      <NetworkBanner
        isOffline={true}
        onRetry={() => {
          retried = true;
        }}
      />,
    );

    const retryBtn = screen.getByRole("button", {
      name: /reintentar conexión/i,
    });
    fireEvent.press(retryBtn);

    expect(retried).toBe(true);
  });

  it("cumple con las pautas de accesibilidad WCAG 2.1 AA (HU-095)", async () => {
    await render(<NetworkBanner isOffline={true} onRetry={() => {}} />);

    // Contenedor accesible con rol alert
    const alertBanner = screen.getByLabelText(/aviso de modo sin conexión/i);
    expect(alertBanner).toBeTruthy();

    // Botón accesible
    const btn = screen.getByRole("button", { name: /reintentar conexión/i });
    expect(btn.props.accessibilityHint).toMatch(/comprobar si la conexión/i);
  });
});
