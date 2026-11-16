import { useState, type FC } from "react";
import {
  INCIDENT_STATUSES,
  isValidIncidentTransition,
  type Incident,
  type IncidentSeverity,
  type IncidentStatus,
  type IncidentType,
} from "@unimovil/contracts";
import { filterIncidents } from "../domain/admin-service.ts";

interface IncidentsViewProps {
  readonly incidents: readonly Incident[];
  readonly onUpdateStatus: (
    incidentId: string,
    newStatus: IncidentStatus,
    resolutionNote?: string | undefined,
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
  const [severityFilter, setSeverityFilter] = useState<
    IncidentSeverity | "all"
  >("all");
  const [typeFilter, setTypeFilter] = useState<IncidentType | "all">("all");

  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [selectedNextStatus, setSelectedNextStatus] =
    useState<IncidentStatus>("en_curso");
  const [resolutionNote, setResolutionNote] = useState("");
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const filtered = filterIncidents(incidents, {
    query,
    status: statusFilter,
    severity: severityFilter,
    type: typeFilter,
  });

  const countPending = incidents.filter((i) => i.status === "reportada").length;
  const countInProgress = incidents.filter(
    (i) => i.status === "en_curso",
  ).length;
  const countResolved = incidents.filter(
    (i) => i.status === "resuelta",
  ).length;

  const handleOpenEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setTransitionError(null);
    setResolutionNote("");

    // Elegir primera transición válida
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
    setTransitionError(null);
  };

  const handleSaveStatus = () => {
    if (!editingIncident) return;

    if (
      !isValidIncidentTransition(editingIncident.status, selectedNextStatus)
    ) {
      setTransitionError(
        `No está permitida la transición de "${editingIncident.status}" a "${selectedNextStatus}".`,
      );
      return;
    }

    onUpdateStatus(
      editingIncident.id,
      selectedNextStatus,
      resolutionNote.trim() || undefined,
    );
    handleCloseEdit();
  };

  return (
    <section aria-labelledby="incidents-heading" className="view-container">
      <div className="view-header">
        <div>
          <h2 id="incidents-heading" className="view-title">
            Gestión y Supervisión de Incidencias
          </h2>
          <p className="view-description">
            Monitoreo y resolución de problemas de movilidad, rampas
            inaccesibles, aceras y obras en Moncloa.
          </p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Reportadas</span>
          <span className="metric-value">{incidents.length}</span>
        </div>
        <div className="metric-card metric-card-warning">
          <span className="metric-label">Reportadas (Nuevas)</span>
          <span className="metric-value">{countPending}</span>
        </div>
        <div className="metric-card metric-card-info">
          <span className="metric-label">En Curso / Obras</span>
          <span className="metric-value">{countInProgress}</span>
        </div>
        <div className="metric-card metric-card-success">
          <span className="metric-label">Resueltas</span>
          <span className="metric-value">{countResolved}</span>
        </div>
      </div>

      <div className="filter-bar">
        <input
          aria-label="Buscar incidencias por título o descripción"
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
            <option value="all">Todos</option>
            <option value="reportada">Reportada</option>
            <option value="en_curso">En Curso</option>
            <option value="resuelta">Resuelta</option>
          </select>
        </div>

        <div className="select-group">
          <label className="filter-label" htmlFor="inc-severity-select">
            Severidad:
          </label>
          <select
            id="inc-severity-select"
            className="filter-select"
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value as IncidentSeverity | "all")
            }
          >
            <option value="all">Todas</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        <div className="select-group">
          <label className="filter-label" htmlFor="inc-type-select">
            Tipo:
          </label>
          <select
            id="inc-type-select"
            className="filter-select"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as IncidentType | "all")
            }
          >
            <option value="all">Todos</option>
            <option value="obra">Obra</option>
            <option value="desvio">Desvío</option>
            <option value="rampa_averiada">Rampa Averiada</option>
            <option value="acera_cortada">Acera Cortada</option>
            <option value="obstaculo_temporal">Obstáculo Temporal</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">ID / Título de Incidencia</th>
              <th scope="col">Tipo</th>
              <th scope="col">Severidad</th>
              <th scope="col">Estado</th>
              <th scope="col">Coordenadas</th>
              <th scope="col">Fecha de Reporte</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-message">
                  No hay incidencias que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filtered.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <div className="place-title-cell">
                      <strong className="place-name">{inc.title}</strong>
                      <span className="place-desc-subtle">
                        {inc.description}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="tag tag-inc-cat">{inc.type}</span>
                  </td>
                  <td>
                    <span
                      className={`tag tag-priority tag-priority-${inc.severity === "critica" ? "urgente" : inc.severity}`}
                    >
                      {inc.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`tag tag-inc-status tag-inc-status-${inc.status}`}
                    >
                      {inc.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="coords-cell">
                    {inc.coordinates.latitude.toFixed(4)},{" "}
                    {inc.coordinates.longitude.toFixed(4)}
                  </td>
                  <td className="date-cell">
                    {new Date(inc.reportedAt).toLocaleDateString("es-ES")}
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
              ).
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
