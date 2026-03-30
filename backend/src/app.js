import express from "express";
import helmet from "helmet";
import compression from "compression";

import healthRoutes from "./routes/healthRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import metaRoutes from "./routes/metaRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import hardwareRoutes from "./routes/hardwareRoutes.js";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by");
app.set("etag", "strong");
app.set("trust proxy", 1);

const allowedOrigins = new Set([
  "https://technetgame.com.br",
  "https://www.technetgame.com.br",
  "https://technetgame-site.pages.dev",
]);

/* CORS GLOBAL FORÇADO */
app.use((req, res, next) => {
  const origin = String(req.headers.origin || "").trim();

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Refresh-Token");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
}));

app.use(compression());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/hardware", hardwareRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;