import type { ReactElement, ReactNode } from 'react';
import type { HeaderOptions, MapProps } from '@maplibre/maplibre-react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { CampusMap } from './CampusMap';
import type { Place } from '../domain/places';
import {
  CAMPUS_MAP_STYLE,
  OSM_TILE_HEADER_ID,
  OSM_TILE_URL_MATCH,
  OSM_TILE_USER_AGENT,
} from './map-style';

jest.mock('@maplibre/maplibre-react-native', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Camera: () => null,
    GeoJSONSource: ({ children }: { children?: ReactNode }) =>
      React.createElement(View, null, children),
    Layer: () => null,
    Map: jest.fn(({ children, testID }: { children?: ReactNode; testID?: string }) =>
      React.createElement(View, { testID }, children),
    ),
    Marker: ({ children, testID }: { children?: ReactNode; testID?: string }) =>
      React.createElement(View, { testID }, children),
    TransformRequestManager: {
      addHeader: jest.fn(),
      removeHeader: jest.fn(),
    },
  };
});

describe('campus map integration', () => {
  it('registers the OpenStreetMap User-Agent before mounting the native map', async () => {
    const screen = await render(
      <CampusMap onSelect={jest.fn()} places={[]} selectedId={null} />,
    );
    const mapLibre = jest.requireMock<typeof import('@maplibre/maplibre-react-native')>(
      '@maplibre/maplibre-react-native',
    );
    const map = mapLibre.Map as unknown as jest.MockedFunction<
      (props: MapProps) => ReactElement
    >;
    const addHeader = mapLibre.TransformRequestManager.addHeader as jest.MockedFunction<
      (options: HeaderOptions) => string
    >;

    await waitFor(() => expect(screen.getByTestId('campus-map')).toBeTruthy());

    expect(addHeader).toHaveBeenCalledWith({
      id: OSM_TILE_HEADER_ID,
      name: 'User-Agent',
      value: OSM_TILE_USER_AGENT,
      match: OSM_TILE_URL_MATCH,
    });
    const headerCallOrder = addHeader.mock.invocationCallOrder[0];
    const mapCallOrder = map.mock.invocationCallOrder[0];
    if (headerCallOrder === undefined || mapCallOrder === undefined) {
      throw new Error('Expected the OSM header and native map to be initialized.');
    }
    expect(headerCallOrder).toBeLessThan(mapCallOrder);
    expect(map.mock.calls[0]?.[0].mapStyle).toEqual(CAMPUS_MAP_STYLE);

    await screen.unmount();
    expect(mapLibre.TransformRequestManager.removeHeader).toHaveBeenCalledWith(
      OSM_TILE_HEADER_ID,
    );
  });

  it('shows the selected place name using a native map marker', async () => {
    const place: Place = {
      id: 'osm-way-1',
      name: 'Facultad de Medicina',
      category: 'building',
      coordinates: { longitude: -3.724, latitude: 40.444 },
      aliases: [],
      source: {
        url: 'https://www.openstreetmap.org/way/1',
        license: 'ODbL-1.0',
        checkedAt: '2026-11-23',
      },
    };
    const screen = await render(
      <CampusMap onSelect={jest.fn()} places={[place]} selectedId={place.id} />,
    );

    expect(screen.getByTestId('selected-place-marker')).toBeTruthy();
    expect(screen.getByText(place.name)).toBeTruthy();
  });

  it('shows category symbols and keeps the device position separate from place filters', async () => {
    const place: Place = {
      id: 'osm-way-2',
      name: 'Biblioteca de Medicina',
      category: 'service',
      coordinates: { longitude: -3.724, latitude: 40.444 },
      aliases: [],
      source: {
        url: 'https://www.openstreetmap.org/way/2',
        license: 'ODbL-1.0',
        checkedAt: '2026-11-23',
      },
    };
    const screen = await render(
      <CampusMap
        currentLocation={{ latitude: 40.445, longitude: -3.726 }}
        locationCenterRequest={1}
        onSelect={jest.fn()}
        places={[place]}
        selectedId={null}
      />,
    );

    expect(screen.getByTestId('map-place-osm-way-2')).toBeTruthy();
    expect(screen.getByTestId('current-location-marker')).toBeTruthy();
    expect(screen.getByText('S')).toBeTruthy();
    expect(screen.getByText('Tu ubicación')).toBeTruthy();
  });

  it('offers a reset action when category filters leave no places visible', async () => {
    const onResetFilters = jest.fn();
    const screen = await render(
      <CampusMap
        onResetFilters={onResetFilters}
        onSelect={jest.fn()}
        places={[]}
        selectedId={null}
        showEmptyState
      />,
    );

    expect(
      screen.getByText('No hay lugares visibles con estas categorías.'),
    ).toBeTruthy();
    await fireEvent.press(screen.getByText('Restablecer categorías'));
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });
});
