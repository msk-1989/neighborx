import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// viewport-fit=cover enables safe-area-inset-* env() values on iOS notch / home indicator.
// maximumScale=1 + user-scalable=no gives a native-app feel (prevents pinch-zoom on inputs).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f8a5f" },
    { media: "(prefers-color-scheme: dark)", color: "#155247" },
  ],
};

export const metadata: Metadata = {
  title: "NeighborX — The Neighborhood Operating System for India",
  description:
    "A local search engine, hyperlocal yellow pages, trusted commerce network, and community safety net — 16 pillars, one verified app, society-first. Built for every Indian neighborhood.",
  keywords: [
    "NeighborX",
    "neighborhood operating system",
    "hyperlocal",
    "yellow pages",
    "local search",
    "community",
    "marketplace",
    "local jobs",
    "reels",
    "India",
  ],
  authors: [{ name: "NeighborX" }],
  // Favicon is generated from src/app/icon.svg (the NeighborX house logo on
  // the brand emerald→amber gradient). No external icon URL needed.
  openGraph: {
    title: "NeighborX — The Neighborhood Operating System for India",
    description:
      "A local search engine, hyperlocal yellow pages, trusted commerce network, and community safety net — 16 pillars, one verified app.",
    siteName: "NeighborX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
