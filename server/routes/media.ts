import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { requireAuth } from "../middleware/auth.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const mimeToExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "video/mp4": ".mp4"
};

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = mimeToExt[file.mimetype] || ".bin";
    const id = crypto.randomUUID();
    cb(null, `${id}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Desteklenmeyen dosya formatı."));
    }
  }
});

export const mediaRouter = Router();

mediaRouter.post("/upload", requireAuth, strictLimiter, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: err.message } });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Dosya yüklenemedi." } });
  }
  
  const url = `/uploads/${req.file.filename}`;
  const type = req.file.mimetype.startsWith('video') ? 'video' : 'image';
  
  res.json({ success: true, data: { url, type } });
});
