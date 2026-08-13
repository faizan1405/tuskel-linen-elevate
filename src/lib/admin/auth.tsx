import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

import type { AdminAuthValue } from "./types";

export type { AdminAuthValue } from "./types";

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin-auth/logout", { method: "GET", cache: "no-store" })
      .then((r) => r.ok ? setIsAuthenticated(true) : setIsAuthenticated(false))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  const login: AdminAuthValue["login"] = async (email, password) => {
    const res = await fetch("/api/admin-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const data = await res.json();
    if (data.ok) {
      setIsAuthenticated(true);
      return { ok: true };
    }
    return { ok: false as const, error: data.error || "Invalid email or password." };
  };

  const logout: AdminAuthValue["logout"] = async () => {
    await fetch("/api/admin-auth/logout", { method: "DELETE", cache: "no-store" });
    setIsAuthenticated(false);
  };

  if (checking) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
