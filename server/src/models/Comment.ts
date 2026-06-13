import mongoose, { InferSchemaType } from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

export type CommentRecord = InferSchemaType<typeof commentSchema> & mongoose.Document;
export const Comment = mongoose.model<CommentRecord>("Comment", commentSchema);
