import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import { LayoutHeader } from "@/components/layout-header";
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
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <Providers>
          <div className="relative min-h-screen">
            <a
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
              href="#main-content"
            >
              Skip to content
            </a>
            <LayoutHeader />
            <main id="main-content">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
