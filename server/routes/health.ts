import { Router } from "express";
import { db } from "../../src/db/index.js";
import { sql } from "drizzle-orm";

export const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
  let dbStatus = "ok";
  let error: any;
  try {
    await db.execute(sql`SELECT 1`);
  } catch (e) {
    dbStatus = "error";
    error = String(e) + (e.stack ? e.stack : "");
    console.error("Health check DB error:", e);
  }

  res.json({
    success: true,
    data: {
      api: "ok",
      database: dbStatus,
      error: typeof error !== "undefined" ? (error as any).message : undefined,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    }
  });
});
