import type { ReactNode } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { IncidentsScreen } from './IncidentsScreen';

const mockRequest = jest.fn<Promise<Response>, [string, RequestInit?]>();
let mockUser: { id: string } | null;

jest.mock('../account/AuthProvider', () => ({
  useAuth: () => ({ user: mockUser, request: mockRequest }),
}));
jest.mock('expo-image-picker', () => ({}));
jest.mock('../account/api-config', () => ({
  API_BASE_URL: 'http://localhost:3001/api',
}));
jest.mock('expo-router', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Link: ({ children }: { children: ReactNode }) =>
      createElement(Text, null, children),
    useLocalSearchParams: () => ({}),
  };
});
jest.mock('../campus/data/repository', () => ({
  localPlacesRepository: { list: async () => [] },
}));

const ownIncident = {
  id: 'own-id',
  publicId: 'own-ref',
  category: 'other',
  status: 'received',
  description: 'Parte privado',
  latitude: 40.45,
  longitude: -3.72,
  createdAt: '2026-11-27T09:00:00Z',
};
const publicIncident = {
  ...ownIncident,
  publicId: 'public-ref',
  description: 'Resumen publicado',
  updatedAt: ownIncident.createdAt,
};
function json(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  mockUser = { id: 'owner' };
  mockRequest.mockReset();
  jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(json({ incidents: [publicIncident] }));
});

it('opens the owner history and shows only the informant response, then confirms a private report', async () => {
  jest.mocked(globalThis.fetch).mockResolvedValueOnce(json({ incidents: [] }));
  mockRequest
    .mockResolvedValueOnce(json({ incidents: [ownIncident] }))
    .mockResolvedValueOnce(
      json({
        incident: {
          status: 'resolved',
          closureReason: 'Motivo interno',
          statusHistory: [
            {
              id: 'history-1',
              fromStatus: 'under_review',
              toStatus: 'resolved',
              createdAt: ownIncident.createdAt,
              informantResponse: 'El ascensor vuelve a funcionar.',
              reason: 'Nota interna',
              actorId: 'manager-id',
              email: 'gestor@example.test',
            },
          ],
        },
      }),
    )
    .mockResolvedValueOnce(json({ confirmation: { outcome: 'still_active' } }));
  const screen = await render(<IncidentsScreen />);
  await fireEvent.press(
    await screen.findByRole('button', { name: 'Ver detalle de own-ref' }),
  );
  expect(mockRequest).toHaveBeenCalledWith('/me/incidents/own-id');
  expect(await screen.findByText('Estado actual: Resuelta')).toBeTruthy();
  expect(screen.getByText(/En revisión → Resuelta/)).toBeTruthy();
  expect(
    screen.getByText('Respuesta para ti: El ascensor vuelve a funcionar.'),
  ).toBeTruthy();
  expect(
    screen.queryByText(/Motivo interno|Nota interna|manager-id|gestor@example/),
  ).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Sigue activo' }));
  expect(mockRequest).toHaveBeenLastCalledWith('/me/incidents/own-id/confirmations', {
    method: 'POST',
    body: JSON.stringify({ outcome: 'still_active' }),
  });
  expect(
    await screen.findByText('Has indicado que el problema sigue activo.'),
  ).toBeTruthy();
  expect(screen.getByText('Estado actual: Resuelta')).toBeTruthy();
});

it('retries a failed public confirmation and allows the account to update it', async () => {
  mockRequest
    .mockResolvedValueOnce(json({ incidents: [] }))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(json({ confirmation: { outcome: 'resolved' } }))
    .mockResolvedValueOnce(json({ confirmation: { outcome: 'still_active' } }));
  const screen = await render(<IncidentsScreen />);
  const resolved = await screen.findByRole('button', { name: 'Está solucionado' });
  await fireEvent.press(resolved);
  expect(
    await screen.findByText(/No se ha podido guardar tu confirmación/),
  ).toBeTruthy();
  await fireEvent.press(resolved);
  expect(mockRequest).toHaveBeenLastCalledWith('/incidents/public-ref/confirmations', {
    method: 'POST',
    body: JSON.stringify({ outcome: 'resolved' }),
  });
  expect(
    await screen.findByText('Has indicado que el problema está solucionado.'),
  ).toBeTruthy();
  expect(screen.getByText(/No cambia automáticamente el estado oficial/)).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Sigue activo' }));
  expect(
    await screen.findByText('Has indicado que el problema sigue activo.'),
  ).toBeTruthy();
  expect(mockRequest).toHaveBeenLastCalledWith('/incidents/public-ref/confirmations', {
    method: 'POST',
    body: JSON.stringify({ outcome: 'still_active' }),
  });
});

it('recovers from a detail error and explains a closed incident with empty history', async () => {
  mockRequest
    .mockResolvedValueOnce(json({ incidents: [ownIncident] }))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(json({ incident: { status: 'closed', statusHistory: [] } }));
  const screen = await render(<IncidentsScreen />);
  await fireEvent.press(
    await screen.findByRole('button', { name: 'Ver detalle de own-ref' }),
  );
  await fireEvent.press(
    await screen.findByRole('button', { name: 'Reintentar el detalle' }),
  );
  expect(await screen.findByText('Todavía no hay cambios de estado.')).toBeTruthy();
  expect(screen.getByText(/ya no admite confirmaciones/)).toBeTruthy();
  expect(screen.getAllByRole('button', { name: 'Sigue activo' })).toHaveLength(1);
});

it('keeps the public feed available and directs signed-out users to sign in', async () => {
  mockUser = null;
  const screen = await render(<IncidentsScreen />);
  expect(await screen.findByText('Resumen publicado')).toBeTruthy();
  expect(screen.getByText('Inicia sesión para confirmar esta incidencia')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Está solucionado' })).toBeNull();
  expect(screen.queryByText('Mis incidencias')).toBeNull();
  expect(mockRequest).not.toHaveBeenCalled();
});

it('discards a private detail still loading when the account changes', async () => {
  let finishDetail!: (response: Response) => void;
  mockRequest
    .mockResolvedValueOnce(json({ incidents: [ownIncident] }))
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishDetail = resolve;
        }),
    )
    .mockResolvedValueOnce(json({ incidents: [] }));
  jest.mocked(globalThis.fetch).mockImplementation(async () => json({ incidents: [] }));
  const screen = await render(<IncidentsScreen />);
  await fireEvent.press(
    await screen.findByRole('button', { name: 'Ver detalle de own-ref' }),
  );
  expect(screen.getByText('Cargando el detalle…')).toBeTruthy();
  mockUser = { id: 'another-account' };
  await screen.rerender(<IncidentsScreen />);
  await act(async () =>
    finishDetail(json({ incident: { status: 'resolved', statusHistory: [] } })),
  );
  expect(await screen.findByText('Todavía no has enviado incidencias.')).toBeTruthy();
  expect(screen.queryByText('Estado actual: Resuelta')).toBeNull();
  expect(screen.queryByText('Parte privado')).toBeNull();
});
