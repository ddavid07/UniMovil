CREATE SCHEMA "unimovil";
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
DO $setup$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'unimovil_runtime') THEN
    CREATE ROLE unimovil_runtime NOLOGIN;
  END IF;
END
$setup$;
--> statement-breakpoint
CREATE TABLE "unimovil"."favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unimovil"."incident_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"content_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"sha256" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "incident_attachments_storage_path_unique" UNIQUE("storage_path")
);
--> statement-breakpoint
CREATE TABLE "unimovil"."incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" text NOT NULL,
	"owner_id" uuid,
	"idempotency_key" text,
	"request_hash" text,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"perceived_priority" text,
	"operational_status" text DEFAULT 'received' NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"location" extensions.geography(Point,4326) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "incidents_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "unimovil"."profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"relationship" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unimovil"."web_sessions" (
	"session_hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"credentials_ciphertext" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "unimovil"."favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unimovil"."incident_attachments" ADD CONSTRAINT "incident_attachments_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "unimovil"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unimovil"."incidents" ADD CONSTRAINT "incidents_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unimovil"."profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unimovil"."web_sessions" ADD CONSTRAINT "web_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_owner_resource_idx" ON "unimovil"."favorites" USING btree ("user_id","resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "favorites_owner_created_idx" ON "unimovil"."favorites" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "incident_attachments_incident_idx" ON "unimovil"."incident_attachments" USING btree ("incident_id");--> statement-breakpoint
CREATE UNIQUE INDEX "incidents_owner_idempotency_idx" ON "unimovil"."incidents" USING btree ("owner_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "incidents_public_status_idx" ON "unimovil"."incidents" USING btree ("visibility","operational_status","updated_at");--> statement-breakpoint
CREATE INDEX "incidents_location_idx" ON "unimovil"."incidents" USING gist ("location");--> statement-breakpoint
CREATE INDEX "web_sessions_expiry_idx" ON "unimovil"."web_sessions" USING btree ("expires_at");
--> statement-breakpoint
ALTER TABLE unimovil.profiles
  ADD CONSTRAINT profiles_relationship_check
  CHECK (relationship IS NULL OR relationship IN ('student', 'faculty', 'staff', 'visitor', 'other'));
--> statement-breakpoint
ALTER TABLE unimovil.favorites
  ADD CONSTRAINT favorites_type_check
  CHECK (resource_type IN ('place', 'transit-stop', 'transit-line', 'mobility-resource')),
  ADD CONSTRAINT favorites_id_length_check
  CHECK (char_length(resource_id) BETWEEN 1 AND 160);
--> statement-breakpoint
ALTER TABLE unimovil.incidents
  ADD CONSTRAINT incidents_category_check
  CHECK (category IN ('access_obstruction', 'lift_or_elevator', 'adapted_access_or_service', 'parking', 'bicycle_resource', 'other')),
  ADD CONSTRAINT incidents_priority_check
  CHECK (perceived_priority IS NULL OR perceived_priority IN ('low', 'normal', 'high')),
  ADD CONSTRAINT incidents_status_check
  CHECK (operational_status IN ('received', 'under_review', 'in_progress', 'resolved', 'closed')),
  ADD CONSTRAINT incidents_visibility_check
  CHECK (visibility IN ('private', 'published')),
  ADD CONSTRAINT incidents_description_length_check
  CHECK (char_length(btrim(description)) BETWEEN 1 AND 2000),
  ADD CONSTRAINT incidents_idempotency_owner_check
  CHECK ((owner_id IS NULL AND idempotency_key IS NULL AND request_hash IS NULL)
      OR (owner_id IS NOT NULL AND idempotency_key IS NOT NULL AND request_hash IS NOT NULL));
--> statement-breakpoint
ALTER TABLE unimovil.incident_attachments
  ADD CONSTRAINT incident_attachments_size_check CHECK (byte_size BETWEEN 1 AND 5242880),
  ADD CONSTRAINT incident_attachments_type_check CHECK (content_type = 'image/webp'),
  ADD CONSTRAINT incident_attachments_hash_check CHECK (sha256 ~ '^[a-f0-9]{64}$');
--> statement-breakpoint
ALTER TABLE unimovil.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE unimovil.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE unimovil.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE unimovil.incident_attachments ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY profiles_owner_read ON unimovil.profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY profiles_owner_insert ON unimovil.profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY profiles_owner_update ON unimovil.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY favorites_owner_all ON unimovil.favorites
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY incidents_owner_read ON unimovil.incidents
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY incidents_public_read ON unimovil.incidents
  FOR SELECT TO anon, authenticated
  USING (visibility = 'published' AND operational_status NOT IN ('resolved', 'closed'));
CREATE POLICY incidents_owner_insert ON unimovil.incidents
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND visibility = 'private' AND operational_status = 'received');
CREATE POLICY attachments_owner_read ON unimovil.incident_attachments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM unimovil.incidents incident
    WHERE incident.id = incident_id AND incident.owner_id = auth.uid()
  ));
CREATE POLICY attachments_owner_insert ON unimovil.incident_attachments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM unimovil.incidents incident
    WHERE incident.id = incident_id AND incident.owner_id = auth.uid()
  ));
--> statement-breakpoint
CREATE VIEW unimovil.public_incidents WITH (security_barrier = true, security_invoker = true) AS
SELECT public_id,
       category,
       description,
       operational_status,
       updated_at,
       round(extensions.ST_Y(location::extensions.geometry)::numeric, 4)::text AS latitude,
       round(extensions.ST_X(location::extensions.geometry)::numeric, 4)::text AS longitude
FROM unimovil.incidents
WHERE visibility = 'published' AND operational_status NOT IN ('resolved', 'closed');
--> statement-breakpoint
CREATE FUNCTION unimovil.create_profile_for_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $profile$
BEGIN
  INSERT INTO unimovil.profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$profile$;
CREATE TRIGGER on_auth_user_created_unimovil_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION unimovil.create_profile_for_auth_user();
--> statement-breakpoint
GRANT USAGE ON SCHEMA unimovil TO anon, authenticated, unimovil_runtime;
GRANT SELECT, INSERT, UPDATE ON unimovil.profiles TO authenticated;
GRANT SELECT, INSERT, DELETE ON unimovil.favorites TO authenticated;
GRANT SELECT, INSERT ON unimovil.incidents TO authenticated;
GRANT SELECT, INSERT ON unimovil.incident_attachments TO authenticated;
GRANT SELECT ON unimovil.incidents TO anon;
GRANT SELECT ON unimovil.public_incidents TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON unimovil.web_sessions TO unimovil_runtime;
GRANT anon, authenticated TO unimovil_runtime;
