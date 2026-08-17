import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`ALTER TABLE profiles ADD COLUMN is_private BOOLEAN DEFAULT false NOT NULL`);
    await db.execute(sql`ALTER TABLE profiles ADD COLUMN allow_search_engine_indexing BOOLEAN DEFAULT true NOT NULL`);
    await db.execute(sql`ALTER TABLE profiles ADD COLUMN message_preference VARCHAR(20) DEFAULT 'ANYONE' NOT NULL`);
    await db.execute(sql`ALTER TABLE profiles ADD COLUMN mention_preference VARCHAR(20) DEFAULT 'ANYONE' NOT NULL`);
    await db.execute(sql`ALTER TABLE profiles ADD COLUMN default_post_visibility VARCHAR(20) DEFAULT 'PUBLIC' NOT NULL`);
    console.log("Success");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
main();
