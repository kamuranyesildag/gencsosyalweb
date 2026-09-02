CREATE TABLE "moderation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(20) NOT NULL,
	"entity_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"action_taken" varchar(20),
	"risk_level" varchar(20) NOT NULL,
	"category" varchar(50),
	"reason" text,
	"admin_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "moderation_status" varchar(20) DEFAULT 'APPROVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "moderation_status" varchar(20) DEFAULT 'APPROVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_comments" ADD COLUMN "moderation_status" varchar(20) DEFAULT 'APPROVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mod_logs_entity_idx" ON "moderation_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "mod_logs_user_id_idx" ON "moderation_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mod_logs_status_idx" ON "moderation_logs" USING btree ("status");
--> statement-breakpoint
