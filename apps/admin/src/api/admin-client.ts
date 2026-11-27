import type {
  AccountRole,
  AdminIncidentDetail,
  AdminIncidentPublicationInput,
  AdminIncidentQueueQuery,
  AdminIncidentSummary,
  AdminIncidentTransitionInput,
  AdminIncidentUpdateInput,
  AuditEventRecord,
  AuditQueryInput,
  ManagerSummary,
} from '@unimovil/contracts';

export interface SessionUser {
  id: string;
  email: string | null;
  role: AccountRole;
}

export class AdminApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function resolveApiBaseUrl(configured?: string): string {
  const value = configured?.trim();
  return value ? value.replace(/\/+$/, '') : '/api';
}

const API_BASE_URL = resolveApiBaseUrl(import.meta.env?.VITE_API_URL);

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message.join(' ');
    }
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
  } catch {
    // Ignore malformed JSON bodies and fall back to status-based Spanish messages.
  }
  if (response.status === 401) return 'Tu sesión ha caducado. Inicia sesión de nuevo.';
  if (response.status === 403)
    return 'No tienes permisos suficientes para esta operación.';
  if (response.status === 409)
    return 'La incidencia se actualizó mientras la consultabas. Recarga el detalle.';
  return 'No se pudo completar la operación con el servidor.';
}

async function apiJson<T>(
  path: string,
  init: RequestInit = {},
  fetchImpl: typeof fetch = fetch,
): Promise<T> {
  const response = await fetchImpl(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new AdminApiError(response.status, await parseErrorMessage(response));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function buildSearchParams(
  entries: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
}

export const adminApiClient = {
  getSession(fetchImpl?: typeof fetch) {
    return apiJson<{ user: SessionUser | null }>('/auth/session', {}, fetchImpl);
  },

  signIn(email: string, password: string, fetchImpl?: typeof fetch) {
    return apiJson<{ user: SessionUser }>(
      '/auth/sign-in',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      fetchImpl,
    );
  },

  signOut(fetchImpl?: typeof fetch) {
    return apiJson<void>('/auth/sign-out', { method: 'POST' }, fetchImpl);
  },

  listManagers(fetchImpl?: typeof fetch) {
    return apiJson<{ managers: ManagerSummary[] }>('/admin/managers', {}, fetchImpl);
  },

  listIncidents(query: Partial<AdminIncidentQueueQuery>, fetchImpl?: typeof fetch) {
    const suffix = buildSearchParams({
      status: query.status,
      category: query.category,
      assignedTo: query.assignedTo,
      visibility: query.visibility,
      includeClosedOrResolved: query.includeClosedOrResolved,
      page: query.page,
      limit: query.limit,
    });
    return apiJson<{
      incidents: AdminIncidentSummary[];
      page: number;
      limit: number;
      total: number;
    }>(`/admin/incidents${suffix}`, {}, fetchImpl);
  },

  getIncidentDetail(incidentId: string, fetchImpl?: typeof fetch) {
    return apiJson<{ incident: AdminIncidentDetail }>(
      `/admin/incidents/${encodeURIComponent(incidentId)}`,
      {},
      fetchImpl,
    );
  },

  updateIncident(
    incidentId: string,
    payload: AdminIncidentUpdateInput,
    fetchImpl?: typeof fetch,
  ) {
    return apiJson<{ incident: AdminIncidentDetail }>(
      `/admin/incidents/${encodeURIComponent(incidentId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      fetchImpl,
    );
  },

  transitionIncident(
    incidentId: string,
    payload: AdminIncidentTransitionInput,
    fetchImpl?: typeof fetch,
  ) {
    return apiJson<{ incident: AdminIncidentDetail }>(
      `/admin/incidents/${encodeURIComponent(incidentId)}/transitions`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      fetchImpl,
    );
  },

  moderatePublication(
    incidentId: string,
    payload: AdminIncidentPublicationInput,
    fetchImpl?: typeof fetch,
  ) {
    return apiJson<{ incident: AdminIncidentDetail }>(
      `/admin/incidents/${encodeURIComponent(incidentId)}/publication`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      fetchImpl,
    );
  },

  async fetchEvidenceBlob(
    incidentId: string,
    attachmentId: string,
    fetchImpl: typeof fetch = fetch,
  ): Promise<Blob> {
    const response = await fetchImpl(
      `${API_BASE_URL}/admin/incidents/${encodeURIComponent(incidentId)}/attachments/${encodeURIComponent(attachmentId)}`,
      { credentials: 'include' },
    );
    if (!response.ok) {
      throw new AdminApiError(response.status, await parseErrorMessage(response));
    }
    return response.blob();
  },

  listAuditEvents(query: Partial<AuditQueryInput>, fetchImpl?: typeof fetch) {
    const suffix = buildSearchParams({
      actorId: query.actorId,
      action: query.action,
      entityType: query.entityType,
      entityId: query.entityId,
      outcome: query.outcome,
      from: query.from,
      to: query.to,
      page: query.page,
      limit: query.limit,
    });
    return apiJson<{
      events: AuditEventRecord[];
      page: number;
      limit: number;
      total: number;
    }>(`/admin/audit-events${suffix}`, {}, fetchImpl);
  },
};
