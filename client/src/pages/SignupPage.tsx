import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Alert, Button, Link, Stack, TextField } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { FormEvent, useMemo, useState } from "react";
import { getApiMessage } from "../api/client";
import { AuthShell } from "../components/AuthShell";
import { useFormValidation } from "../hooks/useFormValidation";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

export function SignupPage() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const validator = useMemo(
    () => (values: { name: string; email: string; password: string }) => ({
      ...(values.name.length >= 2 ? {} : { name: "Name must be at least 2 characters" }),
      ...(values.email.includes("@") ? {} : { email: "Enter a valid email" }),
      ...(values.password.length >= 8 ? {} : { password: "Use at least 8 characters" })
    }),
    []
  );
  const form = useFormValidation<{ name: string; email: string; password: string }>(
    { name: "", email: "", password: "" },
    validator
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.validateAll()) return;
    setLoading(true);
    try {
      await signup({ ...form.values, role: "agent" });
    } catch (err) {
      showToast(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create a manager or agent account.">
      <Stack component="form" spacing={2} onSubmit={onSubmit}>
        <Alert severity="info">Signup creates agent accounts only. Managers are seeded for review and assignment.</Alert>
        <TextField label="Name" value={form.values.name} onChange={(e) => form.setField("name", e.target.value)} error={Boolean(form.errors.name)} helperText={form.errors.name} />
        <TextField label="Email" value={form.values.email} onChange={(e) => form.setField("email", e.target.value)} error={Boolean(form.errors.email)} helperText={form.errors.email} />
        <TextField label="Password" type="password" value={form.values.password} onChange={(e) => form.setField("password", e.target.value)} error={Boolean(form.errors.password)} helperText={form.errors.password} />
        <Button type="submit" variant="contained" startIcon={<PersonAddIcon />} disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
        <Link component={RouterLink} to="/login" underline="hover">
          Back to sign in
        </Link>
      </Stack>
    </AuthShell>
  );
}
