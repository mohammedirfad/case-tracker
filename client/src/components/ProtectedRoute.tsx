import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../state/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}
