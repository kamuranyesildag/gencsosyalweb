import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

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

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
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
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Geçersiz veya süresi dolmuş token." }
    });
  }
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

    if (req.user.role !== role && req.user.role !== "ADMIN") {
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
