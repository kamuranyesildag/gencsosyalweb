import { Router } from "express";
import { db } from "../../src/db/index.js";
import type { DbTransaction } from "../../src/db/index.js";
import { users } from "../../src/db/schema.js";
import { sql, eq } from "drizzle-orm";
import * as argon2 from "argon2";
import nodemailer from "nodemailer";

export const setupRouter = Router();

// Setup lock check
setupRouter.use(async (req, res, next) => {
  // If explicitly locked via ENV
  if (process.env.SETUP_COMPLETED === "true") {
    return res.status(403).json({ success: false, error: { message: "Setup is already completed and locked by environment." } });
  }

  // Check DB to see if admin exists
  try {
    const adminUser = await db.query.users.findFirst({
      where: eq(users.role, "admin"),
    });

    if (adminUser) {
      // Admin exists, which means setup is completed. Lock it.
      return res.status(403).json({ success: false, error: { message: "Setup is already completed and locked by database state." } });
    }
  } catch (error) {
    // If DB check fails, it might be uninitialized, proceed.
  }

  next();
});

// GET /api/setup/status
setupRouter.get("/status", async (req, res) => {
  const statusReport = {
    state: "UNINITIALIZED",
    steps: [] as any[],
  };

  // Check Environment Validation
  const requiredEnv = [
    "POSTGRES_PASSWORD", "DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET", 
    "JWT_EMAIL_SECRET", "JWT_2FA_SECRET", "ENCRYPTION_KEY"
  ];
  const missingEnv = requiredEnv.filter(k => !process.env[k]);

  if (missingEnv.length > 0) {
    statusReport.steps.push({
      step: "ENVIRONMENT_VALIDATION",
      status: "FAILED",
      message: "Missing required secure secrets.",
      diagnostic_code: "ENV_MISSING_SECRETS"
    });
    statusReport.state = "FAILED";
    return res.json({ success: true, data: statusReport });
  }
  
  statusReport.steps.push({
    step: "ENVIRONMENT_VALIDATION",
    status: "SUCCESS",
    message: "Environment secrets verified.",
    diagnostic_code: "ENV_OK"
  });

  // Check Database Connection
  try {
    await db.execute(sql`SELECT 1`);
    statusReport.steps.push({
      step: "DATABASE_CONNECTION",
      status: "SUCCESS",
      message: "Database connection established.",
      diagnostic_code: "DB_OK"
    });
    statusReport.state = "DATABASE_READY";
  } catch (e: unknown) {
    statusReport.steps.push({
      step: "DATABASE_CONNECTION",
      status: "FAILED",
      message: "Database connection failed.",
      diagnostic_code: "DB_CONN_FAIL"
    });
    statusReport.state = "FAILED";
    return res.json({ success: true, data: statusReport });
  }

  // Check Migration by attempting to select from users
  try {
    await db.execute(sql`SELECT count(*) FROM users`);
    statusReport.steps.push({
      step: "DATABASE_MIGRATION",
      status: "SUCCESS",
      message: "Database schema is migrated.",
      diagnostic_code: "DB_MIGRATED"
    });
    statusReport.state = "MIGRATED";
  } catch (e: unknown) {
    statusReport.steps.push({
      step: "DATABASE_MIGRATION",
      status: "FAILED",
      message: "Database schema migration missing.",
      diagnostic_code: "DB_NOT_MIGRATED"
    });
    statusReport.state = "FAILED";
    return res.json({ success: true, data: statusReport });
  }

  // Check SMTP
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    statusReport.steps.push({
      step: "SMTP_CONFIGURATION",
      status: "PARTIAL",
      message: "SMTP is not fully configured.",
      diagnostic_code: "SMTP_NOT_CONFIGURED"
    });
  } else {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.verify();
      statusReport.steps.push({
        step: "SMTP_CONFIGURATION",
        status: "SUCCESS",
        message: "SMTP connection successful.",
        diagnostic_code: "SMTP_OK"
      });
    } catch (e: unknown) {
      statusReport.steps.push({
        step: "SMTP_CONFIGURATION",
        status: "FAILED",
        message: "SMTP configuration is invalid.",
        diagnostic_code: "SMTP_VERIFY_FAIL"
      });
    }
  }

  res.json({ success: true, data: statusReport });
});

// POST /api/setup/run
setupRouter.post("/run", async (req, res) => {
  const { adminEmail, adminUsername, adminPassword, adminFullName } = req.body;

  if (!adminEmail || !adminUsername || !adminPassword || !adminFullName) {
    return res.status(400).json({ success: false, error: { message: "Missing admin credentials." } });
  }

  try {
    const result = await db.transaction(async (tx: DbTransaction) => {
      // Advisory / Transaction lock check
      const existingAdmin = await tx.query.users.findFirst({
        where: eq(users.role, "admin"),
      });

      if (existingAdmin) {
        throw new Error("ADMIN_EXISTS");
      }

      // Hash password with Argon2
      const hashedPassword = await argon2.hash(adminPassword);

      // Create Admin
      const newAdmin = await tx.insert(users).values({
        email: adminEmail,
        username: adminUsername,
        passwordHash: hashedPassword,
        
        role: "admin",
        isVerified: true,
      }).returning();

      return newAdmin[0];
    });

    return res.json({ 
      success: true, 
      data: { 
        state: "COMPLETED",
        message: "Setup finished successfully.",
        // Do not return any secrets or passwords
      } 
    });

  } catch (error: unknown) {
    if ((error as Error).message === "ADMIN_EXISTS") {
      return res.status(403).json({ success: false, error: { message: "Setup is already completed and locked." } });
    }
    console.error("Setup run error:", error);
    return res.status(500).json({ success: false, error: { message: "An error occurred during setup." } });
  }
});
