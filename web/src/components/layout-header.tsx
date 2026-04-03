"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LearnxLogo } from "@/components/learnx-logo";
import { SiteHeader } from "@/components/site-header";

export function LayoutHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/app")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(246,241,232,0.82)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <LearnxLogo />
        </Link>
        <SiteHeader />
      </div>
    </header>
  );
}
