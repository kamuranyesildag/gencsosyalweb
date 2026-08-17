ALTER TABLE "follows" ADD COLUMN "notification_preference" varchar(20) DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_official_account" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "official_notify_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "official_priority" varchar(20) DEFAULT 'normal' NOT NULL;