import { ensureUploadDir, getUploadDir } from "./server/utils/uploadConfig.js";
import { onboardingRouter } from "./server/routes/onboarding.js";
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
  import("dotenv").then((dotenv) => dotenv.config());
}

async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  const app = express();

  // Trust reverse proxy (Nginx/Cloudflare) for rate limiting and IP logging
  // Trust reverse proxies (Nginx / Cloudflare) to get real IPs
  // We set it to trust the loopback / internal docker network IPs, or just 'loopback, linklocal, uniquelocal'
  app.set("trust proxy", 1);
  const PORT = 3000;

  // Security and utilities middlewares
  app.use(helmet({
    contentSecurityPolicy: isProd ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000", "wss:"],
        fontSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:"],
        frameSrc: ["'none'"],
        
      },
    } : false,
    crossOriginEmbedderPolicy: false,
  }));
  const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000").split(',');
  app.use(cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Ensure upload directory exists
  ensureUploadDir();
  // Serve uploads statically
  app.use("/uploads", express.static(getUploadDir()));

  
  // --- API Routes Start ---
  const { setupRouter } = await import("./server/routes/setup.js");
  app.use("/api/setup", setupRouter);

  const { healthRouter } = await import("./server/routes/health.js");
  app.use("/api/v1/health", healthRouter);
  app.use("/api/health", healthRouter);

  
    const { sitemapRouter } = await import("./server/routes/sitemap.js");
    app.use("/", sitemapRouter);
    const { projectsRouter } = await import("./server/routes/projects.js");
    app.use("/api/v1/projects", projectsRouter);
    
    const { authRouter } = await import("./server/routes/auth.js");
    app.use("/api/v1/auth", authRouter);
    const { usersRouter } = await import("./server/routes/users.js");
    app.use("/api/v1/users", usersRouter);

    const { postsRouter } = await import("./server/routes/posts.js");
    app.use("/api/v1/posts", postsRouter);

    const { feedRouter } = await import("./server/routes/feed.js");
    app.use("/api/v1/feed", feedRouter);

    const { userPostsRouter } = await import("./server/routes/userPosts.js");
    app.use("/api/v1/users", userPostsRouter);

    const { followsRouter } = await import("./server/routes/follows.js");
    app.use("/api/v1/users", followsRouter);

    const { bookmarksRouter } = await import("./server/routes/bookmarks.js");
    app.use("/api/v1/bookmarks", bookmarksRouter);

    const { searchRouter } = await import("./server/routes/search.js");
    app.use("/api/v1/search", searchRouter);

    const { notificationsRouter } = await import("./server/routes/notifications.js");
    app.use("/api/v1/notifications", notificationsRouter);

    const { blocksRouter } = await import("./server/routes/blocks.js");
    app.use("/api/v1/users", blocksRouter);
    const { mediaRouter } = await import("./server/routes/media.js");
    app.use("/api/v1/media", mediaRouter);

    const { storiesRouter } = await import("./server/routes/stories.js");
    app.use("/api/v1/stories", storiesRouter);

    const { messagesRouter } = await import("./server/routes/messages.js");
    app.use("/api/v1/messages", messagesRouter);

    const { communitiesRouter } = await import("./server/routes/communities.js");
    app.use("/api/v1/communities", communitiesRouter);
    const { reactionsRouter } = await import("./server/routes/reactions.js");
    app.use("/api/v1/posts", reactionsRouter);
    const { commentsRouter } = await import("./server/routes/comments.js");
    app.use("/api/v1/posts", commentsRouter);
    const { reportsRouter } = await import("./server/routes/reports.js");
    app.use("/api/v1/reports", reportsRouter);
    
    const { adminRouter } = await import("./server/routes/admin.js");
    const { verificationRouter } = await import("./server/routes/verification.js");
    const { hashtagsRouter } = await import("./server/routes/hashtags.js");
    const { collaboratorsRouter } = await import("./server/routes/collaborators.js");
    app.use("/api/v1/admin", adminRouter);
    app.use("/api/v1/verification", verificationRouter);
    app.use("/api/v1/hashtags", hashtagsRouter);
    app.use("/api/v1/collaborators", collaboratorsRouter);
    app.use("/api/v1/onboarding", onboardingRouter);

    const { seoMiddleware } = await import("./server/middleware/seo.js");
    app.use(seoMiddleware);
  
// --- API Routes End ---

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // API 404 handler - prevents API calls from returning index.html
    app.use('/api', (req, res) => {
      res.status(404).json({ success: false, error: { message: "API endpoint not found." } });
    });

    // SPA fallback
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Genç Sosyal Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
