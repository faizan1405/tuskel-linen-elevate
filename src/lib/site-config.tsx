"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface SiteConfigValue {
  announcements: string[];
  coupons: Record<string, { off: number; label: string }>;
  hydrated: boolean;
}

const SiteConfigContext = createContext<SiteConfigValue>({
  announcements: [],
  coupons: {},
  hydrated: false,
});

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<Record<string, { off: number; label: string }>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/site-config")
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const data = await r.json();
        return data.config;
      })
      .then((config) => {
        if (config?.announcements?.length) setAnnouncements(config.announcements);
        if (config?.coupons && Object.keys(config.coupons).length > 0) setCoupons(config.coupons);
      })
      .catch(() => {
        // Use defaults on error
        setAnnouncements([
          "Summer Sale — Up to 25% Off",
          "Free Shipping Across India",
          "Easy 7-Day Returns",
        ]);
        setCoupons({
          TUSKEL10: { off: 0.1, label: "10% off your order" },
          SUMMER15: { off: 0.15, label: "15% summer sale discount" },
        });
      })
      .finally(() => setHydrated(true));
  }, []);

  return (
    <SiteConfigContext.Provider value={{ announcements, coupons, hydrated }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
