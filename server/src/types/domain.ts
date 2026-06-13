export type Role = "manager" | "agent";

export type CaseStatus =
  | "New"
  | "Assigned"
  | "In Progress"
  | "Submitted"
  | "Cleared"
  | "Discrepant";

export const caseStatuses: CaseStatus[] = [
  "New",
  "Assigned",
  "In Progress",
  "Submitted",
  "Cleared",
  "Discrepant"
];

export const allowedTransitions: Record<CaseStatus, CaseStatus[]> = {
  New: ["Assigned"],
  Assigned: ["In Progress"],
  "In Progress": ["Submitted"],
  Submitted: ["Cleared", "Discrepant"],
  Cleared: [],
  Discrepant: []
};
