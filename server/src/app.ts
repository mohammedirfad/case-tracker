import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { openApiDocument } from "./docs/openApi.js";
import { authRouter } from "./routes/authRoutes.js";
import { caseRouter } from "./routes/caseRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();
const allowedOrigins = env.clientUrl.split(",").map((origin) => origin.trim()).filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors((req, callback) => {
    const forwardedProto = req.header("x-forwarded-proto") ?? req.protocol;
    const sameHostOrigin = `${forwardedProto}://${req.header("host")}`;

    callback(null, {
      origin(origin, originCallback) {
        if (!origin || allowedOrigins.includes(origin) || origin === sameHostOrigin) {
          originCallback(null, true);
          return;
        }
        originCallback(null, false);
      },
      credentials: true
    });
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/uploads", express.static(path.resolve(env.uploadDir)));
app.get("/api/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/cases", caseRouter);

app.use(notFound);
app.use(errorHandler);
