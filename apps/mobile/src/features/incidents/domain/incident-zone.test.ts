import { isWithinIncidentZone } from './incident-zone';

describe('public incident zone filtering', () => {
  const center = { latitude: 40.4486, longitude: -3.7262 };

  it('includes incidents within the selected radius and excludes incidents outside it', () => {
    expect(isWithinIncidentZone(center, center, 500)).toBe(true);
    expect(
      isWithinIncidentZone({ latitude: 40.449, longitude: -3.7262 }, center, 100),
    ).toBe(true);
    expect(
      isWithinIncidentZone({ latitude: 40.46, longitude: -3.7262 }, center, 500),
    ).toBe(false);
  });

  it('rejects invalid radii', () => {
    expect(isWithinIncidentZone(center, center, -1)).toBe(false);
    expect(isWithinIncidentZone(center, center, Number.NaN)).toBe(false);
  });

  it('rejects invalid coordinates', () => {
    expect(
      isWithinIncidentZone({ latitude: Number.NaN, longitude: 0 }, center, 500),
    ).toBe(false);
    expect(isWithinIncidentZone({ latitude: 91, longitude: 0 }, center, 500)).toBe(
      false,
    );
  });
});
