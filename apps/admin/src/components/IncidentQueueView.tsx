import {
  incidentCategories,
  incidentStatuses,
  incidentVisibilities,
  type AdminIncidentSummary,
  type IncidentCategory,
  type IncidentStatus,
  type IncidentVisibility,
  type ManagerSummary,
} from '@unimovil/contracts';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  VISIBILITY_LABELS,
  formatLocalDateTime,
} from '../domain/incident-admin';

export interface QueueFiltersState {
  status: IncidentStatus | '';
  category: IncidentCategory | '';
  assignedTo: string;
  visibility: IncidentVisibility | '';
  includeClosedOrResolved: boolean;
  page: number;
}

interface IncidentQueueViewProps {
  incidents: readonly AdminIncidentSummary[];
  managers: readonly ManagerSummary[];
  filters: QueueFiltersState;
  selectedIncidentId: string | null;
  total: number;
  loading: boolean;
  error: string;
  onFiltersChange: (next: QueueFiltersState) => void;
  onSelectIncident: (incidentId: string) => void;
  onRetry: () => void;
}

export function IncidentQueueView({
  incidents,
  managers,
  filters,
  selectedIncidentId,
  total,
  loading,
  error,
  onFiltersChange,
  onSelectIncident,
  onRetry,
}: IncidentQueueViewProps) {
  const totalPages = Math.max(1, Math.ceil(total / 25));

  return (
    <section className="card" aria-labelledby="queue-heading">
      <h2 id="queue-heading" style={{ marginTop: 0 }}>
        Cola de incidencias ({total})
      </h2>
      <p className="muted-text">
        Por defecto muestra casos activos (recibida, en revisión y en proceso) ordenados
        por última actualización ascendente, sin representar un SLA.
      </p>

      <div className="filters-grid">
        <div className="field">
          <label htmlFor="filter-status">Estado operativo</label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: event.target.value as IncidentStatus | '',
                page: 1,
              })
            }
          >
            <option value="">Activos por defecto</option>
            {incidentStatuses.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-category">Categoría</label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                category: event.target.value as IncidentCategory | '',
                page: 1,
              })
            }
          >
            <option value="">Todas</option>
            {incidentCategories.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-assignment">Asignación</label>
          <select
            id="filter-assignment"
            value={filters.assignedTo}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                assignedTo: event.target.value,
                page: 1,
              })
            }
          >
            <option value="">Cualquiera</option>
            <option value="unassigned">Sin asignar</option>
            <option value="me">Asignadas a mí</option>
            {managers.map((manager) => (
              <option key={manager.userId} value={manager.userId}>
                {manager.displayLabel}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-visibility">Publicación</label>
          <select
            id="filter-visibility"
            value={filters.visibility}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                visibility: event.target.value as IncidentVisibility | '',
                page: 1,
              })
            }
          >
            <option value="">Todas</option>
            {incidentVisibilities.map((visibility) => (
              <option key={visibility} value={visibility}>
                {VISIBILITY_LABELS[visibility]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '0.85rem' }}>
        <label style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={filters.includeClosedOrResolved}
            disabled={filters.status !== ''}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                includeClosedOrResolved: event.target.checked,
                page: 1,
              })
            }
          />
          <span>Incluir resueltas y cerradas cuando no hay filtro de estado</span>
        </label>
      </div>

      {error ? (
        <div role="alert" className="alert-error">
          <p style={{ margin: '0 0 0.5rem' }}>{error}</p>
          <button type="button" className="button button-secondary" onClick={onRetry}>
            Reintentar carga
          </button>
        </div>
      ) : null}

      {loading ? (
        <p aria-live="polite" className="muted-text">
          Cargando cola de incidencias...
        </p>
      ) : incidents.length === 0 ? (
        <div className="alert-info">
          No hay incidencias que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <ul className="queue-list">
          {incidents.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="queue-item-button"
                aria-current={item.id === selectedIncidentId ? 'true' : undefined}
                onClick={() => onSelectIncident(item.id)}
              >
                <div className="badge-row">
                  <span className="badge">{STATUS_LABELS[item.status]}</span>
                  <span
                    className={
                      item.visibility === 'published'
                        ? 'badge badge-published'
                        : 'badge'
                    }
                  >
                    {VISIBILITY_LABELS[item.visibility]}
                  </span>
                  {item.managementPriority ? (
                    <span className="badge">
                      Gestión: {PRIORITY_LABELS[item.managementPriority]}
                    </span>
                  ) : null}
                </div>
                <strong>{CATEGORY_LABELS[item.category]}</strong>
                <div className="muted-text">
                  ID público: {item.publicId} · Rev. {item.revision} · Adjuntos:{' '}
                  {item.attachmentCount}
                </div>
                <div className="muted-text">
                  Actualizada: {formatLocalDateTime(item.updatedAt)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="pagination-bar">
        <button
          type="button"
          className="button button-secondary"
          disabled={filters.page <= 1 || loading}
          onClick={() => onFiltersChange({ ...filters, page: filters.page - 1 })}
        >
          Anterior
        </button>
        <span className="muted-text">
          Página {filters.page} de {totalPages}
        </span>
        <button
          type="button"
          className="button button-secondary"
          disabled={filters.page >= totalPages || loading}
          onClick={() => onFiltersChange({ ...filters, page: filters.page + 1 })}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
