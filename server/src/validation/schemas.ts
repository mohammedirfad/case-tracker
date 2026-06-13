import Joi from "joi";
import { caseStatuses } from "../types/domain.js";

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(72).required(),
  role: Joi.string().valid("manager", "agent").required()
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required()
});

export const createCaseSchema = Joi.object({
  clientName: Joi.string().trim().min(2).max(120).required(),
  subjectName: Joi.string().trim().min(2).max(120).required(),
  caseType: Joi.string().trim().min(2).max(80).required(),
  dueDate: Joi.date().iso().greater("now").required(),
  assignedAgent: Joi.string().hex().length(24).optional().allow(null, "")
});

export const listCasesQuerySchema = Joi.object({
  search: Joi.string().trim().allow("").default(""),
  status: Joi.string().valid(...caseStatuses, "").default(""),
  agent: Joi.string().hex().length(24).allow("").default(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(5).max(50).default(10)
});

export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

export const assignCaseSchema = Joi.object({
  agentId: Joi.string().hex().length(24).required(),
  note: Joi.string().trim().max(500).allow("").default("")
});

export const statusSchema = Joi.object({
  note: Joi.string().trim().max(1000).allow("").default("")
});

export const reviewSchema = Joi.object({
  verdict: Joi.string().valid("Cleared", "Discrepant").required(),
  note: Joi.string().trim().min(3).max(1000).required()
});

export const commentSchema = Joi.object({
  message: Joi.string().trim().min(2).max(1000).required()
});
