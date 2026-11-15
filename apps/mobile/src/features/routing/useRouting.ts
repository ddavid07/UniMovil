import { useCallback, useMemo, useState } from "react";
import type { Place, RouteResponse } from "@unimovil/contracts";
import {
  localRoutingRepository,
  type RoutingRepository,
} from "./data/repository";
import {
  classifyError,
  type UIErrorMessage,
} from "./domain/routing-errors";

export interface RoutingState {
  readonly origin: Place | null;
  readonly destination: Place | null;
  readonly accessibleOnly: boolean;
  readonly isRoutingOpen: boolean;
  readonly route: RouteResponse | null;
  readonly loading: boolean;
  readonly error: UIErrorMessage | null;
}

export function createRoutingController(
  repository: RoutingRepository = localRoutingRepository,
) {
  let state: RoutingState = {
    origin: null,
    destination: null,
    accessibleOnly: false,
    isRoutingOpen: false,
    route: null,
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
    closeRouting: () => {
      update({
        isRoutingOpen: false,
        route: null,
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
    swap: () => {
      update({
        origin: state.destination,
        destination: state.origin,
        error: null,
      });
    },
    clearRoute: () => {
      update({ route: null, error: null });
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
        update({ route: response, loading: false, error: null });
      } catch (err) {
        const classified = classifyError(err);
        update({ error: classified, loading: false, route: null });
      }
    },
  };
}

export function useRouting(
  repository: RoutingRepository = localRoutingRepository,
) {
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [isRoutingOpen, setIsRoutingOpen] = useState(false);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UIErrorMessage | null>(null);

  const openRouting = useCallback((initialDestination?: Place) => {
    setIsRoutingOpen(true);
    if (initialDestination) {
      setDestination(initialDestination);
    }
  }, []);

  const closeRouting = useCallback(() => {
    setIsRoutingOpen(false);
    setRoute(null);
    setError(null);
  }, []);

  const swap = useCallback(() => {
    setOrigin(destination);
    setDestination(origin);
    setError(null);
  }, [origin, destination]);

  const clearRoute = useCallback(() => {
    setRoute(null);
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
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      setRoute(null);
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
      loading,
      error,
      setOrigin,
      setDestination,
      setAccessibleOnly,
      openRouting,
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
      loading,
      error,
      openRouting,
      closeRouting,
      swap,
      clearRoute,
      calculate,
    ],
  );
}
