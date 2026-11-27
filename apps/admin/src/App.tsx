import { useCallback, useEffect, useState } from 'react';
import type {
  AdminIncidentDetail,
  AdminIncidentSummary,
  ManagerSummary,
} from '@unimovil/contracts';
import { adminApiClient, AdminApiError, type SessionUser } from './api/admin-client';
import { AuditLogView } from './components/AuditLogView';
import { IncidentDetailPanel } from './components/IncidentDetailPanel';
import {
  IncidentQueueView,
  type QueueFiltersState,
} from './components/IncidentQueueView';
import { SignInView } from './components/SignInView';
import {
  ROLE_LABELS,
  canAccessAuditLog,
  canOperateManagementQueue,
} from './domain/incident-admin';

type ActiveSection = 'queue' | 'audit';

const INITIAL_FILTERS: QueueFiltersState = {
  status: '',
  category: '',
  assignedTo: '',
  visibility: '',
  includeClosedOrResolved: false,
  page: 1,
};

export function App() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [section, setSection] = useState<ActiveSection>('queue');
  const [filters, setFilters] = useState<QueueFiltersState>(INITIAL_FILTERS);
  const [incidents, setIncidents] = useState<readonly AdminIncidentSummary[]>([]);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [managers, setManagers] = useState<readonly ManagerSummary[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminIncidentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [notice, setNotice] = useState('');

  const loadSession = useCallback(async () => {
    setCheckingSession(true);
    try {
      const response = await adminApiClient.getSession();
      setSessionUser(response.user);
    } catch {
      setSessionUser(null);
    } finally {
      setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const loadManagers = useCallback(async () => {
    if (!sessionUser || !canOperateManagementQueue(sessionUser.role)) return;
    try {
      const response = await adminApiClient.listManagers();
      setManagers(response.managers);
    } catch {
      setManagers([]);
    }
  }, [sessionUser]);

  const loadQueue = useCallback(async () => {
    if (!sessionUser || !canOperateManagementQueue(sessionUser.role)) return;
    setLoadingQueue(true);
    setQueueError('');
    try {
      const response = await adminApiClient.listIncidents({
        status: filters.status || undefined,
        category: filters.category || undefined,
        assignedTo: filters.assignedTo || undefined,
        visibility: filters.visibility || undefined,
        includeClosedOrResolved: filters.includeClosedOrResolved ? 'true' : 'false',
        page: filters.page,
        limit: 25,
      });
      setIncidents(response.incidents);
      setTotalIncidents(response.total);
    } catch (cause) {
      if (cause instanceof AdminApiError && cause.status === 401) {
        setSessionUser(null);
      }
      setQueueError(
        cause instanceof Error
          ? cause.message
          : 'No se pudo cargar la cola de incidencias.',
      );
      setIncidents([]);
    } finally {
      setLoadingQueue(false);
    }
  }, [filters, sessionUser]);

  const loadDetail = useCallback(
    async (incidentId: string) => {
      if (!sessionUser || !canOperateManagementQueue(sessionUser.role)) return;
      setLoadingDetail(true);
      setDetailError('');
      try {
        const response = await adminApiClient.getIncidentDetail(incidentId);
        setDetail(response.incident);
      } catch (cause) {
        setDetailError(
          cause instanceof Error
            ? cause.message
            : 'No se pudo cargar el detalle de la incidencia.',
        );
        setDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    },
    [sessionUser],
  );

  useEffect(() => {
    void loadManagers();
  }, [loadManagers]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (selectedIncidentId) {
      void loadDetail(selectedIncidentId);
    } else {
      setDetail(null);
    }
  }, [loadDetail, selectedIncidentId]);

  async function handleSignOut() {
    await adminApiClient.signOut().catch(() => undefined);
    setSessionUser(null);
    setSelectedIncidentId(null);
    setDetail(null);
    setIncidents([]);
    setNotice('');
  }

  return (
    <>
      <header className="admin-header">
        <div className="admin-brand">
          <h1>UniMovil · Administración</h1>
          <p>Gestión de incidencias y auditoría (entorno local separado del cliente público)</p>
        </div>

        {sessionUser ? (
          <nav className="admin-nav" aria-label="Navegación administrativa">
            <span className="badge">{ROLE_LABELS[sessionUser.role]}</span>
            {canOperateManagementQueue(sessionUser.role) ? (
              <button
                type="button"
                className="button button-secondary"
                aria-pressed={section === 'queue'}
                onClick={() => setSection('queue')}
              >
                Cola de incidencias
              </button>
            ) : null}
            {canAccessAuditLog(sessionUser.role) ? (
              <button
                type="button"
                className="button button-secondary"
                aria-pressed={section === 'audit'}
                onClick={() => setSection('audit')}
              >
                Auditoría administrativa
              </button>
            ) : null}
            <button
              type="button"
              className="button button-secondary"
              onClick={() => void handleSignOut()}
            >
              Cerrar sesión
            </button>
          </nav>
        ) : null}
      </header>

      <main className="admin-main">
        {checkingSession ? (
          <p aria-live="polite" className="muted-text">
            Comprobando sesión...
          </p>
        ) : !sessionUser ? (
          <SignInView
            onSignedIn={(user) => {
              setSessionUser(user);
              setSection('queue');
              setNotice('');
            }}
          />
        ) : !canOperateManagementQueue(sessionUser.role) ? (
          <section className="card" role="alert">
            <h2 style={{ marginTop: 0 }}>Acceso restringido</h2>
            <p>
              Tu cuenta tiene el rol «{ROLE_LABELS[sessionUser.role]}». Solo las
              cuentas con rol de gestor o administrador asignado desde servidor
              pueden acceder a la gestión de incidencias.
            </p>
          </section>
        ) : (
          <>
            {notice ? (
              <div role="status" aria-live="polite" className="alert-success">
                {notice}
              </div>
            ) : null}

            {section === 'audit' && canAccessAuditLog(sessionUser.role) ? (
              <AuditLogView />
            ) : (
              <div className="queue-layout">
                <IncidentQueueView
                  incidents={incidents}
                  managers={managers}
                  filters={filters}
                  selectedIncidentId={selectedIncidentId}
                  total={totalIncidents}
                  loading={loadingQueue}
                  error={queueError}
                  onFiltersChange={setFilters}
                  onSelectIncident={(id) => {
                    setNotice('');
                    setSelectedIncidentId(id);
                  }}
                  onRetry={() => void loadQueue()}
                />
                <IncidentDetailPanel
                  incident={detail}
                  managers={managers}
                  loading={loadingDetail}
                  error={detailError}
                  onReload={() => {
                    if (selectedIncidentId) void loadDetail(selectedIncidentId);
                  }}
                  onIncidentUpdated={(updated, message) => {
                    setDetail(updated);
                    setNotice(message);
                    void loadQueue();
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
