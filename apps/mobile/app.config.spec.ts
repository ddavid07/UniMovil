import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConfigContext } from "expo/config";
import configure from "./app.config";
const context: ConfigContext = {
  projectRoot: ".",
  staticConfigPath: null,
  packageJsonPath: null,
  config: {},
};
afterEach(() => vi.unstubAllEnvs());
describe("configuración nativa", () => {
  it("no activa fixtures ni permisos de ubicación por defecto", () => {
    vi.stubEnv("APP_VARIANT", undefined);
    vi.stubEnv("EXPO_PUBLIC_MAP_MODE", undefined);
    const config = configure(context);
    expect(config.extra?.testBuild).toBe(false);
    expect(config.android?.package).toBe("io.github.ddavid07.unimovil");
    expect(config.ios?.bundleIdentifier).toBe("io.github.ddavid07.unimovil");
    expect(config.android?.blockedPermissions).toContain(
      "android.permission.ACCESS_FINE_LOCATION",
    );
  });
  it.each(["fixture", "fixture-error", "invalid"])(
    "rechaza modo %s en build normal",
    (mode) => {
      vi.stubEnv("APP_VARIANT", "preview");
      vi.stubEnv("EXPO_PUBLIC_MAP_MODE", mode);
      expect(() => configure(context)).toThrow("APP_VARIANT=e2e");
    },
  );
  it("permite fixtures exclusivamente en build explícito de pruebas", () => {
    vi.stubEnv("APP_VARIANT", "e2e");
    vi.stubEnv("EXPO_PUBLIC_MAP_MODE", "fixture");
    expect(configure(context).extra?.testBuild).toBe(true);
  });
  it("conserva la configuración y los bloqueos preexistentes", () => {
    vi.stubEnv("APP_VARIANT", "preview");
    vi.stubEnv("EXPO_PUBLIC_MAP_MODE", "live");
    const config = configure({
      ...context,
      config: {
        plugins: ["expo-router"],
        android: { blockedPermissions: ["android.permission.CAMERA"] },
        ios: { supportsTablet: true },
        extra: { existing: true },
      },
    });
    expect(config.android?.blockedPermissions).toContain(
      "android.permission.CAMERA",
    );
    expect(config.ios?.supportsTablet).toBe(true);
    expect(config.extra?.existing).toBe(true);
  });
  it("no duplica el plugin registrado por nombre", () => {
    const config = configure({
      ...context,
      config: { plugins: ["@maplibre/maplibre-react-native"] },
    });
    expect(config.plugins).toEqual(["@maplibre/maplibre-react-native"]);
  });
  it("conserva las opciones del plugin registrado como tupla", () => {
    const config = configure({
      ...context,
      config: {
        plugins: [["@maplibre/maplibre-react-native", { android: {} }]],
      },
    });
    expect(config.plugins).toEqual([
      ["@maplibre/maplibre-react-native", { android: {} }],
    ]);
  });
});
