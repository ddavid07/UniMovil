CREATE TABLE "unimovil"."account_roles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"display_label" text,
	"granted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_roles_role_check" CHECK (role IN ('manager', 'admin'))
);
--> statement-breakpoint
ALTER TABLE "unimovil"."account_roles" ADD CONSTRAINT "account_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unimovil"."account_roles" ADD CONSTRAINT "account_roles_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE unimovil.account_roles ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY account_roles_self_read ON unimovil.account_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY account_roles_runtime_read ON unimovil.account_roles
  FOR SELECT TO unimovil_runtime USING (true);
--> statement-breakpoint
ALTER TABLE "unimovil"."incidents"
	ADD COLUMN "management_priority" text,
	ADD COLUMN "assigned_to" uuid,
	ADD COLUMN "public_summary" text,
	ADD COLUMN "approximate_zone" text,
	ADD COLUMN "duplicate_of_incident_id" uuid,
	ADD COLUMN "closure_reason" text,
	ADD COLUMN "revision" integer DEFAULT 1 NOT NULL,
	ADD COLUMN "published_revision" integer;
--> statement-breakpoint
ALTER TABLE "unimovil"."incidents" ADD CONSTRAINT "incidents_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unimovil"."incidents" ADD CONSTRAINT "incidents_duplicate_of_fk" FOREIGN KEY ("duplicate_of_incident_id") REFERENCES "unimovil"."incidents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE unimovil.incidents
SET public_summary = description,
    approximate_zone = COALESCE(approximate_zone, 'Campus de Moncloa'),
    published_revision = revision
WHERE visibility = 'published' AND public_summary IS NULL;
--> statement-breakpoint
ALTER TABLE unimovil.incidents
  ADD CONSTRAINT incidents_management_priority_check
  CHECK (management_priority IS NULL OR management_priority IN ('low', 'normal', 'high')),
  ADD CONSTRAINT incidents_revision_check
  CHECK (revision >= 1),
  ADD CONSTRAINT incidents_published_revision_check
  CHECK (published_revision IS NULL OR published_revision >= 1),
  ADD CONSTRAINT incidents_public_projection_check
  CHECK (
    visibility <> 'published'
    OR (
      public_summary IS NOT NULL
      AND char_length(btrim(public_summary)) BETWEEN 1 AND 2000
      AND published_revision IS NOT NULL
    )
  ),
  ADD CONSTRAINT incidents_in_progress_assignee_check
  CHECK (operational_status <> 'in_progress' OR assigned_to IS NOT NULL),
  ADD CONSTRAINT incidents_not_self_duplicate_check
  CHECK (duplicate_of_incident_id IS NULL OR duplicate_of_incident_id <> id);
--> statement-breakpoint
CREATE INDEX "incidents_management_queue_idx" ON "unimovil"."incidents" USING btree ("operational_status","updated_at","created_at");--> statement-breakpoint
CREATE INDEX "incidents_assigned_to_idx" ON "unimovil"."incidents" USING btree ("assigned_to") WHERE "assigned_to" IS NOT NULL;--> statement-breakpoint
CREATE POLICY incidents_runtime_read ON unimovil.incidents
  FOR SELECT TO unimovil_runtime USING (true);
CREATE POLICY incidents_runtime_update ON unimovil.incidents
  FOR UPDATE TO unimovil_runtime USING (true) WITH CHECK (true);
CREATE POLICY attachments_runtime_read ON unimovil.incident_attachments
  FOR SELECT TO unimovil_runtime USING (true);
--> statement-breakpoint
DROP VIEW IF EXISTS unimovil.public_incidents;
CREATE VIEW unimovil.public_incidents WITH (security_barrier = true, security_invoker = true) AS
SELECT public_id,
       category,
       public_summary AS description,
       approximate_zone,
       operational_status,
       updated_at,
       round(extensions.ST_Y(location::extensions.geometry)::numeric, 4)::text AS latitude,
       round(extensions.ST_X(location::extensions.geometry)::numeric, 4)::text AS longitude
FROM unimovil.incidents
WHERE visibility = 'published' AND operational_status NOT IN ('resolved', 'closed');
--> statement-breakpoint
GRANT SELECT ON unimovil.public_incidents TO anon, authenticated;
--> statement-breakpoint
CREATE TABLE "unimovil"."incident_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid NOT NULL,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"actor_id" uuid,
	"closure_kind" text,
	"reason" text,
	"informant_response" text,
	"incident_revision" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "incident_status_history_from_check" CHECK (from_status IN ('received', 'under_review', 'in_progress', 'resolved', 'closed')),
	CONSTRAINT "incident_status_history_to_check" CHECK (to_status IN ('received', 'under_review', 'in_progress', 'resolved', 'closed')),
	CONSTRAINT "incident_status_history_closure_check" CHECK (closure_kind IS NULL OR closure_kind IN ('duplicate', 'invalid', 'resolved')),
	CONSTRAINT "incident_status_history_revision_check" CHECK (incident_revision >= 1)
);
--> statement-breakpoint
ALTER TABLE "unimovil"."incident_status_history" ADD CONSTRAINT "incident_status_history_incident_id_fk" FOREIGN KEY ("incident_id") REFERENCES "unimovil"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unimovil"."incident_status_history" ADD CONSTRAINT "incident_status_history_actor_id_fk" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "incident_status_history_incident_idx" ON "unimovil"."incident_status_history" USING btree ("incident_id","created_at");--> statement-breakpoint
ALTER TABLE unimovil.incident_status_history ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY incident_status_history_owner_read ON unimovil.incident_status_history
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM unimovil.incidents incident
    WHERE incident.id = incident_id AND incident.owner_id = auth.uid()
  ));
CREATE POLICY incident_status_history_runtime_read ON unimovil.incident_status_history
  FOR SELECT TO unimovil_runtime USING (true);
CREATE POLICY incident_status_history_runtime_insert ON unimovil.incident_status_history
  FOR INSERT TO unimovil_runtime WITH CHECK (true);
--> statement-breakpoint
CREATE TABLE "unimovil"."incident_confirmations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"outcome" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "incident_confirmations_outcome_check" CHECK (outcome IN ('still_active', 'resolved'))
);
--> statement-breakpoint
ALTER TABLE "unimovil"."incident_confirmations" ADD CONSTRAINT "incident_confirmations_incident_id_fk" FOREIGN KEY ("incident_id") REFERENCES "unimovil"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unimovil"."incident_confirmations" ADD CONSTRAINT "incident_confirmations_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "incident_confirmations_incident_user_idx" ON "unimovil"."incident_confirmations" USING btree ("incident_id","user_id");--> statement-breakpoint
CREATE INDEX "incident_confirmations_incident_updated_idx" ON "unimovil"."incident_confirmations" USING btree ("incident_id","updated_at");--> statement-breakpoint
ALTER TABLE unimovil.incident_confirmations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY incident_confirmations_owner_all ON unimovil.incident_confirmations
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM unimovil.incidents incident
      WHERE incident.id = incident_id
        AND incident.operational_status <> 'closed'
        AND (incident.owner_id = auth.uid() OR incident.visibility = 'published')
    )
  );
CREATE POLICY incident_confirmations_runtime_read ON unimovil.incident_confirmations
  FOR SELECT TO unimovil_runtime USING (true);
--> statement-breakpoint
CREATE TABLE "unimovil"."incident_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_id" uuid NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"outcome" text NOT NULL,
	"reason_code" text,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"incident_revision" integer,
	"changes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "incident_audit_role_check" CHECK (actor_role IN ('user', 'manager', 'admin')),
	CONSTRAINT "incident_audit_action_check" CHECK (action IN ('update_incident', 'transition_incident', 'publish_incident', 'unpublish_incident', 'access_evidence', 'access_denied')),
	CONSTRAINT "incident_audit_outcome_check" CHECK (outcome IN ('success', 'rejected')),
	CONSTRAINT "incident_audit_entity_type_check" CHECK (entity_type IN ('incident', 'incident_attachment', 'audit_log'))
);
--> statement-breakpoint
CREATE INDEX "incident_audit_occurred_idx" ON "unimovil"."incident_audit_events" USING btree ("occurred_at","id");--> statement-breakpoint
CREATE INDEX "incident_audit_actor_idx" ON "unimovil"."incident_audit_events" USING btree ("actor_id","occurred_at");--> statement-breakpoint
CREATE INDEX "incident_audit_entity_idx" ON "unimovil"."incident_audit_events" USING btree ("entity_type","entity_id","occurred_at");--> statement-breakpoint
CREATE INDEX "incident_audit_action_idx" ON "unimovil"."incident_audit_events" USING btree ("action","occurred_at");--> statement-breakpoint
ALTER TABLE unimovil.incident_audit_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY incident_audit_runtime_read ON unimovil.incident_audit_events
  FOR SELECT TO unimovil_runtime USING (true);
CREATE POLICY incident_audit_runtime_insert ON unimovil.incident_audit_events
  FOR INSERT TO unimovil_runtime WITH CHECK (true);
--> statement-breakpoint
GRANT SELECT ON unimovil.account_roles TO authenticated, unimovil_runtime;
GRANT SELECT, INSERT ON unimovil.incident_status_history TO unimovil_runtime;
GRANT SELECT ON unimovil.incident_status_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON unimovil.incident_confirmations TO authenticated;
GRANT SELECT ON unimovil.incident_confirmations TO unimovil_runtime;
GRANT SELECT, INSERT ON unimovil.incident_audit_events TO unimovil_runtime;
REVOKE UPDATE, DELETE ON unimovil.incident_audit_events FROM anon, authenticated, unimovil_runtime;
