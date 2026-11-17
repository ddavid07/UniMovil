import { useState, type FC } from "react";
import type { PlaceCategory } from "@unimovil/contracts";
import type { ManagedPlace, PlaceOperationalStatus } from "../types.ts";
import { filterPlaces } from "../domain/admin-service.ts";

interface PlacesViewProps {
  readonly places: readonly ManagedPlace[];
  readonly onUpdateStatus: (
    placeId: string,
    newStatus: PlaceOperationalStatus,
    reason?: string | undefined,
    newAccessibility?: ManagedPlace["accessibility"] | undefined,
  ) => void;
}

export const PlacesView: FC<PlacesViewProps> = ({ places, onUpdateStatus }) => {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | "all">(
    "all",
  );
  const [accessFilter, setAccessFilter] = useState<
    ManagedPlace["accessibility"] | "all"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    PlaceOperationalStatus | "all"
  >("all");

  const [editingPlace, setEditingPlace] = useState<ManagedPlace | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<PlaceOperationalStatus>("active");
  const [selectedAccess, setSelectedAccess] =
    useState<ManagedPlace["accessibility"]>("yes");
  const [statusReason, setStatusReason] = useState("");

  const filtered = filterPlaces(places, {
    query,
    category: categoryFilter,
    accessibility: accessFilter,
    status: statusFilter,
  });

  const handleOpenEdit = (place: ManagedPlace) => {
    setEditingPlace(place);
    setSelectedStatus(place.status);
    setSelectedAccess(place.accessibility);
    setStatusReason(place.statusReason ?? "");
  };

  const handleCloseEdit = () => {
    setEditingPlace(null);
    setStatusReason("");
  };

  const handleSaveStatus = () => {
    if (!editingPlace) return;
    onUpdateStatus(
      editingPlace.id,
      selectedStatus,
      statusReason.trim() || undefined,
      selectedAccess,
    );
    handleCloseEdit();
  };

  return (
    <section aria-labelledby="places-heading" className="view-container">
      <div className="view-header">
        <div>
          <h2 id="places-heading" className="view-title">
            Gestión de Edificios y Lugares
          </h2>
          <p className="view-description">
            Catálogo oficial de centros universitarios, accesos, facultades y
            recursos de movilidad de Moncloa.
          </p>
        </div>
        <div className="metrics-badge">
          <span>
            {filtered.length} de {places.length} lugares
          </span>
        </div>
      </div>

      <div className="filter-bar">
        <input
          aria-label="Buscar lugar por nombre o alias"
          className="search-input"
          placeholder="Buscar facultad, biblioteca, metro..."
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="select-group">
          <label className="filter-label" htmlFor="category-select">
            Categoría:
          </label>
          <select
            id="category-select"
            className="filter-select"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as PlaceCategory | "all")
            }
          >
            <option value="all">Todas</option>
            <option value="building">Edificios / Facultades</option>
            <option value="transport">Transporte / Metro</option>
            <option value="parking">Aparcamientos</option>
            <option value="bicycle">Bicicletas</option>
            <option value="service">Servicios</option>
            <option value="entrance">Accesos</option>
          </select>
        </div>

        <div className="select-group">
          <label className="filter-label" htmlFor="access-select">
            Accesibilidad PMR:
          </label>
          <select
            id="access-select"
            className="filter-select"
            value={accessFilter}
            onChange={(e) =>
              setAccessFilter(
                e.target.value as ManagedPlace["accessibility"] | "all",
              )
            }
          >
            <option value="all">Todos</option>
            <option value="yes">Adaptado (Sí)</option>
            <option value="limited">Limitado</option>
            <option value="no">Sin adaptar (No)</option>
            <option value="unknown">Por verificar</option>
          </select>
        </div>

        <div className="select-group">
          <label className="filter-label" htmlFor="status-select">
            Estado Operativo:
          </label>
          <select
            id="status-select"
            className="filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as PlaceOperationalStatus | "all")
            }
          >
            <option value="all">Todos</option>
            <option value="active">Activo</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Nombre del Lugar</th>
              <th scope="col">Categoría</th>
              <th scope="col">Accesibilidad PMR</th>
              <th scope="col">Estado</th>
              <th scope="col">Coordenadas</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-message">
                  No se encontraron lugares con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filtered.map((place) => (
                <tr key={place.id}>
                  <td>
                    <div className="place-name-cell">
                      <span className="place-name">{place.name}</span>
                      {place.description && (
                        <span className="place-desc">{place.description}</span>
                      )}
                      {place.statusReason && (
                        <span className="place-reason">
                          Motivo: {place.statusReason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="tag tag-category">{place.category}</span>
                  </td>
                  <td>
                    <span
                      className={`tag tag-access tag-access-${place.accessibility}`}
                    >
                      {place.accessibility === "yes" && "✓ Adaptado"}
                      {place.accessibility === "limited" && "⚠ Limitado"}
                      {place.accessibility === "no" && "✗ No adaptado"}
                      {place.accessibility === "unknown" && "? Desconocido"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`tag tag-status tag-status-${place.status}`}
                    >
                      {place.status === "active" && "Activo"}
                      {place.status === "maintenance" && "En Mantenimiento"}
                      {place.status === "inactive" && "Inactivo"}
                    </span>
                  </td>
                  <td className="coords-cell">
                    {place.coordinates.latitude.toFixed(4)},{" "}
                    {place.coordinates.longitude.toFixed(4)}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => handleOpenEdit(place)}
                    >
                      Modificar Estado
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingPlace && (
        <div className="modal-backdrop" role="presentation">
          <div
            aria-labelledby="modal-title"
            aria-modal="true"
            className="modal-card"
            role="dialog"
          >
            <h3 id="modal-title" className="modal-title">
              Gestionar Estado y Accesibilidad: {editingPlace.name}
            </h3>
            <p className="modal-desc">
              Esta modificación quedará auditada en el registro de trazabilidad
              con tu identificador (@admin.campus).
            </p>

            <div className="form-group">
              <label htmlFor="modal-status-select" className="form-label">
                Estado Operativo:
              </label>
              <select
                id="modal-status-select"
                className="form-control"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as PlaceOperationalStatus)
                }
              >
                <option value="active">
                  Activo (Operativo en mapa y rutas)
                </option>
                <option value="maintenance">
                  En Mantenimiento (Avisos de obras / accesos restringidos)
                </option>
                <option value="inactive">
                  Inactivo (Excluido de cálculo de rutas)
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="modal-access-select" className="form-label">
                Accesibilidad PMR:
              </label>
              <select
                id="modal-access-select"
                className="form-control"
                value={selectedAccess}
                onChange={(e) =>
                  setSelectedAccess(
                    e.target.value as ManagedPlace["accessibility"],
                  )
                }
              >
                <option value="yes">
                  ✓ Adaptado (Rampa o ascensor operativo)
                </option>
                <option value="limited">
                  ⚠ Limitado (Acceso parcial / obras temporales)
                </option>
                <option value="no">
                  ✗ No adaptado (Escaleras sin salvar / barreras)
                </option>
                <option value="unknown">
                  ? Desconocido (Pendiente de verificación)
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="modal-reason" className="form-label">
                Motivo u Observación técnica:
              </label>
              <textarea
                id="modal-reason"
                className="form-control"
                placeholder="Ejemplo: Sustitución de salvaescaleras o desvío provisional por obras."
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
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
                Confirmar y Registrar Cambio
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
