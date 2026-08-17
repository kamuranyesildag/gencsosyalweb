import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function run() {
  const q = sql`
    EXPLAIN ANALYZE
    SELECT p.id
    FROM posts p
    ORDER BY GREATEST((p.base_score * 1.5) + 0 + 0 - ((SELECT COUNT(*) FROM post_views pv WHERE pv.post_id = p.id AND pv.user_id = 1) * 2), 0.1) 
      / POWER(GREATEST(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600, 0) + 2, 1.8) DESC
    LIMIT 20 OFFSET 0;
  `;
  const res = await db.execute(q);
  console.log(res);
  process.exit(0);
}
run();
