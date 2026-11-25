import catalog from './campus-places.json';
import { parsePlaces, type Place } from '../domain/places';

export interface PlacesRepository {
  list(): Promise<readonly Place[]>;
}

export const localPlacesRepository: PlacesRepository = {
  list: async () => parsePlaces(catalog),
};
