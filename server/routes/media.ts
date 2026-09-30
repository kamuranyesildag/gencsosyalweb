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
import { videoTranscodeQueue } from "../utils/transcodeQueue.js";

// Ensure fluent-ffmpeg uses system binaries
if (fs.existsSync("/usr/bin/ffmpeg")) {
  ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
}
if (fs.existsSync("/usr/bin/ffprobe")) {
  ffmpeg.setFfprobePath("/usr/bin/ffprobe");
}

const MIME_CONFIG: Record<string, { ext: string; isVideo: boolean }> = {
  "image/jpeg": { ext: ".jpg", isVideo: false },
  "image/png": { ext: ".png", isVideo: false },
  "image/gif": { ext: ".gif", isVideo: false },
  "image/webp": { ext: ".webp", isVideo: false },
  "video/mp4": { ext: ".mp4", isVideo: true },
  "video/quicktime": { ext: ".mov", isVideo: true },
  "video/webm": { ext: ".webm", isVideo: true },
  "video/x-matroska": { ext: ".mkv", isVideo: true },
  "video/3gpp": { ext: ".3gp", isVideo: true },
  "video/x-msvideo": { ext: ".avi", isVideo: true },
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (req, file, cb) => {
    const conf = MIME_CONFIG[file.mimetype];
    const ext = conf ? conf.ext : path.extname(file.originalname).toLowerCase() || ".bin";
    const id = crypto.randomBytes(16).toString("hex");
    cb(null, `temp_raw_${id}${ext}`);
  }
});

const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.php', '.js', '.html', '.htm', '.jar', '.vbs', '.scr'];

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max upload limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = Object.keys(MIME_CONFIG);
    // Allow if mime is recognized or if extension matches standard video/image
    const ext = path.extname(file.originalname).toLowerCase();
    if (dangerousExts.includes(ext)) {
      return cb(new Error("Güvenlik nedeniyle bu dosya uzantısına izin verilmiyor."));
    }
    
    if (!allowedMimes.includes(file.mimetype) && !file.mimetype.startsWith("video/") && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Desteklenmeyen dosya formatı. Desteklenenler: JPG, PNG, GIF, WebP, MP4, MOV, WebM."));
    }
    cb(null, true);
  }
});

export const mediaRouter = Router();

mediaRouter.post("/upload", requireAuth, strictLimiter, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ 
          success: false, 
          error: { code: "FILE_TOO_LARGE", message: "Dosya boyutu çok büyük (Maksimum 100MB)." } 
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: { code: "BAD_REQUEST", message: err.message || "Dosya yüklenemedi." } 
      });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Lütfen bir dosya seçin." } });
  }

  const tempFilePath = req.file.path;
  const originalFileName = req.file.filename;
  const baseId = originalFileName.replace(/^temp_raw_/, '').split('.')[0];
  const uploadDir = getUploadDir();

  let isAborted = false;
  let activeFfmpegProcess: any = null;
  const finalFilePath = path.join(uploadDir, `${baseId}_compressed.mp4`);
  const thumbFilePath = path.join(uploadDir, `${baseId}_thumb.webp`);

  // Handle client disconnection / abort
  req.on("close", () => {
    if (!res.writableEnded) {
      isAborted = true;
      console.log(`[video] Request closed by client for task ${baseId}`);
      if (activeFfmpegProcess) {
        try {
          activeFfmpegProcess.kill("SIGKILL");
        } catch (e) {}
      }
      videoTranscodeQueue.cancel(baseId);
      // Clean up temporary files immediately
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);
        if (fs.existsSync(thumbFilePath)) fs.unlinkSync(thumbFilePath);
      } catch (e) {}
    }
  });

  try {
    // 1. Verify actual MIME type using file-type
    const detected = await fileTypeFromFile(tempFilePath);
    let mime = detected?.mime || req.file.mimetype;

    const isVideo = mime.startsWith("video/") || ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska", "video/3gpp"].includes(mime);
    const isImage = mime.startsWith("image/");

    if (!isVideo && !isImage) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ 
        success: false, 
        error: { code: "INVALID_FILE_TYPE", message: "Geçersiz veya desteklenmeyen dosya içeriği." } 
      });
    }

    const fileSize = req.file.size;

    // 2. Size limits based on file type
    if (isImage && fileSize > 10 * 1024 * 1024) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ 
        success: false, 
        error: { code: "IMAGE_TOO_LARGE", message: "Görseller maksimum 10MB olabilir." } 
      });
    }

    if (isVideo && fileSize > 100 * 1024 * 1024) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ 
        success: false, 
        error: { code: "VIDEO_TOO_LARGE", message: "Videolar maksimum 100MB olabilir." } 
      });
    }

    // 3. Process Images
    if (isImage) {
      const imageFileName = `${baseId}.webp`;
      const imageFilePath = path.join(uploadDir, imageFileName);

      const metadata = await sharp(tempFilePath).metadata();

      if ((metadata.width && metadata.width > 8000) || (metadata.height && metadata.height > 8000)) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        return res.status(400).json({ 
          success: false, 
          error: { code: "BAD_DIMENSIONS", message: "Görsel boyutları çok büyük (Maksimum 8000x8000)." } 
        });
      }

      await sharp(tempFilePath)
        .rotate() // auto rotate based on EXIF
        .webp({ quality: 82, effort: 4 })
        .toFile(imageFilePath);

      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

      const url = `/uploads/${imageFileName}`;
      return res.json({ 
        success: true, 
        data: { 
          url, 
          type: "image",
          width: metadata.width,
          height: metadata.height
        } 
      });
    }

    // 4. Process Videos
    console.log(`[video] Inspecting video metadata for ${baseId} (${(fileSize / 1024 / 1024).toFixed(1)} MB)`);

    // ffprobe inspection with Promise
    const metadata: ffmpeg.FfprobeData = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(tempFilePath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    const videoStream = metadata.streams.find(s => s.codec_type === "video");
    if (!videoStream) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ 
        success: false, 
        error: { code: "NO_VIDEO_STREAM", message: "Dosya geçerli bir video akışı içermiyor." } 
      });
    }

    const rawDuration = metadata.format.duration ?? videoStream.duration ?? 0;
    const duration = Math.round(Number(rawDuration) || 0);
    if (duration > 600) { // 10 minutes limit
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ 
        success: false, 
        error: { code: "VIDEO_TOO_LONG", message: "Video süresi en fazla 10 dakika (600 saniye) olabilir." } 
      });
    }

    const hasAudio = metadata.streams.some(s => s.codec_type === "audio");
    const origWidth = videoStream.width || 1280;
    const origHeight = videoStream.height || 720;

    console.log(`[video] ffprobe check passed for ${baseId}: duration=${duration}s, res=${origWidth}x${origHeight}, hasAudio=${hasAudio}`);

    if (isAborted) return;

    // Run transcoding through concurrency queue
    await videoTranscodeQueue.enqueue(
      baseId,
      () => {
        return new Promise<void>((resolve, reject) => {
          if (isAborted) {
            return reject(new Error("Transcoding aborted by client."));
          }

          console.log(`[video] Starting FFmpeg transcoding for ${baseId}...`);

          const cmd = ffmpeg(tempFilePath)
            .outputOptions([
              "-c:v libx264",
              "-preset veryfast",
              "-crf 26",
              "-pix_fmt yuv420p",
              // Safe scaling filter: fits in 1280x1280 box, truncates width & height to even numbers
              "-vf scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
              "-movflags +faststart",
            ]);

          if (hasAudio) {
            cmd.outputOptions(["-c:a aac", "-b:a 128k"]);
          } else {
            cmd.outputOptions(["-an"]);
          }

          // Timeout after 180s to prevent hanging
          const timeoutTimer = setTimeout(() => {
            console.error(`[video] Transcode timeout (180s) reached for ${baseId}`);
            try {
              cmd.kill("SIGKILL");
            } catch (e) {}
            reject(new Error("Video işleme süresi zaman aşımına uğradı."));
          }, 180000);

          cmd
            .toFormat("mp4")
            .on("start", (commandLine) => {
              console.log(`[video] FFmpeg process started for ${baseId}`);
            })
            .on("progress", (progress) => {
              // Can be monitored if needed
            })
            .on("end", async () => {
              clearTimeout(timeoutTimer);
              activeFfmpegProcess = null;
              console.log(`[video] Transcoding finished for ${baseId}`);

              // Generate thumbnail at 1s (or 0s if short)
              try {
                const seekTime = duration > 1 ? 1 : 0;
                await new Promise<void>((thumbResolve) => {
                  ffmpeg(finalFilePath)
                    .screenshots({
                      timestamps: [seekTime],
                      filename: `${baseId}_thumb.png`,
                      folder: uploadDir,
                      size: "640x?"
                    })
                    .on("end", async () => {
                      const tempPng = path.join(uploadDir, `${baseId}_thumb.png`);
                      if (fs.existsSync(tempPng)) {
                        try {
                          await sharp(tempPng).webp({ quality: 75 }).toFile(thumbFilePath);
                          fs.unlinkSync(tempPng);
                        } catch (e) {}
                      }
                      thumbResolve();
                    })
                    .on("error", () => {
                      // Non-fatal if thumbnail fails
                      thumbResolve();
                    });
                });
              } catch (thumbErr) {
                console.warn(`[video] Thumbnail generation warning for ${baseId}:`, thumbErr);
              }

              resolve();
            })
            .on("error", (err) => {
              clearTimeout(timeoutTimer);
              activeFfmpegProcess = null;
              console.error(`[video] FFmpeg error for ${baseId}:`, err.message);
              reject(err);
            })
            .save(finalFilePath);

          activeFfmpegProcess = cmd;
        });
      },
      () => {
        // Cancel handler
        if (activeFfmpegProcess) {
          try {
            activeFfmpegProcess.kill("SIGKILL");
          } catch (e) {}
        }
      }
    );

    if (isAborted) return;

    // Verify output file exists and has size > 0
    if (!fs.existsSync(finalFilePath) || fs.statSync(finalFilePath).size === 0) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);
      return res.status(500).json({ 
        success: false, 
        error: { code: "TRANSCODE_EMPTY", message: "Video işlenemedi veya çıktı dosyası boş." } 
      });
    }

    // Clean up original temp raw file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    const compressedSize = fs.statSync(finalFilePath).size;
    console.log(`[video] Transcoding successful for ${baseId}: ${(compressedSize / 1024 / 1024).toFixed(1)} MB`);

    const finalVideoUrl = `/uploads/${baseId}_compressed.mp4`;
    const finalThumbUrl = fs.existsSync(thumbFilePath) ? `/uploads/${baseId}_thumb.webp` : undefined;

    return res.json({
      success: true,
      data: {
        url: finalVideoUrl,
        thumbnailUrl: finalThumbUrl,
        type: "video",
        duration,
        width: origWidth,
        height: origHeight,
        size: compressedSize
      }
    });

  } catch (error: any) {
    console.error(`[video] Media upload/transcode failure for ${baseId}:`, error);

    // Clean up temporary files on error
    try {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);
      if (fs.existsSync(thumbFilePath)) fs.unlinkSync(thumbFilePath);
    } catch (e) {}

    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false, 
        error: { 
          code: "MEDIA_PROCESSING_FAILED", 
          message: "Video sıkıştırılamadı. Dosya bozuk veya desteklenmeyen bir formatta olabilir." 
        } 
      });
    }
  }
});
