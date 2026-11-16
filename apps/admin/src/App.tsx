import { useState, type FC } from "react";
import type { AuditEntry, Incident, ManagedPlace, PlaceOperationalStatus, IncidentStatus } from "./types.ts";
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_INCIDENTS,
  INITIAL_MANAGED_PLACES,
} from "./data/initial-data.ts";
import { updateIncidentStatus, updatePlaceStatus } from "./domain/admin-service.ts";
import { Header } from "./components/Header.tsx";
import { PlacesView } from "./components/PlacesView.tsx";
import { IncidentsView } from "./components/IncidentsView.tsx";
import { TraceabilityView } from "./components/TraceabilityView.tsx";
import "./App.css";

type ActiveTab = "places" | "incidents" | "traceability";

export const App: FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("places");
  const [places, setPlaces] = useState<readonly ManagedPlace[]>(INITIAL_MANAGED_PLACES);
  const [incidents, setIncidents] = useState<readonly Incident[]>(INITIAL_INCIDENTS);
  const [auditLogs, setAuditLogs] = useState<readonly AuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdatePlaceStatus = (
    placeId: string,
    newStatus: PlaceOperationalStatus,
    reason?: string | undefined,
    newAccessibility?: ManagedPlace["accessibility"] | undefined
  ) => {
    const { updatedPlaces, auditEntry } = updatePlaceStatus(
      places,
      placeId,
      newStatus,
      "@admin.campus",
      reason,
      newAccessibility
    );
    setPlaces(updatedPlaces);
    setAuditLogs([auditEntry, ...auditLogs]);
    showNotification(`Lugar actualizado y registrado en auditoría.`);
  };

  const handleUpdateIncidentStatus = (
    incidentId: string,
    newStatus: IncidentStatus,
    resolutionNote?: string | undefined
  ) => {
    const { updatedIncidents, auditEntry } = updateIncidentStatus(
      incidents,
      incidentId,
      newStatus,
      "@admin.campus",
      resolutionNote
    );
    setIncidents(updatedIncidents);
    setAuditLogs([auditEntry, ...auditLogs]);
    showNotification(`Incidencia ${incidentId} actualizada y registrada en auditoría.`);
  };

  return (
    <div className="admin-app">
      <Header />

      <nav aria-label="Secciones del panel de administración" className="admin-nav">
        <div className="nav-container">
          <button
            className={`nav-tab ${activeTab === "places" ? "nav-tab-active" : ""}`}
            type="button"
            onClick={() => setActiveTab("places")}
          >
            <span className="tab-icon" aria-hidden="true">🏛️</span>
            <span>Lugares y Edificios</span>
            <span className="tab-counter">{places.length}</span>
          </button>

          <button
            className={`nav-tab ${activeTab === "incidents" ? "nav-tab-active" : ""}`}
            type="button"
            onClick={() => setActiveTab("incidents")}
          >
            <span className="tab-icon" aria-hidden="true">⚠️</span>
            <span>Incidencias de Movilidad</span>
            <span className="tab-counter">{incidents.length}</span>
          </button>

          <button
            className={`nav-tab ${activeTab === "traceability" ? "nav-tab-active" : ""}`}
            type="button"
            onClick={() => setActiveTab("traceability")}
          >
            <span className="tab-icon" aria-hidden="true">📜</span>
            <span>Trazabilidad y Auditoría</span>
            <span className="tab-counter">{auditLogs.length}</span>
          </button>
        </div>
      </nav>

      {notification && (
        <aside className="toast-notification" role="status">
          <span className="toast-icon" aria-hidden="true">✓</span>
          <span>{notification}</span>
        </aside>
      )}

      <main className="admin-main">
        {activeTab === "places" && (
          <PlacesView places={places} onUpdateStatus={handleUpdatePlaceStatus} />
        )}

        {activeTab === "incidents" && (
          <IncidentsView incidents={incidents} onUpdateStatus={handleUpdateIncidentStatus} />
        )}

        {activeTab === "traceability" && (
          <TraceabilityView auditLogs={auditLogs} />
        )}
      </main>

      <footer className="admin-footer">
        <p>
          UniMovil · Universidad Complutense de Madrid (Campus de Moncloa) · Sprint 2
        </p>
        <p className="footer-credits">
          Desarrollado para Ingeniería del Software 1 (UCM). Desarrollador Web Admin: @charliefox06.
        </p>
      </footer>
    </div>
  );
};

export default App;
