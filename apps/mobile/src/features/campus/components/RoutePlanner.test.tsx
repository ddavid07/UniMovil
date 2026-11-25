import { fireEvent, render } from '@testing-library/react-native';
import {
  CAMPUS_TRANSIT,
  calculateTransitRoute,
  transitStopAsPlace,
} from '../domain/transit';
import { RoutePlanner } from './RoutePlanner';

describe('RoutePlanner', () => {
  it('shows a scheduled direct bus alternative with both walking legs', async () => {
    const line = CAMPUS_TRANSIT.lines.find((candidate) =>
      candidate.patterns.some((pattern) => pattern.stopIds.length > 1),
    )!;
    const pattern = line.patterns.find((candidate) => candidate.stopIds.length > 1)!;
    const originStop = CAMPUS_TRANSIT.stops.find(
      (stop) => stop.id === pattern.stopIds[0],
    )!;
    const destinationStop = CAMPUS_TRANSIT.stops.find(
      (stop) => stop.id === pattern.stopIds[pattern.stopIds.length - 1],
    )!;
    const origin = transitStopAsPlace(originStop);
    const destination = transitStopAsPlace(destinationStop);
    const now = new Date('2026-11-25T05:30:00.000Z');
    const expectedRoute = calculateTransitRoute(
      origin.coordinates,
      destination.coordinates,
      now,
    );
    const onSelectTransitLine = jest.fn();

    const view = await render(
      <RoutePlanner
        currentLocation={null}
        destinationId={destination.id}
        expandRequest={1}
        mapSelectionTarget={null}
        now={now}
        onDestinationChange={jest.fn()}
        onOriginChange={jest.fn()}
        onPickOnMap={jest.fn()}
        onRouteChange={jest.fn()}
        onSelectStep={jest.fn()}
        onSelectTransitLine={onSelectTransitLine}
        onUseCurrentLocation={jest.fn()}
        originId={origin.id}
        originUsesCurrentLocation={false}
        places={[origin, destination]}
        selectedStepIndex={null}
      />,
    );

    expect(expectedRoute).not.toBeNull();
    await fireEvent.press(view.getByText('Autobús'));

    expect(onSelectTransitLine).toHaveBeenCalledWith(expectedRoute!.lineId);
    expect(
      view.getByText(
        `Autobús ${expectedRoute!.lineReference} · ${expectedRoute!.headsign}`,
      ),
    ).toBeTruthy();
    expect(
      view.getByText(new RegExp(`Camina .* hasta ${expectedRoute!.originStop.name}`)),
    ).toBeTruthy();
    expect(
      view.getByText(new RegExp(`Baja en ${expectedRoute!.destinationStop.name}`)),
    ).toBeTruthy();
    expect(view.getByText(/horario estático comprobado/i)).toBeTruthy();
  });
});
