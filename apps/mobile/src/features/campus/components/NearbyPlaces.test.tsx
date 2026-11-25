import { fireEvent, render } from '@testing-library/react-native';
import catalog from '../data/campus-places.json';
import { parsePlaces } from '../domain/places';
import { NearbyPlaces } from './NearbyPlaces';

const places = parsePlaces(catalog);

describe('NearbyPlaces', () => {
  it('lets a user choose a place reference and open a nearby result as a route destination', async () => {
    const onRouteToPlace = jest.fn();
    const view = await render(
      <NearbyPlaces
        currentLocation={null}
        onRequestLocation={jest.fn()}
        onRouteToPlace={onRouteToPlace}
        onViewPlace={jest.fn()}
        places={places}
      />,
    );

    await fireEvent.press(view.getByText('Servicios y lugares cercanos'));
    await fireEvent.changeText(
      view.getByLabelText('Lugar de referencia para buscar cercanos'),
      'Biblioteca de Medicina',
    );
    await fireEvent.press(view.getByText('Biblioteca de Medicina'));
    expect(view.getByText('aprox. 0 m')).toBeTruthy();

    await fireEvent.press(
      view.getByLabelText('Crear una ruta a Biblioteca de Medicina'),
    );
    expect(onRouteToPlace).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Biblioteca de Medicina' }),
    );
  });
});
