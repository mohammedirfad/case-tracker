import AddIcon from "@mui/icons-material/Add";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid2,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getApiMessage } from "../api/client";
import { CreateCaseDialog } from "../components/CreateCaseDialog";
import { PageLoader } from "../components/PageLoader";
import { StatusChip } from "../components/StatusChip";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";
import { CaseRecord, caseStatuses, User } from "../types";

interface CaseListResponse {
  cases: CaseRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: Record<string, number>;
}

export function CasesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [agent, setAgent] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const casesQuery = useQuery({
    queryKey: ["cases", { page, search, status, agent }],
    queryFn: async () => {
      const { data } = await api.get<CaseListResponse>("/cases", {
        params: { page, limit: 8, search, status, agent }
      });
      return data;
    }
  });

  const agentsQuery = useQuery({
    queryKey: ["agents"],
    enabled: user?.role === "manager",
    queryFn: async () => {
      const { data } = await api.get<{ agents: User[] }>("/users/agents");
      return data.agents;
    }
  });

  const statCards = caseStatuses.map((item) => ({
    label: item,
    value: casesQuery.data?.stats[item] ?? 0
  }));

  useEffect(() => {
    if (casesQuery.error) showToast(getApiMessage(casesQuery.error));
  }, [casesQuery.error, showToast]);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4">Cases</Typography>
          <Typography color="text.secondary">
            {user?.role === "manager" ? "Create, assign, review, and close client cases." : "Work through assigned cases and submit evidence."}
          </Typography>
        </Box>
        {user?.role === "manager" && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New case
          </Button>
        )}
      </Stack>

      <Grid2 container spacing={2}>
        {statCards.map((stat) => (
          <Grid2 key={stat.label} size={{ xs: 6, md: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h5">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems={{ lg: "center" }}>
            <TextField
              label="Search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: { lg: 320 } }}
            />
            <TextField
              select
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All statuses</MenuItem>
              {caseStatuses.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
            {user?.role === "manager" && (
              <TextField
                select
                label="Agent"
                value={agent}
                onChange={(event) => {
                  setAgent(event.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">All agents</MenuItem>
                {(agentsQuery.data ?? []).map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <Tooltip title="Filters are applied instantly">
              <IconButton>
                <FilterAltIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      {casesQuery.isLoading && <PageLoader label="Fetching cases" />}
      {casesQuery.data && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Case</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell align="right">Open</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {casesQuery.data.cases.map((caseItem) => (
                  <TableRow key={caseItem._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/cases/${caseItem._id}`)}>
                    <TableCell>
                      <Typography fontWeight={800}>{caseItem.clientName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {caseItem.subjectName}
                      </Typography>
                    </TableCell>
                    <TableCell>{caseItem.caseType}</TableCell>
                    <TableCell>{format(new Date(caseItem.dueDate), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <StatusChip status={caseItem.status} />
                    </TableCell>
                    <TableCell>{caseItem.assignedAgent?.name ?? "Unassigned"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Open case">
                        <IconButton>
                          <AssignmentIndIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {casesQuery.data.cases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary" textAlign="center" py={4}>
                        No cases match the current filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
            <Typography variant="body2" color="text.secondary">
              {casesQuery.data.pagination.total} total cases
            </Typography>
            <Pagination count={casesQuery.data.pagination.pages} page={page} onChange={(_event, value) => setPage(value)} color="primary" />
          </Stack>
        </Card>
      )}

      <CreateCaseDialog open={createOpen} agents={agentsQuery.data ?? []} onClose={() => setCreateOpen(false)} />
    </Stack>
  );
}
