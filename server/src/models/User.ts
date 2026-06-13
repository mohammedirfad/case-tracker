import bcrypt from "bcryptjs";
import mongoose, { InferSchemaType, Model } from "mongoose";
import { Role } from "../types/domain.js";

interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<UserDocument, object, UserMethods>;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["manager", "agent"] satisfies Role[], required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform(_doc, ret) {
    const output = ret as Record<string, unknown>;
    delete output.password;
    delete output.__v;
    return ret;
  }
});

export type UserDocument = InferSchemaType<typeof userSchema> & mongoose.Document & UserMethods;
export const User = mongoose.model<UserDocument, UserModel>("User", userSchema);
