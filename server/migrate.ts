import path from "path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, createPool } from "../src/db/index.js";

async function runMigration() {
  if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
  }

  let exitCode = 0;
  console.log("🚀 Starting database migration...");
  try {
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "migrations") });
    console.log("✅ Database migrations completed successfully.");
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    exitCode = 1;
  } finally {
    try {
      const pool = createPool();
      await pool.end();
    } catch(e) {}
    process.exit(exitCode);
  }
}

runMigration();
