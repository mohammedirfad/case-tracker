import LogoutIcon from "@mui/icons-material/Logout";
import { AppBar, Box, Button, Container, IconButton, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { BrandMark } from "./BrandMark";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <Box minHeight="100vh" sx={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef4f8 100%)" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #e2e8f0", backdropFilter: "blur(10px)" }}>
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexGrow={1}>
            <BrandMark size={42} />
            <Box>
              <Typography variant="h6" lineHeight={1.05}>
                Mini Case Tracker
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === "manager" ? "Manager workspace" : "Agent queue"}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box textAlign="right" display={{ xs: "none", sm: "block" }}>
              <Typography variant="body2" fontWeight={700}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Button startIcon={<LogoutIcon />} color="inherit" onClick={() => logout()} sx={{ display: { xs: "none", sm: "inline-flex" } }}>
              Logout
            </Button>
            <Tooltip title="Logout">
              <IconButton onClick={() => logout()} sx={{ display: { xs: "inline-flex", sm: "none" } }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
