import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#155e75", dark: "#0f3f4f", light: "#e6f4f7" },
    secondary: { main: "#b45309", dark: "#7c2d12", light: "#fff4e6" },
    success: { main: "#15803d" },
    warning: { main: "#ca8a04" },
    error: { main: "#b91c1c" },
    text: { primary: "#172033", secondary: "#64748b" },
    divider: "#e2e8f0",
    background: { default: "#f5f7fb", paper: "#ffffff" }
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: `"Manrope", "Segoe UI", Arial, sans-serif`,
    h4: { fontWeight: 800, fontSize: "2.05rem", lineHeight: 1.12, letterSpacing: 0 },
    h5: { fontWeight: 800, fontSize: "1.5rem", lineHeight: 1.18, letterSpacing: 0 },
    h6: { fontWeight: 800, fontSize: "1.08rem", lineHeight: 1.25, letterSpacing: 0 },
    subtitle1: { fontWeight: 700, letterSpacing: 0 },
    body1: { fontSize: "0.95rem", lineHeight: 1.62, fontWeight: 500, letterSpacing: 0 },
    body2: { fontSize: "0.875rem", lineHeight: 1.55, fontWeight: 500, letterSpacing: 0 },
    caption: { fontSize: "0.75rem", fontWeight: 700, letterSpacing: 0 },
    button: { textTransform: "none", fontWeight: 800, letterSpacing: 0 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, minHeight: 38 } } },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          boxShadow: "0 14px 34px rgba(15, 23, 42, 0.07)"
        }
      }
    },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiSelect: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 850, color: "#334155", backgroundColor: "#f8fafc" },
        root: { borderColor: "#e2e8f0" }
      }
    }
  }
});
