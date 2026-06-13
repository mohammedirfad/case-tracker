import mongoose, { InferSchemaType } from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }
  },
  { timestamps: true }
);

export type DocumentRecord = InferSchemaType<typeof documentSchema> & mongoose.Document;
export const Document = mongoose.model<DocumentRecord>("Document", documentSchema);
