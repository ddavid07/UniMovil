import { Inject, Injectable, Logger } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type {
  AccountRole,
  AuditAction,
  AuditEntityType,
  AuditEventRecord,
  AuditFieldChange,
  AuditOutcome,
  AuditQueryInput,
  AuditReasonCode,
} from '@unimovil/contracts';
import { DatabaseService } from '../database/database.service';

const ALLOWED_CHANGE_FIELDS = new Set([
  'category',
  'managementPriority',
  'assignedTo',
  'operationalStatus',
  'visibility',
  'publishedRevision',
  'duplicateOfIncidentId',
  'closureKind',
]);

export interface RecordAuditEventInput {
  actorId: string;
  actorRole: AccountRole;
  action: AuditAction;
  outcome: AuditOutcome;
  reasonCode?: AuditReasonCode | null;
  entityType: AuditEntityType;
  entityId: string;
  incidentRevision?: number | null;
  changes?: Readonly<Record<string, AuditFieldChange>>;
}

/**
 * Keeps only allowlisted field diffs with primitive values so audit records
 * never capture descriptions, private responses, emails, tokens or request payloads.
 */
export function sanitizeAuditChanges(
  changes: Readonly<Record<string, AuditFieldChange>> | undefined,
): Record<string, AuditFieldChange> {
  if (!changes) return {};
  const sanitized: Record<string, AuditFieldChange> = {};
  for (const [key, value] of Object.entries(changes)) {
    if (!ALLOWED_CHANGE_FIELDS.has(key) || !value) continue;
    const before =
      typeof value.before === 'string' || typeof value.before === 'number'
        ? value.before
        : null;
    const after =
      typeof value.after === 'string' || typeof value.after === 'number'
        ? value.after
        : null;
    sanitized[key] = { before, after };
  }
  return sanitized;
}

@Injectable()
export class IncidentAuditService {
  private readonly logger = new Logger(IncidentAuditService.name);

  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async recordEvent(input: RecordAuditEventInput, client?: PoolClient): Promise<void> {
    const changes = sanitizeAuditChanges(input.changes);
    const sql = `INSERT INTO unimovil.incident_audit_events
       (actor_id, actor_role, action, outcome, reason_code,
        entity_type, entity_id, incident_revision, changes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`;
    const values = [
      input.actorId,
      input.actorRole,
      input.action,
      input.outcome,
      input.reasonCode ?? null,
      input.entityType,
      input.entityId,
      input.incidentRevision ?? null,
      JSON.stringify(changes),
    ];

    if (client) {
      await client.query(sql, values);
      return;
    }
    await this.database.runtimeQuery(sql, values);
  }

  async recordRejectedAttempt(
    input: Omit<RecordAuditEventInput, 'outcome'>,
  ): Promise<void> {
    try {
      await this.recordEvent({ ...input, outcome: 'rejected' });
    } catch {
      this.logger.warn(
        'Could not persist rejected management audit event without sensitive data.',
      );
    }
  }

  async listEvents(query: AuditQueryInput): Promise<{
    events: AuditEventRecord[];
    page: number;
    limit: number;
    total: number;
  }> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (query.actorId) {
      values.push(query.actorId);
      conditions.push(`actor_id = $${values.length}`);
    }
    if (query.action) {
      values.push(query.action);
      conditions.push(`action = $${values.length}`);
    }
    if (query.entityType) {
      values.push(query.entityType);
      conditions.push(`entity_type = $${values.length}`);
    }
    if (query.entityId) {
      values.push(query.entityId);
      conditions.push(`entity_id = $${values.length}`);
    }
    if (query.outcome) {
      values.push(query.outcome);
      conditions.push(`outcome = $${values.length}`);
    }
    if (query.from) {
      values.push(query.from);
      conditions.push(`occurred_at >= $${values.length}::timestamptz`);
    }
    if (query.to) {
      values.push(query.to);
      conditions.push(`occurred_at <= $${values.length}::timestamptz`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (query.page - 1) * query.limit;

    const countResult = await this.database.runtimeQuery<{ total: number }>(
      `SELECT count(*)::integer AS total
       FROM unimovil.incident_audit_events
       ${whereClause}`,
      values,
    );
    const total = countResult.rows[0]?.total ?? 0;

    const rowsResult = await this.database.runtimeQuery<{
      id: string;
      occurredAt: Date | string;
      actorId: string;
      actorRole: AccountRole;
      action: AuditEventRecord['action'];
      outcome: AuditEventRecord['outcome'];
      reasonCode: AuditEventRecord['reasonCode'];
      entityType: AuditEventRecord['entityType'];
      entityId: string;
      incidentRevision: number | null;
      changes: Record<string, AuditFieldChange>;
    }>(
      `SELECT id,
              occurred_at AS "occurredAt",
              actor_id AS "actorId",
              actor_role AS "actorRole",
              action,
              outcome,
              reason_code AS "reasonCode",
              entity_type AS "entityType",
              entity_id AS "entityId",
              incident_revision AS "incidentRevision",
              changes
       FROM unimovil.incident_audit_events
       ${whereClause}
       ORDER BY occurred_at DESC, id DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, query.limit, offset],
    );

    return {
      events: rowsResult.rows.map((row) => ({
        ...row,
        occurredAt:
          row.occurredAt instanceof Date
            ? row.occurredAt.toISOString()
            : String(row.occurredAt),
        changes: sanitizeAuditChanges(row.changes),
      })),
      page: query.page,
      limit: query.limit,
      total,
    };
  }
}
