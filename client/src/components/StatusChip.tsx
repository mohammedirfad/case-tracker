import { Chip } from "@mui/material";
import { CaseStatus } from "../types";

const colorMap: Record<CaseStatus, "default" | "primary" | "warning" | "info" | "success" | "error"> = {
  New: "default",
  Assigned: "primary",
  "In Progress": "warning",
  Submitted: "info",
  Cleared: "success",
  Discrepant: "error"
};

export function StatusChip({ status }: { status: CaseStatus }) {
  return <Chip size="small" label={status} color={colorMap[status]} sx={{ fontWeight: 700 }} />;
}
