import catalog from '../data/campus-places.json';
import { createSearchIndex, parsePlaces, searchPlaces, type Place } from './places';

const places = parsePlaces(catalog);
const index = createSearchIndex(places);

describe('campus place catalog', () => {
  it('contains twenty places with valid coordinates and traceable sources', () => {
    expect(places).toHaveLength(20);

    for (const place of places) {
      expect(place.coordinates.latitude).toBeGreaterThanOrEqual(-90);
      expect(place.coordinates.latitude).toBeLessThanOrEqual(90);
      expect(place.coordinates.longitude).toBeGreaterThanOrEqual(-180);
      expect(place.coordinates.longitude).toBeLessThanOrEqual(180);
      expect(place.source.license).toBe('ODbL-1.0');
      expect(place.source.url).toMatch(/^https:\/\/www\.openstreetmap\.org\//u);
    }
  });

  it('rejects malformed and duplicate records', () => {
    const validPlace = places[0];
    expect(validPlace).toBeDefined();

    expect(() => parsePlaces([validPlace, validPlace])).toThrow(/inválidos/u);
    expect(() => parsePlaces([{ id: 'missing-coordinates' }])).toThrow(/completo/u);
  });
});

describe('place search', () => {
  it('matches names without accents and ignores extra whitespace or letter case', () => {
    const results = searchPlaces(index, '  FACULTAD   DE FARMACIA ');

    expect(results.map((place) => place.name)).toEqual(['Facultad de Farmacia']);
  });

  it('matches category names and aliases from the source data', () => {
    expect(searchPlaces(index, 'bibliotecas')).toHaveLength(4);
    expect(searchPlaces(index, '1690').map((place) => place.name)).toEqual([
      'Avenida Complutense-Ciencias Información',
    ]);
  });

  it('requires two characters and returns a stable, ranked list', () => {
    expect(searchPlaces(index, ' f ')).toEqual([]);

    const results = searchPlaces(index, 'medicina');
    expect(results.map((place) => place.name)).toEqual([
      'Biblioteca de Medicina',
      'Facultad de Medicina',
    ]);
  });

  it('does not mutate the original catalog', () => {
    const snapshot = JSON.stringify(places satisfies readonly Place[]);

    searchPlaces(index, 'campus');

    expect(JSON.stringify(places)).toBe(snapshot);
  });
});
