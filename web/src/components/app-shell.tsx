"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { CommandPalette } from "@/components/command-palette";
import { LearnxLogo } from "@/components/learnx-logo";
import { sessionGateway } from "@/lib/gateways";
import { AppSession } from "@/lib/types";

const navItems = [
  { href: "/app", label: "Home" },
  { href: "/app/subjects", label: "Subjects" },
  { href: "/app/ask", label: "Ask AI" },
  { href: "/app/practice", label: "Practice" },
  { href: "/app/progress", label: "Progress" },
];

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-950 text-white shadow-md" : "text-slate-600 hover:bg-white/80"
        }`}
      href={href}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [session] = useState<AppSession>(() => sessionGateway.getSession());

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} open={paletteOpen} /> : null}
      <div className="mx-auto flex min-h-[calc(100vh-77px)] w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="surface-card sticky top-6 hidden h-[calc(100vh-7rem)] w-72 shrink-0 flex-col justify-between px-5 py-6 lg:flex">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <LearnxLogo />
            </div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                  href={item.href}
                  key={item.href}
                  label={item.label}
                />
              ))}
            </div>
          </div>
          <div className="space-y-3 rounded-[24px] bg-slate-950 px-5 py-5 text-white">
            <p className="text-xs uppercase tracking-[0.22em] text-teal-200">Logged in</p>
            <div>
              <p className="font-semibold">{session.profile?.displayName ?? "LearnX Student"}</p>
              <p className="text-sm text-slate-300">{session.profile?.email ?? "local session"}</p>
            </div>
            <button
              className="button-secondary w-full bg-white/10 text-white hover:bg-white/15"
              onClick={() => {
                sessionGateway.signOut();
                router.push("/login");
              }}
              type="button"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 safe-bottom">
          <div className="surface-card sticky top-4 z-30 mb-6 flex items-center justify-between gap-4 px-4 py-4">
            <div>
              <p className="eyebrow">Protected workspace</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">Study like it is your main app</h1>
            </div>
            <button
              className="button-secondary px-4"
              onClick={() => setPaletteOpen(true)}
              type="button"
            >
              Search topics
            </button>
          </div>
          {children}
        </div>
      </div>

      <nav className="fixed inset-x-4 bottom-4 z-40 rounded-full border border-black/10 bg-white/92 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => (
            <NavLink
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              href={item.href}
              key={item.href}
              label={item.label}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
