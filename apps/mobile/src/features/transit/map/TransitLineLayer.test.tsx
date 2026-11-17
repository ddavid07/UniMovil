import { render } from "@testing-library/react-native";
import { CAMPUS_TRANSIT_LINES } from "../data/transit-data";
import { TransitLineLayer } from "./TransitLineLayer";

describe("TransitLineLayer (HU-026 - Sprint 3)", () => {
  it("no renderiza nada cuando visible es false o el array está vacío", async () => {
    const { toJSON: jsonHidden } = await render(
      <TransitLineLayer lines={CAMPUS_TRANSIT_LINES} visible={false} />,
    );
    expect(jsonHidden()).toBeNull();

    const { toJSON: jsonEmpty } = await render(
      <TransitLineLayer lines={[]} visible={true} />,
    );
    expect(jsonEmpty()).toBeNull();
  });

  it("renderiza la fuente GeoJSON y las capas de línea cuando está visible", async () => {
    const { toJSON } = await render(
      <TransitLineLayer lines={CAMPUS_TRANSIT_LINES} visible={true} />,
    );
    expect(toJSON()).not.toBeNull();
  });
});
