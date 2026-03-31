import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
const TEST_SUPABASE_URL = "https://example.supabase.co";
const TEST_SUPABASE_KEY = "test-publishable-key";

export const SUPABASE_CONFIG_ERROR_MESSAGE =
  "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in web/.env.local or Vercel.";

type SupabaseConfig = {
  url: string;
  key: string;
};

let supabaseClient: SupabaseClient | null = null;

function getSupabaseConfig(): SupabaseConfig | null {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (isTestEnvironment ? TEST_SUPABASE_URL : undefined);
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (isTestEnvironment ? TEST_SUPABASE_KEY : undefined);

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return {
    url: supabaseUrl,
    key: supabaseKey,
  };
}

export function hasSupabaseEnv() {
  return getSupabaseConfig() !== null;
}

export function getSupabaseConfigError() {
  return SUPABASE_CONFIG_ERROR_MESSAGE;
}

export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(SUPABASE_CONFIG_ERROR_MESSAGE);
  }

  if (!supabaseClient) {
    supabaseClient = createClient(config.url, config.key);
  }

  return supabaseClient;
}

export async function getSessionUser() {
  const { data: { user } } = await getSupabaseClient().auth.getUser();
  return user;
}

export async function getAuthenticatedRequestHeaders() {
  if (typeof window === "undefined" || !hasSupabaseEnv()) {
    return {};
  }

  const { data: { session } } = await getSupabaseClient().auth.getSession();
  const accessToken = session?.access_token?.trim();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await getSupabaseClient().auth.signOut();
  return { error };
}
