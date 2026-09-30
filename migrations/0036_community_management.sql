ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "category" varchar(50) DEFAULT 'Genel' NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "is_private" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "rules" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "community_id" integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "communities_deleted_at_idx" ON "communities" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "communities_owner_id_idx" ON "communities" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "communities_category_idx" ON "communities" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_members_role_idx" ON "community_members" USING btree ("role");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_join_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"community_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"community_id" integer NOT NULL,
	"actor_id" integer NOT NULL,
	"target_user_id" integer,
	"action" varchar(50) NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "community_join_requests" ADD CONSTRAINT "community_join_requests_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "community_join_requests" ADD CONSTRAINT "community_join_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "community_audit_logs" ADD CONSTRAINT "community_audit_logs_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "community_audit_logs" ADD CONSTRAINT "community_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "community_audit_logs" ADD CONSTRAINT "community_audit_logs_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "community_join_requests_user_community_unq" ON "community_join_requests" USING btree ("community_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_join_requests_community_idx" ON "community_join_requests" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_join_requests_user_idx" ON "community_join_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_join_requests_status_idx" ON "community_join_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_audit_logs_community_idx" ON "community_audit_logs" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_audit_logs_actor_idx" ON "community_audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_audit_logs_created_at_idx" ON "community_audit_logs" USING btree ("created_at");
