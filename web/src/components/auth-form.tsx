"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { syncSessionFromAuthUser } from "@/lib/backend-sync";
import { sessionGateway } from "@/lib/gateways";
import {
  getSupabaseClient,
  getSupabaseConfigError,
  hasSupabaseEnv,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/supabase";

interface AuthFormProps {
  mode: "login" | "signup";
}

function isUserAlreadyExistsError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("user already registered")
    || normalized.includes("already registered")
    || normalized.includes("already exists")
  );
}

function formatAuthErrorMessage(message: string | undefined, mode: "login" | "signup"): string {
  if (!message) {
    return mode === "login" ? "Login failed. Please try again." : "Signup failed. Please try again.";
  }
  return message;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const title = mode === "login" ? "Enter your LearnX workspace" : "Create your LearnX workspace";
  const submitLabel = submitting
    ? "Loading..."
    : mode === "login"
      ? "Enter the app"
      : "Create account";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    if (!hasSupabaseEnv()) {
      setErrorMessage(getSupabaseConfigError());
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "login") {
        const { data, error } = await signInWithEmail(email.trim(), password);
        if (error) {
          setErrorMessage(formatAuthErrorMessage(error.message, "login"));
          setSubmitting(false);
          return;
        }
        if (data.user) {
          const session = await syncSessionFromAuthUser(data.user);
          router.push(session?.onboarded ? "/app" : "/app/onboarding");
          return;
        }
        router.push("/app/onboarding");
      } else {
        const { data, error } = await signUpWithEmail(email.trim(), password);
        if (error) {
          if (isUserAlreadyExistsError(error.message ?? "")) {
            const { data: loginData, error: loginError } = await signInWithEmail(email.trim(), password);
            if (loginError) {
              setErrorMessage("This email is already registered. Please log in with your existing password or reset it.");
              setSubmitting(false);
              return;
            }

            if (loginData.user) {
              const session = await syncSessionFromAuthUser(loginData.user);
              router.push(session?.onboarded ? "/app" : "/app/onboarding");
              return;
            }

            setErrorMessage("This email is already registered. Please log in to continue.");
            setSubmitting(false);
            return;
          }

          setErrorMessage(formatAuthErrorMessage(error.message, "signup"));
          setSubmitting(false);
          return;
        }
        if (data.user) {
          await getSupabaseClient().auth.updateUser({
            data: { display_name: displayName.trim() || email.split("@")[0] },
          });
          sessionGateway.signUp({
            displayName: displayName.trim() || email.split("@")[0],
            email: data.user.email ?? email.trim(),
          });
        }
        router.push("/app/onboarding");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form className="surface-card w-full space-y-6 px-6 py-8 sm:px-8" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <p className="eyebrow">{mode === "login" ? "Login" : "Sign up"}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="muted text-sm leading-6">
          {mode === "login"
            ? "Sign in to reopen your study workspace."
            : "Create your account to continue into onboarding."}
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {mode === "signup" && (
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">Display name</span>
          <input
            aria-label="Your display name"
            className="field"
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Ricky"
            value={displayName}
          />
        </label>
      )}

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-800">Email</span>
        <input
          aria-label="Email address"
          className="field"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@learnx.app"
          type="email"
          value={email}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-800">Password</span>
        <div className="relative">
          <input
            aria-label="Password (minimum 6 characters)"
            className="field pr-24"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••"
            type={showPassword ? "text" : "password"}
            value={password}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <p className="text-xs text-slate-600">Minimum 6 characters</p>
      </label>

      <button
        className="button-primary w-full"
        disabled={submitting || !email.trim() || !password.trim() || password.length < 6}
        type="submit"
      >
        {submitLabel}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-black/10 bg-slate-950 px-4 py-4 text-white shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
        <div>
          <p className="text-sm font-semibold">
            {mode === "login" ? "Need a LearnX account?" : "Already have a LearnX account?"}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {mode === "login"
              ? "Create one and move straight into onboarding and your first study loop."
              : "Sign in to reopen your latest topic studio and saved progress."}
          </p>
        </div>
        <Link className="button-secondary bg-white/10 text-white hover:bg-white/15" href={mode === "login" ? "/signup" : "/login"}>
          {mode === "login" ? "Create account" : "Log in"}
        </Link>
      </div>
    </form>
  );
}
