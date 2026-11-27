import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { validateIncidentTransition } from '@unimovil/contracts';
import type { AuthenticatedUser } from '../src/auth/auth.service';
import type { DatabaseService } from '../src/database/database.service';
import {
  IncidentAuditService,
  sanitizeAuditChanges,
} from '../src/incidents/incident-audit.service';
import { IncidentManagementService } from '../src/incidents/incident-management.service';
import type { IncidentsService } from '../src/incidents/incidents.service';

const INCIDENT_ID = '11111111-1111-4111-8111-111111111111';
const MANAGER_ID = '22222222-2222-4222-8222-222222222222';
const OTHER_INCIDENT_ID = '33333333-3333-4333-8333-333333333333';
const ATTACHMENT_ID = '44444444-4444-4444-8444-444444444444';

const MANAGER_ACTOR: AuthenticatedUser = {
  id: MANAGER_ID,
  email: null,
  source: 'cookie',
  role: 'manager',
};

describe('incident status state machine (HU-055)', () => {
  it('accepts all valid transitions when preconditions are met', () => {
    assert.equal(
      validateIncidentTransition({
        incidentId: INCIDENT_ID,
        currentStatus: 'received',
        toStatus: 'under_review',
        assignedTo: null,
      }).ok,
      true,
    );
    assert.equal(
      validateIncidentTransition({
        incidentId: INCIDENT_ID,
        currentStatus: 'received',
        toStatus: 'closed',
        assignedTo: null,
        closureKind: 'duplicate',
        duplicateOfIncidentId: OTHER_INCIDENT_ID,
        reason: 'Ya existe un aviso equivalente en la misma entrada.',
      }).ok,
      true,
    );
    assert.equal(
      validateIncidentTransition({
        incidentId: INCIDENT_ID,
        currentStatus: 'under_review',
        toStatus: 'in_progress',
        assignedTo: MANAGER_ID,
      }).ok,
      true,
    );
    assert.equal(
      validateIncidentTransition({
        incidentId: INCIDENT_ID,
        currentStatus: 'in_progress',
        toStatus: 'resolved',
        assignedTo: MANAGER_ID,
        informantResponse: 'Se ha reparado el acceso principal.',
      }).ok,
      true,
    );
    assert.equal(
      validateIncidentTransition({
        incidentId: INCIDENT_ID,
        currentStatus: 'resolved',
        toStatus: 'under_review',
        assignedTo: MANAGER_ID,
        reason: 'Persisten confirmaciones recientes.',
        informantResponse: 'Reabrimos la incidencia para nueva comprobación.',
      }).ok,
      true,
    );
    assert.equal(
      validateIncidentTransition({
        incidentId: INCIDENT_ID,
        currentStatus: 'resolved',
        toStatus: 'closed',
        assignedTo: MANAGER_ID,
        informantResponse: 'Gestión finalizada sin nuevas incidencias.',
      }).ok,
      true,
    );
  });

  it('rejects invalid transitions and missing preconditions', () => {
    const unassigned = validateIncidentTransition({
      incidentId: INCIDENT_ID,
      currentStatus: 'under_review',
      toStatus: 'in_progress',
      assignedTo: null,
    });
    assert.equal(unassigned.ok, false);
    if (!unassigned.ok) assert.equal(unassigned.reasonCode, 'MISSING_ASSIGNEE');

    const skipped = validateIncidentTransition({
      incidentId: INCIDENT_ID,
      currentStatus: 'received',
      toStatus: 'in_progress',
      assignedTo: MANAGER_ID,
    });
    assert.equal(skipped.ok, false);
    if (!skipped.ok) assert.equal(skipped.reasonCode, 'INVALID_TRANSITION');

    const closedTerminal = validateIncidentTransition({
      incidentId: INCIDENT_ID,
      currentStatus: 'closed',
      toStatus: 'under_review',
      assignedTo: MANAGER_ID,
      reason: 'Intento de reapertura',
      informantResponse: 'Respuesta',
    });
    assert.equal(closedTerminal.ok, false);
    if (!closedTerminal.ok)
      assert.equal(closedTerminal.reasonCode, 'INVALID_TRANSITION');

    const selfDuplicate = validateIncidentTransition({
      incidentId: INCIDENT_ID,
      currentStatus: 'received',
      toStatus: 'closed',
      assignedTo: null,
      closureKind: 'duplicate',
      duplicateOfIncidentId: INCIDENT_ID,
      reason: 'Duplicado de sí misma',
    });
    assert.equal(selfDuplicate.ok, false);
    if (!selfDuplicate.ok) assert.equal(selfDuplicate.reasonCode, 'SELF_DUPLICATE');

    const resolvedWithoutResponse = validateIncidentTransition({
      incidentId: INCIDENT_ID,
      currentStatus: 'in_progress',
      toStatus: 'resolved',
      assignedTo: MANAGER_ID,
      informantResponse: '   ',
    });
    assert.equal(resolvedWithoutResponse.ok, false);
    if (!resolvedWithoutResponse.ok) {
      assert.equal(resolvedWithoutResponse.reasonCode, 'MISSING_RESPONSE');
    }
  });
});

describe('audit sanitization (HU-077 / HU-097)', () => {
  it('keeps only allowlisted primitives and strips sensitive fields', () => {
    const sanitized = sanitizeAuditChanges({
      category: { before: 'other', after: 'lift_or_elevator' },
      visibility: { before: 'private', after: 'published' },
      description: { before: 'raw text', after: 'raw text' },
      email: { before: 'user@ucm.es', after: 'user@ucm.es' },
      token: { before: 'secret', after: 'secret' },
      informantResponse: { before: null, after: 'private reply' },
    });

    assert.deepEqual(sanitized, {
      category: { before: 'other', after: 'lift_or_elevator' },
      visibility: { before: 'private', after: 'published' },
    });
  });
});

describe('IncidentManagementService', () => {
  it('rejects assigning to a non-manager account and records audit rejection', async () => {
    const rejectedEvents: unknown[] = [];
    const database = {
      runtimeQuery: async () => ({ rows: [] }),
    } as unknown as DatabaseService;
    const audit = {
      recordRejectedAttempt: async (entry: unknown) => {
        rejectedEvents.push(entry);
      },
    } as unknown as IncidentAuditService;
    const service = new IncidentManagementService(
      database,
      audit,
      {} as IncidentsService,
    );

    await assert.rejects(
      service.updateIncident(MANAGER_ACTOR, INCIDENT_ID, {
        expectedRevision: 1,
        assignedTo: OTHER_INCIDENT_ID,
      }),
      BadRequestException,
    );
    assert.equal(rejectedEvents.length, 1);
    assert.equal(
      (rejectedEvents[0] as { reasonCode: string }).reasonCode,
      'INVALID_ASSIGNEE_ROLE',
    );
  });

  it('rejects stale expectedRevision with ConflictException and audits conflict', async () => {
    const rejectedEvents: unknown[] = [];
    const database = {
      withServerTransaction: async (
        op: (client: { query: () => Promise<{ rows: unknown[] }> }) => Promise<unknown>,
      ) =>
        op({
          query: async () => ({
            rows: [
              {
                id: INCIDENT_ID,
                publicId: 'pub-1',
                category: 'other',
                managementPriority: null,
                assignedTo: null,
                operationalStatus: 'received',
                visibility: 'private',
                publicSummary: null,
                approximateZone: null,
                duplicateOfIncidentId: null,
                closureReason: null,
                revision: 3,
                publishedRevision: null,
              },
            ],
          }),
        }),
    } as unknown as DatabaseService;
    const audit = {
      recordRejectedAttempt: async (entry: unknown) => {
        rejectedEvents.push(entry);
      },
    } as unknown as IncidentAuditService;
    const service = new IncidentManagementService(
      database,
      audit,
      {} as IncidentsService,
    );

    await assert.rejects(
      service.updateIncident(MANAGER_ACTOR, INCIDENT_ID, {
        expectedRevision: 2,
        managementPriority: 'high',
      }),
      ConflictException,
    );
    assert.equal(rejectedEvents.length, 1);
    assert.equal(
      (rejectedEvents[0] as { reasonCode: string }).reasonCode,
      'CONFLICT_REVISION',
    );
  });

  it('records an access_evidence audit event when downloading private evidence', async () => {
    const recordedEvents: unknown[] = [];
    const database = {
      runtimeQuery: async (sql: string) => {
        if (sql.includes('FROM unimovil.incident_attachments')) {
          return {
            rows: [{ storagePath: 'owner/inc/file.webp', revision: 2 }],
          };
        }
        return { rows: [] };
      },
    } as unknown as DatabaseService;
    const audit = {
      recordEvent: async (entry: unknown) => {
        recordedEvents.push(entry);
      },
      recordRejectedAttempt: async () => undefined,
    } as unknown as IncidentAuditService;
    const incidents = {
      downloadPrivateEvidenceByPath: async (path: string) => {
        assert.equal(path, 'owner/inc/file.webp');
        return Buffer.from('webp-bytes');
      },
    } as unknown as IncidentsService;

    const service = new IncidentManagementService(database, audit, incidents);
    const buffer = await service.getEvidenceForManagement(
      MANAGER_ACTOR,
      INCIDENT_ID,
      ATTACHMENT_ID,
    );

    assert.equal(buffer.toString(), 'webp-bytes');
    assert.equal(recordedEvents.length, 1);
    assert.deepEqual(recordedEvents[0], {
      actorId: MANAGER_ID,
      actorRole: 'manager',
      action: 'access_evidence',
      outcome: 'success',
      entityType: 'incident_attachment',
      entityId: ATTACHMENT_ID,
      incidentRevision: 2,
    });
  });

  it('records NOT_FOUND rejection when evidence attachment does not exist', async () => {
    const rejectedEvents: unknown[] = [];
    const database = {
      runtimeQuery: async () => ({ rows: [] }),
    } as unknown as DatabaseService;
    const audit = {
      recordRejectedAttempt: async (entry: unknown) => {
        rejectedEvents.push(entry);
      },
    } as unknown as IncidentAuditService;
    const service = new IncidentManagementService(
      database,
      audit,
      {} as IncidentsService,
    );

    await assert.rejects(
      service.getEvidenceForManagement(MANAGER_ACTOR, INCIDENT_ID, ATTACHMENT_ID),
      NotFoundException,
    );
    assert.equal(rejectedEvents.length, 1);
    assert.equal((rejectedEvents[0] as { reasonCode: string }).reasonCode, 'NOT_FOUND');
  });
});

describe('IncidentAuditService', () => {
  it('delegates insertion with sanitized changes and returns ISO timestamps', async () => {
    const queries: Array<{ sql: string; values: unknown[] }> = [];
    const database = {
      runtimeQuery: async (sql: string, values: unknown[]) => {
        queries.push({ sql, values });
        if (sql.includes('count(*)')) return { rows: [{ total: 1 }] };
        return {
          rows: [
            {
              id: ATTACHMENT_ID,
              occurredAt: new Date('2026-11-27T12:00:00.000Z'),
              actorId: MANAGER_ID,
              actorRole: 'manager',
              action: 'update_incident',
              outcome: 'success',
              reasonCode: null,
              entityType: 'incident',
              entityId: INCIDENT_ID,
              incidentRevision: 2,
              changes: {
                managementPriority: { before: null, after: 'high' },
                description: { before: 'leaked', after: 'leaked' },
              },
            },
          ],
        };
      },
    } as unknown as DatabaseService;

    const audit = new IncidentAuditService(database);
    const result = await audit.listEvents({ page: 1, limit: 25 });

    assert.equal(result.total, 1);
    assert.equal(result.events[0]?.occurredAt, '2026-11-27T12:00:00.000Z');
    assert.deepEqual(result.events[0]?.changes, {
      managementPriority: { before: null, after: 'high' },
    });
    assert.equal(queries.length, 2);
  });
});
