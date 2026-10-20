import type { ConfigContext, ExpoConfig } from "expo/config";
export default function configure({ config }: ConfigContext): ExpoConfig {
  const testing = process.env.APP_VARIANT === "e2e";
  if (
    process.env.EXPO_PUBLIC_MAP_MODE &&
    process.env.EXPO_PUBLIC_MAP_MODE !== "live" &&
    !testing
  )
    throw new Error("Los estilos de prueba requieren APP_VARIANT=e2e.");
  return {
    ...config,
    name: "UniMovil",
    slug: "unimovil",
    android: {
      ...config.android,
      package: "io.github.ddavid07.unimovil",
      blockedPermissions: [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.RECORD_AUDIO",
      ],
    },
    ios: { ...config.ios, bundleIdentifier: "io.github.ddavid07.unimovil" },
    plugins: [...(config.plugins ?? []), "@maplibre/maplibre-react-native"],
    extra: { ...config.extra, testBuild: testing },
  };
}
