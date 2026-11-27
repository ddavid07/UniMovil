import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  incidentCategories,
  incidentPriorities,
  type AdminIncidentDetail,
  type ClosureKind,
  type IncidentCategory,
  type IncidentPriority,
  type IncidentStatus,
  type IncidentVisibility,
  type ManagerSummary,
} from '@unimovil/contracts';
import { adminApiClient } from '../api/admin-client';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  VISIBILITY_LABELS,
  formatLocalDateTime,
  getAllowedTargetStatuses,
  validatePublicationDraft,
  validateTransitionDraft,
} from '../domain/incident-admin';

interface IncidentDetailPanelProps {
  incident: AdminIncidentDetail | null;
  managers: readonly ManagerSummary[];
  loading: boolean;
  error: string;
  onReload: () => void;
  onIncidentUpdated: (updated: AdminIncidentDetail, notice: string) => void;
}

export function IncidentDetailPanel({
  incident,
  managers,
  loading,
  error,
  onReload,
  onIncidentUpdated,
}: IncidentDetailPanelProps) {
  const [category, setCategory] = useState<IncidentCategory>('other');
  const [managementPriority, setManagementPriority] = useState<IncidentPriority | ''>(
    '',
  );
  const [assignedTo, setAssignedTo] = useState('');
  const [toStatus, setToStatus] = useState<IncidentStatus | ''>('');
  const [closureKind, setClosureKind] = useState<ClosureKind>('invalid');
  const [duplicateOfIncidentId, setDuplicateOfIncidentId] = useState('');
  const [reason, setReason] = useState('');
  const [informantResponse, setInformantResponse] = useState('');
  const [publicSummary, setPublicSummary] = useState('');
  const [approximateZone, setApproximateZone] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [actionError, setActionError] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<Record<string, string>>({});
  const evidenceUrlsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    evidenceUrlsRef.current = evidenceUrls;
  }, [evidenceUrls]);

  useEffect(() => {
    if (!incident) return;
    setCategory(incident.category);
    setManagementPriority(incident.managementPriority ?? '');
    setAssignedTo(incident.assignedTo ?? '');
    const allowedTargets = getAllowedTargetStatuses(incident.status);
    setToStatus(allowedTargets[0] ?? '');
    setClosureKind(incident.status === 'resolved' ? 'resolved' : 'invalid');
    setDuplicateOfIncidentId('');
    setReason('');
    setInformantResponse('');
    setPublicSummary(incident.publicSummary ?? '');
    setApproximateZone(incident.approximateZone ?? '');
    setActionError('');
  }, [incident]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(evidenceUrlsRef.current)) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  if (loading) {
    return (
      <section className="card">
        <p aria-live="polite" className="muted-text">
          Cargando detalle de la incidencia...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <div role="alert" className="alert-error">
          <p style={{ margin: '0 0 0.5rem' }}>{error}</p>
          <button type="button" className="button button-secondary" onClick={onReload}>
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  if (!incident) {
    return (
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Detalle de revisión</h2>
        <p className="muted-text">
          Selecciona una incidencia de la cola para revisar su información,
          evidencias privadas, confirmaciones agregadas y moderación.
        </p>
      </section>
    );
  }

  const allowedTransitions = getAllowedTargetStatuses(incident.status);

  async function handleSaveClassification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!incident) return;
    setActionError('');
    setBusyAction('classification');
    try {
      const response = await adminApiClient.updateIncident(incident.id, {
        expectedRevision: incident.revision,
        category,
        managementPriority: managementPriority || null,
        assignedTo: assignedTo || null,
      });
      onIncidentUpdated(
        response.incident,
        'Clasificación y asignación actualizadas.',
      );
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : 'No se pudo actualizar la incidencia.',
      );
    } finally {
      setBusyAction('');
    }
  }

  async function handleTransition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!incident || !toStatus) return;
    const validationError = validateTransitionDraft(incident, {
      toStatus,
      closureKind,
      duplicateOfIncidentId,
      reason,
      informantResponse,
    });
    if (validationError) {
      setActionError(validationError);
      return;
    }
    setActionError('');
    setBusyAction('transition');
    try {
      const response = await adminApiClient.transitionIncident(incident.id, {
        expectedRevision: incident.revision,
        toStatus,
        closureKind: toStatus === 'closed' ? closureKind : undefined,
        duplicateOfIncidentId:
          toStatus === 'closed' && closureKind === 'duplicate'
            ? duplicateOfIncidentId.trim()
            : undefined,
        reason: reason.trim() || undefined,
        informantResponse: informantResponse.trim() || undefined,
      });
      onIncidentUpdated(
        response.incident,
        `Estado actualizado a «${STATUS_LABELS[toStatus]}».`,
      );
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : 'No se pudo cambiar el estado.',
      );
    } finally {
      setBusyAction('');
    }
  }

  async function handlePublication(nextVisibility: IncidentVisibility) {
    if (!incident) return;
    const validationError = validatePublicationDraft(
      nextVisibility,
      publicSummary,
      approximateZone,
    );
    if (validationError) {
      setActionError(validationError);
      return;
    }
    setActionError('');
    setBusyAction('publication');
    try {
      const response = await adminApiClient.moderatePublication(incident.id, {
        expectedRevision: incident.revision,
        visibility: nextVisibility,
        publicSummary:
          nextVisibility === 'published' ? publicSummary.trim() : undefined,
        approximateZone:
          nextVisibility === 'published' ? approximateZone.trim() : undefined,
      });
      onIncidentUpdated(
        response.incident,
        nextVisibility === 'published'
          ? 'Proyección pública aprobada y publicada.'
          : 'Publicación retirada; el estado operativo se conserva.',
      );
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : 'No se pudo actualizar la publicación.',
      );
    } finally {
      setBusyAction('');
    }
  }

  async function handleLoadEvidence(attachmentId: string) {
    if (!incident) return;
    setActionError('');
    setBusyAction(`evidence-${attachmentId}`);
    try {
      const blob = await adminApiClient.fetchEvidenceBlob(incident.id, attachmentId);
      const objectUrl = URL.createObjectURL(blob);
      setEvidenceUrls((prev) => {
        if (prev[attachmentId]) URL.revokeObjectURL(prev[attachmentId]);
        return { ...prev, [attachmentId]: objectUrl };
      });
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : 'No se pudo cargar la evidencia privada.',
      );
    } finally {
      setBusyAction('');
    }
  }

  return (
    <section className="card section-stack" aria-labelledby="detail-heading">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 id="detail-heading" style={{ margin: 0 }}>
            Detalle · {incident.publicId}
          </h2>
          <p className="muted-text" style={{ margin: '0.2rem 0 0' }}>
            Estado: {STATUS_LABELS[incident.status]} ·{' '}
            {VISIBILITY_LABELS[incident.visibility]} · Revisión {incident.revision}
          </p>
        </div>
        <button type="button" className="button button-secondary" onClick={onReload}>
          Recargar
        </button>
      </div>

      {actionError ? (
        <div role="alert" className="alert-error">
          {actionError}
        </div>
      ) : null}

      <dl className="meta-grid">
        <div>
          <dt>Prioridad percibida por el informante</dt>
          <dd>
            {incident.perceivedPriority
              ? PRIORITY_LABELS[incident.perceivedPriority]
              : 'No indicada'}
          </dd>
        </div>
        <div>
          <dt>Prioridad de gestión</dt>
          <dd>
            {incident.managementPriority
              ? PRIORITY_LABELS[incident.managementPriority]
              : 'Sin asignar'}
          </dd>
        </div>
        <div>
          <dt>Ubicación declarada</dt>
          <dd>
            {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
          </dd>
        </div>
        <div>
          <dt>Última actualización</dt>
          <dd>{formatLocalDateTime(incident.updatedAt)}</dd>
        </div>
        <div>
          <dt>Confirmaciones vigentes (30 días)</dt>
          <dd>
            Sigue activa: {incident.confirmationSummary.stillActiveCount} ·
            Solucionada: {incident.confirmationSummary.resolvedCount}
            {incident.confirmationSummary.lastConfirmedAt
              ? ` (última: ${formatLocalDateTime(incident.confirmationSummary.lastConfirmedAt)})`
              : ''}
          </dd>
        </div>
      </dl>

      <div>
        <h3 style={{ marginBottom: '0.35rem' }}>Descripción original (privada)</h3>
        <p style={{ margin: 0 }}>{incident.description}</p>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.35rem' }}>
          Evidencias privadas ({incident.attachments.length})
        </h3>
        {incident.attachments.length === 0 ? (
          <p className="muted-text">No hay imágenes adjuntas.</p>
        ) : (
          <ul className="queue-list">
            {incident.attachments.map((attachment, index) => (
              <li key={attachment.id} className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>
                    Evidencia {index + 1} · {(attachment.byteSize / 1024).toFixed(1)} KiB
                  </span>
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={busyAction === `evidence-${attachment.id}`}
                    onClick={() => void handleLoadEvidence(attachment.id)}
                  >
                    {busyAction === `evidence-${attachment.id}`
                      ? 'Cargando...'
                      : 'Ver evidencia (deja registro en auditoría)'}
                  </button>
                </div>
                {evidenceUrls[attachment.id] ? (
                  <img
                    className="evidence-preview"
                    src={evidenceUrls[attachment.id]}
                    alt={`Evidencia privada ${index + 1} de la incidencia ${incident.publicId}`}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="card section-stack" onSubmit={handleSaveClassification}>
        <h3 style={{ margin: 0 }}>Clasificación y asignación</h3>
        <div className="filters-grid">
          <div className="field">
            <label htmlFor="detail-category">Categoría</label>
            <select
              id="detail-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as IncidentCategory)
              }
            >
              {incidentCategories.map((item) => (
                <option key={item} value={item}>
                  {CATEGORY_LABELS[item]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="detail-management-priority">Prioridad de gestión</label>
            <select
              id="detail-management-priority"
              value={managementPriority}
              onChange={(event) =>
                setManagementPriority(event.target.value as IncidentPriority | '')
              }
            >
              <option value="">Sin definir</option>
              {incidentPriorities.map((item) => (
                <option key={item} value={item}>
                  {PRIORITY_LABELS[item]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="detail-assignee">Responsable (rol gestor)</label>
            <select
              id="detail-assignee"
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
            >
              <option value="">Sin asignar</option>
              {managers.map((manager) => (
                <option key={manager.userId} value={manager.userId}>
                  {manager.displayLabel}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="button button-primary"
          disabled={busyAction !== ''}
        >
          Guardar clasificación
        </button>
      </form>

      <form className="card section-stack" onSubmit={handleTransition}>
        <h3 style={{ margin: 0 }}>Cambio de estado operativo</h3>
        {allowedTransitions.length === 0 ? (
          <p className="muted-text" style={{ margin: 0 }}>
            La incidencia está cerrada; es un estado terminal y no admite más
            transiciones.
          </p>
        ) : (
          <>
            <div className="filters-grid">
              <div className="field">
                <label htmlFor="transition-target">Nuevo estado</label>
                <select
                  id="transition-target"
                  value={toStatus}
                  onChange={(event) =>
                    setToStatus(event.target.value as IncidentStatus)
                  }
                >
                  {allowedTransitions.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              {toStatus === 'closed' && incident.status !== 'resolved' ? (
                <div className="field">
                  <label htmlFor="transition-closure-kind">Motivo de cierre</label>
                  <select
                    id="transition-closure-kind"
                    value={closureKind}
                    onChange={(event) =>
                      setClosureKind(event.target.value as ClosureKind)
                    }
                  >
                    <option value="invalid">Inválida</option>
                    <option value="duplicate">Duplicada</option>
                  </select>
                </div>
              ) : null}

              {toStatus === 'closed' &&
              incident.status !== 'resolved' &&
              closureKind === 'duplicate' ? (
                <div className="field">
                  <label htmlFor="transition-duplicate-id">
                    UUID de la incidencia principal
                  </label>
                  <input
                    id="transition-duplicate-id"
                    type="text"
                    value={duplicateOfIncidentId}
                    onChange={(event) => setDuplicateOfIncidentId(event.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="transition-reason">
                Motivo (obligatorio al cerrar por duplicidad/invalidez o reabrir)
              </label>
              <input
                id="transition-reason"
                type="text"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="transition-response">
                Respuesta visible en el historial privado del informante
              </label>
              <textarea
                id="transition-response"
                rows={2}
                value={informantResponse}
                onChange={(event) => setInformantResponse(event.target.value)}
              />
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={busyAction !== ''}
            >
              Aplicar transición
            </button>
          </>
        )}
      </form>

      <div className="card section-stack">
        <h3 style={{ margin: 0 }}>Moderación de publicación pública</h3>
        <p className="muted-text" style={{ margin: 0 }}>
          La publicación es independiente del estado operativo y expone solo una
          proyección segura aprobada, sin informante ni evidencias.
        </p>

        <div className="field">
          <label htmlFor="public-summary">Resumen público aprobado</label>
          <textarea
            id="public-summary"
            rows={2}
            value={publicSummary}
            onChange={(event) => setPublicSummary(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="approximate-zone">Zona aproximada aprobada</label>
          <input
            id="approximate-zone"
            type="text"
            value={approximateZone}
            onChange={(event) => setApproximateZone(event.target.value)}
            placeholder="Ej.: Entorno de Facultad de Informática"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="button button-primary"
            disabled={busyAction !== ''}
            onClick={() => void handlePublication('published')}
          >
            Aprobar y publicar proyección
          </button>
          {incident.visibility === 'published' ? (
            <button
              type="button"
              className="button button-secondary"
              disabled={busyAction !== ''}
              onClick={() => void handlePublication('private')}
            >
              Retirar publicación
            </button>
          ) : null}
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.35rem' }}>Historial de cambios de estado</h3>
        {incident.statusHistory.length === 0 ? (
          <p className="muted-text">Todavía no hay transiciones registradas.</p>
        ) : (
          <ul className="queue-list">
            {incident.statusHistory.map((entry) => (
              <li key={entry.id} className="card">
                <strong>
                  {STATUS_LABELS[entry.fromStatus]} → {STATUS_LABELS[entry.toStatus]}
                </strong>{' '}
                <span className="muted-text">
                  ({formatLocalDateTime(entry.createdAt)} · rev. {entry.incidentRevision})
                </span>
                {entry.reason ? <div>Motivo: {entry.reason}</div> : null}
                {entry.informantResponse ? (
                  <div>Respuesta al informante: {entry.informantResponse}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
