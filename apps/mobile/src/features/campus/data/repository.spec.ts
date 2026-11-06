import { expect, it } from "vitest";
import { localPlacesRepository } from "./repository";
it("entrega un catálogo local validado, inmutable y sin red", async () => {
  const places = await localPlacesRepository.list();
  expect(places).toHaveLength(24);
  expect(Object.isFrozen(places)).toBe(true);
  expect(new Set(places.map((place) => place.category)).size).toBe(6);
});
