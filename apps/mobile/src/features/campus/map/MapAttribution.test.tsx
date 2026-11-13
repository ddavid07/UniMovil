import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Linking } from "react-native";
import { MapAttribution } from "./MapAttribution";

afterEach(() => jest.restoreAllMocks());
it("muestra créditos enlazados y recupera un fallo al abrirlos", async () => {
  const open = jest
    .spyOn(Linking, "openURL")
    .mockResolvedValueOnce(undefined)
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error("No browser"))
    .mockResolvedValueOnce(undefined);
  await render(<MapAttribution />);
  await fireEvent.press(
    screen.getByRole("link", { name: "Cartografía © MapTiler" }),
  );
  expect(open).toHaveBeenLastCalledWith("https://www.maptiler.com");
  await fireEvent.press(
    screen.getByRole("link", { name: "Créditos © MapTiler" }),
  );
  expect(open).toHaveBeenLastCalledWith("https://www.maptiler.com/copyright/");
  await fireEvent.press(
    screen.getByRole("link", {
      name: "Datos © colaboradores de OpenStreetMap",
    }),
  );
  expect(open).toHaveBeenLastCalledWith(
    "https://www.openstreetmap.org/copyright",
  );
  expect(await screen.findByRole("alert")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("link", { name: "Cartografía © MapTiler" }),
  );
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
});
