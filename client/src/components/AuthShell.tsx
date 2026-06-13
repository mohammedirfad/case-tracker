import { Box, Paper, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { BrandMark } from "./BrandMark";

export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      minHeight="100vh"
      display="grid"
      sx={{
        placeItems: "center",
        p: 2,
        background:
          "radial-gradient(circle at top left, rgba(21,94,117,0.22), transparent 34%), linear-gradient(135deg, #f8fafc, #e8edf3)"
      }}
    >
      <Paper sx={{ width: "min(440px, 100%)", p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <BrandMark size={52} />
            <Typography variant="h4">Mini Case Tracker</Typography>
            <Typography color="text.secondary">{title}</Typography>
          </Box>
          {children}
        </Stack>
      </Paper>
    </Box>
  );
}
