import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import OfflineBanner from "@/components/OfflineBanner";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import GlobalSearch from "@/components/GlobalSearch";
import AppWrapper from "@/components/AppWrapper";

export const metadata: Metadata = {
  title: "Prizm Lounge Production Hub | Super Bowl LX",
  description: "Content production tool for Panini Prizm Lounge activation at Super Bowl LX in San Francisco",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Prizm Lounge"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D0D0D"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <AppWrapper>
          <ServiceWorkerRegister />
          <OfflineBanner />
          <GlobalSearch />
          <main className="pb-24 md:pb-8 pt-4 md:pt-8 px-4 md:px-8 lg:px-12 max-w-4xl mx-auto min-h-screen">
            {children}
          </main>
          <BottomNav />
        </AppWrapper>
      </body>
    </html>
  );
}
