ALTER TABLE "profiles" ADD COLUMN "is_private" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "allow_search_engine_indexing" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "message_preference" varchar(20) DEFAULT 'ANYONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "mention_preference" varchar(20) DEFAULT 'ANYONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "default_post_visibility" varchar(20) DEFAULT 'PUBLIC' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;