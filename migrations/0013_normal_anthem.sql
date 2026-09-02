ALTER TABLE "post_views" DROP CONSTRAINT IF EXISTS "post_views_community_id_communities_id_fk";
--> statement-breakpoint

--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_community_id_communities_id_fk";
--> statement-breakpoint

--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "refresh_tokens_community_id_communities_id_fk";
--> statement-breakpoint

--> statement-breakpoint
ALTER TABLE "reposts" DROP CONSTRAINT IF EXISTS "reposts_community_id_communities_id_fk";
--> statement-breakpoint

--> statement-breakpoint
ALTER TABLE "stories" DROP CONSTRAINT IF EXISTS "stories_community_id_communities_id_fk";
--> statement-breakpoint

--> statement-breakpoint
ALTER TABLE "verification_requests" DROP CONSTRAINT IF EXISTS "verification_requests_community_id_communities_id_fk";
--> statement-breakpoint

--> statement-breakpoint
ALTER TABLE "post_views" DROP COLUMN IF EXISTS "community_id";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "community_id";--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP COLUMN IF EXISTS "community_id";--> statement-breakpoint
ALTER TABLE "reposts" DROP COLUMN IF EXISTS "community_id";--> statement-breakpoint
ALTER TABLE "stories" DROP COLUMN IF EXISTS "community_id";--> statement-breakpoint
ALTER TABLE "verification_requests" DROP COLUMN IF EXISTS "community_id";
--> statement-breakpoint
