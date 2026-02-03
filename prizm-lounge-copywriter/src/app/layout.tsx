import type { Metadata, Viewport } from "next";
import "./globals.css";
import OfflineBanner from "@/components/OfflineBanner";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import GlobalSearch from "@/components/GlobalSearch";
import AppWrapper from "@/components/AppWrapper";

export const metadata: Metadata = {
  title: "Panini Crew App | Super Bowl LX",
  description: "Crew management tool for Panini Prizm Lounge activation at Super Bowl LX in San Francisco",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Panini Crew"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a"
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
      <body className="antialiased bg-[#0a0a0a]">
        <AppWrapper>
          <ServiceWorkerRegister />
          <OfflineBanner />
          <GlobalSearch />
          <main className="pb-8 pt-4 px-4 md:px-8 lg:px-12 max-w-4xl mx-auto min-h-screen">
            {children}
          </main>
        </AppWrapper>
      </body>
    </html>
  );
}
