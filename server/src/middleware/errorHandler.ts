import { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : "Something went wrong";

  res.status(statusCode).json({
    message,
    details: err instanceof AppError ? err.details : undefined,
    stack: env.nodeEnv === "development" ? err.stack : undefined
  });
};
