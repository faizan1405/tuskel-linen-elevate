import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { CLIENT_ENV } from "@/lib/env";

export const ADMIN_CREDENTIALS = {
  email: CLIENT_ENV.NEXT_PUBLIC_ADMIN_EMAIL,
  password: CLIENT_ENV.NEXT_PUBLIC_ADMIN_PASSWORD,
} as const;

interface AdminAuthValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("tuskel.admin.auth");
    if (stored === "1") setIsAuthenticated(true);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate network delay for realistic UX
    await new Promise((r) => setTimeout(r, 600));

    const normalizedEmail = email.trim().toLowerCase();
    const expectedEmail = ADMIN_CREDENTIALS.email.toLowerCase();

    if (normalizedEmail === expectedEmail && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      sessionStorage.setItem("tuskel.admin.auth", "1");
      return { ok: true };
    }

    return { ok: false, error: "Invalid email or password." };
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("tuskel.admin.auth");
  };

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
