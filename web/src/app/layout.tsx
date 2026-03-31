import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

import { LearnxLogo } from "@/components/learnx-logo";
import { Providers } from "@/app/providers";

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
        <Providers>
          <div className="relative min-h-screen">
            <a
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
              href="#main-content"
            >
              Skip to content
            </a>
            <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(246,241,232,0.82)] backdrop-blur-md">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  <LearnxLogo />
                </Link>
                <div className="hidden items-center gap-3 text-sm sm:flex">
                  <span className="pill bg-white/70 text-slate-600">Study workspace</span>
                  <Link className="button-secondary px-4 py-2 text-sm" href="/login">
                    Sign in
                  </Link>
                </div>
              </div>
            </header>
            <main id="main-content">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
