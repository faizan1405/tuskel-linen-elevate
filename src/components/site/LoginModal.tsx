"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoogleSignInButton } from "@/components/site/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const { user, hydrated, signIn, signOut } = useAuth();

  // Close dialog if user becomes logged in
  useEffect(() => {
    if (open && hydrated && user) {
      onOpenChange(false);
    }
  }, [open, hydrated, user, onOpenChange]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setEmail("");
    }
  }, [open]);

  const handleEmailSignIn = () => {
    if (!email.trim() || !email.includes("@")) return;
    signIn(email.trim(), email.split("@")[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20vh] max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">Sign In to Tuskel</DialogTitle>
        <DialogHeader className="border-b border-border px-6 pt-6 pb-4">
          <DialogDescription className="text-center">
            <p className="font-display text-2xl font-light">Welcome</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Sign in to access your account and wishlist
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          {hydrated && user ? (
            <div className="text-center">
              <p className="text-[13px] text-muted-foreground">You are already signed in</p>
              <p className="mt-1 font-medium">{user.name}</p>
              <p className="text-[13px] text-muted-foreground">{user.email}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full text-[11px] tracking-[0.15em] uppercase"
                onClick={() => {
                  signOut();
                  onOpenChange(false);
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <GoogleSignInButton />
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 border-t border-border" />
                <span className="text-[11px] text-muted-foreground tracking-wider uppercase">or</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-label="Email address"
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn()}
                  className="w-full rounded-none border border-border bg-background px-4 py-3 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
                <Button
                  onClick={handleEmailSignIn}
                  disabled={!email.trim() || !email.includes("@")}
                  className="w-full gap-2 text-[11px] tracking-[0.16em] uppercase disabled:opacity-40"
                  variant="secondary"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Continue with Email
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
