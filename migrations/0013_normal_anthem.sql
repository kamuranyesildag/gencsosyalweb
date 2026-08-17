ALTER TABLE "post_views" DROP CONSTRAINT "post_views_community_id_communities_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_community_id_communities_id_fk";
--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_community_id_communities_id_fk";
--> statement-breakpoint
ALTER TABLE "reposts" DROP CONSTRAINT "reposts_community_id_communities_id_fk";
--> statement-breakpoint
ALTER TABLE "stories" DROP CONSTRAINT "stories_community_id_communities_id_fk";
--> statement-breakpoint
ALTER TABLE "verification_requests" DROP CONSTRAINT "verification_requests_community_id_communities_id_fk";
--> statement-breakpoint
ALTER TABLE "post_views" DROP COLUMN "community_id";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "community_id";--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP COLUMN "community_id";--> statement-breakpoint
ALTER TABLE "reposts" DROP COLUMN "community_id";--> statement-breakpoint
ALTER TABLE "stories" DROP COLUMN "community_id";--> statement-breakpoint
ALTER TABLE "verification_requests" DROP COLUMN "community_id";