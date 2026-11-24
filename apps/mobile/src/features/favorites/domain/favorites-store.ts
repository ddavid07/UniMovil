import {
  createFavoritePlace,
  type FavoriteItem,
  type Place,
} from "@unimovil/contracts";

export class FavoritesStore {
  private favorites: Map<string, FavoriteItem> = new Map();

  constructor(initialItems: readonly FavoriteItem[] = []) {
    for (const item of initialItems) {
      this.favorites.set(item.targetId, item);
    }
  }

  isFavorite(targetId: string): boolean {
    return this.favorites.has(targetId);
  }

  getFavorites(): readonly FavoriteItem[] {
    return Array.from(this.favorites.values());
  }

  getFavoriteIds(): ReadonlySet<string> {
    return new Set(this.favorites.keys());
  }

  addFavorite(place: Place, customLabel?: string): FavoriteItem {
    const favorite = createFavoritePlace(
      place.id,
      place.name,
      place.category,
      customLabel,
    );
    this.favorites.set(place.id, favorite);
    return favorite;
  }

  removeFavorite(targetId: string): boolean {
    return this.favorites.delete(targetId);
  }

  toggleFavorite(place: Place, customLabel?: string): boolean {
    if (this.isFavorite(place.id)) {
      this.removeFavorite(place.id);
      return false;
    }
    this.addFavorite(place, customLabel);
    return true;
  }

  filterFavoritePlaces(places: readonly Place[]): readonly Place[] {
    const favoriteIds = this.getFavoriteIds();
    return places.filter((p) => favoriteIds.has(p.id));
  }

  clear(): void {
    this.favorites.clear();
  }
}

export const defaultFavoritesStore = new FavoritesStore();
