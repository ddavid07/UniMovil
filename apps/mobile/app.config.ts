import type { ConfigContext, ExpoConfig } from "expo/config";
export default function configure({ config }: ConfigContext): ExpoConfig {
  const testing = process.env.APP_VARIANT === "e2e";
  const clientKey = process.env.EXPO_PUBLIC_MAPTILER_KEY;
  if (clientKey && !/^[a-zA-Z0-9_-]{10,128}$/.test(clientKey))
    throw new Error(
      "La clave pública de MapTiler tiene un formato inválido. No uses tokens de servicio.",
    );
  const plugins = config.plugins ?? [];
  const hasMapLibre = plugins.some(
    (plugin) =>
      (typeof plugin === "string" ? plugin : plugin[0]) ===
      "@maplibre/maplibre-react-native",
  );
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
        ...(config.android?.blockedPermissions ?? []),
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.RECORD_AUDIO",
      ],
    },
    ios: { ...config.ios, bundleIdentifier: "io.github.ddavid07.unimovil" },
    plugins: hasMapLibre
      ? plugins
      : [...plugins, "@maplibre/maplibre-react-native"],
    extra: { ...config.extra, testBuild: testing },
  };
}
