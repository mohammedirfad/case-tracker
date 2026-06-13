import mongoose, { InferSchemaType } from "mongoose";
import { caseStatuses } from "../types/domain.js";

const caseSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    subjectName: { type: String, required: true, trim: true },
    caseType: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: caseStatuses, default: "New", index: true },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    verdictNote: { type: String, trim: true, default: "" },
    submittedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

caseSchema.index({ clientName: "text", subjectName: "text", caseType: "text" });

export type CaseDocument = InferSchemaType<typeof caseSchema> & mongoose.Document;
export const Case = mongoose.model<CaseDocument>("Case", caseSchema);
