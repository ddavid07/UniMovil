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

export function isValidFavorite(item: unknown): item is FavoriteItem {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<FavoriteItem>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.trim().length > 0 &&
    typeof candidate.targetId === "string" &&
    candidate.targetId.trim().length > 0 &&
    typeof candidate.type === "string" &&
    FAVORITE_TYPES.includes(candidate.type as FavoriteType) &&
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    typeof candidate.addedAt === "string" &&
    !Number.isNaN(Date.parse(candidate.addedAt))
  );
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
