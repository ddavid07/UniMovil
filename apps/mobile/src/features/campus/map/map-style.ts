import type { MapProps } from "@maplibre/maplibre-react-native";
export type MapMode = "live" | "fixture" | "fixture-error";
export function mapMode(value: string | undefined): MapMode {
  if (value === "fixture" || value === "fixture-error") return value;
  return "live";
}
export function mapStyle(
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
  return {
    version: 8,
    name: "OpenStreetMap raster",
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        maxzoom: 19,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }],
  };
}
