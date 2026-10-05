"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ArrowLeft, LogOut, User, Mail, ChevronRight, Heart, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/site/GoogleSignInButton";

export default function AccountPage() {
  const { user, signOut, hydrated } = useAuth();
  const { wishlist } = useStore();

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
          Sign in with Google to save your wishlist, track orders, and enjoy a personalised shopping experience.
        </p>
        <div className="mt-8 max-w-xs">
          <GoogleSignInButton />
        </div>
        <div className="mt-6">
          <Link href="/">
            <Button variant="outline" className="gap-2 text-[11px] tracking-[0.16em] uppercase">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Account" }]} />
      <h1 className="mt-4 font-display text-4xl font-light md:text-5xl">My Account</h1>

      <div className="mt-10 max-w-lg">
        {/* Profile Card */}
        <div className="flex items-center gap-4 border border-border p-5 bg-background">
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
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-6 space-y-3">
          <p className="eyebrow">Account Actions</p>
          <ul className="divide-y divide-border border border-border bg-background">
            <li>
              <Link
                href="/wishlist"
                className="flex items-center justify-between px-5 py-4 text-[13px] hover:bg-secondary/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>My Wishlist</span>
                </div>
                <div className="flex items-center gap-2">
                  {wishlist.length > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {wishlist.length} item{wishlist.length === 1 ? "" : "s"}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/account/orders"
                className="flex items-center justify-between px-5 py-4 text-[13px] hover:bg-secondary/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>Order History</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            </li>
            <li>
              <Link
                href="/account/addresses"
                className="flex items-center justify-between px-5 py-4 text-[13px] hover:bg-secondary/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>Saved Addresses</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
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
