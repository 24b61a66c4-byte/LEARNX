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
  { href: "/app", label: "Home", shortLabel: "HM" },
  { href: "/app/subjects", label: "Subjects", shortLabel: "SB" },
  { href: "/app/ask", label: "Ask AI", shortLabel: "AI" },
  { href: "/app/practice", label: "Practice", shortLabel: "PR" },
  { href: "/app/progress", label: "Progress", shortLabel: "PG" },
];

const SIDEBAR_COLLAPSED_STORAGE_KEY = "learnx-shell-sidebar-collapsed";

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
  shortLabel,
  active,
  compact = false,
  collapsed = false,
  onNavigate,
}: {
  href: string;
  label: string;
  shortLabel?: string;
  active: boolean;
  compact?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const compactMode = compact || collapsed;
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`group relative inline-flex items-center gap-2.5 rounded-2xl border text-sm font-semibold transition ${compactMode
        ? "justify-center px-2.5 py-2.5"
        : "w-full px-3.5 py-2.5"
        } ${active
          ? "border-teal-700/20 bg-slate-950 text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)]"
          : "border-transparent text-slate-600 hover:border-black/10 hover:bg-white/80 hover:text-slate-900"
        }`}
      href={href}
      onClick={onNavigate}
      title={compactMode ? label : undefined}
    >
      <span
        aria-hidden="true"
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[0.65rem] font-bold tracking-[0.1em] transition ${active
          ? "bg-white/15 text-white"
          : "bg-slate-200/70 text-slate-700 group-hover:bg-slate-300/70"
          }`}
      >
        {shortLabel ?? label.slice(0, 2).toUpperCase()}
      </span>
      {compactMode ? null : <span className={active ? "bg-slate-950 text-white" : undefined}>{label}</span>}
      {active && !compactMode ? <span className="nav-active-rail" /> : null}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1";
  });
  const [mobileNavRoute, setMobileNavRoute] = useState<string | null>(null);
  const shellState = useClientSnapshot(getShellState, getServerShellState);
  const mobileNavOpen = mobileNavRoute === pathname;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setMobileNavRoute(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

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
  const profileHref = "/app/profile";
  const activeNavLabel = navItems.find((item) => isActivePath(pathname, item.href))?.label ?? "Workspace";

  const desktopSidebarWidthClass = sidebarCollapsed ? "w-24" : "w-72";

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <>
      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} open={paletteOpen} /> : null}
      <div className="mx-auto flex min-h-[calc(100vh-77px)] w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className={`surface-card sticky top-6 hidden h-[calc(100vh-7rem)] shrink-0 flex-col justify-between px-4 py-5 transition-[width,padding] duration-300 lg:flex ${desktopSidebarWidthClass}`}>
          <div className="space-y-6">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
              <LearnxLogo />
              <button
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/85 text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                onClick={() => setSidebarCollapsed((current) => !current)}
                type="button"
              >
                {sidebarCollapsed ? ">" : "<"}
              </button>
            </div>
            <div className={`surface-panel space-y-4 px-4 py-4 ${sidebarCollapsed ? "hidden" : "block"}`}>
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
              <p className={`px-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500 ${sidebarCollapsed ? "text-center" : ""}`}>
                Nav
              </p>
              {navItems.map((item) => (
                <NavLink
                  active={isActivePath(pathname, item.href)}
                  collapsed={sidebarCollapsed}
                  href={item.href}
                  key={item.href}
                  label={item.label}
                  shortLabel={item.shortLabel}
                />
              ))}
            </div>
            <div className={`space-y-3 ${sidebarCollapsed ? "hidden" : "block"}`}>
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
          <div className={`space-y-3 rounded-[24px] bg-slate-950 px-5 py-5 text-white ${sidebarCollapsed ? "px-3" : ""}`}>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-200">Logged in</p>
            <div>
              <p className="font-semibold">{sidebarCollapsed ? firstName : displayName}</p>
              {sidebarCollapsed ? null : <p className="text-sm text-slate-300">{email}</p>}
            </div>
            {sidebarCollapsed ? null : (
              <Link
                className="button-secondary w-full bg-white/10 text-white hover:bg-white/15"
                href={profileHref}
              >
                Open profile
              </Link>
            )}
            <button
              aria-label="Sign out of LearnX and return to login"
              className="button-secondary w-full bg-white/10 text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
              onClick={() => {
                void handleSignOut();
              }}
              type="button"
            >
              {sidebarCollapsed ? "Out" : "Sign out"}
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
            <button
              aria-expanded={mobileNavOpen}
              aria-label="Open mobile navigation menu and account actions"
              className="button-secondary"
              onClick={() => setMobileNavRoute((current) => (current === pathname ? null : pathname))}
              type="button"
            >
              Menu
            </button>
          </div>
          {children}
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-[2px] lg:hidden" onClick={() => setMobileNavRoute(null)}>
          <div className="absolute inset-x-3 bottom-20 rounded-[28px] border border-black/10 bg-white/95 p-3 shadow-[0_20px_45px_rgba(15,23,42,0.22)]" onClick={(event) => event.stopPropagation()}>
            <div className="rounded-[24px] bg-slate-950 px-4 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-teal-200">
                    {activeNavLabel}
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight">{displayName}</p>
                  <p className="mt-1 text-sm text-slate-300">{focusLine}</p>
                </div>
                <span className="reward-chip">{dashboard.rewards.level}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  className="button-secondary flex-1 bg-white/10 text-white hover:bg-white/15"
                  href={profileHref}
                  onClick={() => setMobileNavRoute(null)}
                >
                  Profile
                </Link>
                <button
                  className="button-secondary flex-1 bg-white/10 text-white hover:bg-white/15"
                  onClick={() => {
                    setMobileNavRoute(null);
                    void handleSignOut();
                  }}
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </div>
            <p className="px-2 pb-2 pt-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Navigate</p>
            <div className="grid grid-cols-1 gap-2">
              {navItems.map((item) => (
                <NavLink
                  active={isActivePath(pathname, item.href)}
                  href={item.href}
                  key={`mobile-${item.href}`}
                  label={item.label}
                  onNavigate={() => setMobileNavRoute(null)}
                  shortLabel={item.shortLabel}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-4 bottom-4 z-40 rounded-full border border-black/10 bg-white/92 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => (
            <NavLink
              active={isActivePath(pathname, item.href)}
              compact
              href={item.href}
              key={item.href}
              label={item.label}
              shortLabel={item.shortLabel}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
