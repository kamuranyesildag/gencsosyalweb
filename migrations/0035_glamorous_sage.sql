CREATE TABLE "appeals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ban_reason" text,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"admin_response" text,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appeals_user_id_idx" ON "appeals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "appeals_status_idx" ON "appeals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "appeals_created_at_idx" ON "appeals" USING btree ("created_at");