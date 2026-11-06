import type { MapProps } from "@maplibre/maplibre-react-native";
export type MapMode = "live" | "fixture" | "fixture-error";
export function mapMode(value: string | undefined): MapMode {
  if (value === "fixture" || value === "fixture-error") return value;
  return "live";
}
export function mapStyle(
  key: string | undefined,
  mode: MapMode,
  attempt: number,
): MapProps["mapStyle"] | null {
  if (mode === "fixture-error" && attempt === 0)
    return "https://127.0.0.1:1/unavailable-style.json";
  if (mode !== "live")
    return {
      version: 8,
      name: "UniMovil native test fixture",
      sources: {},
      layers: [
        {
          id: "background",
          type: "background",
          paint: { "background-color": "#e4e9e2" },
        },
      ],
    };
  if (!key || !/^[a-zA-Z0-9_-]{10,128}$/.test(key)) return null;
  return `https://api.maptiler.com/maps/streets-v4/style.json?key=${encodeURIComponent(key)}`;
}
