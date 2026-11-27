import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { adminApiClient, AdminApiError, resolveApiBaseUrl } from '../src/api/admin-client';
import {
  canAccessAuditLog,
  canOperateManagementQueue,
  getAllowedTargetStatuses,
  validatePublicationDraft,
  validateTransitionDraft,
} from '../src/domain/incident-admin';

describe('admin domain helpers', () => {
  it('distinguishes manager and admin access capabilities', () => {
    assert.equal(canOperateManagementQueue('user'), false);
    assert.equal(canOperateManagementQueue('manager'), true);
    assert.equal(canOperateManagementQueue('admin'), true);

    assert.equal(canAccessAuditLog('user'), false);
    assert.equal(canAccessAuditLog('manager'), false);
    assert.equal(canAccessAuditLog('admin'), true);
  });

  it('exposes only valid target statuses and enforces transition preconditions', () => {
    assert.deepEqual(getAllowedTargetStatuses('received'), ['under_review', 'closed']);
    assert.deepEqual(getAllowedTargetStatuses('closed'), []);

    assert.ok(
      validateTransitionDraft(
        { id: 'inc-1', status: 'under_review', assignedTo: null },
        {
          toStatus: 'in_progress',
          closureKind: 'invalid',
          duplicateOfIncidentId: '',
          reason: '',
          informantResponse: '',
        },
      ),
    );
    assert.equal(
      validateTransitionDraft(
        { id: 'inc-1', status: 'under_review', assignedTo: 'mgr-1' },
        {
          toStatus: 'in_progress',
          closureKind: 'invalid',
          duplicateOfIncidentId: '',
          reason: '',
          informantResponse: '',
        },
      ),
      null,
    );
  });

  it('requires public summary and approximate zone before publishing', () => {
    assert.ok(validatePublicationDraft('published', '', 'Zona'));
    assert.ok(validatePublicationDraft('published', 'Resumen seguro', ''));
    assert.equal(
      validatePublicationDraft('published', 'Resumen seguro', 'Facultad de Informática'),
      null,
    );
    assert.equal(validatePublicationDraft('private', '', ''), null);
  });
});

describe('adminApiClient', () => {
  it('resolves base URL and includes credentials for BFF cookie sessions', async () => {
    assert.equal(resolveApiBaseUrl(undefined), '/api');
    assert.equal(resolveApiBaseUrl('http://127.0.0.1:3001/api/'), 'http://127.0.0.1:3001/api');

    let capturedInit: RequestInit | undefined;
    const mockFetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      capturedInit = init;
      return new Response(
        JSON.stringify({ incidents: [], page: 1, limit: 25, total: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }) as unknown as typeof fetch;

    const result = await adminApiClient.listIncidents({ page: 1, limit: 25 }, mockFetch);
    assert.equal(result.total, 0);
    assert.equal(capturedInit?.credentials, 'include');
  });

  it('normalizes 403 and 409 server errors cleanly', async () => {
    const forbiddenFetch = (async () =>
      new Response(JSON.stringify({ message: 'Permiso denegado por servidor.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })) as unknown as typeof fetch;

    await assert.rejects(
      adminApiClient.listAuditEvents({}, forbiddenFetch),
      (error: unknown) =>
        error instanceof AdminApiError &&
        error.status === 403 &&
        error.message === 'Permiso denegado por servidor.',
    );
  });
});
