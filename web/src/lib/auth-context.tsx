"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type User } from "@supabase/supabase-js";

import { syncSessionFromAuthUser } from "@/lib/backend-sync";
import { getSessionUser, getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => hasSupabaseEnv());

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      return;
    }

    const supabase = getSupabaseClient();
    let isActive = true;

    const checkSession = async () => {
      try {
        const currentUser = await getSessionUser();
        await syncSessionFromAuthUser(currentUser ?? null);

        if (!isActive) {
          return;
        }

        setUser(currentUser ?? null);
        setLoading(false);
      } catch {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSessionFromAuthUser(session?.user ?? null).finally(() => {
        if (!isActive) {
          return;
        }

        setUser(session?.user ?? null);
        setLoading(false);
      });
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (hasSupabaseEnv()) {
      await getSupabaseClient().auth.signOut();
    }

    await syncSessionFromAuthUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
