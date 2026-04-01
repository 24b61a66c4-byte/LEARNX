"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { CommandPalette } from "@/components/command-palette";
import { LearnxLogo } from "@/components/learnx-logo";
import { TOPIC_NOTES_KEY } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { getSubjectById, getTopicById } from "@/lib/data/catalog";
import { getPublicAskHref, getPublicLearnHref, getPublicPracticeHref } from "@/lib/public-routes";
import { getCognitiveGroup, getStoredOnboardingProfile } from "@/lib/profile-preferences";
import {
  defaultSession,
  getServerDashboard,
  learnerStateGateway,
  practiceGateway,
  sessionGateway,
  tutorGateway,
} from "@/lib/gateways";
import { readLocalStorage } from "@/lib/storage";
import { AppSession, DashboardView, OnboardingProfile, PracticeResult, StudyNote, TutorThread } from "@/lib/types";

const navItems = [
  { href: "/app", label: "Home", shortLabel: "HM" },
  { href: "/app/subjects", label: "Subjects", shortLabel: "SB" },
  { href: "/app/ask", label: "Tutor", shortLabel: "TU" },
  { href: "/app/practice", label: "Practice", shortLabel: "PR" },
  { href: "/app/progress", label: "Progress", shortLabel: "PG" },
];

const SIDEBAR_COLLAPSED_STORAGE_KEY = "learnx-shell-sidebar-collapsed";

function getShellState(): {
  session: AppSession;
  dashboard: DashboardView;
  onboarding: OnboardingProfile | null;
  history: PracticeResult[];
  threads: TutorThread[];
  notes: StudyNote[];
} {
  const onboarding = getStoredOnboardingProfile();
  return {
    session: sessionGateway.getSession(),
    dashboard: learnerStateGateway.getDashboard(onboarding?.preferredSubjectId),
    onboarding,
    history: practiceGateway.getHistory(),
    threads: tutorGateway.getThreads(),
    notes: readLocalStorage<StudyNote[]>(TOPIC_NOTES_KEY, []),
  };
}

function getServerShellState() {
  return {
    session: defaultSession,
    dashboard: getServerDashboard(),
    onboarding: null as OnboardingProfile | null,
    history: [] as PracticeResult[],
    threads: [] as TutorThread[],
    notes: [] as StudyNote[],
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

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((startOfToday.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "today";
  }

  if (diffDays === 1) {
    return "yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
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

  const { dashboard, onboarding, session, history, threads, notes } = shellState;
  const activeOnboarding = onboarding;
  const isOnboardingRoute = pathname === "/app/onboarding";
  const displayName =
    (typeof user?.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null) ??
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : null) ??
    session.profile?.displayName ??
    "LearnX Student";
  const email = user?.email ?? session.profile?.email ?? "local session";
  const firstName = displayName.split(" ")[0] ?? "Student";
  const avatarInitials = displayName
    .split(" ")
    .map((name) => name[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const preferredSubjectLabel = activeOnboarding
    ? getSubjectById(activeOnboarding.preferredSubjectId)?.name ?? "Selected subject"
    : "your first subject";
  const focusLine = activeOnboarding
    ? `${preferredSubjectLabel} • ${formatStudyGoal(activeOnboarding.studyGoal)}`
    : "Ask the tutor, search a topic, or start a quick drill.";
  const fallbackSubjectId = activeOnboarding?.preferredSubjectId;
  const tutorHref = dashboard.resumeTopic
    ? getPublicAskHref(dashboard.resumeTopic.subjectId, dashboard.resumeTopic.id)
    : getPublicAskHref(fallbackSubjectId);
  const ageLabel = activeOnboarding?.age ?? "set in settings";
  const groupLabel = activeOnboarding?.age ? getCognitiveGroup(activeOnboarding.age).toUpperCase() : "TEENS";

  const recentWork = [
    history[0]
      ? {
        label: "Drill",
        title:
          getTopicById(history[0].topicId ?? "")?.title ??
          `${getSubjectById(history[0].subjectId)?.name ?? "Subject"} mixed drill`,
        detail: `${history[0].scorePercent}% • ${formatShortDate(history[0].completedAt)}`,
        href: history[0].topicId
          ? getPublicLearnHref(history[0].subjectId, history[0].topicId, "drill-dock")
          : getPublicPracticeHref(history[0].subjectId),
      }
      : null,
    threads[0]
      ? {
        label: "Tutor",
        title:
          threads[0].topicId && getTopicById(threads[0].topicId)
            ? getTopicById(threads[0].topicId)?.title ?? "Topic thread"
            : threads[0].subjectId
              ? `${getSubjectById(threads[0].subjectId)?.name ?? "Subject"} guidance`
              : "Open-ended tutor thread",
        detail: `Updated ${formatShortDate(threads[0].updatedAt)}`,
        href: threads[0].topicId && threads[0].subjectId
          ? getPublicAskHref(threads[0].subjectId, threads[0].topicId)
          : getPublicAskHref(threads[0].subjectId),
      }
      : null,
    notes[0]
      ? {
        label: "Note",
        title: notes[0].title,
        detail: `${getTopicById(notes[0].topicId)?.title ?? notes[0].topicId} • ${formatShortDate(
          notes[0].updatedAt,
        )}`,
        href: getPublicLearnHref(notes[0].subjectId, notes[0].topicId, "topic-notes"),
      }
      : null,
  ].filter((item): item is { label: string; title: string; detail: string; href: string } => Boolean(item));
  const visibleRecentWork = recentWork.slice(0, 2);
  const profileHref = "/app/profile";
  const activeNavLabel = navItems.find((item) => isActivePath(pathname, item.href))?.label ?? "Workspace";

  const desktopSidebarWidthClass = sidebarCollapsed ? "w-24" : "w-72";

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  if (isOnboardingRoute) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-77px)] w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full">{children}</div>
      </div>
    );
  }

  return (
    <>
      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} open={paletteOpen} /> : null}
      <div className="mx-auto flex min-h-[calc(100vh-77px)] w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside
          className={`surface-card sticky top-6 hidden h-[calc(100vh-7rem)] shrink-0 flex-col justify-between overflow-y-auto px-4 py-5 transition-[width,padding] duration-300 lg:flex ${desktopSidebarWidthClass}`}
        >
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

            <div className="space-y-2">
              <p
                className={`px-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500 ${sidebarCollapsed ? "text-center" : ""
                  }`}
              >
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
              <p className="eyebrow">History</p>
              {visibleRecentWork.length === 0 ? (
                <div className="surface-panel px-4 py-4 text-sm leading-6 text-slate-500">
                  Drills, notes, and tutor threads will appear here after you start studying.
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleRecentWork.map((item) => (
                    <Link
                      className="surface-panel block px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                      href={item.href}
                      key={`${item.label}-${item.title}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                      <p className="mt-2 font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`surface-panel space-y-3 p-4 ${sidebarCollapsed ? "items-center" : ""}`}>
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                {avatarInitials}
              </div>
              {sidebarCollapsed ? null : (
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{displayName}</p>
                  <p className="truncate text-sm text-slate-500">{email}</p>
                  <p className="truncate text-xs text-slate-500">
                    Age {ageLabel} {activeOnboarding?.age ? `• ${groupLabel}` : ""}
                  </p>
                </div>
              )}
            </div>
            <div className={`grid gap-2 ${sidebarCollapsed ? "grid-cols-1" : "grid-cols-2"}`}>
              <Link className="button-secondary w-full" href={profileHref}>
                Settings
              </Link>
              <button
                aria-label="Sign out of LearnX and return to login"
                className="button-secondary w-full"
                onClick={() => {
                  void handleSignOut();
                }}
                type="button"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 safe-bottom">
          <div className="surface-card mb-5 overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="eyebrow">Study cockpit</p>
                    <span className="pill">🔥 {dashboard.rewards.streakDays}d streak</span>
                    <span className="pill">Top {100 - dashboard.rewards.percentile}% pace</span>
                    <span className="pill">L{dashboard.rewards.level}</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Welcome back, {firstName}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600">{focusLine}</p>
                </div>

              </div>
            </div>
          </div>
          <div className="mb-5 flex flex-wrap gap-3 lg:hidden">
            <Link className="button-primary" href={tutorHref}>
              Ask the tutor
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
