import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { BottomMobileNav } from "@/components/bottom-mobile-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InfoGlance — AI 信息精选平台",
  description: "AI 驱动的信息聚合平台，为你精选每日必读内容",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex">
        {/* Background Orbs */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />

        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 relative z-[1] overflow-hidden">
          {children}
        </main>
        <BottomMobileNav />
      </body>
    </html>
  );
}
