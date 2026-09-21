import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Cormorant_Garamond, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { LocaleProvider } from "@/i18n/provider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/**
 * Resolved per request so that canonical and Open Graph URLs follow whatever
 * domain the visitor used. Attaching a custom domain then needs no rebuild.
 */
async function resolveSiteUrl(): Promise<string> {
  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    if (host) {
      const proto =
        requestHeaders.get("x-forwarded-proto") ??
        (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // Not inside a request — fall back to the configured URL.
  }
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await resolveSiteUrl();

  return {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RootSym — Root Cause Analysis & Systematic Actions",
    template: "%s · RootSym",
  },
  description:
    "Live eight-hour workshops by Rand Saleh that teach teams to find the true root cause and eliminate the loss — permanently. Delivered on Microsoft Teams, capped at 15 attendees.",
  keywords: [
    "root cause analysis",
    "RCA training",
    "lean manufacturing",
    "operational excellence",
    "continuous improvement",
    "IWS",
    "Rand Saleh",
    "Jordan",
    "loss elimination",
  ],
  authors: [{ name: "Rand Saleh" }],
  openGraph: {
    type: "website",
    siteName: "RootSym",
    title: "RootSym — Root Cause Analysis & Systematic Actions",
    description:
      "Stop treating symptoms. Start removing roots. Live eight-hour RCA workshops by Rand Saleh.",
    url: siteUrl,
    images: [{ url: "/brand/rootsym-logo.jpg", width: 1600, height: 900, alt: "RootSym" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RootSym — Root Cause Analysis & Systematic Actions",
    description: "Live eight-hour RCA workshops by Rand Saleh.",
    images: ["/brand/rootsym-logo.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b2a36",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${inter.variable} ${cormorant.variable} ${arabic.variable}`}
    >
      <head>
        {/* Scroll reveals are JS-driven; without scripts the content must still show. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
