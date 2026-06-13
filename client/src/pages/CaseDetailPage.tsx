import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SendIcon from "@mui/icons-material/Send";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid2,
  Link,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ASSET_URL, getApiMessage } from "../api/client";
import { ErrorState } from "../components/ErrorState";
import { PageLoader } from "../components/PageLoader";
import { StatusChip } from "../components/StatusChip";
import { useFormValidation } from "../hooks/useFormValidation";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";
import { AuditLogRecord, CaseRecord, caseStatuses, CommentRecord, DocumentRecord, User } from "../types";

interface DetailResponse {
  case: CaseRecord;
  comments: CommentRecord[];
  documents: DocumentRecord[];
  auditLogs: AuditLogRecord[];
}

export function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();
  const detailQuery = useQuery({
    queryKey: ["case", id],
    queryFn: async () => {
      const { data } = await api.get<DetailResponse>(`/cases/${id}`);
      return data;
    }
  });
  const agentsQuery = useQuery({
    queryKey: ["agents"],
    enabled: user?.role === "manager",
    queryFn: async () => (await api.get<{ agents: User[] }>("/users/agents")).data.agents
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["case", id] }),
      queryClient.invalidateQueries({ queryKey: ["cases"] })
    ]);
  };

  const transitionMutation = useMutation({
    mutationFn: async ({ path, body }: { path: string; body?: unknown }) => api.post(`/cases/${id}/${path}`, body ?? { note: "" }),
    onSuccess: async () => {
      await invalidate();
      showToast("Case status updated", "success");
    },
    onError: (err) => showToast(getApiMessage(err))
  });

  if (detailQuery.isLoading) return <PageLoader label="Opening case file" />;
  if (detailQuery.error) {
    const message = getApiMessage(detailQuery.error);
    return (
      <ErrorState
        kind={message.toLowerCase().includes("access") || message.toLowerCase().includes("assigned") ? "locked" : "error"}
        title={message.toLowerCase().includes("assigned") ? "Case access restricted" : "Unable to open case"}
        message={message}
      />
    );
  }
  if (!detailQuery.data) return null;

  const caseItem = detailQuery.data.case;
  const progressStatuses = getProgressStatuses(caseItem.status);
  const activeStep = Math.max(0, progressStatuses.indexOf(caseItem.status));

  return (
    <Stack spacing={3}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ alignSelf: "flex-start" }}>
        Back
      </Button>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h4">{caseItem.clientName}</Typography>
                  <StatusChip status={caseItem.status} />
                </Stack>
                <Typography color="text.secondary">
                  {caseItem.subjectName} / {caseItem.caseType}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {user?.role === "manager" && caseItem.status === "New" && (
                  <AssignPanel agents={agentsQuery.data ?? []} caseId={caseItem._id} onDone={invalidate} />
                )}
                {user?.role === "manager" && caseItem.status === "Submitted" && (
                  <ReviewPanel caseId={caseItem._id} onDone={invalidate} />
                )}
                {user?.role === "agent" && caseItem.status === "Assigned" && (
                  <Button variant="contained" startIcon={<PlayArrowIcon />} disabled={transitionMutation.isPending} onClick={() => transitionMutation.mutate({ path: "start" })}>
                    Start
                  </Button>
                )}
                {user?.role === "agent" && caseItem.status === "In Progress" && (
                  <Button variant="contained" startIcon={<SendIcon />} disabled={transitionMutation.isPending} onClick={() => transitionMutation.mutate({ path: "submit", body: { note: "Ready for manager review" } })}>
                    Submit
                  </Button>
                )}
              </Stack>
            </Stack>
            <Stepper activeStep={activeStep} alternativeLabel>
              {progressStatuses.map((status) => (
                <Step key={status} completed={progressStatuses.indexOf(status) <= activeStep}>
                  <StepLabel>{status}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
        </CardContent>
      </Card>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Case details</Typography>
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Info label="Due date" value={format(new Date(caseItem.dueDate), "dd MMM yyyy")} />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Info label="Assigned agent" value={caseItem.assignedAgent?.name ?? "Unassigned"} />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Info label="Created by" value={caseItem.createdBy.name} />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Info label="Last updated" value={format(new Date(caseItem.updatedAt), "dd MMM yyyy, HH:mm")} />
                  </Grid2>
                </Grid2>
                {caseItem.verdictNote && (
                  <Alert severity={caseItem.status === "Cleared" ? "success" : "warning"} sx={{ mt: 2 }}>
                    {caseItem.verdictNote}
                  </Alert>
                )}
              </CardContent>
            </Card>

            <CommentsPanel comments={detailQuery.data.comments} caseId={caseItem._id} onDone={invalidate} />
          </Stack>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <DocumentsPanel documents={detailQuery.data.documents} canUpload={user?.role === "agent" && ["Assigned", "In Progress"].includes(caseItem.status)} caseId={caseItem._id} onDone={invalidate} />
            <AuditPanel logs={detailQuery.data.auditLogs} />
          </Stack>
        </Grid2>
      </Grid2>
    </Stack>
  );
}

function getProgressStatuses(status: CaseRecord["status"]) {
  if (status === "Cleared") return caseStatuses.filter((item) => item !== "Discrepant");
  if (status === "Discrepant") return caseStatuses.filter((item) => item !== "Cleared");
  return caseStatuses;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography fontWeight={800}>{value}</Typography>
    </Box>
  );
}

function AssignPanel({ agents, caseId, onDone }: { agents: User[]; caseId: string; onDone(): Promise<void> }) {
  const [agentId, setAgentId] = useState("");
  const { showToast } = useToast();
  const mutation = useMutation({
    mutationFn: async () => api.post(`/cases/${caseId}/assign`, { agentId, note: "Assigned from case detail" }),
    onSuccess: async () => {
      await onDone();
      showToast("Case assigned successfully", "success");
    },
    onError: (err) => showToast(getApiMessage(err))
  });
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <TextField select label="Agent" value={agentId} onChange={(e) => setAgentId(e.target.value)} sx={{ minWidth: 180 }}>
        {agents.map((agent) => (
          <MenuItem key={agent._id} value={agent._id}>{agent.name}</MenuItem>
        ))}
      </TextField>
      <Button variant="contained" startIcon={<AssignmentTurnedInIcon />} disabled={!agentId || mutation.isPending} onClick={() => mutation.mutate()}>
        Assign
      </Button>
    </Stack>
  );
}

function ReviewPanel({ caseId, onDone }: { caseId: string; onDone(): Promise<void> }) {
  const [verdict, setVerdict] = useState<"Cleared" | "Discrepant">("Cleared");
  const [note, setNote] = useState("");
  const { showToast } = useToast();
  const mutation = useMutation({
    mutationFn: async () => api.post(`/cases/${caseId}/review`, { verdict, note }),
    onSuccess: async () => {
      await onDone();
      showToast(`Case marked ${verdict}`, "success");
    },
    onError: (err) => showToast(getApiMessage(err))
  });
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
      <TextField select label="Verdict" value={verdict} onChange={(e) => setVerdict(e.target.value as "Cleared" | "Discrepant")} sx={{ minWidth: 150 }}>
        <MenuItem value="Cleared">Cleared</MenuItem>
        <MenuItem value="Discrepant">Discrepant</MenuItem>
      </TextField>
      <TextField label="Review note" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button variant="contained" startIcon={<TaskAltIcon />} disabled={note.length < 3 || mutation.isPending} onClick={() => mutation.mutate()}>
        Review
      </Button>
    </Stack>
  );
}

function CommentsPanel({ comments, caseId, onDone }: { comments: CommentRecord[]; caseId: string; onDone(): Promise<void> }) {
  const { showToast } = useToast();
  const validator = useMemo(() => (values: { message: string }) => (values.message.length >= 2 ? {} : { message: "Write at least 2 characters" }), []);
  const form = useFormValidation({ message: "" }, validator);
  const mutation = useMutation({
    mutationFn: async () => api.post(`/cases/${caseId}/comments`, form.values),
    onSuccess: async () => {
      form.reset();
      await onDone();
      showToast("Comment posted", "success");
    },
    onError: (err) => {
      showToast(getApiMessage(err));
    }
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (form.validateAll()) mutation.mutate();
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Comments</Typography>
        <Stack spacing={2}>
          {comments.map((comment) => (
            <Box key={comment._id}>
              <Typography fontWeight={800}>{comment.author.name}</Typography>
              <Typography color="text.secondary" variant="caption">{format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}</Typography>
              <Typography>{comment.message}</Typography>
              <Divider sx={{ mt: 1 }} />
            </Box>
          ))}
          <Stack component="form" spacing={1.5} onSubmit={submit}>
            <TextField multiline minRows={3} label="Add note" value={form.values.message} onChange={(e) => form.setField("message", e.target.value)} error={Boolean(form.errors.message)} helperText={form.errors.message} />
            <Button type="submit" variant="outlined" disabled={mutation.isPending} sx={{ alignSelf: "flex-start" }}>Post comment</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DocumentsPanel({ documents, canUpload, caseId, onDone }: { documents: DocumentRecord[]; canUpload: boolean; caseId: string; onDone(): Promise<void> }) {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (file) formData.append("file", file);
      return api.post(`/cases/${caseId}/documents`, formData);
    },
    onSuccess: async () => {
      setFile(null);
      await onDone();
      showToast("Document uploaded", "success");
    },
    onError: (err) => {
      showToast(getApiMessage(err));
    }
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Documents</Typography>
        <Stack spacing={2}>
          {canUpload && (
            <Stack spacing={1}>
              <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                Choose file
                <input hidden type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </Button>
              {file && <Typography variant="body2">{file.name}</Typography>}
              <Button variant="contained" disabled={!file || mutation.isPending} onClick={() => mutation.mutate()}>
                Upload
              </Button>
            </Stack>
          )}
          {documents.map((doc) => (
            <Box key={doc._id}>
              <Link href={`${ASSET_URL}/${doc.path.replace(/\\/g, "/")}`} target="_blank" rel="noreferrer" fontWeight={800}>
                {doc.originalName}
              </Link>
              <Typography variant="caption" color="text.secondary" display="block">
                {(doc.size / 1024).toFixed(1)} KB / {doc.uploadedBy.name}
              </Typography>
            </Box>
          ))}
          {documents.length === 0 && <Typography color="text.secondary">No supporting files uploaded yet.</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
}

function AuditPanel({ logs }: { logs: AuditLogRecord[] }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Status timeline</Typography>
        <Stack spacing={2}>
          {logs.map((log) => (
            <Box key={log._id}>
              <StatusChip status={log.toStatus} />
              <Typography variant="body2" mt={0.75}>
                {log.fromStatus ? `${log.fromStatus} -> ${log.toStatus}` : `Created as ${log.toStatus}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm")} / {log.actor.name}
              </Typography>
              {log.note && <Typography variant="body2">{log.note}</Typography>}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
