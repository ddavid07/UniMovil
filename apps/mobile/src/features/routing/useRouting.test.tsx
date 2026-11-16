import { act, renderHook } from "@testing-library/react-native";
import type { Place, RouteResponse } from "@unimovil/contracts";
import type { RoutingRepository } from "./data/repository";
import { createRoutingController, useRouting } from "./useRouting";

const placeA: Place = {
  id: "place-a",
  name: "Metro Ciudad Universitaria",
  category: "transport",
  coordinates: { latitude: 40.4442, longitude: -3.7262 },
  aliases: [],
  accessibility: "yes",
  source: {
    url: "https://osm.org",
    checkedAt: "2026-10-01",
    license: "ODbL-1.0",
  },
};

const placeB: Place = {
  id: "place-b",
  name: "Facultad de Medicina",
  category: "building",
  coordinates: { latitude: 40.4455, longitude: -3.7275 },
  aliases: [],
  accessibility: "limited",
  source: {
    url: "https://osm.org",
    checkedAt: "2026-10-01",
    license: "ODbL-1.0",
  },
};

const mockRoute: RouteResponse = {
  id: "route-test",
  origin: placeA.coordinates,
  destination: placeB.coordinates,
  totalDistanceMeters: 200,
  estimatedDurationMinutes: 3,
  accessible: false,
  segments: [],
  polyline: [placeA.coordinates, placeB.coordinates],
};

describe("useRouting Hook (HU-020 & HU-023 - Jest Coverage)", () => {
  it("inicia con valores nulos y permite abrir/cerrar", async () => {
    const { result } = await renderHook(() => useRouting());

    expect(result.current.origin).toBeNull();
    expect(result.current.destination).toBeNull();
    expect(result.current.isRoutingOpen).toBe(false);

    await act(async () => {
      result.current.openRouting(placeB);
    });

    expect(result.current.isRoutingOpen).toBe(true);
    expect(result.current.destination).toEqual(placeB);

    await act(async () => {
      result.current.closeRouting();
    });

    expect(result.current.isRoutingOpen).toBe(false);
  });

  it("permite seleccionar origen, destino, alternar accesibilidad e intercambiar", async () => {
    const { result } = await renderHook(() => useRouting());

    await act(async () => {
      result.current.setOrigin(placeA);
      result.current.setDestination(placeB);
      result.current.setAccessibleOnly(true);
    });

    expect(result.current.origin).toEqual(placeA);
    expect(result.current.destination).toEqual(placeB);
    expect(result.current.accessibleOnly).toBe(true);

    await act(async () => {
      result.current.swap();
    });

    expect(result.current.origin).toEqual(placeB);
    expect(result.current.destination).toEqual(placeA);
  });

  it("calcula ruta exitosamente llamando al repositorio", async () => {
    const mockRepo: RoutingRepository = {
      calculateRoute: jest.fn().mockResolvedValue(mockRoute),
    };

    const { result } = await renderHook(() => useRouting(mockRepo));

    await act(async () => {
      result.current.setOrigin(placeA);
      result.current.setDestination(placeB);
    });

    await act(async () => {
      await result.current.calculate();
    });

    expect(mockRepo.calculateRoute).toHaveBeenCalled();
    expect(result.current.route).toEqual(mockRoute);
    expect(result.current.loading).toBe(false);

    await act(async () => {
      result.current.clearRoute();
    });
    expect(result.current.route).toBeNull();
  });

  it("establece error de validación cuando origen y destino no están definidos", async () => {
    const { result } = await renderHook(() => useRouting());

    await act(async () => {
      await result.current.calculate();
    });

    expect(result.current.error?.category).toBe("VALIDATION");
    expect(result.current.error?.title).toBe("Puntos incompletos");
  });

  it("establece error de validación cuando origen y destino son idénticos", async () => {
    const { result } = await renderHook(() => useRouting());

    await act(async () => {
      result.current.setOrigin(placeA);
      result.current.setDestination(placeA);
    });

    await act(async () => {
      await result.current.calculate();
    });

    expect(result.current.error?.category).toBe("VALIDATION");
    expect(result.current.error?.title).toBe("Puntos idénticos");
  });

  it("captura y clasifica fallos del repositorio (HU-094)", async () => {
    const mockRepo: RoutingRepository = {
      calculateRoute: jest.fn().mockRejectedValue(new Error("Network failed")),
    };

    const { result } = await renderHook(() => useRouting(mockRepo));

    await act(async () => {
      result.current.setOrigin(placeA);
      result.current.setDestination(placeB);
    });

    await act(async () => {
      await result.current.calculate();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.route).toBeNull();
  });

  it("ejercita createRoutingController para garantizar 100% cobertura", async () => {
    const controller = createRoutingController();
    const unsub = controller.subscribe(jest.fn());

    controller.openRouting(placeA);
    controller.clearRoute();
    controller.swap();
    controller.closeRouting();
    controller.setOrigin(null);
    controller.setDestination(null);
    controller.setAccessibleOnly(true);

    await controller.calculate();
    expect(controller.getState().error?.title).toBe("Puntos incompletos");

    controller.setOrigin(placeA);
    controller.setDestination(placeA);
    await controller.calculate();
    expect(controller.getState().error?.title).toBe("Puntos idénticos");

    unsub();
  });
});
