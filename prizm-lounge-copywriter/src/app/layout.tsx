import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import OfflineBanner from "@/components/OfflineBanner";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Prizm Lounge Copywriter | Super Bowl LIX",
  description: "Social media copywriting tool for Panini Prizm Lounge activation at Super Bowl LIX in New Orleans",
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
        <ServiceWorkerRegister />
        <OfflineBanner />
        <main className="pb-20 pt-4 px-4 max-w-lg mx-auto min-h-screen">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
