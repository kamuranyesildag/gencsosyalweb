import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import sharp from "sharp";
import { fileTypeFromFile } from "file-type";
import ffmpeg from "fluent-ffmpeg";
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
    // Uploadlanan dosyayı önce temp olarak kaydediyoruz.
    cb(null, `temp_${id}${ext}`);
  }
});

// Dangerous extensions check on original filename
const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.php', '.js', '.html', '.htm', '.jar', '.vbs', '.scr'];

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max limit to prevent memory bloat
  fileFilter: (req, file, cb) => {
    const allowedMimes = Object.keys(mimeToExt);
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error("Desteklenmeyen dosya formatı. Sadece JPG, PNG, GIF, WebP ve MP4."));
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

  const tempFilePath = req.file.path;
  const originalFileName = req.file.filename;
  // `temp_` önekini çıkarıp yeni kimlik (id) oluşturuyoruz.
  const baseId = originalFileName.replace(/^temp_/, '').split('.')[0];

  try {
    // 1. Verify actual MIME type using file-type (MIME Sniffing)
    const fileType = await fileTypeFromFile(tempFilePath);
    const allowed = Object.keys(mimeToExt);
    
    if (!fileType || !allowed.includes(fileType.mime)) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz veya desteklenmeyen dosya içeriği (MIME uyumsuz)." } });
    }

    // 2. Size limits based on file type
    const isImage = fileType.mime.startsWith("image/");
    const size = req.file.size;
    
    if (isImage && size > 5 * 1024 * 1024) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Görseller maksimum 5MB olabilir." } });
    }
    if (!isImage && size > 30 * 1024 * 1024) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Videolar maksimum 30MB olabilir." } });
    }

    let finalFileName = "";
    const uploadDir = getUploadDir();

    // 3. Process Images (WebP Convertion)
    if (isImage) {
      const metadata = await sharp(tempFilePath).metadata();
      
      // Zip bomb / memory exhaustion check
      if ((metadata.width && metadata.width > 8000) || (metadata.height && metadata.height > 8000)) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Görsel boyutları çok büyük (Max 8000x8000)." } });
      }

      // Convert everything to WebP to save space
      finalFileName = `${baseId}.webp`;
      const finalFilePath = path.join(uploadDir, finalFileName);
      
      await sharp(tempFilePath)
        .rotate()
        .webp({ quality: 80, effort: 4 }) // WebP format for great compression
        .toFile(finalFilePath);

      // Clean up temp
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      
      const url = `/uploads/${finalFileName}`;
      return res.json({ success: true, data: { url, type: 'image' } });
    } 
    // 4. Process Videos (MP4 Compression)
    else {
      finalFileName = `${baseId}_compressed.mp4`;
      const finalFilePath = path.join(uploadDir, finalFileName);

      // Compress video using fluent-ffmpeg
      ffmpeg(tempFilePath)
        .outputOptions([
          '-c:v libx264',    // H.264 codec
          '-crf 28',         // Constant Rate Factor (28 is highly compressed but acceptable)
          '-preset veryfast',// Faster encoding
          '-c:a aac',        // AAC audio
          '-b:a 128k',       // 128kbps audio
          '-movflags +faststart', // Optimize for web streaming
          '-vf scale=\'min(1280,iw)\':-2' // Max width 1280px, proportional height (must be even)
        ])
        .toFormat('mp4')
        .on('end', () => {
          // Clean up temp
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
          const url = `/uploads/${finalFileName}`;
          return res.json({ success: true, data: { url, type: 'video' } });
        })
        .on('error', (err) => {
          console.error("FFMPEG Error:", err);
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
          if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);
          return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Video sıkıştırma hatası." } });
        })
        .save(finalFilePath);
    }
  } catch (error) {
    console.error("Media upload error:", error);
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Medya işlenirken hata oluştu." } });
    }
  }
});

