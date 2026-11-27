import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PoolClient } from 'pg';
import {
  validateIncidentTransition,
  type AdminIncidentAttachment,
  type AdminIncidentDetail,
  type AdminIncidentPublicationInput,
  type AdminIncidentQueueQuery,
  type AdminIncidentSummary,
  type AdminIncidentTransitionInput,
  type AdminIncidentUpdateInput,
  type AuditAction,
  type AuditFieldChange,
  type AuditReasonCode,
  type ClosureKind,
  type ConfirmationSummary,
  type IncidentCategory,
  type IncidentPriority,
  type IncidentStatus,
  type IncidentStatusHistoryItem,
  type IncidentVisibility,
  type ManagerSummary,
} from '@unimovil/contracts';
import type { AuthenticatedUser } from '../auth/auth.service';
import { DatabaseService } from '../database/database.service';
import { IncidentAuditService } from './incident-audit.service';
import { IncidentsService } from './incidents.service';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertUuid(value: string, fieldLabel: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new BadRequestException(`El identificador de ${fieldLabel} no es válido.`);
  }
  return value;
}

function toIsoTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function toOptionalIsoTimestamp(value: Date | string | null): string | null {
  return value === null ? null : toIsoTimestamp(value);
}

class RejectedManagementActionError extends Error {
  constructor(
    readonly reasonCode: AuditReasonCode,
    readonly httpError: Error,
    readonly incidentRevision: number | null = null,
  ) {
    super(httpError.message);
  }
}

interface IncidentLockRow {
  id: string;
  publicId: string;
  category: IncidentCategory;
  managementPriority: IncidentPriority | null;
  assignedTo: string | null;
  operationalStatus: IncidentStatus;
  visibility: IncidentVisibility;
  publicSummary: string | null;
  approximateZone: string | null;
  duplicateOfIncidentId: string | null;
  closureReason: string | null;
  revision: number;
  publishedRevision: number | null;
}

@Injectable()
export class IncidentManagementService {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(IncidentAuditService) private readonly audit: IncidentAuditService,
    @Inject(IncidentsService) private readonly incidents: IncidentsService,
  ) {}

  async listManagers(): Promise<ManagerSummary[]> {
    const result = await this.database.runtimeQuery<{
      userId: string;
      displayLabel: string | null;
    }>(
      `SELECT user_id AS "userId", display_label AS "displayLabel"
       FROM unimovil.account_roles
       WHERE role = 'manager'
       ORDER BY created_at ASC, user_id ASC`,
    );
    return result.rows.map((row) => ({
      userId: row.userId,
      displayLabel: row.displayLabel ?? `Gestor ${row.userId.slice(0, 8)}`,
    }));
  }

  async listQueue(
    currentUserId: string,
    query: AdminIncidentQueueQuery,
  ): Promise<{
    incidents: AdminIncidentSummary[];
    page: number;
    limit: number;
    total: number;
  }> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (query.status) {
      values.push(query.status);
      conditions.push(`incident.operational_status = $${values.length}`);
    } else if (query.includeClosedOrResolved !== 'true') {
      conditions.push(
        `incident.operational_status IN ('received', 'under_review', 'in_progress')`,
      );
    }

    if (query.category) {
      values.push(query.category);
      conditions.push(`incident.category = $${values.length}`);
    }

    if (query.visibility) {
      values.push(query.visibility);
      conditions.push(`incident.visibility = $${values.length}`);
    }

    if (query.assignedTo === 'unassigned') {
      conditions.push('incident.assigned_to IS NULL');
    } else if (query.assignedTo === 'me') {
      values.push(currentUserId);
      conditions.push(`incident.assigned_to = $${values.length}`);
    } else if (query.assignedTo) {
      values.push(query.assignedTo);
      conditions.push(`incident.assigned_to = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (query.page - 1) * query.limit;

    const countResult = await this.database.runtimeQuery<{ total: number }>(
      `SELECT count(*)::integer AS total
       FROM unimovil.incidents incident
       ${whereClause}`,
      values,
    );
    const total = countResult.rows[0]?.total ?? 0;

    const listResult = await this.database.runtimeQuery<{
      id: string;
      publicId: string;
      category: IncidentCategory;
      perceivedPriority: IncidentPriority | null;
      managementPriority: IncidentPriority | null;
      status: IncidentStatus;
      visibility: IncidentVisibility;
      assignedTo: string | null;
      revision: number;
      publishedRevision: number | null;
      attachmentCount: number;
      createdAt: Date | string;
      updatedAt: Date | string;
    }>(
      `SELECT incident.id,
              incident.public_id AS "publicId",
              incident.category,
              incident.perceived_priority AS "perceivedPriority",
              incident.management_priority AS "managementPriority",
              incident.operational_status AS status,
              incident.visibility,
              incident.assigned_to AS "assignedTo",
              incident.revision,
              incident.published_revision AS "publishedRevision",
              (SELECT count(*)::integer
               FROM unimovil.incident_attachments attachment
               WHERE attachment.incident_id = incident.id) AS "attachmentCount",
              incident.created_at AS "createdAt",
              incident.updated_at AS "updatedAt"
       FROM unimovil.incidents incident
       ${whereClause}
       ORDER BY incident.updated_at ASC, incident.created_at ASC, incident.id ASC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, query.limit, offset],
    );

    return {
      incidents: listResult.rows.map((row) => ({
        ...row,
        createdAt: toIsoTimestamp(row.createdAt),
        updatedAt: toIsoTimestamp(row.updatedAt),
      })),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async getDetail(incidentId: string): Promise<AdminIncidentDetail> {
    assertUuid(incidentId, 'incidencia');

    const incidentResult = await this.database.runtimeQuery<{
      id: string;
      publicId: string;
      category: IncidentCategory;
      description: string;
      perceivedPriority: IncidentPriority | null;
      managementPriority: IncidentPriority | null;
      status: IncidentStatus;
      visibility: IncidentVisibility;
      assignedTo: string | null;
      publicSummary: string | null;
      approximateZone: string | null;
      duplicateOfIncidentId: string | null;
      closureReason: string | null;
      revision: number;
      publishedRevision: number | null;
      latitude: number;
      longitude: number;
      createdAt: Date | string;
      updatedAt: Date | string;
    }>(
      `SELECT id,
              public_id AS "publicId",
              category,
              description,
              perceived_priority AS "perceivedPriority",
              management_priority AS "managementPriority",
              operational_status AS status,
              visibility,
              assigned_to AS "assignedTo",
              public_summary AS "publicSummary",
              approximate_zone AS "approximateZone",
              duplicate_of_incident_id AS "duplicateOfIncidentId",
              closure_reason AS "closureReason",
              revision,
              published_revision AS "publishedRevision",
              extensions.ST_Y(location::extensions.geometry)::double precision AS latitude,
              extensions.ST_X(location::extensions.geometry)::double precision AS longitude,
              created_at AS "createdAt",
              updated_at AS "updatedAt"
       FROM unimovil.incidents
       WHERE id = $1`,
      [incidentId],
    );

    const incident = incidentResult.rows[0];
    if (!incident) throw new NotFoundException('No se encontró la incidencia.');

    const [attachmentsResult, historyResult, confirmationsResult] = await Promise.all([
      this.database.runtimeQuery<{
        id: string;
        contentType: string;
        byteSize: number;
        createdAt: Date | string;
      }>(
        `SELECT id,
                content_type AS "contentType",
                byte_size AS "byteSize",
                created_at AS "createdAt"
         FROM unimovil.incident_attachments
         WHERE incident_id = $1
         ORDER BY created_at ASC, id ASC`,
        [incidentId],
      ),
      this.database.runtimeQuery<{
        id: string;
        fromStatus: IncidentStatus;
        toStatus: IncidentStatus;
        actorId: string | null;
        closureKind: ClosureKind | null;
        reason: string | null;
        informantResponse: string | null;
        incidentRevision: number;
        createdAt: Date | string;
      }>(
        `SELECT id,
                from_status AS "fromStatus",
                to_status AS "toStatus",
                actor_id AS "actorId",
                closure_kind AS "closureKind",
                reason,
                informant_response AS "informantResponse",
                incident_revision AS "incidentRevision",
                created_at AS "createdAt"
         FROM unimovil.incident_status_history
         WHERE incident_id = $1
         ORDER BY created_at ASC, id ASC`,
        [incidentId],
      ),
      this.database.runtimeQuery<{
        stillActiveCount: number;
        resolvedCount: number;
        totalActiveCount: number;
        lastConfirmedAt: Date | string | null;
      }>(
        `SELECT count(*) FILTER (WHERE outcome = 'still_active')::integer AS "stillActiveCount",
                count(*) FILTER (WHERE outcome = 'resolved')::integer AS "resolvedCount",
                count(*)::integer AS "totalActiveCount",
                max(updated_at) AS "lastConfirmedAt"
         FROM unimovil.incident_confirmations
         WHERE incident_id = $1
           AND updated_at >= now() - interval '30 days'`,
        [incidentId],
      ),
    ]);

    const attachments: AdminIncidentAttachment[] = attachmentsResult.rows.map(
      (row) => ({
        ...row,
        createdAt: toIsoTimestamp(row.createdAt),
      }),
    );
    const statusHistory: IncidentStatusHistoryItem[] = historyResult.rows.map(
      (row) => ({
        ...row,
        createdAt: toIsoTimestamp(row.createdAt),
      }),
    );
    const summaryRow = confirmationsResult.rows[0];
    const confirmationSummary: ConfirmationSummary = {
      stillActiveCount: summaryRow?.stillActiveCount ?? 0,
      resolvedCount: summaryRow?.resolvedCount ?? 0,
      totalActiveCount: summaryRow?.totalActiveCount ?? 0,
      lastConfirmedAt: toOptionalIsoTimestamp(summaryRow?.lastConfirmedAt ?? null),
    };

    return {
      ...incident,
      attachmentCount: attachments.length,
      createdAt: toIsoTimestamp(incident.createdAt),
      updatedAt: toIsoTimestamp(incident.updatedAt),
      attachments,
      statusHistory,
      confirmationSummary,
    };
  }

  async updateIncident(
    actor: AuthenticatedUser,
    incidentId: string,
    input: AdminIncidentUpdateInput,
  ): Promise<AdminIncidentDetail> {
    assertUuid(incidentId, 'incidencia');

    if (input.assignedTo !== undefined && input.assignedTo !== null) {
      const managerCheck = await this.database.runtimeQuery<{ role: string }>(
        `SELECT role FROM unimovil.account_roles WHERE user_id = $1 AND role = 'manager'`,
        [input.assignedTo],
      );
      if (!managerCheck.rows[0]) {
        await this.audit.recordRejectedAttempt({
          actorId: actor.id,
          actorRole: actor.role,
          action: 'update_incident',
          reasonCode: 'INVALID_ASSIGNEE_ROLE',
          entityType: 'incident',
          entityId: incidentId,
        });
        throw new BadRequestException(
          'La incidencia solo puede asignarse a una cuenta con rol de gestor.',
        );
      }
    }

    await this.runAuditedIncidentMutation(
      actor,
      incidentId,
      'update_incident',
      input.expectedRevision,
      async (client, current) => {
        const nextCategory = input.category ?? current.category;
        const nextManagementPriority =
          input.managementPriority !== undefined
            ? input.managementPriority
            : current.managementPriority;
        const nextAssignedTo =
          input.assignedTo !== undefined ? input.assignedTo : current.assignedTo;

        if (current.operationalStatus === 'in_progress' && !nextAssignedTo) {
          throw new RejectedManagementActionError(
            'UNASSIGNED_IN_PROGRESS',
            new BadRequestException(
              'Una incidencia en proceso debe conservar una persona gestora asignada.',
            ),
            current.revision,
          );
        }

        const changes: Record<string, AuditFieldChange> = {};
        if (nextCategory !== current.category) {
          changes.category = { before: current.category, after: nextCategory };
        }
        if (nextManagementPriority !== current.managementPriority) {
          changes.managementPriority = {
            before: current.managementPriority,
            after: nextManagementPriority,
          };
        }
        if (nextAssignedTo !== current.assignedTo) {
          changes.assignedTo = { before: current.assignedTo, after: nextAssignedTo };
        }

        if (Object.keys(changes).length === 0) return;

        const nextRevision = current.revision + 1;
        await client.query(
          `UPDATE unimovil.incidents
           SET category = $2,
               management_priority = $3,
               assigned_to = $4,
               revision = $5,
               updated_at = now()
           WHERE id = $1`,
          [
            incidentId,
            nextCategory,
            nextManagementPriority,
            nextAssignedTo,
            nextRevision,
          ],
        );

        await this.audit.recordEvent(
          {
            actorId: actor.id,
            actorRole: actor.role,
            action: 'update_incident',
            outcome: 'success',
            entityType: 'incident',
            entityId: incidentId,
            incidentRevision: nextRevision,
            changes,
          },
          client,
        );
      },
    );

    return this.getDetail(incidentId);
  }

  async transitionIncident(
    actor: AuthenticatedUser,
    incidentId: string,
    input: AdminIncidentTransitionInput,
  ): Promise<AdminIncidentDetail> {
    assertUuid(incidentId, 'incidencia');

    await this.runAuditedIncidentMutation(
      actor,
      incidentId,
      'transition_incident',
      input.expectedRevision,
      async (client, current) => {
        const validation = validateIncidentTransition({
          incidentId,
          currentStatus: current.operationalStatus,
          toStatus: input.toStatus,
          assignedTo: current.assignedTo,
          closureKind: input.closureKind,
          duplicateOfIncidentId: input.duplicateOfIncidentId,
          reason: input.reason,
          informantResponse: input.informantResponse,
        });
        if (!validation.ok) {
          throw new RejectedManagementActionError(
            validation.reasonCode,
            new BadRequestException(validation.message),
            current.revision,
          );
        }

        const duplicateTargetId =
          validation.normalizedClosureKind === 'duplicate'
            ? (input.duplicateOfIncidentId ?? null)
            : null;
        if (duplicateTargetId) {
          const targetExists = await client.query<{ id: string }>(
            'SELECT id FROM unimovil.incidents WHERE id = $1',
            [duplicateTargetId],
          );
          if (!targetExists.rows[0]) {
            throw new RejectedManagementActionError(
              'NOT_FOUND',
              new BadRequestException(
                'La incidencia principal indicada para el duplicado no existe.',
              ),
              current.revision,
            );
          }
        }

        const nextRevision = current.revision + 1;
        const nextClosureReason =
          input.toStatus === 'closed'
            ? (input.reason?.trim() ?? input.informantResponse?.trim() ?? null)
            : input.toStatus === 'under_review'
              ? null
              : current.closureReason;
        const nextDuplicateId =
          input.toStatus === 'closed'
            ? duplicateTargetId
            : input.toStatus === 'under_review'
              ? null
              : current.duplicateOfIncidentId;

        await client.query(
          `UPDATE unimovil.incidents
           SET operational_status = $2,
               closure_reason = $3,
               duplicate_of_incident_id = $4,
               revision = $5,
               updated_at = now()
           WHERE id = $1`,
          [
            incidentId,
            input.toStatus,
            nextClosureReason,
            nextDuplicateId,
            nextRevision,
          ],
        );

        await client.query(
          `INSERT INTO unimovil.incident_status_history
             (incident_id, from_status, to_status, actor_id, closure_kind,
              reason, informant_response, incident_revision)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            incidentId,
            current.operationalStatus,
            input.toStatus,
            actor.id,
            validation.normalizedClosureKind,
            input.reason?.trim() ?? null,
            input.informantResponse?.trim() ?? null,
            nextRevision,
          ],
        );

        const changes: Record<string, AuditFieldChange> = {
          operationalStatus: {
            before: current.operationalStatus,
            after: input.toStatus,
          },
        };
        if (validation.normalizedClosureKind) {
          changes.closureKind = {
            before: null,
            after: validation.normalizedClosureKind,
          };
        }
        if (duplicateTargetId && duplicateTargetId !== current.duplicateOfIncidentId) {
          changes.duplicateOfIncidentId = {
            before: current.duplicateOfIncidentId,
            after: duplicateTargetId,
          };
        }

        await this.audit.recordEvent(
          {
            actorId: actor.id,
            actorRole: actor.role,
            action: 'transition_incident',
            outcome: 'success',
            entityType: 'incident',
            entityId: incidentId,
            incidentRevision: nextRevision,
            changes,
          },
          client,
        );
      },
    );

    return this.getDetail(incidentId);
  }

  async moderatePublication(
    actor: AuthenticatedUser,
    incidentId: string,
    input: AdminIncidentPublicationInput,
  ): Promise<AdminIncidentDetail> {
    assertUuid(incidentId, 'incidencia');
    const action: AuditAction =
      input.visibility === 'published' ? 'publish_incident' : 'unpublish_incident';

    await this.runAuditedIncidentMutation(
      actor,
      incidentId,
      action,
      input.expectedRevision,
      async (client, current) => {
        const nextRevision = current.revision + 1;
        const nextPublishedRevision =
          input.visibility === 'published' ? nextRevision : null;

        if (input.visibility === 'published') {
          await client.query(
            `UPDATE unimovil.incidents
             SET visibility = 'published',
                 public_summary = $2,
                 approximate_zone = $3,
                 revision = $4,
                 published_revision = $4,
                 updated_at = now()
             WHERE id = $1`,
            [
              incidentId,
              input.publicSummary!.trim(),
              input.approximateZone!.trim(),
              nextRevision,
            ],
          );
        } else {
          await client.query(
            `UPDATE unimovil.incidents
             SET visibility = 'private',
                 revision = $2,
                 published_revision = NULL,
                 updated_at = now()
             WHERE id = $1`,
            [incidentId, nextRevision],
          );
        }

        await this.audit.recordEvent(
          {
            actorId: actor.id,
            actorRole: actor.role,
            action,
            outcome: 'success',
            entityType: 'incident',
            entityId: incidentId,
            incidentRevision: nextRevision,
            changes: {
              visibility: { before: current.visibility, after: input.visibility },
              publishedRevision: {
                before: current.publishedRevision,
                after: nextPublishedRevision,
              },
            },
          },
          client,
        );
      },
    );

    return this.getDetail(incidentId);
  }

  async getEvidenceForManagement(
    actor: AuthenticatedUser,
    incidentId: string,
    attachmentId: string,
  ): Promise<Buffer> {
    assertUuid(incidentId, 'incidencia');
    assertUuid(attachmentId, 'evidencia');

    const result = await this.database.runtimeQuery<{
      storagePath: string;
      revision: number;
    }>(
      `SELECT attachment.storage_path AS "storagePath",
              incident.revision
       FROM unimovil.incident_attachments attachment
       JOIN unimovil.incidents incident ON incident.id = attachment.incident_id
       WHERE incident.id = $1 AND attachment.id = $2`,
      [incidentId, attachmentId],
    );

    const record = result.rows[0];
    if (!record) {
      await this.audit.recordRejectedAttempt({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'access_evidence',
        reasonCode: 'NOT_FOUND',
        entityType: 'incident_attachment',
        entityId: attachmentId,
      });
      throw new NotFoundException('No se encontró la evidencia solicitada.');
    }

    const buffer = await this.incidents.downloadPrivateEvidenceByPath(
      record.storagePath,
    );

    await this.audit.recordEvent({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'access_evidence',
      outcome: 'success',
      entityType: 'incident_attachment',
      entityId: attachmentId,
      incidentRevision: record.revision,
    });

    return buffer;
  }

  private async runAuditedIncidentMutation(
    actor: AuthenticatedUser,
    incidentId: string,
    action: AuditAction,
    expectedRevision: number,
    operation: (client: PoolClient, current: IncidentLockRow) => Promise<void>,
  ): Promise<void> {
    try {
      await this.database.withServerTransaction(async (client) => {
        const currentResult = await client.query<IncidentLockRow>(
          `SELECT id,
                  public_id AS "publicId",
                  category,
                  management_priority AS "managementPriority",
                  assigned_to AS "assignedTo",
                  operational_status AS "operationalStatus",
                  visibility,
                  public_summary AS "publicSummary",
                  approximate_zone AS "approximateZone",
                  duplicate_of_incident_id AS "duplicateOfIncidentId",
                  closure_reason AS "closureReason",
                  revision,
                  published_revision AS "publishedRevision"
           FROM unimovil.incidents
           WHERE id = $1
           FOR UPDATE`,
          [incidentId],
        );
        const current = currentResult.rows[0];
        if (!current) {
          throw new RejectedManagementActionError(
            'NOT_FOUND',
            new NotFoundException('No se encontró la incidencia.'),
          );
        }
        if (current.revision !== expectedRevision) {
          throw new RejectedManagementActionError(
            'CONFLICT_REVISION',
            new ConflictException(
              'La incidencia cambió desde tu última lectura. Recarga los datos antes de guardar.',
            ),
            current.revision,
          );
        }
        await operation(client, current);
      });
    } catch (error) {
      if (error instanceof RejectedManagementActionError) {
        await this.audit.recordRejectedAttempt({
          actorId: actor.id,
          actorRole: actor.role,
          action,
          reasonCode: error.reasonCode,
          entityType: 'incident',
          entityId: incidentId,
          incidentRevision: error.incidentRevision,
        });
        throw error.httpError;
      }
      throw error;
    }
  }
}
