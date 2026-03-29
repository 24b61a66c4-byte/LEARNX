"use client";

import Link from "next/link";

import { useClientSnapshot } from "@/lib/client-snapshot";
import { getTopicsBySubject } from "@/lib/data/catalog";
import { getServerProgressSnapshot, practiceGateway } from "@/lib/gateways";
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
    ? `/app/learn/${subject.id}/${mastery.continueTopic.id}`
    : `/app/subjects/${subject.id}`;

  return (
    <Link
      className="surface-card group block overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
      href={`/app/subjects/${subject.id}`}
    >
      <div className={`rounded-[20px] bg-gradient-to-br ${subject.accent} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Flagship subject</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{subject.name}</h2>
          </div>
          <span className="reward-chip">{statusLabel(mastery.weakCount, mastery.strongCount, mastery.attemptedTopics)}</span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{subject.description}</p>

      <div className="mt-4 rounded-[22px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Mastery preview</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
              {mastery.attemptedTopics}/{mastery.totalTopics} topics touched
            </p>
          </div>
          <span className="pill">{mastery.masteryPercent}% mastery</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(15,118,110,0.9),rgba(245,158,11,0.88))] transition-all"
            style={{ width: `${Math.max(8, mastery.masteryPercent)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {previewTopics.map((topic) => (
          <div className="flex items-center justify-between rounded-[18px] bg-white/78 px-3 py-3 shadow-sm" key={topic.topicId}>
            <span className="text-sm font-medium text-slate-800">{topic.title}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {topic.accuracy === null ? "new" : `${topic.accuracy}%`}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[22px] border border-black/10 bg-slate-950 px-4 py-4 text-white shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition group-hover:translate-y-[-2px]">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Continue topic</p>
        <p className="mt-2 text-lg font-semibold tracking-tight">
          {mastery.continueTopic?.title ?? "Open subject workspace"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{mastery.continueReason}</p>
        <span className="mt-3 inline-flex text-sm font-semibold text-teal-200" aria-hidden="true">
          Open {continueHref.includes("/learn/") ? "topic studio" : "subject hub"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {subject.tags.map((tag) => (
          <span className={`pill ${subject.backdrop}`} key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
