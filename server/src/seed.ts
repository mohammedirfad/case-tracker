import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import { AuditLog } from "./models/AuditLog.js";
import { Case } from "./models/Case.js";
import { Comment } from "./models/Comment.js";
import { Document } from "./models/Document.js";
import { User } from "./models/User.js";

await connectDb();

await Promise.all([
  AuditLog.deleteMany({}),
  Comment.deleteMany({}),
  Document.deleteMany({}),
  Case.deleteMany({}),
  User.deleteMany({})
]);

const [manager, agentA, agentB] = await User.create([
  {
    name: "Maya Manager",
    email: "manager@example.com",
    password: "Password123!",
    role: "manager"
  },
  {
    name: "Aarav Agent",
    email: "agent@example.com",
    password: "Password123!",
    role: "agent"
  },
  {
    name: "Neha Agent",
    email: "neha.agent@example.com",
    password: "Password123!",
    role: "agent"
  }
]);

const now = Date.now();
const cases = await Case.create([
  {
    clientName: "Northstar Finance",
    subjectName: "Rohan Mehta",
    caseType: "Employment Verification",
    dueDate: new Date(now + 3 * 24 * 60 * 60 * 1000),
    status: "Assigned",
    assignedAgent: agentA._id,
    createdBy: manager._id
  },
  {
    clientName: "Crescent Health",
    subjectName: "Dr. Mira Shah",
    caseType: "License Check",
    dueDate: new Date(now + 5 * 24 * 60 * 60 * 1000),
    status: "In Progress",
    assignedAgent: agentA._id,
    createdBy: manager._id
  },
  {
    clientName: "Atlas Retail",
    subjectName: "Store 18",
    caseType: "Address Verification",
    dueDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
    status: "Submitted",
    assignedAgent: agentB._id,
    createdBy: manager._id,
    submittedAt: new Date(now - 4 * 60 * 60 * 1000)
  },
  {
    clientName: "BluePeak Logistics",
    subjectName: "Fleet Vendor KYC",
    caseType: "Vendor Screening",
    dueDate: new Date(now + 8 * 24 * 60 * 60 * 1000),
    status: "New",
    createdBy: manager._id
  }
]);

await AuditLog.create([
  { case: cases[0]._id, actor: manager._id, fromStatus: null, toStatus: "Assigned", note: "Seeded assigned case" },
  { case: cases[1]._id, actor: manager._id, fromStatus: null, toStatus: "Assigned", note: "Seeded case" },
  { case: cases[1]._id, actor: agentA._id, fromStatus: "Assigned", toStatus: "In Progress", note: "Documents requested" },
  { case: cases[2]._id, actor: manager._id, fromStatus: null, toStatus: "Assigned", note: "Seeded case" },
  { case: cases[2]._id, actor: agentB._id, fromStatus: "Assigned", toStatus: "In Progress", note: "Field visit complete" },
  { case: cases[2]._id, actor: agentB._id, fromStatus: "In Progress", toStatus: "Submitted", note: "Ready for review" },
  { case: cases[3]._id, actor: manager._id, fromStatus: null, toStatus: "New", note: "Seeded unassigned case" }
]);

await Comment.create([
  { case: cases[1]._id, author: agentA._id, message: "Client confirmed the HR contact. Waiting on signed verification letter." },
  { case: cases[2]._id, author: agentB._id, message: "Uploaded site photos and address proof. Please review." }
]);

console.log("Seed complete");
console.table([
  { role: "manager", email: "manager@example.com", password: "Password123!" },
  { role: "agent", email: "agent@example.com", password: "Password123!" }
]);

await mongoose.disconnect();
