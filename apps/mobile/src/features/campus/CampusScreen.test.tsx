import { Alert } from 'react-native';
import type { ReactNode } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import catalog from './data/campus-places.json';
import { parsePlaces, PLACE_CATEGORIES, type Place } from './domain/places';
import type { PlacesRepository } from './data/repository';
import type { LocationGateway } from './domain/location';
import { CAMPUS_TRANSIT, type TransitLine, type TransitStop } from './domain/transit';

jest.mock('expo-router', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Link: ({ children }: { children: ReactNode }) =>
      createElement(Text, null, children),
    router: { push: jest.fn(), replace: jest.fn() },
  };
});

jest.mock('../account/api-config', () => ({
  API_BASE_URL: 'http://localhost:3001/api',
}));

jest.mock('./data/expo-location-gateway', () => ({
  expoLocationGateway: {
    getForegroundPermission: jest.fn(),
    requestForegroundPermission: jest.fn(),
    areLocationServicesEnabled: jest.fn(),
    getCurrentPosition: jest.fn(),
    openSettings: jest.fn(),
  },
}));

jest.mock('./map/CampusMap', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text, View } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    CampusMap: ({
      onSelect,
      places,
      selectedId,
      currentLocation,
      selectedTransitLine,
      transitStops,
      onSelectTransitStop,
    }: {
      onSelect: (placeId: string) => void;
      places: readonly Place[];
      selectedId: string | null;
      currentLocation?: { latitude: number; longitude: number } | null;
      selectedTransitLine?: TransitLine | null;
      transitStops?: readonly TransitStop[];
      onSelectTransitStop?: (stop: TransitStop) => void;
    }) =>
      createElement(
        View,
        {
          testID: 'mock-campus-map',
        },
        createElement(Text, { testID: 'selected-map-marker' }, selectedId ?? ''),
        createElement(
          Text,
          { testID: 'selected-transit-line' },
          selectedTransitLine?.id ?? '',
        ),
        createElement(
          Text,
          { testID: 'current-location-marker' },
          currentLocation
            ? `${currentLocation.latitude},${currentLocation.longitude}`
            : '',
        ),
        ...places.map((place) =>
          createElement(
            Pressable,
            {
              accessibilityRole: 'button',
              key: place.id,
              onPress: () => onSelect(place.id),
              testID: `mock-map-place-${place.id}`,
            },
            createElement(Text, null, place.name),
          ),
        ),
        ...(transitStops ?? []).map((stop) =>
          createElement(
            Pressable,
            {
              accessibilityRole: 'button',
              key: stop.id,
              onPress: () => onSelectTransitStop?.(stop),
              testID: `mock-transit-stop-${stop.id}`,
            },
            createElement(Text, null, stop.name),
          ),
        ),
      ),
  };
});

import { CampusScreen } from './CampusScreen';

const places = parsePlaces(catalog);

function createLocationGateway(
  overrides: Partial<LocationGateway> = {},
): LocationGateway {
  return {
    getForegroundPermission: jest
      .fn<ReturnType<LocationGateway['getForegroundPermission']>, []>()
      .mockResolvedValue({ granted: true, canAskAgain: true }),
    requestForegroundPermission: jest
      .fn<ReturnType<LocationGateway['requestForegroundPermission']>, []>()
      .mockResolvedValue({ granted: true, canAskAgain: true }),
    areLocationServicesEnabled: jest.fn().mockResolvedValue(true),
    getCurrentPosition: jest
      .fn<ReturnType<LocationGateway['getCurrentPosition']>, []>()
      .mockResolvedValue({ latitude: 40.445, longitude: -3.726 }),
    openSettings: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function confirmLocationDisclosure(): jest.SpyInstance {
  return jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
    buttons?.find((button) => button.text === 'Continuar')?.onPress?.();
  });
}

describe('campus screen', () => {
  beforeEach(() => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() => new Promise<Response>(() => undefined));
  });

  it('keeps the selected bus line when choosing one of its shared stops', async () => {
    const repository: PlacesRepository = { list: async () => places };
    const screen = await render(<CampusScreen repository={repository} />);
    const line = CAMPUS_TRANSIT.lines.find(
      (candidate) => candidate.reference === '44',
    )!;
    const stop = CAMPUS_TRANSIT.stops.find((candidate) =>
      line.stopIds.includes(candidate.id),
    )!;

    await fireEvent.press(screen.getByText('Autobuses y paradas'));
    await fireEvent.press(screen.getByLabelText('44: Callao'));
    await fireEvent.press(screen.getByTestId(`mock-transit-stop-${stop.id}`));

    expect(screen.getByTestId('selected-transit-line').props.children).toBe(line.id);
    expect(screen.getByTestId('selected-map-marker').props.children).toBe(
      `emt-stop-${stop.id}`,
    );
  });

  it('connects search selection to the result list and map marker', async () => {
    const repository: PlacesRepository = { list: async () => places };
    const screen = await render(<CampusScreen repository={repository} />);

    await fireEvent.press(screen.getByTestId('toggle-map-list'));
    expect(
      screen.getByText('Consulta los lugares también en esta lista.'),
    ).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('place-search-input'), 'farm');
    await fireEvent.press(screen.getByTestId('suggestion-osm-way-15431483'));

    expect(screen.getByTestId('selected-map-marker').props.children).toBe(
      'osm-way-15431483',
    );
    expect(screen.getByTestId('place-search-input').props.value).toBe(
      'Facultad de Farmacia',
    );

    await fireEvent.press(screen.getByTestId('toggle-map-list'));
    expect(
      screen.getByTestId('place-result-osm-way-15431483').props.accessibilityState,
    ).toEqual({ selected: true });
  });

  it('retries loading the local place catalog after an error', async () => {
    const repository: PlacesRepository = {
      list: jest
        .fn<
          ReturnType<PlacesRepository['list']>,
          Parameters<PlacesRepository['list']>
        >()
        .mockRejectedValueOnce(new Error('Catalog unavailable'))
        .mockResolvedValue(places),
    };
    const screen = await render(<CampusScreen repository={repository} />);

    await waitFor(() =>
      expect(
        screen.getByText('No se pudo cargar el catálogo de lugares.'),
      ).toBeTruthy(),
    );
    await fireEvent.press(screen.getByText('Reintentar catálogo'));
    await waitFor(() => expect(screen.getByTestId('place-search-input')).toBeTruthy());

    expect(repository.list).toHaveBeenCalledTimes(2);
  });

  it('filters the map and list by category and restores all categories', async () => {
    const repository: PlacesRepository = { list: async () => places };
    const screen = await render(<CampusScreen repository={repository} />);
    const transportPlace = places.find((place) => place.category === 'transport');

    expect(transportPlace).toBeDefined();
    if (!transportPlace) throw new Error('Expected at least one transport place.');
    expect(screen.getByTestId(`mock-map-place-${transportPlace.id}`)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('category-filter-transport'));
    expect(
      screen.getByTestId('category-filter-transport').props.accessibilityState,
    ).toEqual({ checked: false });
    expect(screen.queryByTestId(`mock-map-place-${transportPlace.id}`)).toBeNull();

    await fireEvent.press(screen.getByTestId('toggle-map-list'));
    expect(screen.queryByTestId(`place-result-${transportPlace.id}`)).toBeNull();

    await fireEvent.press(screen.getByTestId('reset-category-filters'));
    expect(
      screen.getByTestId('category-filter-transport').props.accessibilityState,
    ).toEqual({ checked: true });
    expect(screen.getByTestId(`place-result-${transportPlace.id}`)).toBeTruthy();
    expect(PLACE_CATEGORIES).toHaveLength(6);
  });

  it('reactivates a hidden category when selecting one of its search results', async () => {
    const repository: PlacesRepository = { list: async () => places };
    const screen = await render(<CampusScreen repository={repository} />);
    const hiddenPlace = places.find((place) => place.category === 'service');

    expect(hiddenPlace).toBeDefined();
    if (!hiddenPlace) throw new Error('Expected at least one service place.');

    await fireEvent.press(screen.getByTestId('category-filter-service'));
    expect(screen.queryByTestId(`mock-map-place-${hiddenPlace.id}`)).toBeNull();

    await fireEvent.changeText(
      screen.getByTestId('place-search-input'),
      hiddenPlace.name,
    );
    await fireEvent.press(screen.getByTestId(`suggestion-${hiddenPlace.id}`));

    expect(
      screen.getByTestId('category-filter-service').props.accessibilityState,
    ).toEqual({ checked: true });
    expect(screen.getByTestId('selected-map-marker').props.children).toBe(
      hiddenPlace.id,
    );
    expect(screen.getByTestId('category-announcement').props.children).toContain(
      'Se ha activado la categoría Servicios',
    );
  });

  it('shows an empty list state and restores the catalog when every category is off', async () => {
    const repository: PlacesRepository = { list: async () => places };
    const screen = await render(<CampusScreen repository={repository} />);

    for (const category of PLACE_CATEGORIES) {
      await fireEvent.press(screen.getByTestId(`category-filter-${category}`));
    }

    await fireEvent.press(screen.getByTestId('toggle-map-list'));
    expect(screen.getByText('No hay lugares en las categorías activas.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Restablecer categorías'));
    expect(screen.getByTestId('place-result-osm-node-1212072743')).toBeTruthy();
  });

  it('explains location use before requesting a one-time position', async () => {
    const repository: PlacesRepository = { list: async () => places };
    const locationGateway = createLocationGateway();
    const alert = confirmLocationDisclosure();
    const screen = await render(
      <CampusScreen locationGateway={locationGateway} repository={repository} />,
    );

    expect(locationGateway.getForegroundPermission).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId('show-current-location'));

    expect(alert).toHaveBeenCalledWith(
      'Usar tu ubicación',
      expect.stringContaining(
        'el proveedor cartográfico recibe las teselas del área visible',
      ),
      expect.any(Array),
      { cancelable: true },
    );
    await waitFor(() =>
      expect(screen.getByTestId('current-location-marker').props.children).toBe(
        '40.445,-3.726',
      ),
    );
    expect(locationGateway.requestForegroundPermission).not.toHaveBeenCalled();
    expect(locationGateway.getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText('Se muestra tu ubicación aproximada en el mapa.'),
    ).toBeTruthy();
  });

  it('does not request a system permission when the location explanation is dismissed', async () => {
    const repository: PlacesRepository = { list: async () => places };
    const locationGateway = createLocationGateway();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const screen = await render(
      <CampusScreen locationGateway={locationGateway} repository={repository} />,
    );

    await fireEvent.press(screen.getByTestId('show-current-location'));

    expect(locationGateway.getForegroundPermission).not.toHaveBeenCalled();
    expect(locationGateway.requestForegroundPermission).not.toHaveBeenCalled();
  });

  it('keeps the map usable after a permission denial and offers a retry', async () => {
    const repository: PlacesRepository = { list: async () => places };
    const locationGateway = createLocationGateway({
      getForegroundPermission: jest
        .fn<ReturnType<LocationGateway['getForegroundPermission']>, []>()
        .mockResolvedValue({ granted: false, canAskAgain: true }),
      requestForegroundPermission: jest
        .fn<ReturnType<LocationGateway['requestForegroundPermission']>, []>()
        .mockResolvedValue({ granted: false, canAskAgain: true }),
    });
    confirmLocationDisclosure();
    const screen = await render(
      <CampusScreen locationGateway={locationGateway} repository={repository} />,
    );

    await fireEvent.press(screen.getByTestId('show-current-location'));
    await waitFor(() =>
      expect(
        screen.getByText(
          'No se concedió el permiso. Puedes seguir usando el mapa manualmente.',
        ),
      ).toBeTruthy(),
    );
    expect(screen.getByTestId('mock-campus-map')).toBeTruthy();
    expect(screen.getByTestId('retry-location')).toBeTruthy();
  });

  it('offers system settings when foreground permission cannot be requested again', async () => {
    const repository: PlacesRepository = { list: async () => places };
    const locationGateway = createLocationGateway({
      getForegroundPermission: jest
        .fn<ReturnType<LocationGateway['getForegroundPermission']>, []>()
        .mockResolvedValue({ granted: false, canAskAgain: false }),
    });
    confirmLocationDisclosure();
    const screen = await render(
      <CampusScreen locationGateway={locationGateway} repository={repository} />,
    );

    await fireEvent.press(screen.getByTestId('show-current-location'));
    await waitFor(() =>
      expect(screen.getByTestId('retry-location').props.children).toBeTruthy(),
    );
    expect(screen.getByText('Abrir Ajustes')).toBeTruthy();
    expect(locationGateway.requestForegroundPermission).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('retry-location'));
    await waitFor(() => expect(locationGateway.openSettings).toHaveBeenCalledTimes(1));
  });
});
