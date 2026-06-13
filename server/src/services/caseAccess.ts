import { CaseDocument } from "../models/Case.js";
import { Role } from "../types/domain.js";
import { AppError } from "../utils/AppError.js";

type AssignedAgentRef =
  | null
  | undefined
  | string
  | { toString(): string }
  | { _id?: { toString(): string } | string };

function getAssignedAgentId(assignedAgent: AssignedAgentRef) {
  if (!assignedAgent) return "";
  if (typeof assignedAgent === "string") return assignedAgent;
  if ("_id" in assignedAgent && assignedAgent._id) return assignedAgent._id.toString();
  return assignedAgent.toString();
}

export function assertCaseAccess(
  role: Role,
  userId: string,
  caseRecord: CaseDocument,
  action: "read" | "agent-write" | "manager-write"
) {
  if (role === "manager") return;

  const assignedAgentId = getAssignedAgentId(caseRecord.assignedAgent as AssignedAgentRef);
  const isAssigned = assignedAgentId === userId;

  if (action === "manager-write") {
    throw new AppError(403, "Only managers can perform this action");
  }

  if (!isAssigned) {
    throw new AppError(403, "You can only access cases assigned to you");
  }
}
