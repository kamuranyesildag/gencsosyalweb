-- Clean up duplicate reposts before adding unique constraint
DELETE FROM "reposts" a USING (
  SELECT MIN(id) as id, user_id, post_id
  FROM "reposts"
  GROUP BY user_id, post_id HAVING COUNT(*) > 1
) b
WHERE a.user_id = b.user_id AND a.post_id = b.post_id AND a.id <> b.id;
--> statement-breakpoint

ALTER TABLE "reposts" ADD CONSTRAINT "reposts_user_post_unq" UNIQUE("user_id","post_id");
--> statement-breakpoint
