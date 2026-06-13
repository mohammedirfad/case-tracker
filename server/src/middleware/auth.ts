import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Role } from "../types/domain.js";
import { AppError } from "../utils/AppError.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        name: string;
        email: string;
      };
    }
  }
}

interface TokenPayload {
  sub: string;
}

export async function protect(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) return next(new AppError(401, "Authentication token is required"));

  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return next(new AppError(401, "Session expired. Please sign in again."));

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    };
    return next();
  } catch {
    return next(new AppError(401, "Session expired. Please sign in again."));
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "Authentication token is required"));
    if (!roles.includes(req.user.role)) return next(new AppError(403, "You do not have permission for this action"));
    return next();
  };
}
