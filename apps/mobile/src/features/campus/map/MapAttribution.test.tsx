import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Linking } from "react-native";
import { MapAttribution } from "./MapAttribution";

afterEach(() => jest.restoreAllMocks());
it("muestra los créditos OSM enlazados y recupera un fallo al abrirlos", async () => {
  const open = jest
    .spyOn(Linking, "openURL")
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error("No browser"))
    .mockResolvedValueOnce(undefined);
  await render(<MapAttribution />);
  await fireEvent.press(
    screen.getByRole("link", { name: "© OpenStreetMap contributors" }),
  );
  expect(open).toHaveBeenLastCalledWith(
    "https://www.openstreetmap.org/copyright",
  );
  await fireEvent.press(
    screen.getByRole("link", { name: "© OpenStreetMap contributors" }),
  );
  expect(open).toHaveBeenLastCalledWith(
    "https://www.openstreetmap.org/copyright",
  );
  expect(await screen.findByRole("alert")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("link", { name: "© OpenStreetMap contributors" }),
  );
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
});
