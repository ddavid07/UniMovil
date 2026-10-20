import { act, renderHook, waitFor } from "@testing-library/react-native";
import { PLACE_CATEGORIES, parsePlaces } from "@unimovil/contracts";
import { useCampus } from "./useCampus";
import catalog from "./data/catalog.json";

const places = parsePlaces(catalog);
describe("estado de exploración", () => {
  it("rechaza un catálogo vacío y recupera excepciones síncronas del repositorio", async () => {
    const list = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("Invalid configuration");
      })
      .mockResolvedValueOnce([]);
    const repository = { list };
    const { result } = await renderHook(() => useCampus(repository));
    await waitFor(() => expect(result.current.catalog.status).toBe("error"));
    await act(() => result.current.retry());
    await waitFor(() => expect(result.current.catalog.status).toBe("error"));
    expect(list).toHaveBeenCalledTimes(2);
  });
  it("carga, busca, filtra, selecciona y restablece sin resucitar selecciones", async () => {
    const { result } = await renderHook(() => useCampus());
    await waitFor(() => expect(result.current.catalog.status).toBe("ready"));
    await act(() => result.current.select(places[0]!.id));
    expect(result.current.selected?.id).toBe(places[0]!.id);
    await act(() => result.current.toggleCategory("building"));
    expect(result.current.visible).toHaveLength(20);
    expect(result.current.selected).toBeNull();
    await act(() => result.current.toggleCategory("building"));
    expect(result.current.selected).toBeNull();
    await act(() => result.current.setQuery("medicina"));
    expect(result.current.visible).toHaveLength(2);
    await act(() => result.current.select("invalid"));
    expect(result.current.selected).toBeNull();
    await act(() => result.current.reset());
    expect(result.current.visible).toHaveLength(24);
    for (const category of PLACE_CATEGORIES)
      await act(() => result.current.toggleCategory(category));
    expect(result.current.visible).toHaveLength(0);
    await act(() => result.current.setQuery("x".repeat(101)));
    expect(result.current.query).toHaveLength(100);
  });
  it("presenta errores y permite un nuevo intento", async () => {
    const list = jest
      .fn()
      .mockRejectedValueOnce(new Error("Unavailable"))
      .mockResolvedValue(places);
    const repository = { list };
    const { result } = await renderHook(() => useCampus(repository));
    await waitFor(() => expect(result.current.catalog.status).toBe("error"));
    await act(() => result.current.retry());
    await waitFor(() => expect(result.current.catalog.status).toBe("ready"));
    expect(list).toHaveBeenCalledTimes(2);
  });
  it.each([true, false])(
    "descarta respuestas después de desmontar (éxito=%s)",
    async (success) => {
      let resolve!: (value: ReturnType<typeof parsePlaces>) => void;
      let reject!: (error: Error) => void;
      const pending = new Promise<ReturnType<typeof parsePlaces>>(
        (ok, fail) => {
          resolve = ok;
          reject = fail;
        },
      );
      const repository = { list: () => pending };
      const { unmount } = await renderHook(() => useCampus(repository));
      await unmount();
      await act(async () => {
        if (success) resolve(places);
        else reject(new Error("Unavailable"));
        await Promise.resolve();
      });
    },
  );
});
