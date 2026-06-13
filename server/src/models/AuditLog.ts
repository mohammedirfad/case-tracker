import mongoose, { InferSchemaType } from "mongoose";
import { caseStatuses } from "../types/domain.js";

const auditLogSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fromStatus: { type: String, enum: caseStatuses, default: null },
    toStatus: { type: String, enum: caseStatuses, required: true },
    note: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

export type AuditLogRecord = InferSchemaType<typeof auditLogSchema> & mongoose.Document;
export const AuditLog = mongoose.model<AuditLogRecord>("AuditLog", auditLogSchema);
