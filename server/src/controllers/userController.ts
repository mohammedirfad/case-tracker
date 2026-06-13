import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listAgents = asyncHandler(async (_req, res) => {
  const agents = await User.find({ role: "agent", isActive: true }).sort({ name: 1 });
  res.json({ agents });
});
