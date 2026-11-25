import { fireEvent, render } from '@testing-library/react-native';
import catalog from '../data/campus-places.json';
import { parsePlaces } from '../domain/places';
import { PlaceResults } from './PlaceResults';

const places = parsePlaces(catalog);

describe('place results component', () => {
  it('provides a text alternative for places and selects the requested item', async () => {
    const onSelect = jest.fn();
    const { getByTestId } = await render(
      <PlaceResults
        onClear={jest.fn()}
        onSelect={onSelect}
        places={places.slice(0, 1)}
        query=""
        selectedId={null}
      />,
    );

    await fireEvent.press(getByTestId('place-result-osm-node-1212072743'));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Vicente Aleixandre' }),
    );
  });

  it('offers a clear action when a query has no matches', async () => {
    const onClear = jest.fn();
    const { getByRole, getByText } = await render(
      <PlaceResults
        onClear={onClear}
        onSelect={jest.fn()}
        places={[]}
        query="Lugar inexistente"
        selectedId={null}
      />,
    );

    await fireEvent.press(getByRole('button', { name: 'Borrar búsqueda' }));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(getByText('Cambia la búsqueda para encontrar otro lugar.')).toBeTruthy();
  });
});
