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
      <div className={`rounded-[20px] bg-gradient-to-br ${subject.accent} p-4 relative`}>
        {/* Track Icon */}
        <svg className="absolute -top-2 -right-2 w-8 h-8 text-white/70 animate-spin-slow" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L13.09 8.26L22 9L17 14.74L18.18 21.5L12 17.77L5.82 21.5L7 14.74L2 9L10.91 8.26L12 2Z" opacity="0.4" />
          <path d="M12 2L13.09 8.26L22 9L17 14.74L18.18 21.5L12 17.77L5.82 21.5L7 14.74L2 9L10.91 8.26L12 2Z" />
        </svg>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Study Track</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 animate-fade-in">{subject.name}</h2>
          </div>
          <span className="reward-chip animate-bounce">{statusLabel(mastery.weakCount, mastery.strongCount, mastery.attemptedTopics)}</span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{subject.description}</p>

      <div className="mt-4 rounded-[22px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 animate-fade-in">Track Mastery</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
              {mastery.attemptedTopics}/{mastery.totalTopics} topics
            </p>
          </div>
          <span className="pill bg-gradient-to-r from-emerald-500 to-teal-500">{mastery.masteryPercent}%</span>
        </div>
        {/* Radial Progress */}
        <div className="mt-4 flex items-center justify-center">
          <svg className="w-20 h-20 -ml-2" viewBox="0 0 36 36">
            <path
              className="text-slate-200"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <path
              className="text-emerald-400 animate-dash"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeDasharray="100, 100"
              style={{ strokeDashoffset: 100 - mastery.masteryPercent }}
            />
            <text
              x="18"
              y="20.5"
              className="text-center font-mono text-xl font-bold text-slate-950"
              fill="currentColor"
              textAnchor="middle"
            >
              {mastery.masteryPercent}%
            </text>
          </svg>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {previewTopics.map((topic) => {
          const isWeak = topic.status === "recover";
          return (
            <div
              key={topic.topicId}
              className={`flex items-center justify-between rounded-[18px] px-3 py-3 shadow-sm transition-all hover:shadow-md ${isWeak ? "scale-[1.02] border-2 border-amber-200 bg-amber-50/80 ring-1 ring-amber-100 backdrop-blur-sm" : "bg-white/78"}`}
            >
              <span className={`text-sm font-medium ${isWeak ? "font-semibold text-amber-900" : "text-slate-800"}`}>
                {topic.title}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.18em] ${isWeak ? "bg-amber-200 text-amber-800" : "bg-slate-100 text-slate-500"}`}
              >
                {topic.accuracy === null ? "new" : `${topic.accuracy}%`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-[22px] border border-slate-900/30 bg-gradient-to-b from-slate-900/95 to-slate-950/90 backdrop-blur-xl px-4 py-4 text-white shadow-2xl transition-all group-hover:translate-y-[-2px] group-hover:shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)]">
        {/* Sequence Dots */}
        <div className="flex gap-1 mb-3 opacity-60">
          <div className="w-2 h-2 bg-slate-400 rounded-full" />
          <div className="w-2 h-2 bg-slate-400 rounded-full" />
          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
          <div className="w-2 h-2 bg-slate-400 rounded-full" />
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-teal-200 animate-fade-in">Continue Track</p>
        <p className="mt-1 text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text">
          {mastery.continueTopic?.title ?? "Launch Workspace"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{mastery.continueReason}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-300 group-hover:translate-x-1 transition-all">
          {continueHref.includes("/learn/") ? "→ Topic Studio" : "→ Subject Hub"}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
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
