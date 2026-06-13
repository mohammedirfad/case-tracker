import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api/client";
import { User } from "../types";
import { useToast } from "./ToastContext";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login(email: string, password: string): Promise<void>;
  signup(input: { name: string; email: string; password: string; role: "agent" }): Promise<void>;
  logout(message?: string): void;
  sessionMessage: string;
  clearSessionMessage(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [sessionMessage, setSessionMessage] = useState("");

  function applySession(nextToken: string, nextUser: User) {
    setToken(nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setTokenState(nextToken);
    setUser(nextUser);
  }

  function logout(message = "") {
    setToken(null);
    localStorage.removeItem("user");
    setTokenState(null);
    setUser(null);
    setSessionMessage(message);
    if (message) showToast(message, "warning");
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout(error.response?.data?.message ?? "Session expired. Please sign in again.");
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      async login(email, password) {
        const { data } = await api.post("/auth/login", { email, password });
        applySession(data.token, data.user);
        navigate("/", { replace: true });
      },
      async signup(input) {
        const { data } = await api.post("/auth/signup", input);
        applySession(data.token, data.user);
        navigate("/", { replace: true });
      },
      logout,
      sessionMessage,
      clearSessionMessage: () => setSessionMessage("")
    }),
    [user, token, sessionMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
