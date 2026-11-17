import { fireEvent, render, screen } from "@testing-library/react-native";
import { PLACE_CATEGORIES } from "@unimovil/contracts";
import { ExplorerControls } from "./ExplorerControls";

describe("ExplorerControls Component", () => {
  const defaultProps = {
    query: "",
    categories: [...PLACE_CATEGORIES],
    onQuery: jest.fn(),
    onToggle: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input and category actions by default", async () => {
    await render(
      <ExplorerControls
        query={defaultProps.query}
        categories={defaultProps.categories}
        onQuery={defaultProps.onQuery}
        onToggle={defaultProps.onToggle}
        onReset={defaultProps.onReset}
      />,
    );

    expect(screen.getByLabelText("Buscar lugares")).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Edificios" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Transporte" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Restablecer" })).toBeTruthy();
  });

  it("calls onQuery when typing in the search input", async () => {
    await render(
      <ExplorerControls
        query={defaultProps.query}
        categories={defaultProps.categories}
        onQuery={defaultProps.onQuery}
        onToggle={defaultProps.onToggle}
        onReset={defaultProps.onReset}
      />,
    );

    await fireEvent.changeText(screen.getByLabelText("Buscar lugares"), "Medicina");
    expect(defaultProps.onQuery).toHaveBeenCalledWith("Medicina");
  });

  it("calls onToggle when pressing a category action", async () => {
    await render(
      <ExplorerControls
        query={defaultProps.query}
        categories={defaultProps.categories}
        onQuery={defaultProps.onQuery}
        onToggle={defaultProps.onToggle}
        onReset={defaultProps.onReset}
      />,
    );

    await fireEvent.press(screen.getByRole("checkbox", { name: "Edificios" }));
    expect(defaultProps.onToggle).toHaveBeenCalledWith("building");
  });

  it("calls onReset when pressing the Restablecer button", async () => {
    await render(
      <ExplorerControls
        query={defaultProps.query}
        categories={defaultProps.categories}
        onQuery={defaultProps.onQuery}
        onToggle={defaultProps.onToggle}
        onReset={defaultProps.onReset}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Restablecer" }));
    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
  });

  it("hides category actions when hideCategories is true", async () => {
    await render(
      <ExplorerControls
        query={defaultProps.query}
        categories={defaultProps.categories}
        onQuery={defaultProps.onQuery}
        onToggle={defaultProps.onToggle}
        onReset={defaultProps.onReset}
        hideCategories={true}
      />,
    );

    expect(screen.getByLabelText("Buscar lugares")).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "Edificios" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Restablecer" })).toBeNull();
  });
});
