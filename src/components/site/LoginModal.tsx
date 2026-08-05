"use client";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoogleSignInButton } from "@/components/site/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { user, hydrated, signOut } = useAuth();

  // Close dialog if user becomes logged in
  useEffect(() => {
    if (open && hydrated && user) {
      onOpenChange(false);
    }
  }, [open, hydrated, user, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20vh] max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">Sign In to Tuskel</DialogTitle>
        <DialogHeader className="border-b border-border px-6 pt-6 pb-4">
          <DialogDescription className="text-center">
            <p className="font-display text-2xl font-light">Welcome</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Sign in with Google to access your account and wishlist
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-6">
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
            <div className="py-2">
              <GoogleSignInButton />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
