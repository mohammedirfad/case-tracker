import { FilterQuery, Types } from "mongoose";
import { AuditLog } from "../models/AuditLog.js";
import { Case, CaseDocument } from "../models/Case.js";
import { Comment } from "../models/Comment.js";
import { Document } from "../models/Document.js";
import { User } from "../models/User.js";
import { CaseStatus } from "../types/domain.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertCaseAccess } from "../services/caseAccess.js";
import { transitionCase } from "../services/status.js";

const casePopulate = [
  { path: "assignedAgent", select: "name email role" },
  { path: "createdBy", select: "name email role" }
];

export const createCase = asyncHandler(async (req, res) => {
  const assignedAgent = req.body.assignedAgent || null;
  const status: CaseStatus = assignedAgent ? "Assigned" : "New";

  if (assignedAgent) {
    const agent = await User.findOne({ _id: assignedAgent, role: "agent", isActive: true });
    if (!agent) throw new AppError(400, "Selected agent is not available");
  }

  const caseRecord = await Case.create({
    ...req.body,
    assignedAgent,
    status,
    createdBy: req.user!.id
  });

  await AuditLog.create({
    case: caseRecord._id,
    actor: req.user!.id,
    fromStatus: null,
    toStatus: status,
    note: assignedAgent ? "Case created and assigned" : "Case created"
  });

  const populated = await caseRecord.populate(casePopulate);
  res.status(201).json({ case: populated });
});

export const listCases = asyncHandler(async (req, res) => {
  const { search, status, agent, page, limit } = req.query as unknown as {
    search: string;
    status: CaseStatus | "";
    agent: string;
    page: number;
    limit: number;
  };

  const filter: FilterQuery<CaseDocument> = {};
  if (req.user!.role === "agent") filter.assignedAgent = req.user!.id;
  if (status) filter.status = status;
  if (agent && req.user!.role === "manager") filter.assignedAgent = agent;
  if (search) {
    filter.$or = [
      { clientName: new RegExp(search, "i") },
      { subjectName: new RegExp(search, "i") },
      { caseType: new RegExp(search, "i") }
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total, stats] = await Promise.all([
    Case.find(filter).populate(casePopulate).sort({ dueDate: 1, createdAt: -1 }).skip(skip).limit(limit),
    Case.countDocuments(filter),
    Case.aggregate([
      req.user!.role === "agent"
        ? { $match: { assignedAgent: new Types.ObjectId(req.user!.id) } }
        : { $match: {} },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ])
  ]);

  res.json({
    cases: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    stats: stats.reduce<Record<string, number>>((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  });
});

export const getCase = asyncHandler(async (req, res) => {
  const caseRecord = await Case.findById(req.params.id).populate(casePopulate);
  if (!caseRecord) throw new AppError(404, "Case not found");
  assertCaseAccess(req.user!.role, req.user!.id, caseRecord, "read");

  const [comments, documents, auditLogs] = await Promise.all([
    Comment.find({ case: caseRecord._id }).populate("author", "name role").sort({ createdAt: 1 }),
    Document.find({ case: caseRecord._id }).populate("uploadedBy", "name role").sort({ createdAt: -1 }),
    AuditLog.find({ case: caseRecord._id }).populate("actor", "name role").sort({ createdAt: 1 })
  ]);

  res.json({ case: caseRecord, comments, documents, auditLogs });
});

export const assignCase = asyncHandler(async (req, res) => {
  const [caseRecord, agent] = await Promise.all([
    Case.findById(req.params.id),
    User.findOne({ _id: req.body.agentId, role: "agent", isActive: true })
  ]);
  if (!caseRecord) throw new AppError(404, "Case not found");
  if (!agent) throw new AppError(400, "Selected agent is not available");
  if (caseRecord.status !== "New") throw new AppError(409, "Only New cases can be assigned");

  caseRecord.assignedAgent = agent._id;
  await transitionCase(caseRecord, "Assigned", req.user!.id, req.body.note || `Assigned to ${agent.name}`);
  const populated = await caseRecord.populate(casePopulate);
  res.json({ case: populated });
});

export const startCase = asyncHandler(async (req, res) => {
  const caseRecord = await Case.findById(req.params.id);
  if (!caseRecord) throw new AppError(404, "Case not found");
  assertCaseAccess(req.user!.role, req.user!.id, caseRecord, "agent-write");

  await transitionCase(caseRecord, "In Progress", req.user!.id, req.body.note);
  res.json({ case: await caseRecord.populate(casePopulate) });
});

export const submitCase = asyncHandler(async (req, res) => {
  const caseRecord = await Case.findById(req.params.id);
  if (!caseRecord) throw new AppError(404, "Case not found");
  assertCaseAccess(req.user!.role, req.user!.id, caseRecord, "agent-write");

  const documentCount = await Document.countDocuments({ case: caseRecord._id });
  if (documentCount === 0) throw new AppError(400, "Upload at least one supporting document before submitting");

  await transitionCase(caseRecord, "Submitted", req.user!.id, req.body.note || "Submitted for manager review");
  res.json({ case: await caseRecord.populate(casePopulate) });
});

export const reviewCase = asyncHandler(async (req, res) => {
  const caseRecord = await Case.findById(req.params.id);
  if (!caseRecord) throw new AppError(404, "Case not found");
  if (caseRecord.status !== "Submitted") throw new AppError(409, "Only Submitted cases can be reviewed");

  caseRecord.verdictNote = req.body.note;
  await transitionCase(caseRecord, req.body.verdict, req.user!.id, req.body.note);
  res.json({ case: await caseRecord.populate(casePopulate) });
});

export const addComment = asyncHandler(async (req, res) => {
  const caseRecord = await Case.findById(req.params.id);
  if (!caseRecord) throw new AppError(404, "Case not found");
  assertCaseAccess(req.user!.role, req.user!.id, caseRecord, "read");

  const comment = await Comment.create({
    case: caseRecord._id,
    author: req.user!.id,
    message: req.body.message
  });
  await comment.populate("author", "name role");
  res.status(201).json({ comment });
});

export const uploadDocument = asyncHandler(async (req, res) => {
  const caseRecord = await Case.findById(req.params.id);
  if (!caseRecord) throw new AppError(404, "Case not found");
  assertCaseAccess(req.user!.role, req.user!.id, caseRecord, "agent-write");
  if (!["Assigned", "In Progress"].includes(caseRecord.status)) {
    throw new AppError(409, "Documents can only be uploaded before submission");
  }
  if (!req.file) throw new AppError(400, "Please attach a file");

  const document = await Document.create({
    case: caseRecord._id,
    uploadedBy: req.user!.id,
    originalName: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size
  });

  await document.populate("uploadedBy", "name role");
  res.status(201).json({ document });
});
