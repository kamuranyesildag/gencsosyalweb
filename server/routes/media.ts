import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import sharp from "sharp";
import { fileTypeFromFile } from "file-type";
import { requireAuth } from "../middleware/auth.js";
import { strictLimiter } from "../middleware/rateLimiter.js";
import { getUploadDir } from "../utils/uploadConfig.js";

const mimeToExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "video/mp4": ".mp4"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (req, file, cb) => {
    const ext = mimeToExt[file.mimetype] || ".bin";
    const id = crypto.randomBytes(16).toString("hex");
    cb(null, `${id}${ext}`);
  }
});

// Dangerous extensions check on original filename
const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.php', '.js', '.html', '.htm', '.jar', '.vbs', '.scr'];

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for video. Image is checked in controller.
  fileFilter: (req, file, cb) => {
    const allowedMimes = Object.keys(mimeToExt);
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error("Desteklenmeyen dosya formatı."));
    }
    
    if (file.originalname) {
      const originalExt = path.extname(file.originalname).toLowerCase();
      if (dangerousExts.includes(originalExt)) {
        return cb(new Error("Güvenlik nedeniyle bu dosya uzantısına izin verilmiyor."));
      }
    }
    cb(null, true);
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
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Dosya yüklenemedi." } });
  }
  
  const filePath = req.file.path;
  
  try {
    // 1. Verify actual MIME type using file-type (MIME Sniffing)
    const fileType = await fileTypeFromFile(filePath);
    const allowed = Object.keys(mimeToExt);
    
    if (!fileType || !allowed.includes(fileType.mime)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz veya desteklenmeyen dosya içeriği (MIME uyumsuz)." } });
    }

    // 2. Size limits based on file type
    const isImage = fileType.mime.startsWith("image/");
    const size = req.file.size;
    
    if (isImage && size > 5 * 1024 * 1024) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Görseller maksimum 5MB olabilir." } });
    }
    if (!isImage && size > 50 * 1024 * 1024) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Videolar maksimum 50MB olabilir." } });
    }

    // 3. Process Images (Dimensions check & EXIF strip)
    if (isImage) {
      const metadata = await sharp(filePath).metadata();
      
      // Zip bomb / memory exhaustion check
      if ((metadata.width && metadata.width > 8000) || (metadata.height && metadata.height > 8000)) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Görsel boyutları çok büyük (Max 8000x8000)." } });
      }

      // Strip EXIF metadata
      const processedBuffer = await sharp(filePath).rotate().toBuffer();
      fs.writeFileSync(filePath, processedBuffer);
    }

    const url = `/uploads/${req.file.filename}`;
    const type = isImage ? 'image' : 'video';
    
    res.json({ success: true, data: { url, type } });
  } catch (error) {
    console.error("Media upload error:", error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Medya işlenirken hata oluştu." } });
  }
});
