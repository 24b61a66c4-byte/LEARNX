import { NextRequest, NextResponse } from "next/server";

import { ONBOARDED_COOKIE, SESSION_COOKIE } from "./src/lib/constants";

const AUTH_ROUTES = new Set(["/login", "/signup"]);
const PROTECTED_PREFIX = "/app";

function redirect(request: NextRequest, destination: string) {
  const url = request.nextUrl.clone();
  url.pathname = destination;
  url.search = "";
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === "active";
  const isOnboarded = request.cookies.get(ONBOARDED_COOKIE)?.value === "1";
  const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);
  const isOnboardingRoute = pathname === "/app/onboarding";

  if (isProtectedRoute && !hasSession) {
    return redirect(request, "/login");
  }

  if (hasSession && AUTH_ROUTES.has(pathname)) {
    return redirect(request, isOnboarded ? "/app" : "/app/onboarding");
  }

  if (hasSession && isProtectedRoute && !isOnboarded && !isOnboardingRoute) {
    return redirect(request, "/app/onboarding");
  }

  if (hasSession && isOnboarded && isOnboardingRoute) {
    return redirect(request, "/app");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|robots.txt|sitemap.xml).*)"],
};
