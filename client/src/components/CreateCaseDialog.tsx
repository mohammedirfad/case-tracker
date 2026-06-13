import SaveIcon from "@mui/icons-material/Save";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo } from "react";
import { api, getApiMessage } from "../api/client";
import { useFormValidation } from "../hooks/useFormValidation";
import { useToast } from "../state/ToastContext";
import { User } from "../types";

export function CreateCaseDialog({ open, agents, onClose }: { open: boolean; agents: User[]; onClose(): void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const validator = useMemo(
    () => (values: { clientName: string; subjectName: string; caseType: string; dueDate: string; assignedAgent: string }) => ({
      ...(values.clientName.length >= 2 ? {} : { clientName: "Client name is required" }),
      ...(values.subjectName.length >= 2 ? {} : { subjectName: "Subject name is required" }),
      ...(values.caseType.length >= 2 ? {} : { caseType: "Case type is required" }),
      ...(values.dueDate ? {} : { dueDate: "Due date is required" })
    }),
    []
  );
  const form = useFormValidation(
    { clientName: "", subjectName: "", caseType: "", dueDate: "", assignedAgent: "" },
    validator
  );

  const mutation = useMutation({
    mutationFn: async () => api.post("/cases", form.values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cases"] });
      form.reset();
      showToast("Case created successfully", "success");
      onClose();
    },
    onError: (err) => showToast(getApiMessage(err))
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (form.validateAll()) mutation.mutate();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create case</DialogTitle>
      {mutation.isPending && <LinearProgress />}
      <DialogContent>
        <Stack spacing={2.5} component="form" id="create-case-form" onSubmit={onSubmit} sx={{ pt: 1 }}>
          <Stepper activeStep={form.values.assignedAgent ? 2 : 1} alternativeLabel>
            <Step completed={Boolean(form.values.clientName && form.values.subjectName)}>
              <StepLabel>Case details</StepLabel>
            </Step>
            <Step completed={Boolean(form.values.dueDate)}>
              <StepLabel>Due date</StepLabel>
            </Step>
            <Step completed={Boolean(form.values.assignedAgent)}>
              <StepLabel>Assign</StepLabel>
            </Step>
          </Stepper>
          <TextField label="Client name" value={form.values.clientName} onChange={(e) => form.setField("clientName", e.target.value)} error={Boolean(form.errors.clientName)} helperText={form.errors.clientName} />
          <TextField label="Subject name" value={form.values.subjectName} onChange={(e) => form.setField("subjectName", e.target.value)} error={Boolean(form.errors.subjectName)} helperText={form.errors.subjectName} />
          <TextField label="Case type" value={form.values.caseType} onChange={(e) => form.setField("caseType", e.target.value)} error={Boolean(form.errors.caseType)} helperText={form.errors.caseType} />
          <TextField label="Due date" type="date" InputLabelProps={{ shrink: true }} value={form.values.dueDate} onChange={(e) => form.setField("dueDate", e.target.value)} error={Boolean(form.errors.dueDate)} helperText={form.errors.dueDate} />
          <TextField select label="Assign agent now" value={form.values.assignedAgent} onChange={(e) => form.setField("assignedAgent", e.target.value)}>
            <MenuItem value="">Keep New</MenuItem>
            {agents.map((agent) => (
              <MenuItem key={agent._id} value={agent._id}>
                {agent.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="create-case-form" variant="contained" startIcon={<SaveIcon />} disabled={mutation.isPending}>
          Save case
        </Button>
      </DialogActions>
    </Dialog>
  );
}
