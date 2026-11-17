import { describe, expect, it, vi } from "vitest";
import type { Place, RouteResponse } from "@unimovil/contracts";
import type { RoutingRepository } from "../data/repository.js";
import { createRoutingController } from "../useRouting.js";

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

describe("Routing Controller / State Logic (TDD - Tema 3)", () => {
  it("inicia con estado por defecto limpio", () => {
    const controller = createRoutingController();
    const state = controller.getState();

    expect(state.origin).toBeNull();
    expect(state.destination).toBeNull();
    expect(state.accessibleOnly).toBe(false);
    expect(state.isRoutingOpen).toBe(false);
    expect(state.route).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("permite abrir y cerrar el modo de enrutamiento", () => {
    const controller = createRoutingController();

    controller.openRouting(placeB);
    expect(controller.getState().isRoutingOpen).toBe(true);
    expect(controller.getState().destination).toEqual(placeB);

    controller.closeRouting();
    expect(controller.getState().isRoutingOpen).toBe(false);

    controller.openRouting(placeB);
    expect(controller.getState().isRoutingOpen).toBe(true);
    controller.closePlanner();
    expect(controller.getState().isRoutingOpen).toBe(false);
  });

  it("permite alternar el conmutador de accesibilidad PMR", () => {
    const controller = createRoutingController();

    controller.setAccessibleOnly(true);
    expect(controller.getState().accessibleOnly).toBe(true);

    controller.setAccessibleOnly(false);
    expect(controller.getState().accessibleOnly).toBe(false);
  });

  it("permite intercambiar origen y destino (swap)", () => {
    const controller = createRoutingController();
    controller.setOrigin(placeA);
    controller.setDestination(placeB);

    controller.swap();

    expect(controller.getState().origin).toEqual(placeB);
    expect(controller.getState().destination).toEqual(placeA);
  });

  it("calcula ruta exitosamente llamando al repositorio", async () => {
    const mockRepo: RoutingRepository = {
      calculateRoute: vi.fn().mockResolvedValue(mockRoute),
    };
    const controller = createRoutingController(mockRepo);
    controller.setOrigin(placeA);
    controller.setDestination(placeB);

    await controller.calculate();

    expect(mockRepo.calculateRoute).toHaveBeenCalledWith({
      origin: placeA.coordinates,
      destination: placeB.coordinates,
      accessibleOnly: false,
    });
    expect(controller.getState().route).toEqual(mockRoute);
    expect(controller.getState().loading).toBe(false);
    expect(controller.getState().error).toBeNull();
  });

  it("valida que origen y destino no sean idénticos antes de llamar al repositorio", async () => {
    const mockRepo: RoutingRepository = {
      calculateRoute: vi.fn(),
    };
    const controller = createRoutingController(mockRepo);
    controller.setOrigin(placeA);
    controller.setDestination(placeA);

    await controller.calculate();

    expect(mockRepo.calculateRoute).not.toHaveBeenCalled();
    expect(controller.getState().error?.category).toBe("VALIDATION");
    expect(controller.getState().error?.userMessage).toContain(
      "El origen y el destino no pueden ser iguales",
    );
  });

  it("clasifica errores ante fallo del repositorio según HU-094", async () => {
    const mockRepo: RoutingRepository = {
      calculateRoute: vi
        .fn()
        .mockRejectedValue(new Error("Network request failed")),
    };
    const controller = createRoutingController(mockRepo);
    controller.setOrigin(placeA);
    controller.setDestination(placeB);

    await controller.calculate();

    expect(controller.getState().loading).toBe(false);
    expect(controller.getState().route).toBeNull();
    expect(controller.getState().error).toBeDefined();
    expect(controller.getState().error?.safeForDisplay).toBe(true);
  });

  it("permite seleccionar el modo de transporte multimodal", async () => {
    const mockRouteLong: RouteResponse = {
      ...mockRoute,
      totalDistanceMeters: 800,
      estimatedDurationMinutes: 10,
    };
    const mockRepo: RoutingRepository = {
      calculateRoute: vi.fn().mockResolvedValue(mockRouteLong),
    };
    const controller = createRoutingController(mockRepo);
    controller.setOrigin(placeA);
    controller.setDestination(placeB);

    await controller.calculate();
    expect(controller.getState().route?.id).toBe("route-test");
    expect(controller.getState().selectedMode).toBe("walking");

    controller.setTransportMode("bus");
    expect(controller.getState().selectedMode).toBe("bus");
    expect(controller.getState().route?.mode).toBe("bus");

    controller.setTransportMode("bicycle");
    expect(controller.getState().selectedMode).toBe("bicycle");
    expect(controller.getState().route?.mode).toBe("bicycle");

    controller.setTransportMode("walking");
    expect(controller.getState().selectedMode).toBe("walking");
    expect(controller.getState().route?.mode).toBe("walking");
  });
});
