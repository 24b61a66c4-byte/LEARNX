"use client";

import Link from "next/link";

import { useClientSnapshot } from "@/lib/client-snapshot";
import { getTopicsBySubject } from "@/lib/data/catalog";
import { getServerProgressSnapshot, practiceGateway } from "@/lib/gateways";
import { getPublicLearnHref, getPublicSubjectHref } from "@/lib/public-routes";
import { buildSubjectMasteryView } from "@/lib/progress-views";
import { Subject } from "@/lib/types";

function statusLabel(weakCount: number, strongCount: number, attemptedTopics: number) {
  if (attemptedTopics === 0) {
    return "Fresh start";
  }

  if (weakCount > 0) {
    return `${weakCount} recovery topic${weakCount === 1 ? "" : "s"}`;
  }

  if (strongCount > 0) {
    return `${strongCount} strong topic${strongCount === 1 ? "" : "s"}`;
  }

  return "Steady progress";
}

export function SubjectCard({ subject }: { subject: Subject }) {
  const history = useClientSnapshot(
    () => practiceGateway.getHistory(),
    () => getServerProgressSnapshot().recentActivity,
  );
  const topics = getTopicsBySubject(subject.id);
  const mastery = buildSubjectMasteryView(subject.id, topics, history);
  const previewTopics = mastery.topicViews.slice(0, 3);
  const continueHref = mastery.continueTopic
    ? getPublicLearnHref(subject.id, mastery.continueTopic.id)
    : getPublicSubjectHref(subject.id);

  return (
    <Link
      className="surface-card group block overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
      href={getPublicSubjectHref(subject.id)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Study track</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{subject.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{subject.description}</p>
        </div>
        <span className="reward-chip">{statusLabel(mastery.weakCount, mastery.strongCount, mastery.attemptedTopics)}</span>
      </div>

      <div className="mt-5 rounded-[24px] border border-black/10 bg-white/84 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Track mastery</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
              {mastery.attemptedTopics}/{mastery.totalTopics} topics
            </p>
          </div>
          <span className="pill">{mastery.masteryPercent}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-700 via-teal-500 to-amber-500 transition-[width] duration-300"
            style={{ width: `${Math.max(8, mastery.masteryPercent)}%` }}
          />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{mastery.continueReason}</p>
      </div>

      <div className="mt-4 grid gap-2">
        {previewTopics.map((topic) => {
          const isWeak = topic.status === "recover";
          return (
            <div
              key={topic.topicId}
              className={`flex items-center justify-between gap-3 rounded-[18px] border px-3 py-3 shadow-sm transition hover:bg-white ${
                isWeak ? "border-amber-200 bg-amber-50/80" : "border-black/10 bg-white/78"
              }`}
            >
              <span className={`min-w-0 text-sm font-medium ${isWeak ? "font-semibold text-amber-900" : "text-slate-800"}`}>
                {topic.title}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.18em] ${
                  isWeak ? "bg-amber-200 text-amber-800" : "bg-slate-100 text-slate-500"
                }`}
              >
                {topic.accuracy === null ? "new" : `${topic.accuracy}%`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-[24px] border border-black/10 bg-slate-950 px-4 py-4 text-white shadow-[0_22px_45px_rgba(15,23,42,0.16)] transition group-hover:-translate-y-0.5 group-hover:shadow-[0_28px_56px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          Continue track
        </div>
        <p className="mt-3 text-lg font-semibold tracking-tight text-white">
          {mastery.continueTopic?.title ?? "Launch Workspace"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{mastery.continueReason}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-300 transition group-hover:translate-x-1">
          {continueHref.includes("/learn/") ? "Open topic studio" : "Open subject hub"}
          <span aria-hidden="true">→</span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {subject.tags.map((tag) => (
          <span className="pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
