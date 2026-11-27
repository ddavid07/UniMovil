import {
  customType,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');
const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const appSchema = pgSchema('unimovil');

const geographyPoint = customType<{
  data: { latitude: number; longitude: number };
  driverData: string;
}>({
  dataType: () => 'extensions.geography(Point,4326)',
  toDriver: ({ latitude, longitude }) => `SRID=4326;POINT(${longitude} ${latitude})`,
  fromDriver: (value) => {
    const match = /^SRID=4326;POINT\((-?[\d.]+) (-?[\d.]+)\)$/.exec(value);
    if (!match) throw new Error('Invalid PostGIS geography value.');
    return { longitude: Number(match[1]), latitude: Number(match[2]) };
  },
});

export const profiles = appSchema.table('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  relationship: text('relationship'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const accountRoles = appSchema.table('account_roles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  displayLabel: text('display_label'),
  grantedBy: uuid('granted_by').references(() => authUsers.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const favorites = appSchema.table(
  'favorites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('favorites_owner_resource_idx').on(
      table.userId,
      table.resourceType,
      table.resourceId,
    ),
    index('favorites_owner_created_idx').on(table.userId, table.createdAt),
  ],
);

export const webSessions = appSchema.table(
  'web_sessions',
  {
    sessionHash: text('session_hash').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    credentialsCiphertext: text('credentials_ciphertext').notNull(),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
    }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('web_sessions_expiry_idx').on(table.expiresAt)],
);

export const storageCleanupQueue = appSchema.table(
  'storage_cleanup_queue',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    storagePath: text('storage_path').notNull().unique(),
    attempts: integer('attempts').notNull().default(0),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('storage_cleanup_created_idx').on(table.createdAt)],
);

export const incidents = appSchema.table(
  'incidents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    publicId: text('public_id').notNull().unique(),
    ownerId: uuid('owner_id').references(() => authUsers.id, {
      onDelete: 'cascade',
    }),
    idempotencyKey: text('idempotency_key'),
    requestHash: text('request_hash'),
    category: text('category').notNull(),
    description: text('description').notNull(),
    perceivedPriority: text('perceived_priority'),
    managementPriority: text('management_priority'),
    assignedTo: uuid('assigned_to').references(() => authUsers.id, {
      onDelete: 'set null',
    }),
    operationalStatus: text('operational_status').notNull().default('received'),
    visibility: text('visibility').notNull().default('private'),
    publicSummary: text('public_summary'),
    approximateZone: text('approximate_zone'),
    duplicateOfIncidentId: uuid('duplicate_of_incident_id').references(
      (): AnyPgColumn => incidents.id,
      { onDelete: 'set null' },
    ),
    closureReason: text('closure_reason'),
    revision: integer('revision').notNull().default(1),
    publishedRevision: integer('published_revision'),
    location: geographyPoint('location').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('incidents_owner_idempotency_idx').on(
      table.ownerId,
      table.idempotencyKey,
    ),
    index('incidents_public_status_idx').on(
      table.visibility,
      table.operationalStatus,
      table.updatedAt,
    ),
    index('incidents_management_queue_idx').on(
      table.operationalStatus,
      table.updatedAt,
      table.createdAt,
    ),
    index('incidents_location_idx').using('gist', table.location),
  ],
);

export const incidentAttachments = appSchema.table(
  'incident_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    incidentId: uuid('incident_id')
      .notNull()
      .references(() => incidents.id, { onDelete: 'cascade' }),
    storagePath: text('storage_path').notNull().unique(),
    contentType: text('content_type').notNull(),
    byteSize: integer('byte_size').notNull(),
    sha256: text('sha256').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('incident_attachments_incident_idx').on(table.incidentId)],
);

export const incidentStatusHistory = appSchema.table(
  'incident_status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    incidentId: uuid('incident_id')
      .notNull()
      .references(() => incidents.id, { onDelete: 'cascade' }),
    fromStatus: text('from_status').notNull(),
    toStatus: text('to_status').notNull(),
    actorId: uuid('actor_id').references(() => authUsers.id, {
      onDelete: 'set null',
    }),
    closureKind: text('closure_kind'),
    reason: text('reason'),
    informantResponse: text('informant_response'),
    incidentRevision: integer('incident_revision').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('incident_status_history_incident_idx').on(table.incidentId, table.createdAt),
  ],
);

export const incidentConfirmations = appSchema.table(
  'incident_confirmations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    incidentId: uuid('incident_id')
      .notNull()
      .references(() => incidents.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    outcome: text('outcome').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('incident_confirmations_incident_user_idx').on(
      table.incidentId,
      table.userId,
    ),
    index('incident_confirmations_incident_updated_idx').on(
      table.incidentId,
      table.updatedAt,
    ),
  ],
);

export const incidentAuditEvents = appSchema.table(
  'incident_audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    actorId: uuid('actor_id').notNull(),
    actorRole: text('actor_role').notNull(),
    action: text('action').notNull(),
    outcome: text('outcome').notNull(),
    reasonCode: text('reason_code'),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    incidentRevision: integer('incident_revision'),
    changes: jsonb('changes').$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => [
    index('incident_audit_occurred_idx').on(table.occurredAt, table.id),
    index('incident_audit_actor_idx').on(table.actorId, table.occurredAt),
    index('incident_audit_entity_idx').on(
      table.entityType,
      table.entityId,
      table.occurredAt,
    ),
    index('incident_audit_action_idx').on(table.action, table.occurredAt),
  ],
);

export const publicIncidents = appSchema
  .view('public_incidents', {
    publicId: text('public_id'),
    category: text('category'),
    description: text('description'),
    approximateZone: text('approximate_zone'),
    operationalStatus: text('operational_status'),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    latitude: text('latitude'),
    longitude: text('longitude'),
  })
  .existing();
