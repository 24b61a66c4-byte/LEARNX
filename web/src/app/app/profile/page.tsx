"use client";

import { useRouter } from "next/navigation";

import { ONBOARDING_STORAGE_KEY } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { getServerDashboard, learnerStateGateway, sessionGateway } from "@/lib/gateways";
import { readLocalStorage } from "@/lib/storage";
import { ExportProgress } from "@/components/export-progress";
import { StreakCalendar } from "@/components/streak-calendar";
import { OnboardingProfile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { onboarding, session, dashboard } = useClientSnapshot(
    () => ({
      session: sessionGateway.getSession(),
      onboarding: readLocalStorage<OnboardingProfile | null>(ONBOARDING_STORAGE_KEY, null),
      dashboard: learnerStateGateway.getDashboard(
        readLocalStorage<OnboardingProfile | null>(ONBOARDING_STORAGE_KEY, null)?.preferredSubjectId,
      ),
    }),
    () => ({
      session: sessionGateway.getSession(),
      onboarding: null as OnboardingProfile | null,
      dashboard: getServerDashboard(),
    }),
  );

  const displayName =
    (typeof user?.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null) ??
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : null) ??
    session.profile?.displayName ??
    "LearnX Student";
  const email = user?.email ?? session.profile?.email ?? "preview session";
  const examTarget = onboarding?.examTarget?.replaceAll("-", " ") ?? "semester exam";
  const launchMode = onboarding?.launchMode?.replaceAll("-", " ") ?? "lesson";

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="surface-card p-6">
        <p className="eyebrow">Profile</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{displayName}</h1>
        <p className="mt-1 text-sm text-slate-600">{email}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Target exam</p>
            <p className="mt-2 font-semibold text-slate-950 capitalize">{examTarget}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Study style</p>
            <p className="mt-2 font-semibold text-slate-950 capitalize">{launchMode}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Preferred subject</p>
            <p className="mt-2 font-semibold text-slate-950 uppercase">
              {onboarding?.preferredSubjectId ?? "dbms"}
            </p>
          </div>
        </div>
      </div>

      {/* Streak Calendar Section */}
      <div>
        <p className="eyebrow mb-3">Momentum</p>
        <StreakCalendar />
      </div>

      {/* Progress & Rewards Section */}
      <div className="surface-card p-6">
        <p className="eyebrow">Your momentum snapshot</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">XP earned</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{dashboard.rewards.xp}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Level</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{dashboard.rewards.level}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Rank</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{dashboard.rewards.leaderboardLabel}</p>
          </div>
        </div>

        {dashboard.rewards.badges.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-900">Badges earned</p>
            <div className="flex flex-wrap gap-2">
              {dashboard.rewards.badges.map((badge) => (
                <div
                  className="rounded-full bg-gradient-to-br from-amber-100 to-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm"
                  key={badge.id}
                  title={badge.description}
                >
                  ★ {badge.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Study Goals & Actions */}
      <div className="surface-panel p-6">
        <p className="eyebrow mb-4">Study goal</p>
        <p className="text-sm leading-6 text-slate-700 capitalize">
          {onboarding?.studyGoal?.replaceAll("-", " ") ??
            "Start by setting your study goal in onboarding. This helps LearnX recommend the right drills."}
        </p>

        <div className="mt-6 space-y-3">
          <ExportProgress displayName={displayName} examTarget={examTarget} launchMode={launchMode} />
          <button
            aria-label="Sign out of LearnX"
            className="button-secondary w-full"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            type="button"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-500 text-center">
        Your progress stays local-first and syncs when you are signed in. Export your report anytime to keep a copy.
      </p>
    </div>
  );
}
