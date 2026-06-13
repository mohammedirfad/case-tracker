import { Box, LinearProgress, Stack, Typography } from "@mui/material";

export function PageLoader({ label = "Loading workspace" }: { label?: string }) {
  return (
    <Box display="grid" minHeight={320} sx={{ placeItems: "center" }}>
      <Stack spacing={2} width="min(420px, 90vw)" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <LinearProgress sx={{ width: "100%", height: 8, borderRadius: 8 }} />
      </Stack>
    </Box>
  );
}
