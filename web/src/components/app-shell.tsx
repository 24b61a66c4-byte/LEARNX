"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { CommandPalette } from "@/components/command-palette";
import { LearnxLogo } from "@/components/learnx-logo";
import { ONBOARDING_STORAGE_KEY } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useClientSnapshot } from "@/lib/client-snapshot";
import {
  defaultSession,
  getServerDashboard,
  learnerStateGateway,
  sessionGateway,
} from "@/lib/gateways";
import { readLocalStorage } from "@/lib/storage";
import { AppSession, DashboardView, OnboardingProfile } from "@/lib/types";

const navItems = [
  { href: "/app", label: "Home" },
  { href: "/app/subjects", label: "Subjects" },
  { href: "/app/ask", label: "Ask AI" },
  { href: "/app/practice", label: "Practice" },
  { href: "/app/progress", label: "Progress" },
];

function getShellState(): {
  session: AppSession;
  dashboard: DashboardView;
  onboarding: OnboardingProfile | null;
} {
  const onboarding = readLocalStorage<OnboardingProfile | null>(ONBOARDING_STORAGE_KEY, null);
  return {
    session: sessionGateway.getSession(),
    dashboard: learnerStateGateway.getDashboard(onboarding?.preferredSubjectId),
    onboarding,
  };
}

function getServerShellState() {
  return {
    session: defaultSession,
    dashboard: getServerDashboard(),
    onboarding: null as OnboardingProfile | null,
  };
}

function isActivePath(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatStudyGoal(goal?: OnboardingProfile["studyGoal"]) {
  return goal ? goal.replaceAll("-", " ") : "steady daily practice";
}

function formatExamTarget(target?: OnboardingProfile["examTarget"]) {
  return target ? target.replaceAll("-", " ") : "semester exam";
}

function NavLink({
  href,
  label,
  active,
  compact = false,
}: {
  href: string;
  label: string;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center rounded-full text-sm font-semibold transition ${compact ? "justify-center px-2 py-2 text-[0.72rem]" : "px-4 py-2.5"
        } ${active ? "bg-slate-950 text-white shadow-md" : "text-slate-600 hover:bg-white/80"}`}
      href={href}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const shellState = useClientSnapshot(getShellState, getServerShellState);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const { dashboard, onboarding, session } = shellState;
  const todaySegments = Array.from({ length: dashboard.dailyGoalTarget }, (_, index) => index < dashboard.todayAttempts);
  const displayName =
    (typeof user?.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null) ??
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : null) ??
    session.profile?.displayName ??
    "LearnX Student";
  const email = user?.email ?? session.profile?.email ?? "local session";
  const firstName = displayName.split(" ")[0] ?? "Student";
  const focusLine = onboarding
    ? `Focus: ${onboarding.preferredSubjectId.toUpperCase()} • ${formatStudyGoal(onboarding.studyGoal)} • ${formatExamTarget(onboarding.examTarget)}`
    : "Choose one subject, protect the streak, and keep the flow simple.";
  const tutorHref = dashboard.resumeTopic
    ? `/app/ask?subjectId=${dashboard.resumeTopic.subjectId}&topicId=${dashboard.resumeTopic.id}`
    : `/app/ask?subjectId=${onboarding?.preferredSubjectId ?? "dbms"}`;
  const quickActions = [
    {
      href: tutorHref,
      label: "Ask the tutor",
      detail: "Turn one confusion into a clear explanation with the current topic attached.",
    },
    {
      href: dashboard.quickPracticeHref,
      label: "Start a drill",
      detail: "Keep the streak alive with a fast question set.",
    },
    {
      href: "/app/progress",
      label: "See rewards",
      detail: "Track XP, badges, and momentum in one place.",
    },
  ];

  return (
    <>
      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} open={paletteOpen} /> : null}
      <div className="mx-auto flex min-h-[calc(100vh-77px)] w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="surface-card sticky top-6 hidden h-[calc(100vh-7rem)] w-72 shrink-0 flex-col justify-between px-5 py-6 lg:flex">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <LearnxLogo />
            </div>
            <div className="surface-panel space-y-4 px-4 py-4">
              <div>
                <p className="eyebrow">Today cadence</p>
                <p className="mt-2 text-lg font-bold tracking-tight text-slate-950">
                  {dashboard.rewards.streakDays > 0 ? `${dashboard.rewards.streakDays} day streak` : "Start the streak"}
                </p>
                <p className="mt-1 text-sm text-slate-600">{focusLine}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="shell-stat-card">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">XP</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{dashboard.rewards.xp}</p>
                </div>
                <div className="shell-stat-card">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Today</p>
                      <p className="mt-2 text-2xl font-bold text-slate-950">
                        {dashboard.todayAttempts}/{dashboard.dailyGoalTarget}
                      </p>
                    </div>
                    <span className="reward-chip">{dashboard.rewards.level}</span>
                  </div>
                  <div className="momentum-meter mt-3">
                    {todaySegments.map((active, index) => (
                      <span data-active={active} key={index} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700">{dashboard.rewards.nextBadgeLabel}</p>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  active={isActivePath(pathname, item.href)}
                  href={item.href}
                  key={item.href}
                  label={item.label}
                />
              ))}
            </div>
            <div className="space-y-3">
              <p className="eyebrow">Quick launch</p>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    className="surface-panel block px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                    href={action.href}
                    key={action.href}
                  >
                    <p className="font-semibold text-slate-950">{action.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{action.detail}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3 rounded-[24px] bg-slate-950 px-5 py-5 text-white">
            <p className="text-xs uppercase tracking-[0.22em] text-teal-200">Logged in</p>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-slate-300">{email}</p>
            </div>
            <button
              aria-label="Sign out of LearnX and return to login"
              className="button-secondary w-full bg-white/10 text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              type="button"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 safe-bottom">
          <div className="surface-card sticky top-4 z-30 mb-6 overflow-hidden px-4 py-4 sm:px-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(15,118,110,0.85),rgba(245,158,11,0.85),rgba(251,113,133,0.7))]" />
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="reward-chip">🔥 {dashboard.rewards.streakDays}d streak</span>
                  <span className="reward-chip">+{dashboard.rewards.xpToNextLevel} XP to level up</span>
                  <span className="reward-chip">{dashboard.rewards.leaderboardLabel}</span>
                </div>
                <div>
                  <p className="eyebrow">Study cockpit</p>
                  <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                    Welcome back, {firstName}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{focusLine}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link className="button-primary" href={tutorHref}>
                    Ask the tutor
                  </Link>
                  <Link className="button-secondary" href={dashboard.quickPracticeHref}>
                    Quick practice
                  </Link>
                  <button aria-label="Open command palette to search topics (Ctrl+K)" className="button-secondary px-4 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2" onClick={() => setPaletteOpen(true)} type="button">
                    Search topics
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[360px]">
                <div className="shell-stat-card">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Today</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    {dashboard.todayAttempts}/{dashboard.dailyGoalTarget}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Daily drill goal</p>
                </div>
                <div className="shell-stat-card">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Level</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{dashboard.rewards.level}</p>
                  <p className="mt-1 text-sm text-slate-600">{dashboard.rewards.nextBadgeLabel}</p>
                </div>
                <div className="shell-stat-card">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next move</p>
                  <p className="mt-2 text-lg font-bold tracking-tight text-slate-950">
                    {dashboard.recommendation?.title ?? "Open a drill"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {dashboard.recommendation?.reason ?? "Use practice or tutor mode to create the next study win."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-5 flex flex-wrap gap-3 lg:hidden">
            <Link className="button-primary" href={tutorHref}>
              Ask AI
            </Link>
            <Link className="button-secondary" href={dashboard.quickPracticeHref}>
              Quick drill
            </Link>
            <Link className="button-secondary" href="/app/progress">
              Rewards
            </Link>
          </div>
          <div>
            <div>
              <p className="eyebrow">Study cockpit</p>
              <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-950 sm:hidden">
                Keep one study flow open
              </h2>
            </div>
          </div>
          {children}
        </div>
      </div>

      <nav className="fixed inset-x-4 bottom-4 z-40 rounded-full border border-black/10 bg-white/92 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => (
            <NavLink
              active={isActivePath(pathname, item.href)}
              compact
              href={item.href}
              key={item.href}
              label={item.label}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
