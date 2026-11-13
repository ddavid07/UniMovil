import { parsePlaces, type Place } from "@unimovil/contracts";
import catalog from "./catalog.json";

export interface PlacesRepository {
  list(): Promise<readonly Place[]>;
}

export const localPlacesRepository: PlacesRepository = {
  list: () => Promise.resolve().then(() => parsePlaces(catalog)),
};
