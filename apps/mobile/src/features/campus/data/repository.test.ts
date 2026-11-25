import { localPlacesRepository } from './repository';

describe('local places repository', () => {
  it('returns the validated campus catalog', async () => {
    const places = await localPlacesRepository.list();

    expect(places).toHaveLength(20);
    expect(places.every((place) => place.source.checkedAt === '2026-11-23')).toBe(true);
  });
});
