import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, generateSuspensionToken } from "../utils/jwt.js";
import { db } from "../../src/db/index.js";
import { users } from "../../src/db/schema.js";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
        username?: string;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Yetkilendirme token'ı bulunamadı." }
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Geçersiz kullanıcı context'i." }
      });
      return;
    }

    // Verify account active status in database
    const userRecord = await db.select({
      id: users.id,
      isActive: users.isActive,
      banReason: users.banReason,
      bannedAt: users.bannedAt,
      banExpiresAt: users.banExpiresAt
    }).from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (userRecord.length === 0) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Kullanıcı bulunamadı." }
      });
      return;
    }

    const u = userRecord[0];
    if (!u.isActive) {
      // Check if temporary ban has expired
      if (u.banExpiresAt && new Date(u.banExpiresAt) <= new Date()) {
        await db.update(users).set({
          isActive: true,
          banReason: null,
          bannedAt: null,
          banExpiresAt: null,
          updatedAt: new Date()
        }).where(eq(users.id, u.id));
      } else {
        const suspensionToken = generateSuspensionToken(u.id, decoded.username || '');
        res.status(403).json({
          success: false,
          error: {
            code: "ACCOUNT_SUSPENDED",
            message: "Hesabınız askıya alınmıştır.",
            suspension: {
              userId: u.id,
              isPermanent: !u.banExpiresAt,
              banReason: u.banReason || "Topluluk kurallarının ihlali",
              bannedAt: u.bannedAt,
              banExpiresAt: u.banExpiresAt,
              suspensionToken
            }
          }
        });
        return;
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Geçersiz veya süresi dolmuş token." }
    });
  }
};

export const getUserId = (req: Request): number => {
  if (!req.user || !req.user.userId) {
    throw new Error("UNAUTHORIZED_ACCESS");
  }
  return req.user.userId;
};


export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Lütfen giriş yapın." }
      });
      return;
    }

    if (req.user.role.toUpperCase() !== role.toUpperCase() && req.user.role.toUpperCase() !== "ADMIN") {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Bu işlem için yetkiniz yok." }
      });
      return;
    }

    next();
  };
};


export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      // ignore
    }
  }
  next();
};



export const optionalAuthContext = (req: Request): number | null => {
  return req.user?.userId || null;
};

export class AuthContextError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.status = 401;
    this.name = "AuthContextError";
  }
}

export const requireAuthContext = (req: Request): number => {
  if (!req.user || !req.user.userId) {
    throw new AuthContextError("UNAUTHORIZED_CONTEXT");
  }
  return req.user.userId;
};

