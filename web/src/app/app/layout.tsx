import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { SESSION_COOKIE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get(SESSION_COOKIE)?.value === "active";

  if (!hasSession) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
