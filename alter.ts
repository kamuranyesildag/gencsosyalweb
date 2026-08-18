import { db, createPool } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;`);
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    const pool = createPool();
    await pool.end();
  }
}
main();
