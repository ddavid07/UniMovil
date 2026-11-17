import { useCallback, useMemo, useState } from "react";
import type { Place, RouteResponse, TransportMode } from "@unimovil/contracts";
import {
  defaultRoutingRepository,
  localRoutingRepository,
  type RoutingRepository,
} from "./data/repository";
import { classifyError, type UIErrorMessage } from "./domain/routing-errors";
import { buildMultimodalRoute } from "../transit/domain/transit";

export interface RoutingState {
  readonly origin: Place | null;
  readonly destination: Place | null;
  readonly accessibleOnly: boolean;
  readonly isRoutingOpen: boolean;
  readonly route: RouteResponse | null;
  readonly baseWalkingRoute?: RouteResponse | null;
  readonly selectedMode: TransportMode;
  readonly loading: boolean;
  readonly error: UIErrorMessage | null;
}

export function createRoutingController(
  repository: RoutingRepository = defaultRoutingRepository,
) {
  let state: RoutingState = {
    origin: null,
    destination: null,
    accessibleOnly: false,
    isRoutingOpen: false,
    route: null,
    baseWalkingRoute: null,
    selectedMode: "walking",
    loading: false,
    error: null,
  };

  const listeners = new Set<(s: RoutingState) => void>();

  function update(partial: Partial<RoutingState>) {
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener(state));
  }

  return {
    getState: () => state,
    subscribe: (listener: (s: RoutingState) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    openRouting: (initialDestination?: Place) => {
      update({
        isRoutingOpen: true,
        ...(initialDestination ? { destination: initialDestination } : {}),
      });
    },
    closePlanner: () => {
      update({
        isRoutingOpen: false,
      });
    },
    closeRouting: () => {
      update({
        isRoutingOpen: false,
        route: null,
        baseWalkingRoute: null,
        selectedMode: "walking",
        error: null,
      });
    },
    setOrigin: (origin: Place | null) => {
      update({ origin, error: null });
    },
    setDestination: (destination: Place | null) => {
      update({ destination, error: null });
    },
    setAccessibleOnly: (accessibleOnly: boolean) => {
      update({ accessibleOnly });
    },
    setTransportMode: (mode: TransportMode) => {
      const base = state.baseWalkingRoute ?? state.route;
      if (!base) return;
      const newRoute = buildMultimodalRoute(base, mode);
      update({
        selectedMode: mode,
        route: newRoute,
      });
    },
    swap: () => {
      update({
        origin: state.destination,
        destination: state.origin,
        error: null,
      });
    },
    clearRoute: () => {
      update({
        route: null,
        baseWalkingRoute: null,
        selectedMode: "walking",
        error: null,
      });
    },
    calculate: async () => {
      if (!state.origin || !state.destination) {
        update({
          error: {
            category: "VALIDATION",
            title: "Puntos incompletos",
            userMessage: "Debe seleccionar un origen y un destino.",
            recommendedAction: "Seleccione ambos lugares en el campus.",
            isRetryable: false,
            safeForDisplay: true,
          },
        });
        return;
      }

      if (state.origin.id === state.destination.id) {
        update({
          error: {
            category: "VALIDATION",
            title: "Puntos idénticos",
            userMessage: "El origen y el destino no pueden ser iguales.",
            recommendedAction: "Seleccione dos lugares diferentes.",
            isRetryable: false,
            safeForDisplay: true,
          },
        });
        return;
      }

      update({ loading: true, error: null });

      try {
        const response = await repository.calculateRoute({
          origin: state.origin.coordinates,
          destination: state.destination.coordinates,
          accessibleOnly: state.accessibleOnly,
        });
        update({
          route: response,
          baseWalkingRoute: response,
          selectedMode: "walking",
          loading: false,
          error: null,
        });
      } catch (err) {
        const classified = classifyError(err);
        update({ error: classified, loading: false, route: null });
      }
    },
  };
}

export function useRouting(
  repository: RoutingRepository = defaultRoutingRepository,
) {
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [isRoutingOpen, setIsRoutingOpen] = useState(false);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [baseWalkingRoute, setBaseWalkingRoute] = useState<RouteResponse | null>(null);
  const [selectedMode, setSelectedMode] = useState<TransportMode>("walking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UIErrorMessage | null>(null);

  const openRouting = useCallback((initialDestination?: Place) => {
    setIsRoutingOpen(true);
    if (initialDestination) {
      setDestination(initialDestination);
    }
  }, []);

  const closePlanner = useCallback(() => {
    setIsRoutingOpen(false);
  }, []);

  const closeRouting = useCallback(() => {
    setIsRoutingOpen(false);
    setRoute(null);
    setBaseWalkingRoute(null);
    setSelectedMode("walking");
    setError(null);
  }, []);

  const setTransportMode = useCallback(
    (mode: TransportMode) => {
      const base = baseWalkingRoute ?? route;
      if (!base) return;
      const newRoute = buildMultimodalRoute(base, mode);
      setSelectedMode(mode);
      setRoute(newRoute);
    },
    [baseWalkingRoute, route],
  );

  const swap = useCallback(() => {
    setOrigin(destination);
    setDestination(origin);
    setError(null);
  }, [origin, destination]);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setBaseWalkingRoute(null);
    setSelectedMode("walking");
    setError(null);
  }, []);

  const calculate = useCallback(async () => {
    if (!origin || !destination) {
      setError({
        category: "VALIDATION",
        title: "Puntos incompletos",
        userMessage: "Debe seleccionar un origen y un destino.",
        recommendedAction: "Seleccione ambos lugares en el campus.",
        isRetryable: false,
        safeForDisplay: true,
      });
      return;
    }

    if (origin.id === destination.id) {
      setError({
        category: "VALIDATION",
        title: "Puntos idénticos",
        userMessage: "El origen y el destino no pueden ser iguales.",
        recommendedAction: "Seleccione dos lugares diferentes.",
        isRetryable: false,
        safeForDisplay: true,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await repository.calculateRoute({
        origin: origin.coordinates,
        destination: destination.coordinates,
        accessibleOnly,
      });
      setRoute(result);
      setBaseWalkingRoute(result);
      setSelectedMode("walking");
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      setRoute(null);
      setBaseWalkingRoute(null);
      setSelectedMode("walking");
    } finally {
      setLoading(false);
    }
  }, [origin, destination, accessibleOnly, repository]);

  return useMemo(
    () => ({
      origin,
      destination,
      accessibleOnly,
      isRoutingOpen,
      route,
      baseWalkingRoute,
      selectedMode,
      loading,
      error,
      setOrigin,
      setDestination,
      setAccessibleOnly,
      setTransportMode,
      openRouting,
      closePlanner,
      closeRouting,
      swap,
      clearRoute,
      calculate,
    }),
    [
      origin,
      destination,
      accessibleOnly,
      isRoutingOpen,
      route,
      baseWalkingRoute,
      selectedMode,
      loading,
      error,
      setOrigin,
      setDestination,
      setAccessibleOnly,
      setTransportMode,
      openRouting,
      closePlanner,
      closeRouting,
      swap,
      clearRoute,
      calculate,
    ],
  );
}
