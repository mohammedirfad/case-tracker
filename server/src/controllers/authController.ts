import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

function signToken(userId: string) {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign({ sub: userId }, env.jwtSecret, options);
}

export const signup = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new AppError(409, "Email is already registered");

  const user = await User.create(req.body);
  res.status(201).json({ token: signToken(user.id), user });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError(401, "Invalid email or password");
  }
  if (!user.isActive) throw new AppError(403, "This account is disabled");

  res.json({ token: signToken(user.id), user });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
