import path from "path";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { db, createPool, createPglite } from "../src/db/index.js";

async function runMigration() {
  if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
  }

  if (process.env.NODE_ENV === "production" && process.env.SETUP_COMPLETED !== "true") {
    console.log("⚠️ SETUP_COMPLETED is not true. Skipping database migration during Setup Mode.");
    process.exit(0);
  }

  let exitCode = 0;
  console.log("🚀 Starting database migration...");

  try {
    const pool = createPool();
    if (pool) {
      await migratePg(db, { migrationsFolder: path.join(process.cwd(), "migrations") });
    } else {
      await migratePglite(db, { migrationsFolder: path.join(process.cwd(), "migrations") });
    }
    console.log("✅ Database migrations completed successfully.");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    exitCode = 1;
  } finally {
    try {
      const pool = createPool();
      if (pool) await pool.end();
      
      const pglite = createPglite();
      if (pglite) await pglite.close();
    } catch(e) {}
    process.exit(exitCode);
  }
}

runMigration();
