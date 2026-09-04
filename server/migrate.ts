import path from "path";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
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
    console.log("✅ Database migrations completed successfully.");
  } catch (error: any) {
    const errorCode = error?.code || error?.cause?.code;
    const errorMsg = String(error?.message || error?.cause?.message || "");

    if (errorCode === "42P07" || errorCode === "42710" || errorCode === "42701" || errorMsg.includes("already exists")) {
      console.warn("⚠️ Veritabanı tabloları veya şema nesneleri zaten mevcut (" + (errorCode || "already exists") + ").");
      console.log("ℹ️ Mevcut veritabanı şeması korunarak devam ediliyor.");
      exitCode = 0;
    } else {
      console.error("❌ Database migration failed:", error);
      exitCode = 1;
    }
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
