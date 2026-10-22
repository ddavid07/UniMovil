import { useEffect, useMemo, useRef, useState } from "react";
import {
  LogManager,
  TransformRequestManager,
  type CameraRef,
} from "@maplibre/maplibre-react-native";
import type { Place } from "@unimovil/contracts";
import { campusBounds } from "../domain/places";
import { mapStyle, type MapMode } from "./map-style";

function useMapResources() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    TransformRequestManager.addHeader({
      id: "unimovil-user-agent",
      name: "User-Agent",
      value: "UniMovil/0.1",
      match: /^https:\/\/api\.maptiler\.com\//,
    });
    LogManager.onLog((event) => {
      console.warn("MapLibre", event.level, event.tag);
      return true;
    });
    setReady(true);
    return () => {
      TransformRequestManager.removeHeader("unimovil-user-agent");
    };
  }, []);
  return ready;
}
export function useMapController(
  allPlaces: readonly Place[],
  selected: Place | null,
  mode: MapMode,
  apiKey?: string,
) {
  const camera = useRef<CameraRef>(null);
  const zoom = useRef(14);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const style = useMemo(
    () => mapStyle(apiKey, mode, attempt),
    [apiKey, mode, attempt],
  );
  const bounds = useMemo(() => campusBounds(allPlaces), [allPlaces]);
  const resourcesReady = useMapResources();
  useEffect(() => {
    if (state !== "loading") return;
    const timeout = setTimeout(() => setState("error"), 15_000);
    return () => clearTimeout(timeout);
  }, [state, attempt]);
  useEffect(() => {
    if (selected && state === "ready")
      camera.current?.easeTo({
        center: [selected.coordinates.longitude, selected.coordinates.latitude],
        zoom: 16,
        duration: 250,
      });
  }, [selected, state]);
  return {
    resourcesReady,
    camera,
    attempt,
    state,
    style,
    bounds,
    recordZoom: (value: number) => {
      zoom.current = value;
    },
    zoomBy: (delta: number) => {
      zoom.current = Math.min(19, Math.max(10, zoom.current + delta));
      camera.current?.zoomTo(zoom.current, { duration: 250 });
    },
    setState,
    retry: () => {
      setState("loading");
      setAttempt((value) => value + 1);
    },
    recenter: () =>
      camera.current?.fitBounds(bounds, {
        duration: 250,
        padding: { top: 24, bottom: 40, left: 24, right: 24 },
      }),
  };
}
