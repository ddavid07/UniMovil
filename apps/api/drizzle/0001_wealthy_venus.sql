CREATE TABLE "unimovil"."storage_cleanup_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_path" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "storage_cleanup_queue_storage_path_unique" UNIQUE("storage_path")
);
--> statement-breakpoint
CREATE INDEX "storage_cleanup_created_idx" ON "unimovil"."storage_cleanup_queue" USING btree ("created_at");
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON unimovil.storage_cleanup_queue TO unimovil_runtime;
