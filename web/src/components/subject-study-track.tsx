"use client";

import Link from "next/link";

import { useClientSnapshot } from "@/lib/client-snapshot";
import { practiceGateway } from "@/lib/gateways";
import { buildSubjectMasteryView, type TopicMasteryView } from "@/lib/progress-views";
import type { SubjectId, Topic } from "@/lib/types";

interface SubjectStudyTrackProps {
  subjectId: SubjectId;
  topics: Topic[];
}

function getTopicBadgeClasses(status: TopicMasteryView["status"]) {
  if (status === "strong") {
    return "bg-emerald-500 text-white";
  }

  if (status === "recover") {
    return "bg-rose-500 text-white";
  }

  if (status === "steady") {
    return "bg-amber-400 text-white";
  }

  return "bg-slate-200 text-slate-600";
}

export function SubjectStudyTrack({ subjectId, topics }: SubjectStudyTrackProps) {
  const masteryView = useClientSnapshot(
    () => buildSubjectMasteryView(subjectId, topics, practiceGateway.getHistory()),
    () => buildSubjectMasteryView(subjectId, topics, []),
  );

  const {
    masteryPercent,
    attemptedTopics,
    totalTopics,
    strongCount,
    weakCount,
    continueTopic,
    continueReason,
    topicViews,
  } = masteryView;

  const weakTopics = topicViews.filter((topic) => topic.status === "recover").slice(0, 3);
  const strongTopics = topicViews.filter((topic) => topic.status === "strong").slice(0, 3);

  return (
    <div className="surface-card overflow-hidden p-6">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Study track</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Keep this subject moving with one clear next step
            </h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight text-slate-950">{masteryPercent}%</p>
            <p className="text-sm text-slate-500">
              {attemptedTopics}/{totalTopics} topics touched
            </p>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(15,118,110,0.9),rgba(245,158,11,0.88))] transition-all duration-300"
            style={{ width: `${Math.max(8, masteryPercent)}%` }}
          />
        </div>

        {continueTopic ? (
          <div className="surface-panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{continueTopic.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{continueReason}</p>
              </div>
              <Link className="button-secondary" href={`/app/learn/${subjectId}/${continueTopic.id}`}>
                Continue topic
              </Link>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-rose-600">Growth priority</p>
              <span className="reward-chip">{weakCount}</span>
            </div>

            {weakTopics.length > 0 ? (
              <div className="mt-4 space-y-2">
                {weakTopics.map((topic) => (
                  <div className="flex items-center justify-between gap-3 rounded-[18px] bg-white/84 px-3 py-3 shadow-sm" key={topic.topicId}>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {topic.accuracy ?? 0}% accuracy
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${getTopicBadgeClasses(topic.status)}`}>
                      Recover
                    </span>
                  </div>
                ))}
                <Link className="mt-3 inline-flex text-sm font-semibold text-rose-600 hover:underline" href={`/app/practice?subjectId=${subjectId}`}>
                  Drill weak topics
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                No weak-topic cluster yet. Run a few drills and LearnX will surface the recovery targets here.
              </p>
            )}
          </div>

          <div className="surface-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-emerald-600">Confidence anchors</p>
              <span className="reward-chip">{strongCount}</span>
            </div>

            {strongTopics.length > 0 ? (
              <div className="mt-4 space-y-2">
                {strongTopics.map((topic) => (
                  <div className="flex items-center justify-between gap-3 rounded-[18px] bg-white/84 px-3 py-3 shadow-sm" key={topic.topicId}>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {topic.accuracy ?? 0}% accuracy
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${getTopicBadgeClasses(topic.status)}`}>
                      Strong
                    </span>
                  </div>
                ))}
                <Link className="mt-3 inline-flex text-sm font-semibold text-emerald-600 hover:underline" href="/app/profile">
                  View full progress
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Strong-topic anchors appear after a few solid runs and help show what is ready for revision speedwork.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
