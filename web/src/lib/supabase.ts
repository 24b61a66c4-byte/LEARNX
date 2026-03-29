import { createClient } from "@supabase/supabase-js";

const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (isTestEnvironment ? "https://example.supabase.co" : undefined);
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (isTestEnvironment ? "test-publishable-key" : undefined);

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in web/.env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getSessionUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
