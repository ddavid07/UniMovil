jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
jest.mock("@maplibre/maplibre-react-native", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { View } =
    jest.requireActual<typeof import("react-native")>("react-native");
  return {
    Map: View,
    GeoJSONSource: (props: object) =>
      React.createElement(View, { ...props, testID: "map-source" }),
    Layer: View,
    Camera: React.forwardRef(function Camera(_props, ref) {
      React.useImperativeHandle(ref, () => ({
        easeTo: jest.fn(),
        fitBounds: jest.fn(),
      }));
      return null;
    }),
    TransformRequestManager: { addHeader: jest.fn(), removeHeader: jest.fn() },
    LogManager: { onLog: jest.fn() },
  };
});
