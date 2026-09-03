import fs from 'fs';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema.ts';
import path from 'path';

declare global {
  var _postgresPool: Pool | undefined;
  var _pgliteClient: PGlite | undefined;
  var _dbInstance: any;
}

import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';

export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export const createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is missing");
    }
    return null;
  }
  
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      connectionString: connectionString,
      max: 10,
      connectionTimeoutMillis: 15000,
    });
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

export const createPglite = () => {
  if (!global._pgliteClient) {
    console.warn("=========================================================");
    console.warn("⚠️  UYARI: DATABASE_URL ortam değişkeni bulunamadı!");
    console.warn("Lokal PGlite (WASM) fallback veritabanı başlatılıyor...");
    console.warn("Tüm verileriniz ./database klasörüne kaydedilecektir.");
    console.warn("=========================================================");
    const dbPath = path.join(process.cwd(), 'database');
    try {
      global._pgliteClient = new PGlite(dbPath);
    } catch (err) {
      console.error("PGlite initialization failed, attempting to clear database folder...", err);
      try {
        fs.rmSync(dbPath, { recursive: true, force: true });
        global._pgliteClient = new PGlite(dbPath);
      } catch (retryErr) {
        console.error("Failed to recover PGlite:", retryErr);
        throw retryErr;
      }
    }
  }
  return global._pgliteClient;
}

export const getDb = () => {
  if (global._dbInstance) return global._dbInstance;
  
  const pool = createPool();
  if (pool) {
    global._dbInstance = drizzlePg(pool, { schema });
  } else {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is missing");
    }
    const client = createPglite();
    global._dbInstance = drizzlePglite(client, { schema });
  }
  
  return global._dbInstance;
}

// Export a Proxy that lazily initializes the database on first use.
// This prevents PGLite fallback creation during boot when DATABASE_URL is missing
// and we are simply trying to serve the Setup UI.
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(target, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

