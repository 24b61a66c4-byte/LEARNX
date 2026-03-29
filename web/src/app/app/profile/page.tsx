"use client";

import { useRouter } from "next/navigation";

import { ONBOARDING_STORAGE_KEY } from "@/lib/constants";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { sessionGateway } from "@/lib/gateways";
import { readLocalStorage } from "@/lib/storage";
import { OnboardingProfile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { onboarding, session } = useClientSnapshot(
    () => ({
      session: sessionGateway.getSession(),
      onboarding: readLocalStorage<OnboardingProfile | null>(ONBOARDING_STORAGE_KEY, null),
    }),
    () => ({
      session: sessionGateway.getSession(),
      onboarding: null as OnboardingProfile | null,
    }),
  );

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="surface-card p-6">
        <p className="eyebrow">Profile</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Preview workspace profile</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="surface-panel p-5">
            <p className="text-sm text-slate-500">Display name</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {session.profile?.displayName ?? "LearnX Student"}
            </p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {session.profile?.email ?? "preview session"}
            </p>
          </div>
        </div>
      </div>

      <div className="surface-panel p-6">
        <p className="eyebrow">Study defaults</p>
        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <p>
            <strong className="text-slate-900">Preferred subject:</strong>{" "}
            {onboarding?.preferredSubjectId?.toUpperCase() ?? "Not set"}
          </p>
          <p>
            <strong className="text-slate-900">Goal:</strong>{" "}
            {onboarding?.studyGoal?.replaceAll("-", " ") ?? "Not set"}
          </p>
        </div>
        <button
          className="button-secondary mt-6 w-full"
          onClick={() => {
            sessionGateway.signOut();
            router.push("/login");
          }}
          type="button"
        >
          Sign out
        </button>
      </div>
    </section>
  );
}
