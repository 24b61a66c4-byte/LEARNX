"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signUpWithEmail, signInWithEmail, supabase } from "@/lib/supabase";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const title = mode === "login" ? "Enter your LearnX workspace" : "Create your LearnX workspace";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      if (mode === "login") {
        const { data, error } = await signInWithEmail(email.trim(), password);
        if (error) {
          setErrorMessage(error.message || "Login failed. Please try again.");
          setSubmitting(false);
          return;
        }
        if (data.user) {
          await supabase.auth.updateUser({
            data: { display_name: displayName || email.split("@")[0] },
          });
        }
        router.push("/app");
      } else {
        const { data, error } = await signUpWithEmail(email.trim(), password);
        if (error) {
          setErrorMessage(error.message || "Signup failed. Please try again.");
          setSubmitting(false);
          return;
        }
        if (data.user) {
          await supabase.auth.updateUser({
            data: { display_name: displayName.trim() || email.split("@")[0] },
          });
        }
        router.push("/app/onboarding");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form className="surface-card w-full max-w-xl space-y-5 px-6 py-8 sm:px-8" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <p className="eyebrow">{mode === "login" ? "Login" : "Sign up"}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="muted text-sm">Your study data is securely stored and synced across all your devices.</p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
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
        <input
          aria-label="Password (minimum 6 characters)"
          className="field"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••"
          type="password"
          value={password}
        />
        <p className="text-xs text-slate-600">Minimum 6 characters</p>
      </label>

      <button
        className="button-primary w-full"
        disabled={submitting || !email.trim() || !password.trim() || password.length < 6}
        type="submit"
      >
        {submitting ? "Loading..." : mode === "login" ? "Enter the app" : "Create account"}
      </button>
    </form>
  );
}
