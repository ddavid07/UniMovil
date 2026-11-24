import type { PlaceCategory, PlaceId } from "./places.js";

export const FAVORITE_TYPES = ["place", "stop", "route"] as const;
export type FavoriteType = (typeof FAVORITE_TYPES)[number];

export interface FavoriteItem {
  readonly id: string;
  readonly targetId: PlaceId;
  readonly type: FavoriteType;
  readonly name: string;
  readonly category?: PlaceCategory;
  readonly addedAt: string;
  readonly customLabel?: string;
}

function isNonEmptyString(val: unknown): val is string {
  return typeof val === "string" && val.trim().length > 0;
}

export function isValidFavorite(item: unknown): item is FavoriteItem {
  if (!item || typeof item !== "object") return false;
  const c = item as Partial<FavoriteItem>;
  const validStrings =
    isNonEmptyString(c.id) &&
    isNonEmptyString(c.targetId) &&
    isNonEmptyString(c.name);
  const validType =
    typeof c.type === "string" &&
    FAVORITE_TYPES.includes(c.type as FavoriteType);
  const validDate =
    typeof c.addedAt === "string" && !Number.isNaN(Date.parse(c.addedAt));
  return validStrings && validType && validDate;
}

export function createFavoritePlace(
  targetId: PlaceId,
  name: string,
  category?: PlaceCategory,
  customLabel?: string,
): FavoriteItem {
  return {
    id: `fav_${targetId}`,
    targetId,
    type: "place",
    name,
    ...(category ? { category } : {}),
    ...(customLabel ? { customLabel } : {}),
    addedAt: new Date().toISOString(),
  };
}
