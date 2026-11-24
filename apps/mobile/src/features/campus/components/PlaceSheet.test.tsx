import { fireEvent, render, screen } from "@testing-library/react-native";
import { PlaceSheet } from "./PlaceSheet";
import type { Place } from "@unimovil/contracts";

const MOCK_PLACE: Place = {
  id: "fdi",
  name: "Facultad de Informática",
  category: "building",
  coordinates: { latitude: 40.452, longitude: -3.733 },
  aliases: ["FDI"],
  accessibility: "yes",
  source: {
    url: "https://osm.org/node/123",
    checkedAt: "2026-11-24",
    license: "ODbL-1.0",
  },
};

describe("PlaceSheet Component (HU-014 & HU-060)", () => {
  it("renders place details correctly", async () => {
    await render(<PlaceSheet place={MOCK_PLACE} onClose={jest.fn()} />);
    expect(screen.getByText("Facultad de Informática")).toBeTruthy();
    expect(screen.getByText("Edificios")).toBeTruthy();
    expect(
      screen.getByText(/OSM indica acceso para silla de ruedas/),
    ).toBeTruthy();
  });

  it("calls onClose when close action is pressed", async () => {
    const handleClose = jest.fn();
    await render(<PlaceSheet place={MOCK_PLACE} onClose={handleClose} />);
    await fireEvent.press(screen.getByRole("button", { name: "Cerrar ficha" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onPlanRoute when route action is pressed", async () => {
    const handlePlanRoute = jest.fn();
    const handleClose = jest.fn();
    await render(
      <PlaceSheet
        place={MOCK_PLACE}
        onClose={handleClose}
        onPlanRoute={handlePlanRoute}
      />,
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Cómo llegar a este lugar" }),
    );
    expect(handleClose).toHaveBeenCalled();
    expect(handlePlanRoute).toHaveBeenCalledWith(MOCK_PLACE);
  });

  it("shows 'Guardar en favoritos' when place is not yet a favorite", async () => {
    const handleToggle = jest.fn();
    await render(
      <PlaceSheet
        place={MOCK_PLACE}
        onClose={jest.fn()}
        isFavorite={false}
        onToggleFavorite={handleToggle}
      />,
    );
    const favButton = screen.getByRole("button", {
      name: "☆ Guardar en favoritos",
    });
    expect(favButton).toBeTruthy();
    await fireEvent.press(favButton);
    expect(handleToggle).toHaveBeenCalledWith(MOCK_PLACE);
  });

  it("shows 'Quitar de favoritos' when place is already a favorite", async () => {
    const handleToggle = jest.fn();
    await render(
      <PlaceSheet
        place={MOCK_PLACE}
        onClose={jest.fn()}
        isFavorite={true}
        onToggleFavorite={handleToggle}
      />,
    );
    const favButton = screen.getByRole("button", {
      name: "★ Quitar de favoritos",
    });
    expect(favButton).toBeTruthy();
    await fireEvent.press(favButton);
    expect(handleToggle).toHaveBeenCalledWith(MOCK_PLACE);
  });
});
