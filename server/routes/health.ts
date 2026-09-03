import { Router } from "express";
import { db } from "../../src/db/index.js";
import { sql } from "drizzle-orm";

export const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
  let dbStatus = "ok";
  let error: any;
  let statusCode = 200;

  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = "ok";
  } catch (e: unknown) {
    dbStatus = "error";
    statusCode = 503;
    error = e;
    console.error("Health check DB error:", e);
  }

  res.status(statusCode).json({
    success: statusCode === 200,
    data: {
      api: "ok",
      database: dbStatus,
      error: error ? String(error) : undefined,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    }
  });
});
