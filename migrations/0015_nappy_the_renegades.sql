CREATE TABLE "system_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "device_info" text;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "browser" varchar(100);--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "os" varchar(100);--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "last_active_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;