import path from "path";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { sql } from "drizzle-orm";
import { db, createPool, createPglite } from "../src/db/index.js";

export async function runMigration(isStandalone = false) {
  if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
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

    // Direct idempotent safety checks for Community Management (FAZ 65)
    try {
      await db.execute(sql`ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "category" varchar(50) DEFAULT 'Genel' NOT NULL;`);
      await db.execute(sql`ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "is_private" boolean DEFAULT false NOT NULL;`);
      await db.execute(sql`ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "rules" text;`);
      await db.execute(sql`ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;`);
      await db.execute(sql`ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "community_id" integer;`);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "community_join_requests" (
          "id" serial PRIMARY KEY NOT NULL,
          "community_id" integer NOT NULL REFERENCES "communities"("id") ON DELETE CASCADE,
          "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
          "note" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "community_join_requests_user_community_unq" ON "community_join_requests" ("community_id", "user_id");`);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "community_audit_logs" (
          "id" serial PRIMARY KEY NOT NULL,
          "community_id" integer NOT NULL REFERENCES "communities"("id") ON DELETE CASCADE,
          "actor_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "target_user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
          "action" varchar(50) NOT NULL,
          "details" text,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "community_audit_logs_community_idx" ON "community_audit_logs" ("community_id");`);
    } catch (safeErr) {
      console.warn("Community schema safety check note:", safeErr);
    }

    console.log("✅ Database migrations completed successfully.");
  } catch (error: any) {
    console.error("❌ Database migration failed:", error);
    exitCode = 1;
  } finally {
    if (isStandalone) {
      try {
        if (global._postgresPool) {
          await global._postgresPool.end();
        }
        if (global._pgliteClient) {
          await global._pgliteClient.close();
        }
      } catch(e) {}
      process.exit(exitCode);
    }
  }
}

if (process.argv[1] && process.argv[1].includes("migrate")) {
  runMigration(true);
}
