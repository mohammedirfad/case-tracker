import LoginIcon from "@mui/icons-material/Login";
import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { FormEvent, useMemo, useState } from "react";
import { getApiMessage } from "../api/client";
import { AuthShell } from "../components/AuthShell";
import { useFormValidation } from "../hooks/useFormValidation";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

export function LoginPage() {
  const { login, clearSessionMessage } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const validator = useMemo(
    () => (values: { email: string; password: string }) => ({
      ...(values.email.includes("@") ? {} : { email: "Enter a valid email" }),
      ...(values.password ? {} : { password: "Password is required" })
    }),
    []
  );
  const form = useFormValidation({ email: "manager@example.com", password: "Password123!" }, validator);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    clearSessionMessage();
    if (!form.validateAll()) return;
    setLoading(true);
    try {
      await login(form.values.email, form.values.password);
    } catch (err) {
      showToast(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Sign in to manage cases without spreadsheet drift.">
      <Stack component="form" spacing={2} onSubmit={onSubmit}>
        <TextField
          label="Email"
          value={form.values.email}
          onChange={(event) => form.setField("email", event.target.value)}
          onBlur={() => form.markTouched("email")}
          error={Boolean(form.errors.email)}
          helperText={form.errors.email}
        />
        <TextField
          label="Password"
          type="password"
          value={form.values.password}
          onChange={(event) => form.setField("password", event.target.value)}
          onBlur={() => form.markTouched("password")}
          error={Boolean(form.errors.password)}
          helperText={form.errors.password}
        />
        <Button type="submit" variant="contained" startIcon={<LoginIcon />} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <Typography variant="body2" color="text.secondary">
          Agent login: agent@example.com / Password123!
        </Typography>
        <Link component={RouterLink} to="/signup" underline="hover">
          Create a new account
        </Link>
      </Stack>
    </AuthShell>
  );
}
