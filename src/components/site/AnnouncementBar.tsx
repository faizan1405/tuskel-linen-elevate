"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSiteConfig } from "@/lib/site-config";

export function AnnouncementBar() {
  const { announcements, hydrated } = useSiteConfig();
  const [index, setIndex] = useState(0);
  const messages = announcements.length > 0 ? announcements : [];

  useEffect(() => {
    if (!hydrated || messages.length === 0) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 4200);
    return () => window.clearInterval(id);
  }, [messages.length, hydrated]);

  if (!hydrated || messages.length === 0) return null;

  return (
    <div className="relative z-50 h-9 overflow-hidden bg-foreground text-primary-foreground">
      <div className="shell flex h-9 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] font-medium tracking-[0.18em] uppercase"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
