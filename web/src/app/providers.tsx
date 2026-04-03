"use client";

import { useEffect } from "react";

import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    const cleanupPwaState = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if (!("caches" in window)) {
        return;
      }

      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
    };

    void cleanupPwaState();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
