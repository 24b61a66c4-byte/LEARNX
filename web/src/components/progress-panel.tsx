"use client";

import Link from "next/link";
import { type ReactNode } from "react";

import { LEVEL_XP_STEP } from "@/lib/constants";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { getSubjectById, getTopicById } from "@/lib/data/catalog";
import { getServerProgressSnapshot, learnerStateGateway } from "@/lib/gateways";

function XPRing({ xp, level }: { xp: number; level: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const previousLevelXp = Math.max(0, (level - 1) * LEVEL_XP_STEP);
  const progress = Math.min(1, Math.max(0, (xp - previousLevelXp) / LEVEL_XP_STEP));
  const offset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-32 w-32 -rotate-90 transform" aria-hidden="true">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="url(#xp-gradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Level</span>
        <span className="text-3xl font-semibold tracking-tight text-slate-950">{level}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = "teal",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: "teal" | "amber" | "rose";
}) {
  const colors = {
    teal: "text-teal-700 bg-teal-50 border-teal-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    rose: "text-rose-700 bg-rose-50 border-rose-100",
  };

  return (
    <div className="flex items-center gap-4 rounded-[24px] border border-black/6 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="text-xl font-semibold tracking-tight text-slate-950">{value}</p>
      </div>
    </div>
  );
}

export function ProgressPanel() {
  const snapshot = useClientSnapshot(
    () => learnerStateGateway.getProgressSnapshot(),
    () => getServerProgressSnapshot(),
  );

  const drillPlans = snapshot.weakTopics.map((topic, index) => ({
    topic,
    title: index === 0 ? "Recovery drill" : "Reinforcement cycle",
    detail:
      topic.accuracy < 50
        ? "Concept gap detected. Review the lesson summary before attempting more drills."
        : "Moderate understanding. A quick practice set will stabilize your recall.",
  }));

  const pacePercent = Math.max(2, 100 - snapshot.rewards.percentile);

  return (
    <section className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <div className="surface-card p-6">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
            <XPRing xp={snapshot.rewards.xp} level={snapshot.rewards.level} />

            <div className="space-y-4">
              <div>
                <p className="eyebrow">Momentum pulse</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  You are in the {snapshot.rewards.leaderboardLabel}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Consistency is high this week. {snapshot.rewards.nextBadgeLabel}. Keep the streak alive.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="pill bg-slate-950 text-white">+{snapshot.rewards.xp} XP</span>
                <span className="pill">{snapshot.rewards.xpToNextLevel} XP to next level</span>
                <span className="pill">Top {pacePercent}% pace</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Attempts"
              value={snapshot.completedAttempts}
              color="teal"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <StatCard
              label="Streak"
              value={`${snapshot.rewards.streakDays}d`}
              color="amber"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 3 3.333 4.667 3.333 6 0 1.5-.5 3-1.5 4 1 0 1.5-1 1.5-1z"
                  />
                </svg>
              }
            />
            <StatCard
              label="Percentile"
              value={`Top ${pacePercent}%`}
              color="rose"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
            />
          </div>
        </div>

        <div className="surface-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Last practice runs</h3>
            </div>
            <span className="reward-chip">{snapshot.recentActivity.length} sessions</span>
          </div>

          {snapshot.recentActivity.length === 0 ? (
            <div className="mt-4 rounded-[24px] border border-dashed border-black/10 p-8 text-center text-sm text-slate-500">
              No activity yet. Your study timeline will build as you practice.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {snapshot.recentActivity.map((item, idx) => (
                <div
                  className="flex flex-col gap-4 rounded-[24px] border border-black/10 bg-white/84 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  key={`${item.completedAt}-${idx}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {getSubjectById(item.subjectId)?.name ?? "Subject"}{item.topicId ? ` • ${getTopicById(item.topicId)?.title ?? "Topic"}` : " • Mixed practice"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold tracking-tight text-slate-950">
                        {item.scorePercent}%
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                          item.scorePercent >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {item.scorePercent >= 80 ? "Mastery" : "Practiced"}
                    </span>
                  </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>
                      {item.correctCount}/{item.totalCount} correct
                    </span>
                    <span className="h-4 w-px bg-slate-200" />
                    <span className="font-semibold text-teal-700">+{item.xpEarned} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="surface-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Knowledge health</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Weak topics and strong anchors</h3>
            </div>
            <span className="reward-chip">Focus view</span>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Growth priority</p>
              {snapshot.weakTopics.length === 0 ? (
                <p className="rounded-[20px] border border-dashed border-black/10 px-4 py-5 text-sm text-slate-500">
                  Scan complete. No major weak topics detected.
                </p>
              ) : (
                <div className="space-y-3">
                  {snapshot.weakTopics.map((topic) => (
                    <div className="rounded-[20px] border border-black/10 bg-white/84 p-4 shadow-sm" key={topic.topicId}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-950">{topic.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {topic.accuracy}% accuracy
                          </p>
                        </div>
                        <Link className="text-sm font-semibold text-rose-700 hover:underline" href={`/app/learn/${topic.subjectId}/${topic.topicId}`}>
                          Review
                        </Link>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-rose-500 transition-[width] duration-500" style={{ width: `${topic.accuracy}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Strong anchors</p>
              {snapshot.strongTopics.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Complete more drills to identify your focus strengths.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {snapshot.strongTopics.map((topic) => (
                    <span className="pill" key={topic.topicId}>
                      {topic.title} • {topic.accuracy}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="surface-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Achievements</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Badges earned and the next milestone
              </h3>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {snapshot.rewards.badges.length} earned
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {snapshot.rewards.badges.map((badge) => (
              <div
                className="rounded-[22px] border border-amber-100 bg-amber-50/40 px-4 py-4 shadow-sm"
                key={badge.id}
                title={badge.description}
              >
                <p className="font-semibold text-amber-900">{badge.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{badge.description}</p>
              </div>
            ))}
            {snapshot.rewards.badges.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-black/10 px-4 py-4 text-sm text-slate-500">
                Earn your first badge by finishing a few focused drills.
              </div>
            ) : null}
          </div>
        </div>

        <div className="surface-card bg-slate-950 p-6 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-300">Drill blueprints</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Recovery roadmap</h3>

          {drillPlans.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No active recovery plans. Your growth is currently optimal.</p>
          ) : (
            <div className="mt-6 space-y-5">
              {drillPlans.map((plan, index) => (
                <div className="rounded-[22px] border border-white/10 bg-white/6 p-4" key={plan.topic.topicId}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        0{index + 1}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">{plan.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-teal-300">
                        {plan.topic.title}
                      </p>
                    </div>
                    <Link
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                      href={`/app/learn/${plan.topic.subjectId}/${plan.topic.topicId}`}
                    >
                      Open
                    </Link>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{plan.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
