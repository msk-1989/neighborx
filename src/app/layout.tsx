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
  title: "NeighborX — India's Hyperlocal Community & Commerce Super App",
  description:
    "Your Neighborhood. Your Community. Your Marketplace. Verified local communities, marketplace, jobs, services, businesses, and emergency network — all in one app.",
  keywords: [
    "NeighborX",
    "hyperlocal",
    "neighborhood",
    "community",
    "marketplace",
    "local jobs",
    "India",
  ],
  authors: [{ name: "NeighborX" }],
  // Favicon is generated from src/app/icon.svg (the NeighborX house logo on
  // the brand emerald→amber gradient). No external icon URL needed.
  openGraph: {
    title: "NeighborX — Hyperlocal Community Super App",
    description:
      "The Digital Operating System for Every Neighborhood in India.",
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
