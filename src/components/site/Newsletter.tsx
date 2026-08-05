"use client";
import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Newsletter({ variant = "section" }: { variant?: "section" | "footer" }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setPending(true);
    await new Promise((r) => setTimeout(r, 600));
    setPending(false);
    setDone(true);
  }

  const compact = variant === "footer";

  return (
    <div className={compact ? "" : "mx-auto max-w-xl text-center"}>
      {!compact && (
        <>
          <p className="eyebrow mb-3">Newsletter</p>
          <h2 className="text-3xl md:text-4xl">A More Refined Inbox</h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-muted-foreground">
            Discover new collections, styling notes and private offers.
          </p>
        </>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            role="status"
            className={`flex items-center gap-2 text-[13px] ${compact ? "mt-4" : "mt-8 justify-center"}`}
          >
            <Check className="h-4 w-4 text-accent" aria-hidden="true" />
            You're on the list. Look out for our next collection note.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            initial={false}
            className={compact ? "mt-4" : "mt-8"}
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor={`nl-${variant}`} className="sr-only">
                Email address
              </label>
              <input
                id={`nl-${variant}`}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="your@email.com"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `nl-${variant}-error` : undefined}
                className="min-h-11 flex-1 border-b border-border bg-transparent px-1 py-3 text-[14px] placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
              <button
                type="submit"
                disabled={pending}
                className="min-h-11 bg-foreground px-7 text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase transition-opacity hover:opacity-85 disabled:opacity-60"
              >
                {pending ? "Sending…" : "Subscribe"}
              </button>
            </div>
            {error && (
              <p id={`nl-${variant}-error`} role="alert" className="mt-2 text-[12px] text-destructive">
                {error}
              </p>
            )}
            <p className={`mt-3 text-[11px] text-muted-foreground ${compact ? "" : ""}`}>
              We send occasional emails and never share your address. Unsubscribe anytime.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
