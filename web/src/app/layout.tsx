import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";

import { CommandPaletteProvider } from "@/components/command-palette-provider";
import { GoogleAnalytics } from "@/components/google-analytics";
import { MessagesProvider } from "@/components/messages-provider";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import messages from "../../messages/en.json";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sih2026.vuce.in",
  ),
  title: {
    default: "SIH 2026 Problem Statements - Browse All 229",
    template: "%s | SIH 2026 Problem Statements",
  },
  description:
    "Search, filter and shortlist all 229 Smart India Hackathon 2026 problem statements. Filter by theme, category, organization and dataset availability.",
  keywords: [
    "SIH 2026",
    "Smart India Hackathon",
    "problem statements",
    "hackathon",
    "SIH26001",
    "government problem statements",
  ],
  authors: [{ name: "Vedant Chalke" }],
  openGraph: {
    type: "website",
    siteName: "SIH 2026 Problem Statements",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <GoogleAnalytics />
      </head>
      <body className="flex min-h-full flex-col">
        <MessagesProvider messages={messages}>
          <Providers>
            <CommandPaletteProvider>
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </CommandPaletteProvider>
          </Providers>
        </MessagesProvider>
      </body>
    </html>
  );
}
