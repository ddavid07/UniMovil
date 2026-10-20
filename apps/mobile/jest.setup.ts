jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
jest.mock("@maplibre/maplibre-react-native", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { View } =
    jest.requireActual<typeof import("react-native")>("react-native");
  const camera = { easeTo: jest.fn(), fitBounds: jest.fn(), zoomTo: jest.fn() };
  return {
    __camera: camera,
    Map: jest.fn((props: object) => React.createElement(View, props)),
    GeoJSONSource: (props: object) =>
      React.createElement(View, { ...props, testID: "map-source" }),
    Layer: View,
    Camera: React.forwardRef(function Camera(_props, ref) {
      React.useImperativeHandle(ref, () => camera);
      return null;
    }),
    TransformRequestManager: { addHeader: jest.fn(), removeHeader: jest.fn() },
    LogManager: { onLog: jest.fn() },
  };
});
