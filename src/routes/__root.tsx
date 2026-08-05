import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/lib/site";

function NotFoundComponent() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="font-display text-5xl font-light md:text-6xl">This page has moved on</h1>
      <p className="mt-4 max-w-md text-[15px] text-muted-foreground">
        The page you're looking for doesn't exist. The collection, however, is right here.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/shop"
          className="min-h-12 bg-foreground px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase"
        >
          Shop All
        </Link>
        <Link
          to="/"
          className="min-h-12 border border-border px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-secondary"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-4xl font-light">This page didn't load</h1>
      <p className="mt-3 max-w-md text-[15px] text-muted-foreground">
        Something went wrong on our end. Try again, or head back to the collection.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="min-h-12 bg-foreground px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] text-primary-foreground uppercase"
        >
          Try again
        </button>
        <a
          href="/"
          className="min-h-12 border border-border px-8 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-secondary"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tuskel — Premium Men's Linen Shirts" },
      {
        name: "description",
        content:
          "Premium linen and linen-blend shirts for men, crafted for effortless comfort and refined summer style.",
      },
      { property: "og:site_name", content: "Tuskel" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#F7F4EE" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Manrope:wght@300;400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Tuskel",
          description: site.description,
          telephone: `+91${site.phone}`,
          address: {
            "@type": "PostalAddress",
            streetAddress: site.address.line1,
            addressLocality: "Delhi",
            postalCode: "110053",
            addressCountry: "IN",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-foreground focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <AnnouncementBar />
          <Header />
          <main id="main">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
          <Footer />
          <CartDrawer />
          <Toaster position="bottom-right" />
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
