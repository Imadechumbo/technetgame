import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

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

const allowedOrigins = [
  "https://technetgame.com.br",
  "https://www.technetgame.com.br",
  "https://technetgame-site.pages.dev"
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS bloqueado: " + origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
};

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(compression());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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