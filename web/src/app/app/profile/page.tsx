"use client";

import { useRouter } from "next/navigation";
import { LEVEL_XP_STEP } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { getSubjectById } from "@/lib/data/catalog";
import { getServerDashboard, learnerStateGateway, sessionGateway } from "@/lib/gateways";
import { ExportProgress } from "@/components/export-progress";
import { StreakCalendar } from "@/components/streak-calendar";
import { persistOnboardingProfile } from "@/lib/profile-updates";
import { getCognitiveGroup, getRecommendedSubjectId, getStoredOnboardingProfile } from "@/lib/profile-preferences";
import { AccessibilityFeature, OnboardingProfile } from "@/lib/types";

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
      onboarding: getStoredOnboardingProfile(),
      dashboard: learnerStateGateway.getDashboard(getStoredOnboardingProfile()?.preferredSubjectId),
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
  const profile = onboarding;
  const examTarget = profile?.examTarget?.replaceAll("-", " ") ?? "semester exam";
  const launchMode = profile?.launchMode?.replaceAll("-", " ") ?? "lesson";
  const pacePercent = Math.max(2, 100 - dashboard.rewards.percentile);
  const preferredSubjectLabel = getSubjectById(profile?.preferredSubjectId ?? "dbms")?.name ?? "Selected track";
  const ageValue = profile?.age ?? "";
  const ageGroupLabel = profile?.age ? getCognitiveGroup(profile.age) : "teens";

  async function persistProfile(nextProfile: OnboardingProfile) {
    await persistOnboardingProfile(nextProfile);
  }

  function updateAge(nextAge: number | "") {
    if (!profile) {
      return;
    }

    const hasAge = nextAge !== "";
    const nextProfile: OnboardingProfile = {
      ...profile,
      age: hasAge ? nextAge : undefined,
      cognitiveGroup: hasAge ? getCognitiveGroup(nextAge) : undefined,
      preferredSubjectId: hasAge
        ? getRecommendedSubjectId(nextAge, getCognitiveGroup(nextAge), profile.interests)
        : profile.preferredSubjectId,
    };

    void persistProfile(nextProfile);
  }

  function toggleAccessibility(feature: AccessibilityFeature) {
    if (!profile) {
      return;
    }

    const current = profile.accessibilityFeatures ?? [];
    const nextFeatures = current.includes(feature)
      ? current.filter((item) => item !== feature)
      : [...current, feature];

    void persistProfile({
      ...profile,
      accessibilityFeatures: nextFeatures,
    });
  }

  function toggleStudyFeature(feature: "enableVisualDiagrams" | "enableVoiceInput" | "enableQuizMode") {
    if (!profile) {
      return;
    }

    void persistProfile({
      ...profile,
      [feature]: !profile[feature],
    });
  }

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
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white ring-1 ring-white/10">
                Age: {ageValue || "set it in settings"}
              </span>
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-teal-300 ring-1 ring-white/10">
                Group: {profile?.age ? ageGroupLabel.toUpperCase() : "TEENS"}
              </span>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <section className="surface-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Settings</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Account and accessibility</h2>
            </div>
            <span className="reward-chip">Auto-save</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Age</span>
              <input
                aria-label="Update age"
                className="field"
                min="5"
                max="100"
                onChange={(event) => updateAge(event.target.value === "" ? "" : parseInt(event.target.value))}
                placeholder="Enter age"
                type="number"
                value={ageValue}
              />
              <p className="text-xs text-slate-500">Age updates the learning group and default subject.</p>
            </label>

            <div className="surface-panel space-y-3 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current path</p>
              <p className="text-sm font-semibold text-slate-950">{preferredSubjectLabel}</p>
              <p className="text-sm leading-6 text-slate-600">{onboarding?.studyGoal?.replaceAll("-", " ") ?? "Steady study"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <div>
              <p className="eyebrow">Accessibility</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                These stay in settings so the onboarding flow stays light.
              </p>
            </div>

            {(["high-contrast", "large-text", "screen-reader"] as AccessibilityFeature[]).map((feature) => {
              const enabled = profile?.accessibilityFeatures?.includes(feature) ?? false;
              return (
                <label
                  className={`flex items-center justify-between gap-4 rounded-[22px] border px-4 py-4 transition ${
                    enabled ? "border-teal-300 bg-teal-50" : "border-black/10 bg-white/84"
                  }`}
                  key={feature}
                >
                  <div>
                    <p className="font-semibold text-slate-950 capitalize">{feature.replace("-", " ")}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {feature === "high-contrast"
                        ? "Use a sharper contrast palette."
                        : feature === "large-text"
                          ? "Increase the reading size."
                          : "Optimize for assistive reading tools."}
                    </p>
                  </div>
                  <input
                    aria-label={`Toggle ${feature}`}
                    checked={enabled}
                    onChange={() => toggleAccessibility(feature)}
                    type="checkbox"
                  />
                </label>
              );
            })}
          </div>

          <div className="mt-8 grid gap-3">
            <div>
              <p className="eyebrow">Study controls</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tune the tutor experience without crowding the main workspace.
              </p>
            </div>

            {[
              {
                feature: "enableVisualDiagrams" as const,
                label: "Visual diagrams",
                description: "Open Mermaid-style support when concepts need structure.",
              },
              {
                feature: "enableVoiceInput" as const,
                label: "Voice mode",
                description: "Talk through the lesson instead of only typing.",
              },
              {
                feature: "enableQuizMode" as const,
                label: "Adaptive quiz",
                description: "Turn the current topic into short practice checks.",
              },
            ].map((item) => {
              const enabled = profile?.[item.feature] ?? false;
              return (
                <label
                  className={`flex items-center justify-between gap-4 rounded-[22px] border px-4 py-4 transition ${
                    enabled ? "border-teal-300 bg-teal-50" : "border-black/10 bg-white/84"
                  }`}
                  key={item.feature}
                >
                  <div>
                    <p className="font-semibold text-slate-950">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                  <input
                    aria-label={`Toggle ${item.label}`}
                    checked={enabled}
                    onChange={() => toggleStudyFeature(item.feature)}
                    type="checkbox"
                  />
                </label>
              );
            })}
          </div>
        </section>

        <aside className="surface-panel p-6">
          <p className="eyebrow">Profile summary</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[24px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Display name</p>
              <p className="mt-1 font-semibold text-slate-950">{displayName}</p>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 font-semibold text-slate-950">{email}</p>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Age group</p>
              <p className="mt-1 font-semibold text-slate-950">{profile?.age ? ageGroupLabel : "Set in settings"}</p>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Sidebar features</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Visual diagrams, voice mode, and adaptive quiz now live in settings instead of crowding the sidebar.
              </p>
            </div>
          </div>
        </aside>
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
