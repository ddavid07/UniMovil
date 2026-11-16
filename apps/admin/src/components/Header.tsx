import type { FC } from "react";

export const Header: FC = () => {
  return (
    <header className="admin-header">
      <div className="header-brand">
        <div className="brand-logo-container">
          <img
            alt="Universidad Complutense de Madrid"
            className="header-logo"
            src="/images/ucm-logo-secondary.jpg"
          />
        </div>
        <div>
          <h1 className="header-title">UniMovil · Portal de Administración</h1>
          <p className="header-subtitle">
            Gestión de Movilidad, Accesibilidad e Incidencias del Campus de Moncloa
          </p>
        </div>
      </div>

      <div className="header-meta">
        <div className="user-badge" title="Sesión activa verificada">
          <span className="user-avatar" aria-hidden="true">AC</span>
          <div className="user-info">
            <span className="user-name">Administrador de Campus</span>
            <span className="user-handle">@admin.campus</span>
          </div>
          <span className="user-role">Administración UCM</span>
        </div>
        <div className="status-pill" title="Servicio operativo en campus Moncloa">
          <span className="status-dot" aria-hidden="true" />
          <span>Campus Moncloa Online</span>
        </div>
      </div>
    </header>
  );
};
