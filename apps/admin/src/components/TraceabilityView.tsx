import { useState, type FC } from "react";
import type { AuditEntry, AuditResource } from "@unimovil/contracts";
import { filterAuditEntries } from "../domain/admin-service.ts";

interface TraceabilityViewProps {
  readonly auditLogs: readonly AuditEntry[];
}

function formatAccessibility(val: unknown): string {
  if (val === "yes") return "Adaptado";
  if (val === "limited") return "Limitado";
  if (val === "no") return "No adaptado";
  if (val === "unknown") return "Desconocido";
  return String(val);
}

function getNote(details: Record<string, unknown>): string | null {
  if (typeof details.resolutionNote === "string") return details.resolutionNote;
  if (typeof details.reason === "string") return details.reason;
  return null;
}

const TimestampCell: FC<{ readonly timestamp: string }> = ({ timestamp }) => {
  const d = new Date(timestamp);
  const isValid = !Number.isNaN(d.getTime());
  const dateStr = isValid
    ? d
        .toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(".", "")
    : "Fecha inválida";
  const timeStr = isValid
    ? d.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    <div
      className="timestamp-chip"
      title={isValid ? d.toLocaleString("es-ES") : timestamp}
    >
      <div className="timestamp-row timestamp-row-date">
        <svg
          className="timestamp-icon"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="timestamp-date">{dateStr}</span>
      </div>
      <div className="timestamp-row timestamp-row-time">
        <svg
          className="timestamp-icon"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="timestamp-time">{timeStr}</span>
      </div>
    </div>
  );
};

const AuditDetailsCell: FC<{
  readonly details?: Record<string, unknown> | undefined;
}> = ({ details }) => {
  const [showRaw, setShowRaw] = useState(false);

  if (!details || Object.keys(details).length === 0) {
    return <span className="details-empty">—</span>;
  }

  const prevStatus =
    typeof details.previousStatus === "string" ? details.previousStatus : null;
  const nextStatus =
    typeof details.newStatus === "string" ? details.newStatus : null;
  const statusChanged = Boolean(
    prevStatus && nextStatus && prevStatus !== nextStatus,
  );

  const prevAccess =
    typeof details.previousAccessibility === "string"
      ? details.previousAccessibility
      : null;
  const nextAccess =
    typeof details.newAccessibility === "string"
      ? details.newAccessibility
      : null;
  const accessChanged = Boolean(
    prevAccess && nextAccess && prevAccess !== nextAccess,
  );

  const note = getNote(details);

  return (
    <div className="audit-details-container">
      {statusChanged && prevStatus && nextStatus ? (
        <div className="diff-pill-group">
          <span className="diff-label">Estado:</span>
          <span className="diff-chip diff-chip-old">
            {prevStatus.replace("_", " ")}
          </span>
          <span className="diff-arrow" aria-hidden="true">
            ➔
          </span>
          <span className="diff-chip diff-chip-new">
            {nextStatus.replace("_", " ")}
          </span>
        </div>
      ) : null}

      {accessChanged && prevAccess && nextAccess ? (
        <div className="diff-pill-group">
          <span className="diff-label">Accesibilidad:</span>
          <span className="diff-chip diff-chip-old">
            {formatAccessibility(prevAccess)}
          </span>
          <span className="diff-arrow" aria-hidden="true">
            ➔
          </span>
          <span className="diff-chip diff-chip-new">
            {formatAccessibility(nextAccess)}
          </span>
        </div>
      ) : null}

      {!statusChanged && !accessChanged && nextStatus ? (
        <div className="diff-pill-group">
          <span className="diff-label">Estado:</span>
          <span className="diff-chip diff-chip-new">
            {nextStatus.replace("_", " ")}
          </span>
        </div>
      ) : null}

      {details.priority || details.scope ? (
        <div className="diff-pill-group">
          {details.priority ? (
            <>
              <span className="diff-label">Prioridad:</span>
              <span className="diff-chip diff-chip-new">
                {String(details.priority)}
              </span>
            </>
          ) : null}
          {details.scope ? (
            <>
              <span className="diff-label">Ámbito:</span>
              <span className="diff-chip diff-chip-old">
                {String(details.scope)}
              </span>
            </>
          ) : null}
        </div>
      ) : null}

      {typeof details.assignedTo === "string" && details.assignedTo ? (
        <div className="diff-note">
          <span className="diff-note-label">Asignado:</span>{" "}
          {details.assignedTo}
        </div>
      ) : null}

      {note ? (
        <div className="diff-note">
          <span className="diff-note-label">Nota:</span> {note}
        </div>
      ) : null}

      <div className="diff-raw-toggle">
        <button
          type="button"
          className="btn-link-raw"
          onClick={() => setShowRaw(!showRaw)}
        >
          {showRaw ? "▲ Ocultar JSON" : "▼ Ver JSON"}
        </button>
        {showRaw ? (
          <pre className="details-json">{JSON.stringify(details, null, 2)}</pre>
        ) : null}
      </div>
    </div>
  );
};

export const TraceabilityView: FC<TraceabilityViewProps> = ({ auditLogs }) => {
  const [resourceFilter, setResourceFilter] = useState<AuditResource | "all">(
    "all",
  );
  const [authorQuery, setAuthorQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = filterAuditEntries(auditLogs, resourceFilter, authorQuery);
  const hasMore = filtered.length > 4;
  const displayedLogs = showAll ? filtered : filtered.slice(0, 4);

  return (
    <section aria-labelledby="traceability-heading" className="view-container">
      <div className="view-header">
        <div>
          <h2 id="traceability-heading" className="view-title">
            Trazabilidad y Auditoría de Cambios
          </h2>
          <p className="view-description">
            Registro inmutable de modificaciones sobre información sensible del
            campus (lugares, incidencias, accesibilidad).
          </p>
        </div>
        <div
          className="security-notice"
          title="Conforme a directrices de seguridad y privacidad"
        >
          <span className="security-icon" aria-hidden="true">
            🛡️
          </span>
          <span>Protección de Secretos Activa</span>
        </div>
      </div>

      <div className="filter-bar">
        <div className="select-group">
          <label className="filter-label" htmlFor="audit-resource-select">
            Recurso Afectado:
          </label>
          <select
            id="audit-resource-select"
            className="filter-select"
            value={resourceFilter}
            onChange={(e) =>
              setResourceFilter(e.target.value as AuditResource | "all")
            }
          >
            <option value="all">Todos los recursos</option>
            <option value="place">Lugares y Edificios</option>
            <option value="incident">Incidencias de Movilidad</option>
            <option value="accessibility">Accesibilidad PMR</option>
            <option value="route">Rutas y Caminos</option>
            <option value="announcement">Avisos</option>
          </select>
        </div>

        <input
          aria-label="Filtrar por autor"
          className="search-input"
          placeholder="Filtrar por autor (@admin.campus, @charliefox06...)"
          type="search"
          value={authorQuery}
          onChange={(e) => setAuthorQuery(e.target.value)}
        />

        <div className="metrics-badge">
          <span>{filtered.length} eventos registrados</span>
        </div>
      </div>

      <div
        className={`table-wrapper ${showAll ? "table-wrapper-scrollable" : ""}`}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Fecha y Hora</th>
              <th scope="col">Acción</th>
              <th scope="col">Recurso / ID</th>
              <th scope="col">Autor Responsable</th>
              <th scope="col">Descripción del Cambio</th>
              <th scope="col">Detalles Técnicos</th>
            </tr>
          </thead>
          <tbody>
            {displayedLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-message">
                  No hay registros de auditoría que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              displayedLogs.map((log) => (
                <tr key={log.id}>
                  <td className="col-timestamp">
                    <TimestampCell timestamp={log.timestamp} />
                  </td>
                  <td>
                    <span className={`tag tag-action tag-action-${log.action}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className="resource-cell">
                      <span className="resource-name">{log.resource}</span>
                      <code className="resource-id">{log.resourceId}</code>
                    </div>
                  </td>
                  <td>
                    <span className="author-badge">{log.author}</span>
                  </td>
                  <td>
                    <span className="log-summary">{log.summary}</span>
                  </td>
                  <td>
                    <AuditDetailsCell details={log.details} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {hasMore && (
            <tfoot>
              <tr className="table-row-expandable">
                <td colSpan={6} className="table-cell-expandable">
                  <button
                    type="button"
                    className="btn-table-expand"
                    onClick={() => setShowAll(!showAll)}
                  >
                    <span className="expand-main">
                      <span className="expand-chevron" aria-hidden="true">
                        {showAll ? "▴" : "▾"}
                      </span>
                      <span>
                        {showAll
                          ? "Mostrar solo los 4 eventos más recientes"
                          : `Ver historial anterior (${filtered.length - 4} eventos más)`}
                      </span>
                    </span>
                    <span className="expand-badge">
                      {showAll
                        ? `Mostrando ${filtered.length} de ${filtered.length}`
                        : `Mostrando 4 de ${filtered.length}`}
                    </span>
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
};
