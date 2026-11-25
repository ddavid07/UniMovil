import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { MapAttribution } from './MapAttribution';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('map attribution', () => {
  it('opens the OpenStreetMap copyright page from an accessible link', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const screen = await render(<MapAttribution />);

    await fireEvent.press(
      screen.getByRole('link', { name: 'Créditos y licencia de OpenStreetMap' }),
    );

    expect(openURL).toHaveBeenCalledWith('https://www.openstreetmap.org/copyright');
  });

  it('announces when the attribution link cannot be opened', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('Unavailable'));
    const screen = await render(<MapAttribution />);

    await fireEvent.press(
      screen.getByRole('link', { name: 'Créditos y licencia de OpenStreetMap' }),
    );

    await waitFor(() =>
      expect(
        screen.getByText('No se pudieron abrir los créditos de OpenStreetMap.'),
      ).toBeTruthy(),
    );
  });
});
