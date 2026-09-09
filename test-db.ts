import { db, createPglite } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function run() {
  const pglite = createPglite();
  try {
    const res = await pglite.query(`select "posts"."id", "posts"."content", "posts"."post_type", "posts"."content_warning", "posts"."visibility", "posts"."view_count", "posts"."created_at", "posts"."quoted_post_id", "posts"."user_id", "users"."id", "users"."username", "profiles"."display_name", "profiles"."avatar_url", "users"."is_verified" from "posts" inner join "users" on "posts"."user_id" = "users"."id" left join "profiles" on "users"."id" = "profiles"."user_id" where ("posts"."community_id" is null and "posts"."moderation_status" = 'APPROVED' and "posts"."created_at" >= NOW() - INTERVAL '30 days' and "posts"."visibility" = 'PUBLIC') order by GREATEST(("posts"."base_score" * 1.0) + 0 + 0 - (0 * 3.0), 0.1) / POWER(GREATEST(EXTRACT(EPOCH FROM (NOW() - "posts"."created_at")) / 3600, 0) + 2.0, 1.5) desc limit 20;`);
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pglite.close();
  }
}
run();
