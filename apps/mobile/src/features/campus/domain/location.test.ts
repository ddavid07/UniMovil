import { requestCurrentLocation, type LocationGateway } from './location';
import type { PlaceCoordinates } from './places';

function createGateway(overrides: Partial<LocationGateway> = {}): LocationGateway {
  return {
    getForegroundPermission: jest
      .fn<
        ReturnType<LocationGateway['getForegroundPermission']>,
        Parameters<LocationGateway['getForegroundPermission']>
      >()
      .mockResolvedValue({ granted: true, canAskAgain: true }),
    requestForegroundPermission: jest
      .fn<
        ReturnType<LocationGateway['requestForegroundPermission']>,
        Parameters<LocationGateway['requestForegroundPermission']>
      >()
      .mockResolvedValue({ granted: true, canAskAgain: true }),
    areLocationServicesEnabled: jest.fn().mockResolvedValue(true),
    getCurrentPosition: jest
      .fn<
        ReturnType<LocationGateway['getCurrentPosition']>,
        Parameters<LocationGateway['getCurrentPosition']>
      >()
      .mockResolvedValue({ latitude: 40.445, longitude: -3.726 }),
    openSettings: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('one-time foreground location', () => {
  it('requests permission only through the explicit location flow and returns one position', async () => {
    const gateway = createGateway({
      getForegroundPermission: jest
        .fn<
          ReturnType<LocationGateway['getForegroundPermission']>,
          Parameters<LocationGateway['getForegroundPermission']>
        >()
        .mockResolvedValue({ granted: false, canAskAgain: true }),
    });

    await expect(requestCurrentLocation(gateway)).resolves.toEqual({
      status: 'located',
      coordinates: { latitude: 40.445, longitude: -3.726 },
    });
    expect(gateway.requestForegroundPermission).toHaveBeenCalledTimes(1);
    expect(gateway.areLocationServicesEnabled).toHaveBeenCalledTimes(1);
    expect(gateway.getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('does not request permission again when it cannot be asked for', async () => {
    const gateway = createGateway({
      getForegroundPermission: jest
        .fn<
          ReturnType<LocationGateway['getForegroundPermission']>,
          Parameters<LocationGateway['getForegroundPermission']>
        >()
        .mockResolvedValue({ granted: false, canAskAgain: false }),
    });

    await expect(requestCurrentLocation(gateway)).resolves.toEqual({
      status: 'permission-denied',
      canAskAgain: false,
    });
    expect(gateway.requestForegroundPermission).not.toHaveBeenCalled();
    expect(gateway.getCurrentPosition).not.toHaveBeenCalled();
  });

  it('preserves a repeatable permission denial', async () => {
    const gateway = createGateway({
      getForegroundPermission: jest
        .fn<
          ReturnType<LocationGateway['getForegroundPermission']>,
          Parameters<LocationGateway['getForegroundPermission']>
        >()
        .mockResolvedValue({ granted: false, canAskAgain: true }),
      requestForegroundPermission: jest
        .fn<
          ReturnType<LocationGateway['requestForegroundPermission']>,
          Parameters<LocationGateway['requestForegroundPermission']>
        >()
        .mockResolvedValue({ granted: false, canAskAgain: true }),
    });

    await expect(requestCurrentLocation(gateway)).resolves.toEqual({
      status: 'permission-denied',
      canAskAgain: true,
    });
    expect(gateway.getCurrentPosition).not.toHaveBeenCalled();
  });

  it('handles disabled location services and unavailable positions', async () => {
    const disabledGateway = createGateway({
      areLocationServicesEnabled: jest.fn().mockResolvedValue(false),
    });
    const unavailableGateway = createGateway({
      getCurrentPosition: jest
        .fn<
          ReturnType<LocationGateway['getCurrentPosition']>,
          Parameters<LocationGateway['getCurrentPosition']>
        >()
        .mockResolvedValue(null),
    });

    await expect(requestCurrentLocation(disabledGateway)).resolves.toEqual({
      status: 'services-disabled',
    });
    expect(disabledGateway.getForegroundPermission).not.toHaveBeenCalled();
    expect(disabledGateway.requestForegroundPermission).not.toHaveBeenCalled();
    expect(disabledGateway.getCurrentPosition).not.toHaveBeenCalled();

    await expect(requestCurrentLocation(unavailableGateway)).resolves.toEqual({
      status: 'unavailable',
    });
  });

  it('returns an unavailable result if the one-shot reading does not finish', async () => {
    jest.useFakeTimers();
    const pendingPosition = new Promise<PlaceCoordinates>(() => undefined);
    const gateway = createGateway({
      getCurrentPosition: jest.fn(() => pendingPosition),
    });
    const resultPromise = requestCurrentLocation(gateway);

    await jest.advanceTimersByTimeAsync(15_000);

    await expect(resultPromise).resolves.toEqual({ status: 'unavailable' });
    jest.useRealTimers();
  });

  it('rejects invalid coordinates and returns a recoverable error when the provider fails', async () => {
    const invalidGateway = createGateway({
      getCurrentPosition: jest
        .fn<
          ReturnType<LocationGateway['getCurrentPosition']>,
          Parameters<LocationGateway['getCurrentPosition']>
        >()
        .mockResolvedValue({ latitude: 90.1, longitude: -3.7 }),
    });
    const failedGateway = createGateway({
      getCurrentPosition: jest
        .fn<
          ReturnType<LocationGateway['getCurrentPosition']>,
          Parameters<LocationGateway['getCurrentPosition']>
        >()
        .mockRejectedValue(new Error('Location unavailable')),
    });

    await expect(requestCurrentLocation(invalidGateway)).resolves.toEqual({
      status: 'unavailable',
    });
    await expect(requestCurrentLocation(failedGateway)).resolves.toEqual({
      status: 'error',
    });
  });
});
