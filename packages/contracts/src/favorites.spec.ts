import { describe, expect, it } from "vitest";
import {
  createFavoritePlace,
  FAVORITE_TYPES,
  isValidFavorite,
  type FavoriteItem,
} from "./favorites.js";

describe("Favorites Contracts (HU-060)", () => {
  it("defines standard favorite types", () => {
    expect(FAVORITE_TYPES).toContain("place");
    expect(FAVORITE_TYPES).toContain("stop");
    expect(FAVORITE_TYPES).toContain("route");
  });

  it("creates a valid favorite place item", () => {
    const fav = createFavoritePlace("place_fdi", "Facultad de Informática", "building");
    expect(fav.id).toBe("fav_place_fdi");
    expect(fav.targetId).toBe("place_fdi");
    expect(fav.name).toBe("Facultad de Informática");
    expect(fav.category).toBe("building");
    expect(fav.type).toBe("place");
    expect(isValidFavorite(fav)).toBe(true);
  });

  it("creates a favorite with custom label", () => {
    const fav = createFavoritePlace("place_fdi", "Facultad de Informática", "building", "Mi facultad");
    expect(fav.customLabel).toBe("Mi facultad");
    expect(isValidFavorite(fav)).toBe(true);
  });

  it("validates well-formed favorite items", () => {
    const item: FavoriteItem = {
      id: "fav_123",
      targetId: "node_456",
      type: "stop",
      name: "Parada Paraninfo",
      addedAt: "2026-11-24T10:00:00.000Z",
    };
    expect(isValidFavorite(item)).toBe(true);
  });

  it("rejects invalid or corrupted favorite objects", () => {
    expect(isValidFavorite(null)).toBe(false);
    expect(isValidFavorite(undefined)).toBe(false);
    expect(isValidFavorite({})).toBe(false);
    expect(isValidFavorite({ id: "", targetId: "1", type: "place", name: "FDI", addedAt: "now" })).toBe(false);
    expect(isValidFavorite({ id: "1", targetId: "", type: "place", name: "FDI", addedAt: "2026-01-01" })).toBe(false);
    expect(isValidFavorite({ id: "1", targetId: "2", type: "unknown", name: "FDI", addedAt: "2026-01-01" })).toBe(false);
    expect(isValidFavorite({ id: "1", targetId: "2", type: "place", name: "", addedAt: "2026-01-01" })).toBe(false);
    expect(isValidFavorite({ id: "1", targetId: "2", type: "place", name: "FDI", addedAt: "not-a-date" })).toBe(false);
  });
});
