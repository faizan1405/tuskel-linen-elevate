import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ArrowLeft, LogOut, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Tuskel" },
      { name: "description", content: "Manage your Tuskel account." },
    ],
    links: [{ rel: "canonical", href: "/account" }],
  }),
  beforeLoad: () => {
    // Auth is purely client-side; route always renders.
    // If needed, redirect logic can be added in a loader later.
    return {};
  },
  component: Page,
});

function Page() {
  const { user, signOut, hydrated } = useAuth();

  if (!hydrated) {
    return (
      <div className="shell pb-24">
        <Breadcrumbs items={[{ label: "Account" }]} />
        <div className="mt-8 h-12 animate-pulse bg-secondary w-64" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="shell pb-24">
        <Breadcrumbs items={[{ label: "Account" }]} />
        <h1 className="mt-4 font-display text-4xl font-light md:text-5xl">My Account</h1>
        <p className="mt-4 text-[14px] text-muted-foreground max-w-md">
          Sign in to save your wishlist, track orders, and enjoy a personalised shopping experience.
        </p>
        <Link to="/">
          <Button variant="outline" className="mt-6 gap-2 text-[11px] tracking-[0.16em] uppercase">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Account" }]} />
      <h1 className="mt-4 font-display text-4xl font-light md:text-5xl">My Account</h1>

      <div className="mt-10 max-w-lg">
        <div className="flex items-center gap-4 border border-border p-5">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover border border-border"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary border border-border">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium truncate">{user.name}</p>
            <div className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="eyebrow">Account Actions</p>
          <ul className="divide-y divide-border border border-border">
            <li>
              <Link
                to="/wishlist"
                className="block px-5 py-4 text-[13px] hover:bg-secondary transition-colors"
              >
                My Wishlist
              </Link>
            </li>
            <li>
              <a
                href="/orders"
                className="block px-5 py-4 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Order History <span className="text-[11px]">(coming soon)</span>
              </a>
            </li>
            <li>
              <a
                href="/addresses"
                className="block px-5 py-4 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Saved Addresses <span className="text-[11px]">(coming soon)</span>
              </a>
            </li>
          </ul>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full gap-2 text-[11px] tracking-[0.16em] uppercase"
            onClick={() => signOut()}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
