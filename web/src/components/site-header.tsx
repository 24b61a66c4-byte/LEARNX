"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { sessionGateway } from "@/lib/gateways";

export function SiteHeader() {
  const pathname = usePathname();
  const { loading, user } = useAuth();

  const session = useClientSnapshot(
    () => sessionGateway.getSession(),
    () => sessionGateway.getSession(),
  );

  const isAuthenticated = Boolean(user) || session.isAuthenticated;
  const displayName =
    (typeof user?.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null) ??
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : null) ??
    session.profile?.displayName ??
    "LearnX Student";
  const isInsideWorkspace = pathname.startsWith("/app");

  if (loading && !isAuthenticated) {
    return (
      <div className="hidden items-center gap-3 text-sm sm:flex">
        <span className="pill bg-white/70 text-slate-600">Checking session</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="hidden items-center gap-3 text-sm sm:flex">
        <span className="pill bg-white/70 text-slate-600">Study workspace</span>
        <Link className="button-secondary px-4 py-2 text-sm" href="/login">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 text-sm sm:flex">
      <span className="pill bg-white/80 text-slate-700">Signed in as {displayName}</span>
      <Link className="button-secondary px-4 py-2 text-sm" href={isInsideWorkspace ? "/app/profile" : "/app"}>
        {isInsideWorkspace ? "Account" : "Open app"}
      </Link>
    </div>
  );
}
