"use client";

import Link from "next/link";

import { useClientSnapshot } from "@/lib/client-snapshot";
import { getServerProgressSnapshot, practiceGateway } from "@/lib/gateways";
import { buildSubjectMasteryView } from "@/lib/progress-views";
import { Topic } from "@/lib/types";
import { getTopicsBySubject } from "@/lib/data/catalog";

function topicStatusCopy(status: "untouched" | "recover" | "steady" | "strong") {
  if (status === "strong") {
    return "Strong topic";
  }

  if (status === "recover") {
    return "Needs recovery";
  }

  if (status === "steady") {
    return "In progress";
  }

  return "New topic";
}

export function TopicCard({ topic }: { topic: Topic }) {
  const history = useClientSnapshot(
    () => practiceGateway.getHistory(),
    () => getServerProgressSnapshot().recentActivity,
  );
  const topicView = buildSubjectMasteryView(
    topic.subjectId,
    getTopicsBySubject(topic.subjectId),
    history,
  ).topicViews.find((item) => item.topicId === topic.id);

  return (
    <article className="surface-panel p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Topic</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{topic.title}</h3>
        </div>
        <span className="pill">{Math.round(topic.examImportance * 100)}% exam weight</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{topic.summary}</p>

      <div className="mt-4 rounded-[22px] border border-black/10 bg-white/82 px-4 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">{topicStatusCopy(topicView?.status ?? "untouched")}</p>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {topicView?.accuracy === null || topicView?.accuracy === undefined ? "0 attempts" : `${topicView.accuracy}% mastery`}
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(15,118,110,0.9),rgba(245,158,11,0.88))]"
            style={{ width: `${Math.max(8, topicView?.accuracy ?? 8)}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <span>{topicView?.attempts ?? 0} attempts</span>
          <span>{topic.difficulty < 0.4 ? "Easy start" : topic.difficulty < 0.7 ? "Medium climb" : "High-focus topic"}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {topic.tags.map((tag) => (
          <span className="pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link className="button-secondary" href={`/app/learn/${topic.subjectId}/${topic.id}`}>
          Open lesson
        </Link>
        <Link className="button-secondary" href={`/app/practice?subjectId=${topic.subjectId}&topicId=${topic.id}`}>
          Drill this topic
        </Link>
      </div>
    </article>
  );
}
