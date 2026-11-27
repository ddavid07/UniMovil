import { useCallback, useEffect, useState } from 'react';
import {
  auditActions,
  auditEntityTypes,
  auditOutcomes,
  type AuditAction,
  type AuditEntityType,
  type AuditEventRecord,
  type AuditOutcome,
} from '@unimovil/contracts';
import { adminApiClient } from '../api/admin-client';
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  AUDIT_OUTCOME_LABELS,
  AUDIT_REASON_LABELS,
  ROLE_LABELS,
  formatLocalDateTime,
  formatUtcTimestamp,
} from '../domain/incident-admin';

export function AuditLogView() {
  const [events, setEvents] = useState<readonly AuditEventRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actorId, setActorId] = useState('');
  const [action, setAction] = useState<AuditAction | ''>('');
  const [entityType, setEntityType] = useState<AuditEntityType | ''>('');
  const [entityId, setEntityId] = useState('');
  const [outcome, setOutcome] = useState<AuditOutcome | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApiClient.listAuditEvents({
        actorId: actorId.trim() || undefined,
        action: action || undefined,
        entityType: entityType || undefined,
        entityId: entityId.trim() || undefined,
        outcome: outcome || undefined,
        from: fromDate ? new Date(`${fromDate}T00:00:00.000Z`).toISOString() : undefined,
        to: toDate ? new Date(`${toDate}T23:59:59.999Z`).toISOString() : undefined,
        page,
        limit: 25,
      });
      setEvents(response.events);
      setTotal(response.total);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No se pudo consultar la auditoría administrativa.',
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [action, actorId, entityId, entityType, fromDate, outcome, page, toDate]);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  const totalPages = Math.max(1, Math.ceil(total / 25));

  return (
    <section className="card section-stack" aria-labelledby="audit-heading">
      <div>
        <h2 id="audit-heading" style={{ margin: 0 }}>
          Auditoría de gestión de incidencias ({total})
        </h2>
        <p className="muted-text" style={{ margin: '0.25rem 0 0' }}>
          Consulta de solo lectura ordenada del evento más reciente al más antiguo. No
          expone contraseñas, tokens, correos, fotografías ni contenido sensible.
        </p>
      </div>

      <div className="filters-grid">
        <div className="field">
          <label htmlFor="audit-actor">ID interno de actor</label>
          <input
            id="audit-actor"
            type="text"
            value={actorId}
            onChange={(event) => {
              setActorId(event.target.value);
              setPage(1);
            }}
            placeholder="UUID de cuenta"
          />
        </div>

        <div className="field">
          <label htmlFor="audit-action">Acción</label>
          <select
            id="audit-action"
            value={action}
            onChange={(event) => {
              setAction(event.target.value as AuditAction | '');
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            {auditActions.map((item) => (
              <option key={item} value={item}>
                {AUDIT_ACTION_LABELS[item]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="audit-entity-type">Tipo de elemento</label>
          <select
            id="audit-entity-type"
            value={entityType}
            onChange={(event) => {
              setEntityType(event.target.value as AuditEntityType | '');
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {auditEntityTypes.map((item) => (
              <option key={item} value={item}>
                {AUDIT_ENTITY_LABELS[item]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="audit-entity-id">ID de elemento</label>
          <input
            id="audit-entity-id"
            type="text"
            value={entityId}
            onChange={(event) => {
              setEntityId(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="audit-outcome">Resultado</label>
          <select
            id="audit-outcome"
            value={outcome}
            onChange={(event) => {
              setOutcome(event.target.value as AuditOutcome | '');
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {auditOutcomes.map((item) => (
              <option key={item} value={item}>
                {AUDIT_OUTCOME_LABELS[item]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="audit-from">Desde (UTC)</label>
          <input
            id="audit-from"
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="audit-to">Hasta (UTC)</label>
          <input
            id="audit-to"
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {error ? (
        <div role="alert" className="alert-error">
          <p style={{ margin: '0 0 0.5rem' }}>{error}</p>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => void loadAudit()}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {loading ? (
        <p aria-live="polite" className="muted-text">
          Cargando eventos de auditoría...
        </p>
      ) : events.length === 0 ? (
        <div className="alert-info">
          No hay eventos registrados para los filtros seleccionados.
        </div>
      ) : (
        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Actor</th>
                <th>Acción</th>
                <th>Elemento</th>
                <th>Resultado</th>
                <th>Cambios permitidos / Motivo</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <div>{formatLocalDateTime(event.occurredAt)}</div>
                    <div className="muted-text">{formatUtcTimestamp(event.occurredAt)}</div>
                  </td>
                  <td>
                    <div>{event.actorId}</div>
                    <div className="muted-text">{ROLE_LABELS[event.actorRole]}</div>
                  </td>
                  <td>{AUDIT_ACTION_LABELS[event.action]}</td>
                  <td>
                    <div>{AUDIT_ENTITY_LABELS[event.entityType]}</div>
                    <div className="muted-text">
                      {event.entityId}
                      {event.incidentRevision !== null
                        ? ` · rev. ${event.incidentRevision}`
                        : ''}
                    </div>
                  </td>
                  <td>{AUDIT_OUTCOME_LABELS[event.outcome]}</td>
                  <td>
                    {event.reasonCode ? (
                      <div>
                        Código: {event.reasonCode} (
                        {AUDIT_REASON_LABELS[event.reasonCode]})
                      </div>
                    ) : null}
                    {Object.entries(event.changes).map(([field, diff]) => (
                      <div key={field}>
                        <code>{field}</code>: {String(diff.before ?? '—')} →{' '}
                        {String(diff.after ?? '—')}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-bar">
        <button
          type="button"
          className="button button-secondary"
          disabled={page <= 1 || loading}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Anterior
        </button>
        <span className="muted-text">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          className="button button-secondary"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
