import { beforeEach, describe, expect, it } from "vitest";
import { FavoritesStore } from "./favorites-store";
import type { Place } from "@unimovil/contracts";

const MOCK_PLACE_1: Place = {
  id: "fdi",
  name: "Facultad de Informática",
  category: "building",
  coordinates: { latitude: 40.452, longitude: -3.733 },
  aliases: ["FDI"],
  accessibility: "yes",
  source: {
    url: "https://osm.org",
    checkedAt: "2026-11-24",
    license: "ODbL-1.0",
  },
};

const MOCK_PLACE_2: Place = {
  id: "matematicas",
  name: "Facultad de Matemáticas",
  category: "building",
  coordinates: { latitude: 40.449, longitude: -3.726 },
  aliases: ["Mates"],
  accessibility: "yes",
  source: {
    url: "https://osm.org",
    checkedAt: "2026-11-24",
    license: "ODbL-1.0",
  },
};

describe("FavoritesStore Domain Logic (HU-060)", () => {
  let store: FavoritesStore;

  beforeEach(() => {
    store = new FavoritesStore();
  });

  it("starts empty by default", () => {
    expect(store.getFavorites()).toHaveLength(0);
    expect(store.isFavorite("fdi")).toBe(false);
  });

  it("adds a place to favorites", () => {
    const item = store.addFavorite(MOCK_PLACE_1);
    expect(store.isFavorite("fdi")).toBe(true);
    expect(item.name).toBe("Facultad de Informática");
    expect(store.getFavorites()).toHaveLength(1);
  });

  it("removes a place from favorites", () => {
    store.addFavorite(MOCK_PLACE_1);
    expect(store.isFavorite("fdi")).toBe(true);

    const removed = store.removeFavorite("fdi");
    expect(removed).toBe(true);
    expect(store.isFavorite("fdi")).toBe(false);
    expect(store.getFavorites()).toHaveLength(0);
  });

  it("toggles favorite state correctly", () => {
    // 1st toggle: adds
    const added = store.toggleFavorite(MOCK_PLACE_1);
    expect(added).toBe(true);
    expect(store.isFavorite("fdi")).toBe(true);

    // 2nd toggle: removes
    const removedState = store.toggleFavorite(MOCK_PLACE_1);
    expect(removedState).toBe(false);
    expect(store.isFavorite("fdi")).toBe(false);
  });

  it("filters a list of places returning only marked favorites", () => {
    store.addFavorite(MOCK_PLACE_1);
    const all = [MOCK_PLACE_1, MOCK_PLACE_2];

    const filtered = store.filterFavoritePlaces(all);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("fdi");
  });

  it("clears all stored favorites", () => {
    store.addFavorite(MOCK_PLACE_1);
    store.addFavorite(MOCK_PLACE_2);
    expect(store.getFavorites()).toHaveLength(2);

    store.clear();
    expect(store.getFavorites()).toHaveLength(0);
  });
});
