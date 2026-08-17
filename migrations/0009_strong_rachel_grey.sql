ALTER TABLE "hashtags" DROP CONSTRAINT "hashtags_name_unique";--> statement-breakpoint
ALTER TABLE "hashtags" ADD COLUMN "normalized_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "hashtags" ADD COLUMN "usage_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "hashtags" ADD CONSTRAINT "hashtags_normalized_name_unique" UNIQUE("normalized_name");