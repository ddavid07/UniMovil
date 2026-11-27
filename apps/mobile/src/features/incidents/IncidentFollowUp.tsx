import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type {
  ConfirmationOutcome,
  IncidentStatus,
  IncidentStatusHistoryItem,
} from '@unimovil/contracts';
import type { useAuth } from '../account/AuthProvider';
import { colors } from '../../shared/theme';
import { INCIDENT_STATUS_LABELS, localDate } from './labels';

type SessionRequest = ReturnType<typeof useAuth>['request'];
type VisibleTransition = Pick<
  IncidentStatusHistoryItem,
  'id' | 'fromStatus' | 'toStatus' | 'createdAt' | 'informantResponse'
>;

interface OwnDetail {
  status: IncidentStatus;
  statusHistory: readonly VisibleTransition[];
}

export function OwnIncidentDetail({
  incidentId,
  request,
  onStatus,
}: {
  incidentId: string;
  request: SessionRequest;
  onStatus(id: string, status: IncidentStatus): void;
}) {
  const path = `/me/incidents/${encodeURIComponent(incidentId)}`;
  const [detail, setDetail] = useState<OwnDetail | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await request(path);
        const { incident } = (await response.json()) as { incident: OwnDetail };
        if (active) {
          setDetail(incident);
          onStatus(incidentId, incident.status);
        }
      } catch {
        if (active) setFailed(true);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [path, request, attempt, incidentId, onStatus]);

  if (failed)
    return (
      <View style={styles.group}>
        <Text accessibilityRole="alert">
          No se ha podido cargar el detalle de la incidencia.
        </Text>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => {
            setFailed(false);
            setAttempt((value) => value + 1);
          }}
        >
          <Text style={styles.buttonText}>Reintentar el detalle</Text>
        </Pressable>
      </View>
    );
  if (!detail)
    return <Text accessibilityLiveRegion="polite">Cargando el detalle…</Text>;
  return (
    <View style={styles.group}>
      <Text style={styles.heading}>
        Estado actual: {INCIDENT_STATUS_LABELS[detail.status]}
      </Text>
      <Text accessibilityRole="header" style={styles.heading}>
        Historial de cambios
      </Text>
      {detail.statusHistory.length === 0 && (
        <Text>Todavía no hay cambios de estado.</Text>
      )}
      {detail.statusHistory.map((entry) => (
        <View key={entry.id}>
          <Text>
            {localDate(entry.createdAt)} · {INCIDENT_STATUS_LABELS[entry.fromStatus]} →{' '}
            {INCIDENT_STATUS_LABELS[entry.toStatus]}
          </Text>
          {entry.informantResponse ? (
            <Text>Respuesta para ti: {entry.informantResponse}</Text>
          ) : null}
        </View>
      ))}
      <ConfirmationForm path={path} status={detail.status} request={request} />
    </View>
  );
}

export function ConfirmationForm({
  path,
  status,
  request,
}: {
  path: string;
  status: IncidentStatus;
  request: SessionRequest;
}) {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  async function confirm(outcome: ConfirmationOutcome) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setFailed(false);
    setMessage('');
    try {
      await request(`${path}/confirmations`, {
        method: 'POST',
        body: JSON.stringify({ outcome }),
      });
      setMessage(
        outcome === 'still_active'
          ? 'Has indicado que el problema sigue activo.'
          : 'Has indicado que el problema está solucionado.',
      );
    } catch {
      setFailed(true);
      setMessage(
        'No se ha podido guardar tu confirmación. Vuelve a elegir una opción para reintentar.',
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  if (status === 'closed')
    return <Text>Esta incidencia está cerrada y ya no admite confirmaciones.</Text>;
  return (
    <View style={styles.group}>
      <Text style={styles.heading}>¿Sigue presente el problema?</Text>
      <Text>
        Tu respuesta es privada y caduca a los 30 días de su última actualización. No
        cambia automáticamente el estado oficial.
      </Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          style={styles.button}
          onPress={() => void confirm('still_active')}
        >
          <Text style={styles.buttonText}>Sigue activo</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          style={styles.button}
          onPress={() => void confirm('resolved')}
        >
          <Text style={styles.buttonText}>Está solucionado</Text>
        </Pressable>
      </View>
      {busy || message ? (
        <Text
          accessibilityLiveRegion="polite"
          accessibilityRole={failed ? 'alert' : undefined}
        >
          {busy ? 'Guardando tu confirmación…' : message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  heading: { color: colors.ink, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.universityRedDark,
  },
  buttonText: { color: colors.universityRedDark, fontWeight: '700' },
});
