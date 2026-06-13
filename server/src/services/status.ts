import { AuditLog } from "../models/AuditLog.js";
import { CaseDocument } from "../models/Case.js";
import { allowedTransitions, CaseStatus } from "../types/domain.js";
import { AppError } from "../utils/AppError.js";

export async function transitionCase(
  caseRecord: CaseDocument,
  nextStatus: CaseStatus,
  actorId: string,
  note = ""
) {
  const current = caseRecord.status as CaseStatus;
  if (!allowedTransitions[current].includes(nextStatus)) {
    throw new AppError(409, `Cannot move case from ${current} to ${nextStatus}`);
  }

  caseRecord.status = nextStatus;
  if (nextStatus === "Submitted") caseRecord.submittedAt = new Date();
  if (nextStatus === "Cleared" || nextStatus === "Discrepant") caseRecord.closedAt = new Date();
  await caseRecord.save();

  await AuditLog.create({
    case: caseRecord._id,
    actor: actorId,
    fromStatus: current,
    toStatus: nextStatus,
    note
  });

  return caseRecord;
}
