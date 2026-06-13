import { Alert, Snackbar } from "@mui/material";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type ToastSeverity = "success" | "error" | "warning" | "info";

interface ToastContextValue {
  showToast(message: string, severity?: ToastSeverity): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; severity: ToastSeverity } | null>(null);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast(message, severity = "error") {
        setToast({ message, severity });
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4200}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity ?? "info"}
          variant="filled"
          sx={{ width: "100%", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)" }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
