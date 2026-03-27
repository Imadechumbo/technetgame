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

// segurança básica
app.disable("x-powered-by");
app.set("etag", "strong");

// proxy (Railway / Cloudflare)
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// middlewares
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));

// 🔥 CORS LIBERADO (resolve Cloudflare Pages)
app.use(cors());
app.options("*", cors());

// rate limit
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// rota base
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "technetgame-api",
    status: "online",
  });
});

// rotas
app.use("/api", healthRoutes);
app.use("/api", metaRoutes);
app.use("/api", mediaRoutes);
app.use("/api", newsRoutes);

// erros
app.use(notFoundHandler);
app.use(errorHandler);

export default app;