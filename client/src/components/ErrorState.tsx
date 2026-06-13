import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function ErrorState({
  title,
  message,
  kind = "error"
}: {
  title: string;
  message: string;
  kind?: "error" | "locked";
}) {
  const navigate = useNavigate();
  const Icon = kind === "locked" ? LockPersonIcon : ReportGmailerrorredIcon;

  return (
    <Box display="grid" minHeight="calc(100vh - 170px)" sx={{ placeItems: "center", px: 2 }}>
      <Card sx={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
        <CardContent sx={{ py: 6, px: { xs: 3, sm: 6 } }}>
          <Stack spacing={2.5} alignItems="center">
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: kind === "locked" ? "warning.main" : "error.main",
                bgcolor: kind === "locked" ? "rgba(202,138,4,0.12)" : "rgba(185,28,28,0.10)"
              }}
            >
              <Icon sx={{ fontSize: 46 }} />
            </Box>
            <Box>
              <Typography variant="h5">{title}</Typography>
              <Typography color="text.secondary" mt={1}>
                {message}
              </Typography>
            </Box>
            <Button startIcon={<ArrowBackIcon />} variant="contained" onClick={() => navigate(-1)}>
              Back to previous page
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
