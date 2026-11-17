import { useState, type FC } from "react";
import {
  INCIDENT_STATUSES,
  isValidIncidentTransition,
  type Incident,
  type IncidentCategory,
  type IncidentPriority,
  type IncidentStatus,
} from "@unimovil/contracts";
import { filterIncidents } from "../domain/admin-service.ts";

interface IncidentsViewProps {
  readonly incidents: readonly Incident[];
  readonly onUpdateStatus: (
    incidentId: string,
    newStatus: IncidentStatus,
    resolutionNote?: string | undefined,
    newPriority?: IncidentPriority | undefined,
    assignedTo?: string | undefined,
  ) => void;
}

export const IncidentsView: FC<IncidentsViewProps> = ({
  incidents,
  onUpdateStatus,
}) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">(
    "all",
  );
  const [priorityFilter, setPriorityFilter] = useState<
    IncidentPriority | "all"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<
    IncidentCategory | "all"
  >("all");

  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [selectedNextStatus, setSelectedNextStatus] =
    useState<IncidentStatus>("en_proceso");
  const [selectedPriority, setSelectedPriority] =
    useState<IncidentPriority>("media");
  const [assignedTo, setAssignedTo] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const filtered = filterIncidents(incidents, {
    query,
    status: statusFilter,
    priority: priorityFilter,
    category: categoryFilter,
  });

  const countPending = incidents.filter(
    (i) => i.status === "recibida" || i.status === "en_revision",
  ).length;
  const countInProgress = incidents.filter(
    (i) => i.status === "en_proceso",
  ).length;
  const countResolved = incidents.filter(
    (i) => i.status === "resuelta" || i.status === "cerrada",
  ).length;

  const handleOpenEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setTransitionError(null);
    setSelectedPriority(incident.priority);
    setAssignedTo(incident.assignedTo ?? "");
    setResolutionNote(incident.resolutionNote ?? "");

    // Choose first valid next transition
    const validNext = INCIDENT_STATUSES.find(
      (st) =>
        st !== incident.status &&
        isValidIncidentTransition(incident.status, st),
    );
    setSelectedNextStatus(validNext ?? incident.status);
  };

  const handleCloseEdit = () => {
    setEditingIncident(null);
    setResolutionNote("");
    setAssignedTo("");
    setTransitionError(null);
  };

  const handleSaveStatus = () => {
    if (!editingIncident) return;

    if (
      !isValidIncidentTransition(editingIncident.status, selectedNextStatus)
    ) {
      setTransitionError(
        `No está permitida la transición directa de "${editingIncident.status}" a "${selectedNextStatus}".`,
      );
      return;
    }

    onUpdateStatus(
      editingIncident.id,
      selectedNextStatus,
      resolutionNote.trim() || undefined,
      selectedPriority,
      assignedTo.trim() || undefined,
    );
    handleCloseEdit();
  };

  return (
    <section aria-labelledby="incidents-heading" className="view-container">
      <div className="view-header">
        <div>
          <h2 id="incidents-heading" className="view-title">
            Gestión y Resolución de Incidencias
          </h2>
          <p className="view-description">
            Monitoreo y resolución de problemas de movilidad, rampas
            inaccesibles, aceras y elevadores en Moncloa.
          </p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Reportadas</span>
          <span className="metric-value">{incidents.length}</span>
        </div>
        <div className="metric-card metric-card-warning">
          <span className="metric-label">Pendientes / En Revisión</span>
          <span className="metric-value">{countPending}</span>
        </div>
        <div className="metric-card metric-card-info">
          <span className="metric-label">En Intervención Técnica</span>
          <span className="metric-value">{countInProgress}</span>
        </div>
        <div className="metric-card metric-card-success">
          <span className="metric-label">Resueltas y Cerradas</span>
          <span className="metric-value">{countResolved}</span>
        </div>
      </div>

      <div className="filter-bar">
        <input
          aria-label="Buscar incidencias por título, descripción o ubicación"
          className="search-input"
          placeholder="Buscar por avería, facultad, rampa..."
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="select-group">
          <label className="filter-label" htmlFor="inc-status-select">
            Estado:
          </label>
          <select
            id="inc-status-select"
            className="filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as IncidentStatus | "all")
            }
          >
            <option value="all">Todos los estados</option>
            <option value="recibida">Recibida</option>
            <option value="en_revision">En Revisión</option>
            <option value="en_proceso">En Proceso</option>
            <option value="resuelta">Resuelta</option>
            <option value="cerrada">Cerrada</option>
          </select>
        </div>

        <div className="select-group">
          <label className="filter-label" htmlFor="inc-priority-select">
            Prioridad:
          </label>
          <select
            id="inc-priority-select"
            className="filter-select"
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as IncidentPriority | "all")
            }
          >
            <option value="all">Todas</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        <div className="select-group">
          <label className="filter-label" htmlFor="inc-category-select">
            Categoría:
          </label>
          <select
            id="inc-category-select"
            className="filter-select"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as IncidentCategory | "all")
            }
          >
            <option value="all">Todas</option>
            <option value="rampa">Rampa</option>
            <option value="ascensor">Ascensor</option>
            <option value="acera">Acera / Pavimento</option>
            <option value="obstaculo">Obstáculo</option>
            <option value="alumbrado">Alumbrado</option>
            <option value="transporte">Transporte</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">ID / Asunto</th>
              <th scope="col">Ubicación</th>
              <th scope="col">Categoría</th>
              <th scope="col">Prioridad</th>
              <th scope="col">Estado</th>
              <th scope="col">Comunicado por</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-message">
                  No hay incidencias que coincidan con los criterios de
                  búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <div className="incident-title-cell">
                      <span className="incident-id">{inc.id}</span>
                      <strong className="incident-title">{inc.title}</strong>
                      <span className="incident-desc">{inc.description}</span>
                      {inc.assignedTo && (
                        <div className="incident-assigned-badge">
                          <span>🛠️ Asignado:</span>{" "}
                          <strong>{inc.assignedTo}</strong>
                        </div>
                      )}
                      {inc.resolutionNote && (
                        <div className="resolution-note-badge">
                          <strong>Nota:</strong> {inc.resolutionNote}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="location-name">{inc.locationName}</span>
                  </td>
                  <td>
                    <span className="tag tag-category">{inc.category}</span>
                  </td>
                  <td>
                    <span
                      className={`tag tag-priority tag-priority-${inc.priority}`}
                    >
                      {inc.priority.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`tag tag-inc-status tag-inc-status-${inc.status}`}
                    >
                      {inc.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <span className="reporter-email">{inc.reportedBy}</span>
                    <span className="report-date">
                      {new Date(inc.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => handleOpenEdit(inc)}
                    >
                      Gestionar Estado
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingIncident && (
        <div className="modal-backdrop" role="presentation">
          <div
            aria-labelledby="inc-modal-title"
            aria-modal="true"
            className="modal-card"
            role="dialog"
          >
            <h3 id="inc-modal-title" className="modal-title">
              Gestionar Incidencia: {editingIncident.id}
            </h3>
            <p className="modal-desc">
              Actualizar ciclo de vida de la incidencia ({editingIncident.title}
              ) en {editingIncident.locationName}.
            </p>

            <div className="state-flow-indicator">
              <span>Estado actual:</span>
              <strong
                className={`tag tag-inc-status tag-inc-status-${editingIncident.status}`}
              >
                {editingIncident.status.replace("_", " ")}
              </strong>
            </div>

            {transitionError && (
              <div className="alert-error" role="alert">
                {transitionError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="inc-modal-status-select" className="form-label">
                Nuevo Estado a Aplicar:
              </label>
              <select
                id="inc-modal-status-select"
                className="form-control"
                value={selectedNextStatus}
                onChange={(e) => {
                  setSelectedNextStatus(e.target.value as IncidentStatus);
                  setTransitionError(null);
                }}
              >
                {INCIDENT_STATUSES.map((statusOption) => {
                  const allowed = isValidIncidentTransition(
                    editingIncident.status,
                    statusOption,
                  );
                  return (
                    <option
                      key={statusOption}
                      value={statusOption}
                      disabled={!allowed}
                    >
                      {statusOption.replace("_", " ")}{" "}
                      {allowed ? "(Transición válida)" : "(Bloqueada)"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="inc-modal-priority-select" className="form-label">
                Prioridad Operativa:
              </label>
              <select
                id="inc-modal-priority-select"
                className="form-control"
                value={selectedPriority}
                onChange={(e) =>
                  setSelectedPriority(e.target.value as IncidentPriority)
                }
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="inc-modal-assigned" className="form-label">
                Responsable o Unidad Asignada:
              </label>
              <input
                id="inc-modal-assigned"
                className="form-control"
                placeholder="Ej. Mantenimiento UCM, Conserjería, EMT Madrid..."
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="inc-modal-note" className="form-label">
                Nota de Intervención / Resolución:
              </label>
              <textarea
                id="inc-modal-note"
                className="form-control"
                placeholder="Indica el informe del técnico, piezas sustituidas o motivo de cierre."
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleCloseEdit}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSaveStatus}
              >
                Guardar y Registrar Trazabilidad
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
