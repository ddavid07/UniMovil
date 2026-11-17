import { useState, type FC } from "react";
import type {
  Announcement,
  AnnouncementPriority,
  AnnouncementScope,
} from "../types.ts";
import { filterAnnouncements } from "../domain/admin-service.ts";

interface AnnouncementsViewProps {
  readonly announcements: readonly Announcement[];
  readonly onCreateAnnouncement: (
    input: Omit<Announcement, "id" | "createdAt">,
  ) => void;
}

export const AnnouncementsView: FC<AnnouncementsViewProps> = ({
  announcements,
  onCreateAnnouncement,
}) => {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    AnnouncementPriority | "all"
  >("all");
  const [scopeFilter, setScopeFilter] = useState<AnnouncementScope | "all">(
    "all",
  );

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<AnnouncementPriority>("alta");
  const [newScope, setNewScope] = useState<AnnouncementScope>("campus");
  const [newTargetLocation, setNewTargetLocation] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = filterAnnouncements(announcements, {
    query,
    priority: priorityFilter,
    scope: scopeFilter,
  });

  const countUrgent = announcements.filter(
    (a) => a.priority === "urgente",
  ).length;
  const countTransit = announcements.filter(
    (a) => a.scope === "transit",
  ).length;

  const handleOpenCreate = () => {
    setIsCreating(true);
    setFormError(null);
    setNewTitle("");
    setNewDescription("");
    setNewPriority("alta");
    setNewScope("campus");
    setNewTargetLocation("");
    setNewExpiresAt("");
  };

  const handleCloseCreate = () => {
    setIsCreating(false);
    setFormError(null);
  };

  const handleSaveAnnouncement = () => {
    if (!newTitle.trim()) {
      setFormError("El título del aviso es obligatorio.");
      return;
    }
    if (!newDescription.trim()) {
      setFormError("La descripción del aviso es obligatoria.");
      return;
    }

    onCreateAnnouncement({
      title: newTitle.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      scope: newScope,
      targetLocation: newTargetLocation.trim() || undefined,
      status: "published",
      publishedBy: "@admin.campus",
      expiresAt: (() => {
        if (!newExpiresAt) return undefined;
        const d = new Date(newExpiresAt);
        return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
      })(),
    });

    handleCloseCreate();
  };

  return (
    <section aria-labelledby="announcements-heading" className="view-container">
      <div className="view-header">
        <div>
          <h2 id="announcements-heading" className="view-title">
            Avisos y Alertas del Campus
          </h2>
          <p className="view-description">
            Emisión y supervisión de avisos urgentes sobre movilidad, cortes
            viales y servicio de transportes en Moncloa.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenCreate}
        >
          <span className="btn-icon" aria-hidden="true">
            📢
          </span>
          <span>Publicar Nuevo Aviso</span>
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Avisos Activos</span>
          <span className="metric-value">{announcements.length}</span>
        </div>
        <div className="metric-card metric-card-danger">
          <span className="metric-label">Avisos Urgentes</span>
          <span className="metric-value">{countUrgent}</span>
        </div>
        <div className="metric-card metric-card-info">
          <span className="metric-label">Transporte EMT</span>
          <span className="metric-value">{countTransit}</span>
        </div>
        <div className="metric-card metric-card-success">
          <span className="metric-label">Difusión Universitaria</span>
          <span className="metric-value">Activa</span>
        </div>
      </div>

      <div className="filter-bar">
        <input
          aria-label="Buscar avisos por título o descripción"
          className="search-input"
          placeholder="Buscar avisos por título, túnel, autobús..."
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="select-group">
          <label className="filter-label" htmlFor="ann-priority-select">
            Prioridad:
          </label>
          <select
            id="ann-priority-select"
            className="filter-select"
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as AnnouncementPriority | "all")
            }
          >
            <option value="all">Todas</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="informativa">Informativa</option>
          </select>
        </div>

        <div className="select-group">
          <label className="filter-label" htmlFor="ann-scope-select">
            Ámbito:
          </label>
          <select
            id="ann-scope-select"
            className="filter-select"
            value={scopeFilter}
            onChange={(e) =>
              setScopeFilter(e.target.value as AnnouncementScope | "all")
            }
          >
            <option value="all">Todos los ámbitos</option>
            <option value="campus">Campus General</option>
            <option value="transit">Transporte EMT</option>
            <option value="building">Edificio / Facultad</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Aviso / Título</th>
              <th scope="col">Ámbito y Ubicación</th>
              <th scope="col">Prioridad</th>
              <th scope="col">Estado</th>
              <th scope="col">Publicado Por</th>
              <th scope="col">Vigencia</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-message">
                  No hay avisos que coincidan con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map((ann) => (
                <tr key={ann.id}>
                  <td>
                    <div className="incident-title-cell">
                      <span className="incident-id">{ann.id}</span>
                      <strong className="place-name">{ann.title}</strong>
                      <span className="place-desc">{ann.description}</span>
                    </div>
                  </td>
                  <td>
                    <div className="resource-cell">
                      <span className="tag tag-category">
                        {ann.scope === "transit"
                          ? "🚌 Transporte"
                          : ann.scope === "building"
                            ? "🏛️ Edificio"
                            : "🌐 Campus"}
                      </span>
                      {ann.targetLocation && (
                        <span className="location-name">
                          {ann.targetLocation}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`tag tag-priority tag-priority-${ann.priority}`}
                    >
                      {ann.priority.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="tag tag-status-active">PUBLICADO</span>
                  </td>
                  <td>
                    <span className="author-badge">{ann.publishedBy}</span>
                  </td>
                  <td>
                    <span className="report-date">
                      Hasta:{" "}
                      {ann.expiresAt
                        ? new Date(ann.expiresAt).toLocaleDateString("es-ES")
                        : "Indefinida"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isCreating && (
        <div className="modal-backdrop" role="presentation">
          <div
            aria-labelledby="ann-modal-title"
            aria-modal="true"
            className="modal-card"
            role="dialog"
          >
            <h3 id="ann-modal-title" className="modal-title">
              Publicar Nuevo Aviso de Campus
            </h3>
            <p className="modal-desc">
              Difusión de avisos sobre afecciones, cortes de viales o refuerzo
              de transporte.
            </p>

            {formError && (
              <div className="alert-error" role="alert">
                {formError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="ann-title-input" className="form-label">
                Título del Aviso:
              </label>
              <input
                id="ann-title-input"
                className="form-control"
                placeholder="Ej. Corte de carril en túnel de Medicina por obras"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ann-desc-input" className="form-label">
                Descripción Detallada e Itinerario Alternativo:
              </label>
              <textarea
                id="ann-desc-input"
                className="form-control"
                placeholder="Indica las causas del aviso, horario previsto y recomendaciones para PMR y peatones."
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>

            <div className="form-row" style={{ display: "flex", gap: "1rem" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label
                  htmlFor="ann-priority-select-modal"
                  className="form-label"
                >
                  Prioridad:
                </label>
                <select
                  id="ann-priority-select-modal"
                  className="form-control"
                  value={newPriority}
                  onChange={(e) =>
                    setNewPriority(e.target.value as AnnouncementPriority)
                  }
                >
                  <option value="urgente">Urgente</option>
                  <option value="alta">Alta</option>
                  <option value="informativa">Informativa</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="ann-scope-select-modal" className="form-label">
                  Ámbito de Difusión:
                </label>
                <select
                  id="ann-scope-select-modal"
                  className="form-control"
                  value={newScope}
                  onChange={(e) =>
                    setNewScope(e.target.value as AnnouncementScope)
                  }
                >
                  <option value="campus">Campus General</option>
                  <option value="transit">
                    Transporte EMT (Líneas / Paradas)
                  </option>
                  <option value="building">Edificio o Facultad</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ann-location-input" className="form-label">
                Ubicación / Punto Afectado:
              </label>
              <input
                id="ann-location-input"
                className="form-control"
                placeholder="Ej. Paso inferior Medicina, Parada 1688 Línea G..."
                type="text"
                value={newTargetLocation}
                onChange={(e) => setNewTargetLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ann-expires-input" className="form-label">
                Fecha Límite de Vigencia (Opcional):
              </label>
              <input
                id="ann-expires-input"
                className="form-control"
                type="date"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleCloseCreate}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSaveAnnouncement}
              >
                Publicar y Notificar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
