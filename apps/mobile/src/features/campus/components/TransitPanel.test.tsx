import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import {
  CAMPUS_TRANSIT,
  getLineStops,
  upcomingDeparturesForStop,
} from '../domain/transit';
import { TransitPanel } from './TransitPanel';

describe('TransitPanel', () => {
  it('shows a selected direction, ordered stops, and static departures with their source', async () => {
    const now = new Date('2026-11-25T06:00:00.000Z');
    const selected = CAMPUS_TRANSIT.lines.flatMap((candidateLine) =>
      candidateLine.patterns.flatMap((candidatePattern) => {
        const candidateStops = getLineStops(
          candidateLine,
          CAMPUS_TRANSIT.stops,
          candidatePattern.id,
        );
        const stop = candidateStops.find((candidate) =>
          upcomingDeparturesForStop(candidate.id, now, CAMPUS_TRANSIT).some(
            (departure) => departure.lineId === candidateLine.id,
          ),
        );
        return stop ? [{ line: candidateLine, pattern: candidatePattern, stop }] : [];
      }),
    )[0]!;
    const { line, pattern, stop } = selected;
    const onSelectLine = jest.fn();

    function Harness() {
      const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
      const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
      return (
        <TransitPanel
          dataset={CAMPUS_TRANSIT}
          onRouteToStop={jest.fn()}
          onSelectLine={(selectedLine) => {
            onSelectLine(selectedLine);
            setSelectedLineId(selectedLine.id);
          }}
          onSelectStop={(stop) => setSelectedStopId(stop.id)}
          selectedLineId={selectedLineId}
          selectedStopId={selectedStopId}
          now={now}
        />
      );
    }

    const view = await render(<Harness />);

    await fireEvent.press(view.getByText('Autobuses y paradas'));
    await fireEvent.press(
      view.getByLabelText(`${line.reference}: ${pattern.headsign}`),
    );
    expect(onSelectLine).toHaveBeenCalledWith(line);
    expect(view.getByText(`Línea ${line.reference}: ${line.name}`)).toBeTruthy();
    expect(view.getAllByText(pattern.headsign, { exact: true }).length).toBeGreaterThan(
      0,
    );

    await fireEvent.press(view.getByText(stop.name));
    expect(view.getByText('Próximas salidas programadas')).toBeTruthy();
    expect(view.getByText(/Open Data Commons Attribution License/)).toBeTruthy();
    expect(view.getByText('Consultar avisos de EMT Madrid')).toBeTruthy();
  });
});
