import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface Account {
  name: string;
  email: string;
  picture?: string;
}

interface AuthValue {
  user: Account | null;
  signIn: (email: string, name?: string) => void;
  signInWithGoogle: (profile: { name: string; email: string; picture?: string }) => void;
  signOut: () => void;
  hydrated: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("tuskel.account");
      if (raw) setUser(JSON.parse(raw) as Account);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const buildAccount = (params: { name: string; email: string; picture?: string }): Account => {
    const base: Account = { name: params.name, email: params.email };
    if (params.picture) base.picture = params.picture;
    return base;
  };

  const value = useMemo<AuthValue>(
    () => ({
      user,
      hydrated,
      signIn: (email, name) => {
        const account: Account = {
          email,
          name: name || email.split("@")[0] || "Guest",
        };
        setUser(account);
        window.localStorage.setItem("tuskel.account", JSON.stringify(account));
      },
      signInWithGoogle: (profile) => {
        const account = buildAccount(profile);
        setUser(account);
        window.localStorage.setItem("tuskel.account", JSON.stringify(account));
      },
      signOut: () => {
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
