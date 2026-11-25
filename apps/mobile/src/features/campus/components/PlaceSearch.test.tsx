import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import catalog from '../data/campus-places.json';
import { parsePlaces } from '../domain/places';
import { PlaceSearch } from './PlaceSearch';

const places = parsePlaces(catalog);

function StatefulPlaceSearch({
  initialQuery = '',
  onClear,
  onQueryChange,
  onSelect,
}: {
  initialQuery?: string;
  onClear: () => void;
  onQueryChange: (query: string) => void;
  onSelect: (place: (typeof places)[number]) => void;
}) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <PlaceSearch
      onClear={() => {
        setQuery('');
        onClear();
      }}
      onQueryChange={(value) => {
        setQuery(value);
        onQueryChange(value);
      }}
      onSelect={onSelect}
      places={places}
      query={query}
    />
  );
}

describe('place search component', () => {
  it('shows suggestions while typing and selects a place', async () => {
    const onSelect = jest.fn();
    const { getByTestId } = await render(
      <StatefulPlaceSearch
        onClear={jest.fn()}
        onQueryChange={jest.fn()}
        onSelect={onSelect}
      />,
    );

    await fireEvent.changeText(getByTestId('place-search-input'), 'farm');
    await fireEvent.press(getByTestId('suggestion-osm-way-15431483'));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Facultad de Farmacia' }),
    );
  });

  it('asks for two characters before searching', async () => {
    const onQueryChange = jest.fn();
    const { getByText, getByTestId } = await render(
      <StatefulPlaceSearch
        initialQuery="f"
        onClear={jest.fn()}
        onQueryChange={onQueryChange}
        onSelect={jest.fn()}
      />,
    );

    await fireEvent.changeText(getByTestId('place-search-input'), 'f');
    expect(getByText('Escribe al menos dos caracteres.')).toBeTruthy();
    await fireEvent.changeText(getByTestId('place-search-input'), 'fa');
    expect(onQueryChange).toHaveBeenCalledWith('fa');
  });

  it('exposes a clear action when the query is not empty', async () => {
    const onClear = jest.fn();
    const { getByLabelText, getByTestId, queryByText } = await render(
      <StatefulPlaceSearch
        initialQuery="zz"
        onClear={onClear}
        onQueryChange={jest.fn()}
        onSelect={jest.fn()}
      />,
    );

    await fireEvent.changeText(getByTestId('place-search-input'), 'zz');
    await fireEvent.press(getByLabelText('Borrar búsqueda'));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(queryByText('No encontramos ese lugar')).toBeNull();
  });
});
