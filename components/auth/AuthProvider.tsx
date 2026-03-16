"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AuthUser = {
  email: string;
  level: number;
};

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("ja_auth_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.email === "string" && typeof parsed.level === "number") {
      return { email: parsed.email, level: parsed.level };
    }
  } catch (err) {
    console.warn("No se pudo leer el usuario almacenado", err);
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const value = useMemo(() => ({
    user,
    login: (nextUser: AuthUser) => {
      setUser(nextUser);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ja_auth_user", JSON.stringify(nextUser));
      }
    },
    logout: () => {
      setUser(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("ja_auth_user");
      }
    }
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
