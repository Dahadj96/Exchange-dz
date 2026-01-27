import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Footer } from "@/components/layout/Footer";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "AssetBridge | International Digital Asset Marketplace",
  description: "International P2P digital asset marketplace. Connect securely for balance transfers via Wise, RedotPay, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} font-cairo antialiased bg-white text-slate-900`}
      >
        <GlobalHeader />
        {children}
        <Footer />
      </body>
    </html>
  );
}
