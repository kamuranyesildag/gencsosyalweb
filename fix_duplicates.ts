import { db } from "./src/db/index.js";
import { reposts } from "./src/db/schema.js";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Removing duplicate reposts...");
  
  const query = sql`
    DELETE FROM reposts a USING (
      SELECT MIN(id) as id, user_id, post_id
      FROM reposts 
      GROUP BY user_id, post_id HAVING COUNT(*) > 1
    ) b
    WHERE a.user_id = b.user_id AND a.post_id = b.post_id AND a.id <> b.id;
  `;
  
  await db.execute(query);
  console.log("Duplicates removed.");
  process.exit(0);
}
main().catch(console.error);
