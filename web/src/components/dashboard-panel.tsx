"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useClientSnapshot } from "@/lib/client-snapshot";
import { getTopicById } from "@/lib/data/catalog";
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
  const activeSubject =
    subjects.find((subject) => subject.id === workspaceState.onboarding?.preferredSubjectId) ?? subjects[0] ?? null;
  const selectedTopics =
    workspaceState.onboarding?.preferredTopicIds
      ?.map((topicId) => getTopicById(topicId))
      .filter((topic): topic is Topic => Boolean(topic)) ?? [];

  if (!activeSubject) {
    return null;
  }

  const continueTopic = workspaceState.dashboard.resumeTopic;
  const continueTitle =
    continueTopic?.title ?? workspaceState.dashboard.recommendation?.title ?? "Open your first study studio";
  const continueReason = continueTopic
    ? workspaceState.dashboard.recommendation?.reason ?? "Resume the next topic while the context is still warm."
    : workspaceState.dashboard.recommendation?.reason ??
      "Open one topic, keep the tutor nearby, and close with a drill.";
  const continueHref = continueTopic
    ? getPublicLearnHref(continueTopic.subjectId, continueTopic.id)
    : workspaceState.dashboard.recommendation?.href ?? "/app/subjects";
  const practiceHref = continueTopic
    ? getPublicPracticeHref(continueTopic.subjectId, continueTopic.id)
    : workspaceState.dashboard.quickPracticeHref;
  const promptSubjectId: SubjectId | undefined = continueTopic?.subjectId ?? workspaceState.onboarding?.preferredSubjectId;
  const promptTopicId = continueTopic?.id;
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
      <div className="surface-card overflow-hidden p-5 sm:p-6">
        <div className={`rounded-[32px] bg-gradient-to-br ${activeSubject.accent} p-5 sm:p-6`}>
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="eyebrow">Today focus</p>
                <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {continueTitle}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">{continueReason}</p>
                {selectedTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTopics.map((topic) => (
                      <span className="pill" key={topic.id}>
                        {topic.title}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <form className="surface-panel space-y-4 p-4 sm:p-5" onSubmit={submitQuickPrompt}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">Ask anything</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Ask a question first. LearnX can keep the answer open-ended, or tie it to {continueTopic?.title ?? activeSubject.name} when you already have context.
                    </p>
                  </div>
                  <span className="reward-chip">{promptSubjectId ? activeSubject.name : "Open-ended"}</span>
                </div>

                <div className="rounded-[30px] border border-black/10 bg-white px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                  <textarea
                    aria-label="Ask LearnX what you want to learn"
                    className="min-h-[108px] w-full resize-none border-0 bg-transparent p-0 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    onChange={(event) => setQuickPrompt(event.target.value)}
                    placeholder="What do you want to learn today?"
                    value={quickPrompt}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((item) => (
                    <button
                      className="pill border border-black/10 bg-white/70 text-slate-700 transition hover:bg-white"
                      key={item}
                      onClick={() => setQuickPrompt(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <button
                  className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!quickPrompt.trim()}
                  type="submit"
                >
                  Ask tutor
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <div className="shell-stat-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Today&apos;s drill target</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {workspaceState.dashboard.todayAttempts}/{workspaceState.dashboard.dailyGoalTarget}
                </p>
                <div className="momentum-meter mt-3">
                  {todaySegments.map((active, index) => (
                    <span data-active={active} key={index} />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {todayRemaining > 0
                    ? `${todayRemaining} more drill${todayRemaining === 1 ? "" : "s"} to hit the daily target.`
                    : "Daily target complete. Add one more run if a weak topic still feels shaky."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="shell-stat-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current level</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    Level {workspaceState.dashboard.rewards.level}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {workspaceState.dashboard.rewards.xp} XP total
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {workspaceState.dashboard.rewards.xpToNextLevel} XP left to the next level.
                  </p>
                </div>

                <div className="shell-stat-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Next reward</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                    {workspaceState.dashboard.rewards.nextBadgeLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Keep the learner on one topic long enough to turn practice into momentum.
                  </p>
                </div>
              </div>

              <div className="shell-stat-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Focus track</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                  {selectedTopics[0]?.title ?? activeSubject.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedTopics.length > 1
                    ? `${selectedTopics.length} starting topics are pinned for the learner right now.`
                    : "This is the main track LearnX will keep in focus first."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="eyebrow">Next move</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Keep one topic open instead of restarting the session
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">{continueReason}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="button-primary" href={continueHref}>
              Open study studio
            </Link>
            <Link className="button-secondary" href={practiceHref}>
              Run a drill
            </Link>
            <Link className="button-secondary" href="/app/subjects">
              Browse subjects
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
