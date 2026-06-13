export type Role = "manager" | "agent";

export type CaseStatus = "New" | "Assigned" | "In Progress" | "Submitted" | "Cleared" | "Discrepant";

export const caseStatuses: CaseStatus[] = ["New", "Assigned", "In Progress", "Submitted", "Cleared", "Discrepant"];

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: Role;
}

export interface CaseRecord {
  _id: string;
  clientName: string;
  subjectName: string;
  caseType: string;
  dueDate: string;
  status: CaseStatus;
  assignedAgent?: User | null;
  createdBy: User;
  verdictNote?: string;
  submittedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRecord {
  _id: string;
  author: User;
  message: string;
  createdAt: string;
}

export interface DocumentRecord {
  _id: string;
  uploadedBy: User;
  originalName: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface AuditLogRecord {
  _id: string;
  actor: User;
  fromStatus?: CaseStatus | null;
  toStatus: CaseStatus;
  note?: string;
  createdAt: string;
}
