"use client";

import { useRouter } from "next/navigation";
import { LEVEL_XP_STEP, ONBOARDING_STORAGE_KEY } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { getServerDashboard, learnerStateGateway, sessionGateway } from "@/lib/gateways";
import { readLocalStorage } from "@/lib/storage";
import { ExportProgress } from "@/components/export-progress";
import { StreakCalendar } from "@/components/streak-calendar";
import { OnboardingProfile } from "@/lib/types";

function XPRingCompact({ xp, level }: { xp: number; level: number }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const previousLevelXp = Math.max(0, (level - 1) * LEVEL_XP_STEP);
  const progress = Math.min(1, Math.max(0, (xp - previousLevelXp) / LEVEL_XP_STEP));
  const offset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-16 w-16 -rotate-90 transform">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="url(#xp-gradient-profile)"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
        />
        <defs>
          <linearGradient id="xp-gradient-profile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-black text-slate-950">{level}</span>
      </div>
    </div>
  );
}

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
  const initials = displayName.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase();
  const examTarget = onboarding?.examTarget?.replaceAll("-", " ") ?? "semester exam";
  const launchMode = onboarding?.launchMode?.replaceAll("-", " ") ?? "lesson";
  const pacePercent = Math.max(2, 100 - dashboard.rewards.percentile);
  const preferredSubjectLabel = (onboarding?.preferredSubjectId ?? "dbms").toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-10">
      {/* Profile Hero */}
      <div className="relative overflow-hidden rounded-[40px] bg-slate-950 p-10 text-white shadow-2xl">
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-teal-500/20 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-amber-500/10 blur-[80px]" />
        
        <div className="relative flex flex-col items-center gap-8 sm:flex-row">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[32px] bg-gradient-to-br from-teal-400 to-teal-600 text-3xl font-black text-white shadow-2xl shadow-teal-500/20 ring-4 ring-white/10">
            {initials}
          </div>
          
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-black tracking-tight">{displayName}</h1>
            <p className="mt-2 font-medium text-slate-400">{email}</p>
            
            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-teal-300 ring-1 ring-white/10">
                Target: {examTarget}
              </span>
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300 ring-1 ring-white/10">
                Style: {launchMode}
              </span>
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white ring-1 ring-white/10">
                {preferredSubjectLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Quickbar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-panel flex items-center justify-between p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total XP</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{dashboard.rewards.xp}</p>
          </div>
          <XPRingCompact xp={dashboard.rewards.xp} level={dashboard.rewards.level} />
        </div>
        
        <div className="surface-panel p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pace Rank</p>
          <p className="mt-1 text-2xl font-black text-slate-950">Top {pacePercent}%</p>
          <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
             <div className="h-full rounded-full bg-rose-500" style={{ width: `${dashboard.rewards.percentile}%` }} />
          </div>
        </div>

        <div className="surface-panel p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Streak</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{dashboard.rewards.streakDays} Days</p>
          <p className="mt-1 text-[10px] font-bold uppercase text-teal-600">Consistency is climbing</p>
        </div>
      </div>

      {/* Momentum Tracker */}
      <section>
        <div className="mb-6 flex items-center justify-between">
           <h2 className="text-xl font-black tracking-tight text-slate-950 italic">Momentum Health</h2>
           <span className="h-px flex-1 mx-6 bg-slate-100" />
        </div>
        <StreakCalendar />
      </section>

      {/* Achievements Gallery */}
      <section className="surface-card p-10">
        <div className="mb-8">
           <p className="eyebrow">Unlock progression</p>
           <h2 className="mt-2 text-2xl font-black text-slate-950">Badge Gallery</h2>
        </div>

        {dashboard.rewards.badges.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {dashboard.rewards.badges.map((badge) => (
              <div
                key={badge.id}
                className="group relative flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/30 px-5 py-3 transition-all hover:bg-amber-50"
                title={badge.description}
              >
                <span className="text-xl group-hover:animate-bounce">★</span>
                <div>
                  <p className="text-xs font-black text-amber-900 uppercase tracking-tight">{badge.label}</p>
                  <p className="text-[10px] font-medium text-amber-700/60 uppercase">Achievement Unlocked</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-sm font-medium text-slate-500">Your first badge is waiting. Complete a drill to claim it!</p>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="grid gap-6 sm:grid-cols-[1.5fr_1fr]">
        <div className="surface-panel p-8">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Study Strategy</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-700">
             {onboarding?.studyGoal?.replaceAll("-", " ") || "Define your study roadmap to see personalized recommendations here."}
          </p>
          <div className="mt-8">
             <ExportProgress displayName={displayName} examTarget={examTarget} launchMode={launchMode} />
          </div>
        </div>

        <div className="flex flex-col justify-end gap-4 rounded-[32px] bg-rose-50 p-8">
          <div className="mb-auto">
            <p className="text-lg font-black text-rose-900 italic">Exit Portal</p>
            <p className="mt-2 text-xs font-medium uppercase leading-relaxed text-rose-700">
              Your progress stays local-first and syncs when you are signed in, so you can return to the same study flow.
            </p>
          </div>
          <button
            aria-label="Sign out of LearnX"
            className="group flex w-full items-center justify-between rounded-2xl bg-rose-950 px-6 py-4 font-bold text-white transition hover:bg-rose-900 active:scale-95"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            type="button"
          >
            SIGN OUT
            <span className="opacity-50 transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        LearnX v1.0 | Built for mastery | Local-first with signed-in sync
      </p>
    </div>
  );
}
