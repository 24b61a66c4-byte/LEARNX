"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useClientSnapshot } from "@/lib/client-snapshot";
import { getSubjectById, getTopicById } from "@/lib/data/catalog";
import { catalogGateway, getServerDashboard, learnerStateGateway } from "@/lib/gateways";
import { getPublicAskHref, getPublicLearnHref, getPublicPracticeHref } from "@/lib/public-routes";
import { OnboardingProfile, SubjectId, Topic } from "@/lib/types";
import { getStoredOnboardingProfile } from "@/lib/profile-preferences";

const promptSuggestions = ["Explain this", "Quiz me", "Turn into notes", "Search examples"];

export function DashboardPanel() {
  const router = useRouter();
  const [quickPrompt, setQuickPrompt] = useState("");
  const workspaceState = useClientSnapshot(
    () => {
      const onboarding = getStoredOnboardingProfile();

      return {
        onboarding,
        dashboard: learnerStateGateway.getDashboard(onboarding?.preferredSubjectId),
      };
    },
    () => ({
      onboarding: null as OnboardingProfile | null,
      dashboard: getServerDashboard(),
    }),
  );

  const subjects = catalogGateway.getSubjects();
  const continueTopic = workspaceState.dashboard.resumeTopic;
  const visualSubject =
    subjects.find((subject) => subject.id === continueTopic?.subjectId) ??
    subjects.find((subject) => subject.id === workspaceState.onboarding?.preferredSubjectId) ??
    subjects[0] ??
    null;
  const selectedTopics =
    workspaceState.onboarding?.preferredTopicIds
      ?.map((topicId) => getTopicById(topicId))
      .filter((topic): topic is Topic => Boolean(topic)) ?? [];

  if (!visualSubject) {
    return null;
  }

  const continueTitle =
    continueTopic?.title ?? workspaceState.dashboard.recommendation?.title ?? "Pick your first topic";
  const continueReason = continueTopic
    ? workspaceState.dashboard.recommendation?.reason ?? "Continue where you left off."
    : workspaceState.dashboard.recommendation?.reason ??
    "Start one topic, ask questions, then do a quick quiz.";
  const continueHref = continueTopic
    ? getPublicLearnHref(continueTopic.subjectId, continueTopic.id)
    : workspaceState.dashboard.recommendation?.href ?? "/app/subjects";
  const practiceHref = continueTopic
    ? getPublicPracticeHref(continueTopic.subjectId, continueTopic.id)
    : workspaceState.dashboard.quickPracticeHref;
  const promptSubjectId: SubjectId | undefined = continueTopic?.subjectId ?? workspaceState.onboarding?.preferredSubjectId;
  const promptTopicId = continueTopic?.id;
  const heroSubjectLabel =
    (continueTopic ? getSubjectById(continueTopic.subjectId)?.name : null) ??
    visualSubject.name;
  const focusTopics =
    selectedTopics.length > 0
      ? selectedTopics.slice(0, 3)
      : continueTopic
        ? [continueTopic]
        : [];
  const todayRemaining = Math.max(
    0,
    workspaceState.dashboard.dailyGoalTarget - workspaceState.dashboard.todayAttempts,
  );
  const todaySegments = Array.from(
    { length: workspaceState.dashboard.dailyGoalTarget },
    (_, index) => index < workspaceState.dashboard.todayAttempts,
  );

  function submitQuickPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = quickPrompt.trim();
    if (!trimmed) {
      return;
    }

    router.push(getPublicAskHref(promptSubjectId, promptTopicId, trimmed));
  }

  return (
    <section className="space-y-6">
      <section
        className={`relative overflow-hidden rounded-[40px] border border-black/10 bg-gradient-to-br ${visualSubject.accent} px-5 py-6 shadow-[0_26px_70px_rgba(15,23,42,0.12)] sm:px-7 sm:py-8`}
      >
        <div className="absolute left-[-4rem] top-[-5rem] h-48 w-48 rounded-full bg-white/45 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-72 w-72 rounded-full bg-slate-950/10 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow text-slate-700">Today</p>
                <span className={`pill ${visualSubject.backdrop}`}>{heroSubjectLabel}</span>
              </div>
              <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl xl:text-6xl">
                {continueTitle}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">{continueReason}</p>
              {focusTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {focusTopics.map((topic) => (
                    <span className="pill border-white/60 bg-white/72" key={topic.id}>
                      {topic.title}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <form
              className="relative overflow-hidden rounded-[34px] border border-slate-900/10 bg-slate-950 px-5 py-5 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]"
              onSubmit={submitQuickPrompt}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.3),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.22),transparent_34%)]" />

              <div className="relative space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-teal-100/80">
                      Ask LearnX
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                      Ask one question to begin.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                    {promptSubjectId ? heroSubjectLabel : "Open-ended"}
                  </span>
                </div>

                <label className="block rounded-[30px] border border-white/10 bg-white/8 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <span className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/8 text-sm text-white/80">
                      ?
                    </span>
                    Prompt
                  </span>
                  <textarea
                    aria-label="Ask LearnX what you want to learn"
                    className="mt-4 min-h-[140px] w-full resize-none border-0 bg-transparent p-0 text-lg leading-8 text-white placeholder:text-slate-500 focus:outline-none focus:ring-0"
                    onChange={(event) => setQuickPrompt(event.target.value)}
                    placeholder="Ask about a concept, request a short answer, or turn a topic into notes."
                    value={quickPrompt}
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((item) => (
                    <button
                      className="inline-flex items-center rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/14"
                      key={item}
                      onClick={() => setQuickPrompt(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!quickPrompt.trim()}
                    type="submit"
                  >
                    Start study chat
                  </button>
                  <Link
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-semibold text-white transition hover:bg-white/14"
                    href={continueHref}
                  >
                    Open topic
                  </Link>
                </div>
              </div>
            </form>
          </div>

          <div className="grid content-start gap-3">
            <div className="rounded-[30px] border border-black/10 bg-white/72 p-5 backdrop-blur-sm shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
              <p className="eyebrow">Daily target</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <p className="text-5xl font-black tracking-[-0.06em] text-slate-950">
                  {workspaceState.dashboard.todayAttempts}
                  <span className="text-2xl font-semibold text-slate-500">
                    /{workspaceState.dashboard.dailyGoalTarget}
                  </span>
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Drills</p>
              </div>
              <div className="momentum-meter mt-4">
                {todaySegments.map((active, index) => (
                  <span data-active={active} key={index} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {todayRemaining > 0
                  ? `${todayRemaining} more drill${todayRemaining === 1 ? "" : "s"} to hit the daily target.`
                  : "Daily target complete. Add one more run if a weak topic still feels shaky."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[28px] border border-black/10 bg-white/62 p-5 backdrop-blur-sm">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Current level</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  Level {workspaceState.dashboard.rewards.level}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {workspaceState.dashboard.rewards.xp} XP total
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {workspaceState.dashboard.rewards.xpToNextLevel} XP left to the next level.
                </p>
              </div>

              <div className="rounded-[28px] border border-black/10 bg-white/62 p-5 backdrop-blur-sm">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Next reward</p>
                <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                  {workspaceState.dashboard.rewards.nextBadgeLabel}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Do one quiz to move this forward.</p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-950 px-5 py-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.18)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-teal-200">Next</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">One clear step</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{continueReason}</p>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
                  href={continueHref}
                >
                  Open topic
                </Link>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-semibold text-white transition hover:bg-white/14"
                    href={practiceHref}
                  >
                    Run a drill
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-semibold text-white transition hover:bg-white/14"
                    href="/app/subjects"
                  >
                    Browse subjects
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
