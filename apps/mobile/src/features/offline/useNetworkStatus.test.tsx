import { act, renderHook } from "@testing-library/react-native";
import { useNetworkStatus } from "./useNetworkStatus";

describe("useNetworkStatus Hook (HU-094)", () => {
  it("inicia en modo online (isOffline = false)", async () => {
    const { result } = await renderHook(() => useNetworkStatus());
    expect(result.current.isOffline).toBe(false);
  });

  it("permite conmutar a modo offline y recuperar", async () => {
    const { result } = await renderHook(() => useNetworkStatus());

    await act(async () => {
      result.current.setOffline(true);
    });
    expect(result.current.isOffline).toBe(true);

    await act(async () => {
      result.current.setOffline(false);
    });
    expect(result.current.isOffline).toBe(false);
  });

  it("permite comprobar la conectividad mediante reintento", async () => {
    const { result } = await renderHook(() => useNetworkStatus());

    await act(async () => {
      result.current.setOffline(true);
    });
    expect(result.current.isOffline).toBe(true);

    await act(async () => {
      const isOnline = await result.current.retryConnection();
      expect(isOnline).toBe(true);
    });

    expect(result.current.isOffline).toBe(false);
  });

  it("expone una instancia accesible de OfflineCache para persistencia de datos", async () => {
    const { result } = await renderHook(() => useNetworkStatus());
    expect(result.current.cache).toBeDefined();
    expect(typeof result.current.cache.saveRecentPlace).toBe("function");
  });
});
