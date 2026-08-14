"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { SiteConfigProvider } from "@/lib/site-config";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <SiteConfigProvider>
            {children}
          </SiteConfigProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
