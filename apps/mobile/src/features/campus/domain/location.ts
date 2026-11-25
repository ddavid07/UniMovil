import type { PlaceCoordinates } from './places';

const LOCATION_READ_TIMEOUT_MS = 15_000;

export interface LocationPermission {
  granted: boolean;
  canAskAgain: boolean;
}

export interface LocationGateway {
  getForegroundPermission(): Promise<LocationPermission>;
  requestForegroundPermission(): Promise<LocationPermission>;
  areLocationServicesEnabled(): Promise<boolean>;
  getCurrentPosition(): Promise<PlaceCoordinates | null>;
  openSettings(): Promise<void>;
}

export type LocationResult =
  | { status: 'located'; coordinates: PlaceCoordinates }
  | { status: 'permission-denied'; canAskAgain: boolean }
  | { status: 'services-disabled' }
  | { status: 'unavailable' }
  | { status: 'error' };

function isValidCoordinates(
  coordinates: PlaceCoordinates | null,
): coordinates is PlaceCoordinates {
  return (
    coordinates !== null &&
    Number.isFinite(coordinates.latitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

function getPositionOrTimeout(
  gateway: LocationGateway,
): Promise<PlaceCoordinates | null | undefined> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => resolve(undefined), LOCATION_READ_TIMEOUT_MS);

    void gateway.getCurrentPosition().then(
      (coordinates) => {
        clearTimeout(timeout);
        resolve(coordinates);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

export async function requestCurrentLocation(
  gateway: LocationGateway,
): Promise<LocationResult> {
  try {
    if (!(await gateway.areLocationServicesEnabled())) {
      return { status: 'services-disabled' };
    }

    let permission = await gateway.getForegroundPermission();

    if (!permission.granted) {
      if (!permission.canAskAgain) {
        return { status: 'permission-denied', canAskAgain: false };
      }

      permission = await gateway.requestForegroundPermission();

      if (!permission.granted) {
        return {
          status: 'permission-denied',
          canAskAgain: permission.canAskAgain,
        };
      }
    }

    const coordinates = await getPositionOrTimeout(gateway);

    if (coordinates === undefined || !isValidCoordinates(coordinates)) {
      return { status: 'unavailable' };
    }

    return { status: 'located', coordinates };
  } catch {
    return { status: 'error' };
  }
}
