import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
import healthRoutes from "./routes/healthRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import metaRoutes from "./routes/metaRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by");
app.set("etag", "strong");

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }),
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));

const configuredOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN.split(",").map((value) => value.trim())
    : []),
].filter(Boolean);

if (process.env.ENABLE_CORS !== "false") {
  app.use(
    cors({
      origin(origin, callback) {
        if (
          !origin ||
          configuredOrigins.length === 0 ||
          configuredOrigins.includes(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error(`Origin não permitida: ${origin}`));
      },
      credentials: true,
    }),
  );
}

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "technetgame-api",
    status: "online",
  });
});

app.use("/api", healthRoutes);
app.use("/api", metaRoutes);
app.use("/api", mediaRoutes);
app.use("/api", newsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
