import { Router } from "express";
import { listAgents } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/auth.js";

export const userRouter = Router();

userRouter.use(protect);
userRouter.get("/agents", authorize("manager"), listAgents);
