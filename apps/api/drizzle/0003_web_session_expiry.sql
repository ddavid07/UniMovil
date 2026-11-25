ALTER TABLE unimovil.web_sessions
  ADD COLUMN access_token_expires_at timestamp with time zone;
--> statement-breakpoint
UPDATE unimovil.web_sessions
SET access_token_expires_at = expires_at,
    expires_at = created_at + interval '14 days';
--> statement-breakpoint
ALTER TABLE unimovil.web_sessions
  ALTER COLUMN access_token_expires_at SET NOT NULL;
