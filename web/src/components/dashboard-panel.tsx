"use client";

import Link from "next/link";

import { QuestRail } from "@/components/quest-rail";
import { ONBOARDING_STORAGE_KEY } from "@/lib/constants";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { catalogGateway, learnerStateGateway } from "@/lib/gateways";
import { readLocalStorage } from "@/lib/storage";
import { DashboardView, OnboardingProfile, ProgressSnapshot } from "@/lib/types";

export function DashboardPanel() {
  const workspaceState = useClientSnapshot(
    () => {
      const onboarding = readLocalStorage<OnboardingProfile | null>(ONBOARDING_STORAGE_KEY, null);
      return {
        onboarding,
        dashboard: learnerStateGateway.getDashboard(onboarding?.preferredSubjectId),
        progress: learnerStateGateway.getProgressSnapshot(),
      };
    },
    () => ({
      onboarding: null as OnboardingProfile | null,
      dashboard: learnerStateGateway.getDashboard(),
      progress: learnerStateGateway.getProgressSnapshot(),
    }),
  );

  const onboarding = workspaceState.onboarding;
  const dashboard: DashboardView = workspaceState.dashboard;
  const progress: ProgressSnapshot = workspaceState.progress;

  const subjects = catalogGateway.getSubjects();
  const activeSubject = subjects.find((subject) => subject.id === onboarding?.preferredSubjectId) ?? subjects[0];
  const continueHref = dashboard.resumeTopic
    ? `/app/learn/${dashboard.resumeTopic.subjectId}/${dashboard.resumeTopic.id}`
    : "/app/subjects";
  const continueTitle = dashboard.resumeTopic?.title ?? dashboard.recommendation?.title ?? "SQL Basics";
  const quickPrompts = [
    `Explain ${continueTitle} like a short lecture`,
    `Search the web for common mistakes in ${continueTitle}`,
    `Turn ${continueTitle} into exam notes`,
    `Quiz me on ${continueTitle}`,
  ];
  const notebookCards = [
    {
      title: `${continueTitle} note pack`,
      detail: dashboard.resumeTopic?.summary ?? "Collect lecture-style explanations, quick notes, and one exam answer.",
    },
    {
      title: progress.weakTopics[0]?.title ?? "Weak-topic cleanup",
      detail:
        progress.weakTopics[0]?.accuracy !== undefined
          ? `Current accuracy ${progress.weakTopics[0].accuracy}%. Save one correction note after every drill.`
          : "As soon as practice starts, weak topics show up here with note-ready corrections.",
    },
    {
      title: "Lecture recap",
      detail: `Keep one page of takeaways for ${activeSubject.name} instead of jumping across tabs.`,
    },
  ];
  const workspaceFeed = [
    {
      lane: "Watch lane",
      title: `${continueTitle} as an 8-minute lecture`,
      detail: "The topic page should feel like a guided explainer, not just a block of notes.",
      href: continueHref,
    },
    {
      lane: "Search lane",
      title: `Web-backed doubts on ${continueTitle}`,
      detail: "Search-oriented prompts, examples, and misconceptions should sit beside the chat instead of outside the product.",
      href: "/app/ask",
    },
    {
      lane: "Note lane",
      title: `One-page notes for ${continueTitle}`,
      detail: "Collect definitions, examples, and exam lines in the same workspace where you ask and practice.",
      href: continueHref,
    },
  ];
  const studySignals = [
    {
      label: "Open studio",
      value: continueTitle,
      detail: dashboard.resumeTopic ? "Resume where you left off." : "Start with the first flagship topic.",
    },
    {
      label: "Today",
      value: `${dashboard.todayAttempts}/${dashboard.dailyGoalTarget} drills`,
      detail: "Protect the study rhythm with one short run.",
    },
    {
      label: "Notebook",
      value: `${progress.completedAttempts + 3} live cards`,
      detail: "Notes, weak-topic fixes, and lecture recaps.",
    },
  ];
  const questItems = [
    {
      id: "resume",
      title: dashboard.resumeTopic ? `Open ${dashboard.resumeTopic.title}` : "Pick your first topic",
      detail: "Walk into one focused study studio instead of bouncing between pages.",
      xp: 30,
      href: continueHref,
    },
    {
      id: "tutor",
      title: `Ask for help on ${continueTitle}`,
      detail: "Use the copilot as part tutor, part search assistant, part note-maker.",
      xp: 35,
      href: "/app/ask",
    },
    {
      id: "practice",
      title: "Close the loop with a drill",
      detail: `Right now you are at ${dashboard.todayAttempts}/${dashboard.dailyGoalTarget} drills for today.`,
      xp: 60,
      href: dashboard.quickPracticeHref,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="surface-card overflow-hidden p-6">
        <div className="rounded-[32px] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(249,115,22,0.14),rgba(255,255,255,0.65))] p-6 sm:p-7">
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="eyebrow">Student workspace</p>
                <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  Ask, read, search, collect notes, and revise from one study screen.
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
                  LearnX should feel like your study OS, not an AI widget. Pick a topic, keep the lesson open, ask for
                  help, pull in web-style context, and turn everything into note-ready revision.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/45 bg-white/84 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Workspace command</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      Chat + search + notes + tutor
                    </p>
                  </div>
                  <span className="reward-chip">{activeSubject.name}</span>
                </div>
                <div className="mt-4 rounded-[24px] border border-black/10 bg-slate-950 px-4 py-4 text-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
                  <p className="text-sm text-slate-300">Try the student-side flow you described:</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-white">
                    “Open {continueTitle}, explain it like a YouTube lecture, search for common mistakes, and turn the
                    answer into revision notes.”
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <span className="pill" key={prompt}>
                      {prompt}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link className="button-primary" href={continueHref}>
                    Open study studio
                  </Link>
                  <Link className="button-secondary" href="/app/ask">
                    Open copilot chat
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {studySignals.map((signal) => (
                <div className="rounded-[26px] border border-white/45 bg-white/80 p-5 shadow-sm" key={signal.label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{signal.label}</p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{signal.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{signal.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.2fr_0.9fr]">
        <div className="space-y-6">
          <div className="surface-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Subject shelf</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Where students actually start</h2>
              </div>
              <span className="reward-chip">2 live tracks</span>
            </div>
            <div className="mt-4 space-y-3">
              {subjects.map((subject) => (
                <Link
                  className={`block rounded-[24px] border px-4 py-4 transition hover:-translate-y-0.5 ${
                    subject.id === activeSubject.id
                      ? "border-teal-300 bg-teal-50"
                      : "border-black/10 bg-white/80 hover:bg-white"
                  }`}
                  href={`/app/subjects/${subject.id}`}
                  key={subject.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{subject.name}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{subject.description}</p>
                    </div>
                    <span className="pill">{subject.tags[0]}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface-panel p-5">
            <p className="eyebrow">Notebook</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Quick note-ready cards</h3>
            <div className="mt-4 space-y-3">
              {notebookCards.map((card) => (
                <div className="rounded-[24px] border border-black/10 bg-white/84 p-4 shadow-sm" key={card.title}>
                  <p className="font-semibold text-slate-950">{card.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Study feed</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  One topic, many ways to understand it
                </h2>
              </div>
              <span className="reward-chip">Read + search + note + drill</span>
            </div>
            <div className="mt-5 space-y-4">
              {workspaceFeed.map((item) => (
                <Link
                  className="block rounded-[28px] border border-black/10 bg-white/82 px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                  href={item.href}
                  key={item.title}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.lane}</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                </Link>
              ))}
            </div>
          </div>

          <QuestRail items={questItems} />
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Copilot thread</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Less AI panel, more study partner</h3>
              </div>
              <span className="reward-chip">Live context</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[24px] bg-slate-950 px-4 py-4 text-sm leading-6 text-white">
                Explain {continueTitle} like I am listening to a short lecture, then show me what I should search next.
              </div>
              <div className="rounded-[24px] bg-teal-50 px-4 py-4 text-sm leading-6 text-slate-800">
                I will keep the lesson open, give you a lecture-style explanation, suggest web searches, and convert
                the answer into note points after that.
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <Link className="button-primary" href="/app/ask">
                Open copilot workspace
              </Link>
              <Link className="button-secondary" href={dashboard.quickPracticeHref}>
                Jump into drill mode
              </Link>
            </div>
          </div>

          <div className="surface-panel p-5">
            <p className="eyebrow">Study rhythm</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[24px] bg-white/84 p-4 shadow-sm">
                <p className="text-sm text-slate-500">Level</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{dashboard.rewards.level}</p>
              </div>
              <div className="rounded-[24px] bg-white/84 p-4 shadow-sm">
                <p className="text-sm text-slate-500">XP to next level</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{dashboard.rewards.xpToNextLevel}</p>
              </div>
              <div className="rounded-[24px] bg-white/84 p-4 shadow-sm">
                <p className="text-sm text-slate-500">Latest badge</p>
                <p className="mt-2 text-lg font-bold tracking-tight text-slate-950">
                  {dashboard.rewards.badges[dashboard.rewards.badges.length - 1]?.label ?? "First Drill waiting"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
