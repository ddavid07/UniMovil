export const PLACE_CATEGORIES = [
  "building",
  "transport",
  "parking",
  "bicycle",
  "service",
  "entrance",
] as const;

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];
export type PlaceId = string;
export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}
export interface Place {
  readonly id: PlaceId;
  readonly name: string;
  readonly category: PlaceCategory;
  readonly coordinates: Coordinates;
  readonly aliases: readonly string[];
  readonly description?: string;
  readonly accessibility: "unknown" | "yes" | "no" | "limited";
  readonly source: {
    readonly url: string;
    readonly checkedAt: string;
    readonly license: "ODbL-1.0";
  };
}
