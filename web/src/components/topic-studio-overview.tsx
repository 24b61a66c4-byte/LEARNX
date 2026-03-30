"use client";

import Link from "next/link";

import { useClientSnapshot } from "@/lib/client-snapshot";
import { notesGateway, practiceGateway } from "@/lib/gateways";

interface TopicStudioOverviewProps {
  topicId: string;
  topicTitle: string;
  lessonBlockCount: number;
}

function getStatusTone(attemptCount: number, latestScore: number | null) {
  if (attemptCount === 0 || latestScore === null) {
    return {
      label: "Fresh studio",
      detail: "Read the lesson once, save one note, then take your first drill.",
    };
  }

  if (latestScore < 70) {
    return {
      label: "Recovery loop",
      detail: "Stay on this topic until the next drill clears the weak spots.",
    };
  }

  if (latestScore >= 85) {
    return {
      label: "Strong retention",
      detail: "Use notes and one more drill to lock the topic into memory.",
    };
  }

  return {
    label: "Steady climb",
    detail: "You are building momentum. Keep the tutor and drill in the same loop.",
  };
}

export function TopicStudioOverview({
  topicId,
  topicTitle,
  lessonBlockCount,
}: TopicStudioOverviewProps) {
  const studioState = useClientSnapshot(
    () => {
      const notes = notesGateway.getTopicNotes(topicId);
      const results = practiceGateway.getHistory().filter((result) => result.topicId === topicId);

      return {
        noteCount: notes.length,
        attemptCount: results.length,
        latestScore: results[0]?.scorePercent ?? null,
        bestScore: results.reduce((best, result) => Math.max(best, result.scorePercent), 0),
      };
    },
    () => ({
      noteCount: 0,
      attemptCount: 0,
      latestScore: null as number | null,
      bestScore: 0,
    }),
  );

  const status = getStatusTone(studioState.attemptCount, studioState.latestScore);
  const quickJumps = [
    { label: "Lesson", href: "#topic-lesson" },
    { label: "Search", href: "#search-lane" },
    { label: "Tutor", href: "#tutor-lane" },
    { label: "Notes", href: "#topic-notes" },
    { label: "Drill", href: "#drill-dock" },
  ];
  const recommendedAction =
    studioState.latestScore === null
      ? {
          label: "Start the first drill",
          detail: "Once the lesson is open, one short drill is the fastest way to expose what still feels fuzzy.",
          href: "#drill-dock",
        }
      : studioState.latestScore < 70
        ? {
            label: "Open the tutor lane",
            detail: "Use the misses from the last drill to ask for a focused repair pass before you retry.",
            href: "#tutor-lane",
          }
        : studioState.noteCount === 0
          ? {
              label: "Save one note card",
              detail: "The concept is landing. Capture the key explanation before you leave the topic.",
              href: "#topic-notes",
            }
          : {
              label: "Retake the drill",
              detail: "One more pass is usually enough to convert clarity into retention.",
              href: "#drill-dock",
            };
  const studyLoop = [
    `Read ${lessonBlockCount} lesson block${lessonBlockCount === 1 ? "" : "s"}`,
    `Save ${studioState.noteCount > 0 ? "one more" : "your first"} note card`,
    `${studioState.attemptCount > 0 ? "Retake" : "Start"} the topic drill`,
  ];

  return (
    <div className="space-y-5 xl:sticky xl:top-28">
      <div className="surface-card p-5">
        <div className="space-y-3">
          <div>
            <p className="eyebrow">Studio map</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Stay inside {topicTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{status.detail}</p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-slate-950 px-4 py-4 text-white shadow-[0_20px_40px_rgba(15,23,42,0.14)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Current status</p>
            <p className="mt-2 text-xl font-bold tracking-tight">{status.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {studioState.latestScore === null
                ? "No drill score yet for this topic."
                : `Latest drill score: ${studioState.latestScore}%`}
            </p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recommended next move</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{recommendedAction.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{recommendedAction.detail}</p>
            <Link className="button-secondary mt-4 w-full" href={recommendedAction.href}>
              Open this step
            </Link>
          </div>
        </div>
      </div>

      <div className="surface-panel p-5">
        <p className="eyebrow">Quick jumps</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {quickJumps.map((item) => (
            <a
              className="rounded-full border border-black/10 bg-white/84 px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-white"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="surface-panel p-5">
        <p className="eyebrow">Topic pulse</p>
        <div className="mt-4 grid gap-3">
          <div className="rounded-[22px] bg-white/84 px-4 py-4 shadow-sm">
            <p className="text-sm text-slate-500">Lesson blocks</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{lessonBlockCount}</p>
          </div>
          <div className="rounded-[22px] bg-white/84 px-4 py-4 shadow-sm">
            <p className="text-sm text-slate-500">Saved notes</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{studioState.noteCount}</p>
          </div>
          <div className="rounded-[22px] bg-white/84 px-4 py-4 shadow-sm">
            <p className="text-sm text-slate-500">Best score</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {studioState.attemptCount === 0 ? "New" : `${studioState.bestScore}%`}
            </p>
          </div>
        </div>
      </div>

      <div className="surface-panel p-5">
        <p className="eyebrow">Study loop</p>
        <div className="mt-4 space-y-3">
          {studyLoop.map((item, index) => (
            <div className="flex items-center gap-3 rounded-[20px] bg-white/84 px-4 py-4 shadow-sm" key={item}>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-slate-800">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
