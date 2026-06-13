import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      cb(new AppError(400, "Only PDF, JPG, PNG, and WebP files are allowed"));
      return;
    }
    cb(null, true);
  }
});
