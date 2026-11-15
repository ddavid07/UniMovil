import { fireEvent, render } from "@testing-library/react-native";
import { CAMPUS_TRANSIT_STOPS } from "../data/transit-data";
import { TransitStopLayer } from "./TransitStopLayer";

describe("TransitStopLayer (HU-027 - Sprint 3)", () => {
  it("no renderiza nada cuando visible es false o stops está vacío", async () => {
    const { toJSON: jsonHidden } = await render(
      <TransitStopLayer
        stops={CAMPUS_TRANSIT_STOPS}
        onSelectStop={jest.fn()}
        visible={false}
      />,
    );
    expect(jsonHidden()).toBeNull();

    const { toJSON: jsonEmpty } = await render(
      <TransitStopLayer stops={[]} onSelectStop={jest.fn()} visible={true} />,
    );
    expect(jsonEmpty()).toBeNull();
  });

  it("renderiza la fuente de puntos GeoJSON cuando está visible", async () => {
    const { toJSON } = await render(
      <TransitStopLayer
        stops={CAMPUS_TRANSIT_STOPS}
        selectedStop={CAMPUS_TRANSIT_STOPS[0]}
        onSelectStop={jest.fn()}
        visible={true}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it("gestiona la pulsación sobre una parada de autobús", async () => {
    const onSelectStop = jest.fn();
    const { getByTestId } = await render(
      <TransitStopLayer
        stops={CAMPUS_TRANSIT_STOPS}
        onSelectStop={onSelectStop}
        visible={true}
      />,
    );

    const source = getByTestId("map-source");
    const stopPropagation = jest.fn();

    // Pulsación con ID coincidente
    await fireEvent(source, "press", {
      nativeEvent: {
        features: [{ properties: { id: CAMPUS_TRANSIT_STOPS[0]?.id } }],
      },
      stopPropagation,
    });
    expect(onSelectStop).toHaveBeenCalledWith(CAMPUS_TRANSIT_STOPS[0]);
    expect(stopPropagation).toHaveBeenCalled();

    // Pulsación con ID no coincidente o feature vacía
    await fireEvent(source, "press", {
      nativeEvent: { features: [{ properties: { id: "unknown" } }] },
      stopPropagation,
    });
    expect(onSelectStop).toHaveBeenCalledTimes(1);
  });
});
