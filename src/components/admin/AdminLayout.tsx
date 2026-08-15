"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Inbox,
  FolderTree,
  Settings,
  PanelLeft,
  Menu,
  X,
  ChevronUp,
  Store,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { title: "Inventory", href: "/admin/inventory", icon: Package },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 text-left w-full ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="font-medium">{item.title}</span>
          </button>
        );
      })}
    </nav>
  );
}

function AdminSidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = useCallback((href: string) => {
    router.push(href);
    onNavigate?.();
  }, [router, onNavigate]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const handleBackToStore = () => {
    router.push("/");
  };

  return (
    <aside className="flex h-full w-[260px] flex-col border-r bg-sidebar/50 backdrop-blur-sm">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b shrink-0">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
          <Store className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-xl font-medium tracking-tight leading-none">Tuskel</span>
          <span className="text-[10px] font-sans font-medium tracking-[0.15em] uppercase text-muted-foreground mt-0.5">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <div className="px-3 mb-2">
          <p className="px-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70">
            Menu
          </p>
        </div>
        <SidebarNav />
      </div>

      {/* Footer */}
      <div className="border-t p-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-accent/60 transition-colors w-full text-left group">
              <Avatar className="h-8 w-8 border border-border/50">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  A
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@tuskel.com</p>
              </div>
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground/70 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleBackToStore}
              className="cursor-pointer"
            >
              <Store className="h-4 w-4 mr-2" />
              Back to Store
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive cursor-pointer"
            >
              <Shield className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      {!collapsed && (
        <div className="hidden lg:flex shrink-0">
          <AdminSidebarInner />
        </div>
      )}

      {/* Collapsed sidebar indicator */}
      {collapsed && (
        <div className="hidden lg:flex flex-col items-center w-12 border-r bg-sidebar/30 py-4 gap-1">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground mb-4">
            <Store className="h-4 w-4" />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const pathname = typeof window !== "undefined" ? window.location.pathname : "";
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => {
                  setCollapsed(false);
                  // navigate via router
                }}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                }`}
                title={item.title}
              >
                <Icon className="h-[18px] w-[18px]" />
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full shadow-2xl">
            <AdminSidebarInner onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top header */}
        <header className="flex h-16 items-center gap-3 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -ml-1 hover:bg-accent/60"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 hover:bg-accent/60"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          <Separator orientation="vertical" className="h-5 hidden md:block" />
          <div className="flex-1" />
          <p className="hidden sm:block text-xs text-muted-foreground font-medium">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function AdminLogin() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("");

  useMemo(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setRedirectTo(params.get("redirect") || "");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error || "Invalid credentials.");
      setPassword("");
    } else {
      router.push(redirectTo || "/admin");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary text-primary-foreground mb-4">
            <Store className="h-5 w-5" />
          </div>
          <h1 className="font-display text-3xl font-light tracking-tight">Tuskel</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Admin Panel</p>
        </div>

        {/* Login card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="admin@tuskel.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                autoComplete="email"
                required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all"
              />
              {error && (
                <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-2">
                  <Shield className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Tuskel Admin — Authorised access only
        </p>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AdminShell>{children}</AdminShell>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}
