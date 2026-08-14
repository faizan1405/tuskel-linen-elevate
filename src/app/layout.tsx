import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { RootShell } from "./RootShell";

export const metadata: Metadata = {
  title: "Tuskel — Premium Men's Pure Linen & Linen Blend Shirts",
  description:
    "Made for warmer days. Designed for sharper ones. Shop Tuskel premium linen shirts for men — breathable, refined and shipped free across India.",
  openGraph: {
    siteName: "Tuskel",
    type: "website",
    title: "Tuskel — Premium Men's Pure Linen & Linen Blend Shirts",
    description:
      "Made for warmer days. Designed for sharper ones. Shop Tuskel premium linen shirts for men — breathable, refined and shipped free across India.",
    images: [
      {
        url: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3c5381d3-6657-4a53-b46f-ac041dafa268/id-preview-80ae5749--9aa71c5e-9e7a-4c98-a80b-25a71015db0b.lovable.app-1785918420971.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuskel — Premium Men's Pure Linen & Linen Blend Shirts",
    description:
      "Made for warmer days. Designed for sharper ones. Shop Tuskel premium linen shirts for men — breathable, refined and shipped free across India.",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3c5381d3-6657-4a53-b46f-ac041dafa268/id-preview-80ae5749--9aa71c5e-9e7a-4c98-a80b-25a71015db0b.lovable.app-1785918420971.png",
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Manrope:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
          }}
        />
      </head>
      <body>
        <Providers>
          <RootShell>{children}</RootShell>
        </Providers>
      </body>
    </html>
  );
}
