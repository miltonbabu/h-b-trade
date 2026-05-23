import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomTabs from "@/components/layout/MobileBottomTabs";
import WhatsAppButton from "@/components/WhatsAppButton";
import FloatingCartButton from "@/components/FloatingCartButton";
import { CartProvider } from "@/context/CartContext";
import PWAServiceWorker from "@/components/PWAServiceWorker";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0f766e" },
  ],
};

export const metadata: Metadata = {
  title: "H&B Trade - China to Bangladesh Product Sourcing & Logistics",
  description:
    "Your trusted partner for China to Bangladesh product sourcing, wholesale supply, shipping, air cargo, and hand carry services.",
  keywords:
    "China sourcing, Bangladesh import, wholesale, logistics, shipping, air cargo, hand carry, Canton Fair",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/hbtrade_logo.png", sizes: "16x16", type: "image/png" },
      { url: "/hbtrade_logo.png", sizes: "32x32", type: "image/png" },
      { url: "/hbtrade_logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/hbtrade_logo.png",
    apple: [
      { url: "/hbtrade_logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="/hbtrade_logo.png"
          sizes="32x32"
          type="image/png"
        />
        <link
          rel="icon"
          href="/hbtrade_logo.png"
          sizes="16x16"
          type="image/png"
        />
        <link rel="shortcut icon" href="/hbtrade_logo.png" />
        <link
          rel="apple-touch-icon"
          href="/hbtrade_logo.png"
          sizes="180x180"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="H&B Trade" />
        <meta name="theme-color" content="#0d9488" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="H&B Trade" />
      </head>
      <body className={`${inter.variable} ${inter.className}`} suppressHydrationWarning>
        <CartProvider>
          <PWAServiceWorker />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          {/* Spacer reserves room on mobile so the Footer's bottom
              content isn't hidden by the fixed mobile tab bar. The body
              also gets a global padding-bottom rule (in globals.css) so
              mid-scroll content always clears the tab bar. */}
          <div className="md:hidden h-20" aria-hidden="true" />
          <MobileBottomTabs />
          <FloatingCartButton />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
