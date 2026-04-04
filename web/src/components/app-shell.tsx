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
import { getStoredOnboardingProfile } from "@/lib/profile-preferences";
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

type NavGlyphProps = {
  className?: string;
};

type NavGlyph = (props: NavGlyphProps) => ReactNode;

function HomeIcon({ className }: NavGlyphProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13V10.5" />
    </svg>
  );
}

function BookIcon({ className }: NavGlyphProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v15.5a.5.5 0 0 1-.5.5H6.5A2.5 2.5 0 0 0 4 22z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  );
}

function ChatIcon({ className }: NavGlyphProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H9l-4 2.5Z" />
      <path d="M8 8h8" />
      <path d="M8 11.5h5" />
    </svg>
  );
}

function TargetIcon({ className }: NavGlyphProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3" />
      <path d="M22 12h-3" />
    </svg>
  );
}

function ChartIcon({ className }: NavGlyphProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 19.5h16" />
      <path d="M7 16V9.5" />
      <path d="M12 16V6" />
      <path d="M17 16v-4.5" />
    </svg>
  );
}

function HistoryIcon({ className }: NavGlyphProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 12a8 8 0 1 0 2.3-5.7" />
      <path d="M4 4v4h4" />
      <path d="M12 8v4l2.5 1.5" />
    </svg>
  );
}

function SettingsIcon({ className }: NavGlyphProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
    </svg>
  );
}

function LogOutIcon({ className }: NavGlyphProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M9 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

const navItems = [
  { href: "/app", label: "Home", icon: HomeIcon },
  { href: "/app/subjects", label: "Subjects", icon: BookIcon },
  { href: "/app/ask", label: "Tutor", icon: ChatIcon },
  { href: "/app/practice", label: "Practice", icon: TargetIcon },
  { href: "/app/progress", label: "Progress", icon: ChartIcon },
];

const SIDEBAR_COLLAPSED_STORAGE_KEY = "learnx-shell-sidebar-collapsed";
const SIDEBAR_HISTORY_STORAGE_KEY = "learnx-shell-history-open";

function safeGetLocalStorageItem(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storage = window.localStorage;
  if (!storage || typeof storage.getItem !== "function") {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorageItem(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  const storage = window.localStorage;
  if (!storage || typeof storage.setItem !== "function") {
    return;
  }

  try {
    storage.setItem(key, value);
  } catch {
    // Ignore storage write failures in restricted or mocked environments.
  }
}

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
  icon: Icon,
  active,
  compact = false,
  collapsed = false,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: NavGlyph;
  active: boolean;
  compact?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const compactMode = compact || collapsed;
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`group relative inline-flex items-center gap-3 rounded-[20px] text-sm font-semibold transition ${compactMode
        ? "justify-center px-2.5 py-2.5"
        : "w-full px-3 py-3"
        } ${active
          ? "bg-white/12 text-white shadow-[0_12px_28px_rgba(15,23,42,0.28)]"
          : "text-white/65 hover:bg-white/7 hover:text-white"
        }`}
      href={href}
      onClick={onNavigate}
      title={compactMode ? label : undefined}
    >
      <span
        aria-hidden="true"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[0.65rem] font-bold tracking-[0.1em] transition ${active
          ? "bg-white/14 text-white"
          : "bg-white/8 text-white/75 group-hover:bg-white/12"
          }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      {compactMode ? null : <span>{label}</span>}
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

    return safeGetLocalStorageItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1";
  });
  const [historyPanelOpen, setHistoryPanelOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return safeGetLocalStorageItem(SIDEBAR_HISTORY_STORAGE_KEY) === "1";
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

    safeSetLocalStorageItem(SIDEBAR_COLLAPSED_STORAGE_KEY, sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    safeSetLocalStorageItem(SIDEBAR_HISTORY_STORAGE_KEY, historyPanelOpen ? "1" : "0");
  }, [historyPanelOpen]);

  const { dashboard, onboarding, session, history, threads, notes } = shellState;
  const activeOnboarding = onboarding;
  const isOnboardingRoute = pathname === "/app/onboarding";
  const displayName =
    (typeof user?.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null) ??
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : null) ??
    session.profile?.displayName ??
    "LearnX Student";
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
    ? `${preferredSubjectLabel} • ask, quiz, and review in one flow`
    : "Ask the tutor, search a topic, or start a quick drill.";
  const fallbackSubjectId = activeOnboarding?.preferredSubjectId;
  const tutorHref = dashboard.resumeTopic
    ? getPublicAskHref(dashboard.resumeTopic.subjectId, dashboard.resumeTopic.id)
    : getPublicAskHref(fallbackSubjectId);
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

  const desktopSidebarWidthClass = sidebarCollapsed ? "w-24" : "w-80";

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  if (isOnboardingRoute) {
    return (
      <div className="mx-auto flex min-h-[100svh] w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full">{children}</div>
      </div>
    );
  }

  return (
    <>
      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} open={paletteOpen} /> : null}
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[92rem] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside
          className={`sticky top-4 hidden h-[calc(100svh-2rem)] shrink-0 overflow-hidden rounded-[36px] border border-slate-900/80 bg-slate-950 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)] transition-[width,padding] duration-300 lg:flex ${desktopSidebarWidthClass}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.14),transparent_30%)]" />
          <div className={`relative flex h-full flex-col justify-between ${sidebarCollapsed ? "px-3 py-4" : "px-4 py-5"}`}>
            <div className="space-y-6">
              <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
                <LearnxLogo />
                <button
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-slate-950"
                  onClick={() => setSidebarCollapsed((current) => !current)}
                  type="button"
                >
                  {sidebarCollapsed ? ">" : "<"}
                </button>
              </div>

              {sidebarCollapsed ? null : (
                <div className="rounded-[24px] border border-white/8 bg-white/6 px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/45">Workspace</p>
                  <p className="mt-3 text-lg font-semibold tracking-tight text-white">{preferredSubjectLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{focusLine}</p>
                </div>
              )}

              <div className="space-y-2">
                <p
                  className={`px-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/40 ${sidebarCollapsed ? "text-center" : ""
                    }`}
                >
                  Navigate
                </p>
                {navItems.map((item) => (
                  <NavLink
                    active={isActivePath(pathname, item.href)}
                    collapsed={sidebarCollapsed}
                    href={item.href}
                    icon={item.icon}
                    key={item.href}
                    label={item.label}
                  />
                ))}
              </div>

              <div className={`space-y-3 ${sidebarCollapsed ? "hidden" : "block"}`}>
                <div className="flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <HistoryIcon className="h-4 w-4 text-white/45" />
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/40">Recent</p>
                  </div>
                  <button
                    className="text-xs font-semibold text-white/55 transition hover:text-white"
                    onClick={() => setHistoryPanelOpen((current) => !current)}
                    type="button"
                  >
                    {historyPanelOpen ? "Hide" : "Show"}
                  </button>
                </div>
                {historyPanelOpen ? (
                  visibleRecentWork.length === 0 ? (
                    <div className="rounded-[24px] border border-white/8 bg-white/6 px-4 py-4 text-sm leading-6 text-white/55">
                      Recent drills, notes, and tutor threads will show up here once the learner starts moving.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {visibleRecentWork.map((item) => (
                        <Link
                          className="block rounded-[22px] border border-white/8 bg-white/6 px-4 py-4 transition hover:bg-white/10"
                          href={item.href}
                          key={`${item.label}-${item.title}`}
                        >
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                          <p className="mt-2 font-semibold text-white">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-white/55">{item.detail}</p>
                        </Link>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="rounded-[24px] border border-white/8 bg-white/6 px-4 py-4 text-sm leading-6 text-white/50">
                    Keep this rail quiet until you want a quick look at recent activity.
                  </div>
                )}
              </div>
            </div>

            <div className={`border-t border-white/8 pt-4 ${sidebarCollapsed ? "space-y-3" : "space-y-4"}`}>
              <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold text-white">
                  {avatarInitials}
                </div>
                {sidebarCollapsed ? null : (
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{firstName}</p>
                    <p className="truncate text-sm text-white/45">Profile and sign-out</p>
                  </div>
                )}
              </div>

              <div className={`grid gap-2 ${sidebarCollapsed ? "grid-cols-1" : "grid-cols-2"}`}>
                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                  href={profileHref}
                >
                  <SettingsIcon className="h-4 w-4" />
                  {sidebarCollapsed ? null : "Profile"}
                </Link>
                <button
                  aria-label="Sign out of LearnX and return to login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                  onClick={() => {
                    void handleSignOut();
                  }}
                  type="button"
                >
                  <LogOutIcon className="h-4 w-4" />
                  {sidebarCollapsed ? null : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 safe-bottom">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="eyebrow">Study</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Welcome back, {firstName}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">{focusLine}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="pill">Streak: {dashboard.rewards.streakDays} day{dashboard.rewards.streakDays === 1 ? "" : "s"}</span>
              <span className="pill">Level {dashboard.rewards.level}</span>
              <span className="pill">Today: {dashboard.todayAttempts}/{dashboard.dailyGoalTarget} drills</span>
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
                <span className="reward-chip">Level {dashboard.rewards.level}</span>
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
                  icon={item.icon}
                  key={`mobile-${item.href}`}
                  label={item.label}
                  onNavigate={() => setMobileNavRoute(null)}
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
              icon={item.icon}
              key={item.href}
              label={item.label}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
