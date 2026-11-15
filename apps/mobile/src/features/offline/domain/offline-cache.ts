import type { Place, RouteResponse } from "@unimovil/contracts";

export interface CachedRouteItem {
  readonly originId: string;
  readonly destinationId: string;
  readonly accessibleOnly: boolean;
  readonly route: RouteResponse;
  readonly cachedAt: number;
}

export class OfflineCache {
  private places: Place[] = [];
  private routes: CachedRouteItem[] = [];
  private readonly maxCapacity: number;

  constructor(maxCapacity = 10) {
    this.maxCapacity = Math.max(1, maxCapacity);
  }

  getRecentPlaces(): readonly Place[] {
    return [...this.places];
  }

  getRecentRoutes(): readonly CachedRouteItem[] {
    return [...this.routes];
  }

  saveRecentPlace(place: Place): void {
    // Eliminar si ya existe para reubicarlo al inicio (LRU)
    this.places = this.places.filter((p) => p.id !== place.id);
    this.places.unshift(place);
    if (this.places.length > this.maxCapacity) {
      this.places.pop();
    }
  }

  saveRecentRoute(
    originId: string,
    destinationId: string,
    accessibleOnly: boolean,
    route: RouteResponse,
  ): void {
    const keyMatch = (item: CachedRouteItem) =>
      item.originId === originId &&
      item.destinationId === destinationId &&
      item.accessibleOnly === accessibleOnly;

    this.routes = this.routes.filter((r) => !keyMatch(r));
    this.routes.unshift({
      originId,
      destinationId,
      accessibleOnly,
      route,
      cachedAt: Date.now(),
    });

    if (this.routes.length > this.maxCapacity) {
      this.routes.pop();
    }
  }

  findCachedRoute(
    originId: string,
    destinationId: string,
    accessibleOnly: boolean,
  ): RouteResponse | null {
    const match = this.routes.find(
      (r) =>
        r.originId === originId &&
        r.destinationId === destinationId &&
        r.accessibleOnly === accessibleOnly,
    );
    return match ? match.route : null;
  }

  clear(): void {
    this.places = [];
    this.routes = [];
  }

  toJSON(): string {
    return JSON.stringify({
      places: this.places,
      routes: this.routes,
    });
  }

  static fromJSON(rawJson: string): OfflineCache {
    const instance = new OfflineCache();
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.places)) {
          instance.places = parsed.places;
        }
        if (Array.isArray(parsed.routes)) {
          instance.routes = parsed.routes;
        }
      }
    } catch {
      // Retorna instancia vacía en caso de fallo de deserialización
    }
    return instance;
  }
}
