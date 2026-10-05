"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface Account {
  id?: string | undefined;
  name: string;
  email: string;
  picture?: string | null | undefined;
}

interface AuthValue {
  user: Account | null;
  signIn: (email: string, name?: string) => void;
  signInWithGoogle: (profile: { id?: string | undefined; name: string; email: string; picture?: string | null | undefined }) => void;
  signOut: () => Promise<void>;
  hydrated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/account/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          window.localStorage.setItem("tuskel.account", JSON.stringify(data.user));
          return;
        }
      }
      // If server returned null or invalid, clear local account
      setUser(null);
      window.localStorage.removeItem("tuskel.account");
    } catch {
      // In case of offline/fetch error, fall back to localStorage
      try {
        const raw = window.localStorage.getItem("tuskel.account");
        if (raw) setUser(JSON.parse(raw) as Account);
      } catch {}
    } finally {
      setHydrated(true);
    }
  };

  useEffect(() => {
    // Quick optimistic check from localStorage
    try {
      const raw = window.localStorage.getItem("tuskel.account");
      if (raw) setUser(JSON.parse(raw) as Account);
    } catch {}

    // Verify against authoritative server session
    fetchSession();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      hydrated,
      refreshUser: fetchSession,
      signIn: (email, name) => {
        const account: Account = {
          email,
          name: name || email.split("@")[0] || "Valued Customer",
        };
        setUser(account);
        window.localStorage.setItem("tuskel.account", JSON.stringify(account));
      },
      signInWithGoogle: (profile) => {
        const account: Account = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          picture: profile.picture ?? undefined,
        };
        setUser(account);
        window.localStorage.setItem("tuskel.account", JSON.stringify(account));
      },
      signOut: async () => {
        try {
          await fetch("/api/account/auth/logout", { method: "POST" });
        } catch {
          // Ignore
        }
        setUser(null);
        window.localStorage.removeItem("tuskel.account");
      },
    }),
    [user, hydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
