"use client";

import Link from "next/link";

import { QuestRail } from "@/components/quest-rail";
import { ONBOARDING_STORAGE_KEY, TOPIC_NOTES_KEY } from "@/lib/constants";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { getSubjectById, getTopicById, getTopicsBySubject } from "@/lib/data/catalog";
import {
  catalogGateway,
  getServerDashboard,
  getServerProgressSnapshot,
  learnerStateGateway,
  practiceGateway,
} from "@/lib/gateways";
import { buildSubjectMasteryView } from "@/lib/progress-views";
import { readLocalStorage } from "@/lib/storage";
import { OnboardingProfile, StudyNote, SubjectId } from "@/lib/types";

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getNotebookStatus(count: number) {
  if (count === 0) {
    return "Empty";
  }

  if (count < 4) {
    return "Growing";
  }

  return "Live";
}

function getRecentDrillLabel(subjectId: SubjectId, topicId?: string) {
  if (topicId) {
    return getTopicById(topicId)?.title ?? topicId;
  }

  const subject = getSubjectById(subjectId);
  return `${subject?.name ?? subjectId.toUpperCase()} mixed drill`;
}

function getSubjectBadge(subjectId: SubjectId) {
  return getSubjectById(subjectId)?.id.toUpperCase() ?? subjectId.toUpperCase();
}

export function DashboardPanel() {
  const workspaceState = useClientSnapshot(
    () => {
      const onboarding = readLocalStorage<OnboardingProfile | null>(ONBOARDING_STORAGE_KEY, null);
      const notes = readLocalStorage<StudyNote[]>(TOPIC_NOTES_KEY, []);

      return {
        onboarding,
        notes,
        history: practiceGateway.getHistory(),
        dashboard: learnerStateGateway.getDashboard(onboarding?.preferredSubjectId),
        progress: learnerStateGateway.getProgressSnapshot(),
      };
    },
    () => ({
      onboarding: null as OnboardingProfile | null,
      notes: [] as StudyNote[],
      history: [],
      dashboard: getServerDashboard(),
      progress: getServerProgressSnapshot(),
    }),
  );

  const subjects = catalogGateway.getSubjects();
  const activeSubject = subjects.find((subject) => subject.id === workspaceState.onboarding?.preferredSubjectId) ?? subjects[0];
  const recentNotes = [...workspaceState.notes]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 4);
  const recentDrills = workspaceState.history.slice(0, 4);
  const subjectTracks = subjects.map((subject) => {
    const mastery = buildSubjectMasteryView(
      subject.id,
      getTopicsBySubject(subject.id),
      workspaceState.history,
    );

    return {
      subject,
      mastery,
      continueHref: mastery.continueTopic
        ? `/app/learn/${subject.id}/${mastery.continueTopic.id}`
        : `/app/subjects/${subject.id}`,
    };
  });
  const activeTrack =
    subjectTracks.find((track) => track.subject.id === activeSubject.id) ?? subjectTracks[0];
  const continueTopic = activeTrack?.mastery.continueTopic ?? workspaceState.dashboard.resumeTopic;
  const continueHref = activeTrack?.continueHref ?? "/app/subjects";
  const continueTitle =
    continueTopic?.title ??
    workspaceState.dashboard.recommendation?.title ??
    "Open your first study studio";
  const tutorHref = continueTopic
    ? `/app/ask?subjectId=${continueTopic.subjectId}&topicId=${continueTopic.id}`
    : `/app/ask?subjectId=${activeSubject.id}`;
  const notesHref = continueTopic
    ? `/app/learn/${continueTopic.subjectId}/${continueTopic.id}#topic-notes`
    : continueHref;
  const practiceHref = continueTopic
    ? `/app/practice?subjectId=${continueTopic.subjectId}&topicId=${continueTopic.id}`
    : workspaceState.dashboard.quickPracticeHref;
  const todayRemaining = Math.max(
    0,
    workspaceState.dashboard.dailyGoalTarget - workspaceState.dashboard.todayAttempts,
  );
  const todaySegments = Array.from(
    { length: workspaceState.dashboard.dailyGoalTarget },
    (_, index) => index < workspaceState.dashboard.todayAttempts,
  );
  const notebookStatus = getNotebookStatus(workspaceState.notes.length);
  const recoveryTopics = workspaceState.progress.weakTopics.slice(0, 3);
  const strongTopics = workspaceState.progress.strongTopics.slice(0, 2);
  const latestBadge =
    workspaceState.dashboard.rewards.badges[workspaceState.dashboard.rewards.badges.length - 1]
      ?.label ?? "First Drill waiting";
  const focusCards = [
    {
      label: "Resume studio",
      title: continueTitle,
      detail:
        activeTrack?.mastery.continueReason ??
        workspaceState.dashboard.recommendation?.reason ??
        "Pick one topic and keep the study loop alive.",
      href: continueHref,
      cta: "Open lesson",
    },
    {
      label: "Tutor follow-up",
      title: recoveryTopics[0]?.title
        ? `Ask about ${recoveryTopics[0].title}`
        : `Explain ${continueTitle}`,
      detail: recoveryTopics[0]?.title
        ? `Use the tutor to repair ${recoveryTopics[0].title} before the next drill.`
        : "Turn the current topic into a short lecture, exam answer, or web-search plan.",
      href: recoveryTopics[0]
        ? `/app/ask?subjectId=${recoveryTopics[0].subjectId}&topicId=${recoveryTopics[0].topicId}`
        : tutorHref,
      cta: "Open tutor",
    },
    {
      label: "Notebook move",
      title: recentNotes[0]?.title ?? `${continueTitle} note card`,
      detail: recentNotes[0]
        ? `Latest update on ${formatDateLabel(recentNotes[0].updatedAt)}. Keep the notebook tied to the topic studio.`
        : "Save one concept summary or correction card before leaving the topic.",
      href: notesHref,
      cta: "Open notes",
    },
  ];
  const questItems = [
    {
      id: "resume",
      title: continueTopic ? `Resume ${continueTopic.title}` : "Pick your first topic",
      detail: "Keep one topic alive instead of reopening the workspace cold every time.",
      xp: 30,
      href: continueHref,
    },
    {
      id: "note",
      title: recentNotes[0] ? "Refresh your latest note" : "Save one note card",
      detail: recentNotes[0]
        ? "Review one saved note, tighten it, and keep it exam-ready."
        : "Convert one explanation into a compact revision card.",
      xp: 25,
      href: notesHref,
    },
    {
      id: "practice",
      title: todayRemaining > 0 ? `${todayRemaining} drill left today` : "Add one extra drill",
      detail: todayRemaining > 0
        ? `Close the daily target with ${todayRemaining} more drill${todayRemaining === 1 ? "" : "s"}.`
        : "You already hit the goal. One extra run can clean up a weak topic.",
      xp: 60,
      href: practiceHref,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="surface-card overflow-hidden p-6">
        <div className={`rounded-[32px] bg-gradient-to-br ${activeSubject.accent} p-6 sm:p-7`}>
          <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="eyebrow">Today focus</p>
                <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  {continueTitle}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
                  {activeTrack?.mastery.continueReason ??
                    workspaceState.dashboard.recommendation?.reason ??
                    "Open one topic, keep the tutor nearby, save one note, and close with a drill."}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/45 bg-slate-950 px-5 py-5 text-white shadow-[0_22px_50px_rgba(15,23,42,0.16)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      Study queue
                    </p>
                    <p className="mt-2 text-xl font-bold tracking-tight">
                      Lesson {"->"} tutor {"->"} notes {"->"} drill
                    </p>
                  </div>
                  <span className="reward-chip">{activeSubject.name}</span>
                </div>
                <div className="mt-5 grid gap-3">
                  {focusCards.map((card, index) => (
                    <Link
                      className={`rounded-[22px] border px-4 py-4 transition ${
                        index === 0
                          ? "border-white/12 bg-white/10 hover:bg-white/14"
                          : "border-white/10 bg-white/6 hover:bg-white/10"
                      }`}
                      href={card.href}
                      key={card.label}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                        {card.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold tracking-tight text-white">{card.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{card.detail}</p>
                      <p className="mt-3 text-sm font-semibold text-teal-200">{card.cta}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="button-primary" href={continueHref}>
                  Open study studio
                </Link>
                <Link className="button-secondary" href={tutorHref}>
                  Ask the tutor
                </Link>
                <Link className="button-secondary" href={practiceHref}>
                  Run a drill
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[26px] border border-white/45 bg-white/82 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Today</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  {workspaceState.dashboard.todayAttempts}/{workspaceState.dashboard.dailyGoalTarget}
                </p>
                <div className="momentum-meter mt-4">
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

              <div className="rounded-[26px] border border-white/45 bg-white/82 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Level + XP</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  L{workspaceState.dashboard.rewards.level}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {workspaceState.dashboard.rewards.xp} XP total
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {workspaceState.dashboard.rewards.xpToNextLevel} XP left to the next level.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/45 bg-white/82 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notebook</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  {workspaceState.notes.length}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{notebookStatus}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {recentNotes[0]
                    ? `Latest note updated ${formatDateLabel(recentNotes[0].updatedAt)}.`
                    : "No notes yet. Save one explanation and the notebook becomes useful immediately."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.94fr_1.14fr_0.92fr]">
        <div className="space-y-6">
          <div className="surface-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Subject tracks</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Keep one flagship subject moving
                </h2>
              </div>
              <span className="reward-chip">{subjectTracks.length} tracks</span>
            </div>

            <div className="mt-4 space-y-3">
              {subjectTracks.map((track) => (
                <Link
                  className={`block rounded-[24px] border px-4 py-4 transition hover:-translate-y-0.5 ${
                    track.subject.id === activeSubject.id
                      ? "border-teal-300 bg-teal-50"
                      : "border-black/10 bg-white/82 hover:bg-white"
                  }`}
                  href={`/app/subjects/${track.subject.id}`}
                  key={track.subject.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{track.subject.name}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {track.mastery.continueReason}
                      </p>
                    </div>
                    <span className="pill">{track.mastery.masteryPercent}%</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,rgba(15,118,110,0.9),rgba(245,158,11,0.88))]"
                      style={{ width: `${Math.max(8, track.mastery.masteryPercent)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>
                      {track.mastery.attemptedTopics}/{track.mastery.totalTopics} topics touched
                    </span>
                    <span>{track.mastery.continueTopic?.title ?? "Open subject hub"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface-panel p-5">
            <p className="eyebrow">Reward pulse</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[22px] bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm text-slate-500">Latest badge</p>
                <p className="mt-2 text-xl font-bold tracking-tight text-slate-950">{latestBadge}</p>
              </div>
              <div className="rounded-[22px] bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm text-slate-500">Streak</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  {workspaceState.dashboard.rewards.streakDays}d
                </p>
              </div>
              <div className="rounded-[22px] bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm text-slate-500">Strong topics</p>
                <p className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  {strongTopics.length > 0 ? strongTopics.map((topic) => topic.title).join(", ") : "None yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Today queue</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Operate the study loop, not just the chat
                </h2>
              </div>
              <span className="reward-chip">Utility view</span>
            </div>

            <div className="mt-5 grid gap-4">
              {focusCards.map((card, index) => (
                <Link
                  className={`block rounded-[28px] border border-black/10 px-5 py-5 shadow-sm transition hover:-translate-y-0.5 ${
                    index === 0 ? "bg-slate-950 text-white hover:bg-slate-900" : "bg-white/84 hover:bg-white"
                  }`}
                  href={card.href}
                  key={card.label}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      index === 0 ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {card.label}
                  </p>
                  <h3
                    className={`mt-2 text-2xl font-bold tracking-tight ${
                      index === 0 ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`mt-2 text-sm leading-6 ${
                      index === 0 ? "text-slate-200" : "text-slate-600"
                    }`}
                  >
                    {card.detail}
                  </p>
                  <p
                    className={`mt-4 text-sm font-semibold ${
                      index === 0 ? "text-teal-200" : "text-teal-700"
                    }`}
                  >
                    {card.cta}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Recent drill log</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  Last practice runs
                </h3>
              </div>
              <Link className="text-sm font-semibold text-teal-700" href="/app/progress">
                Open progress
              </Link>
            </div>

            {recentDrills.length === 0 ? (
              <div className="mt-4 rounded-[24px] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-500">
                Run one drill and the cockpit starts logging your real practice data here.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentDrills.map((item) => (
                  <Link
                    className="block rounded-[22px] bg-white/84 px-4 py-4 shadow-sm transition hover:bg-white"
                    href={
                      item.topicId
                        ? `/app/learn/${item.subjectId}/${item.topicId}#drill-dock`
                        : `/app/practice?subjectId=${item.subjectId}`
                    }
                    key={`${item.completedAt}-${item.subjectId}-${item.topicId ?? "mixed"}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {getRecentDrillLabel(item.subjectId, item.topicId)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {getSubjectBadge(item.subjectId)} • {formatDateLabel(item.completedAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="pill">{item.scorePercent}%</span>
                        <span className="pill">+{item.xpEarned} XP</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <QuestRail items={questItems} />
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Recovery deck</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  Weak topics that need another loop
                </h3>
              </div>
              <span className="reward-chip">{recoveryTopics.length} targets</span>
            </div>

            {recoveryTopics.length === 0 ? (
              <div className="mt-4 rounded-[24px] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-500">
                Weak-topic targets will appear here after a few practice runs.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recoveryTopics.map((topic) => (
                  <div className="rounded-[24px] bg-white/84 px-4 py-4 shadow-sm" key={topic.topicId}>
                    <p className="font-semibold text-slate-950">{topic.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {topic.accuracy}% accuracy over {topic.attempts} attempts. Re-open the lesson, ask one tutor
                      question, and close the loop with a drill.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link className="button-secondary" href={`/app/learn/${topic.subjectId}/${topic.topicId}`}>
                        Open topic
                      </Link>
                      <Link
                        className="button-secondary"
                        href={`/app/ask?subjectId=${topic.subjectId}&topicId=${topic.topicId}`}
                      >
                        Ask tutor
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Notebook live</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  Recent note activity
                </h3>
              </div>
              <span className="reward-chip">{workspaceState.notes.length} cards</span>
            </div>

            {recentNotes.length === 0 ? (
              <div className="mt-4 rounded-[24px] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-500">
                Notes saved from the lesson and ask studio will show up here.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentNotes.map((note) => (
                  <Link
                    className="block rounded-[24px] bg-white/84 px-4 py-4 shadow-sm transition hover:bg-white"
                    href={`/app/learn/${note.subjectId}/${note.topicId}#topic-notes`}
                    key={note.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{note.title}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {note.source.replace("-", " ")} • {formatDateLabel(note.updatedAt)}
                        </p>
                      </div>
                      <span className="pill">{getSubjectBadge(note.subjectId)}</span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">{note.content}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
