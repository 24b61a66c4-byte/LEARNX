import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

import { LearnxLogo } from "@/components/learnx-logo";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "LearnX",
  description: "AI-powered learning for all students, all ages. Learn anything with adaptive explanations, voice, and practice.",
  applicationName: "LearnX",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <div className="relative min-h-screen">
          <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.18),_transparent_58%)]" />
          <div className="absolute inset-x-0 top-24 -z-10 h-96 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.16),_transparent_54%)]" />
          <header className="border-b border-black/5 bg-white/55 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <Link href="/" className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                <LearnxLogo />
              </Link>
              <div className="hidden items-center gap-3 text-sm text-slate-600 sm:flex">
                <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Web-only</span>
                <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">DBMS + EDC launch</span>
              </div>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
