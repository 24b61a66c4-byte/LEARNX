"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { sessionGateway } from "@/lib/gateways";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "Enter your LearnX workspace" : "Create your LearnX workspace"),
    [mode],
  );

  return (
    <form
      className="surface-card w-full max-w-xl space-y-5 px-6 py-8 sm:px-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitting(true);

        const fallbackName = email.split("@")[0] || "LearnX Student";
        const profile = {
          displayName: displayName.trim() || fallbackName,
          email: email.trim(),
        };

        if (mode === "login") {
          const session = sessionGateway.signIn(profile);
          router.push(session.onboarded ? "/app" : "/app/onboarding");
        } else {
          sessionGateway.signUp(profile);
          router.push("/app/onboarding");
        }
      }}
    >
      <div className="space-y-2">
        <p className="eyebrow">{mode === "login" ? "Login" : "Sign up"}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="muted text-sm">
          Use any email to enter the current preview. Your study flow is saved on this device while full account sync is
          still being wired in.
        </p>
      </div>

      {mode === "signup" ? (
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">Display name</span>
          <input
            className="field"
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Ricky"
            value={displayName}
          />
        </label>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-800">Email</span>
        <input
          className="field"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@learnx.app"
          type="email"
          value={email}
        />
      </label>

      <button className="button-primary w-full" disabled={submitting || !email.trim()} type="submit">
        {mode === "login" ? "Enter the app" : "Create account"}
      </button>
    </form>
  );
}
