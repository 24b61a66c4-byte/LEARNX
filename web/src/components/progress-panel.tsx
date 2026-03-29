"use client";

import Link from "next/link";

import { useClientSnapshot } from "@/lib/client-snapshot";
import { learnerStateGateway } from "@/lib/gateways";

export function ProgressPanel() {
  const snapshot = useClientSnapshot(
    () => learnerStateGateway.getProgressSnapshot(),
    () => learnerStateGateway.getProgressSnapshot(),
  );

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-6">
        <div className="surface-card p-6">
          <p className="eyebrow">Progress pulse</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Attempts</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{snapshot.completedAttempts}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Daily streak</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{snapshot.rewards.streakDays}d</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">XP</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{snapshot.rewards.xp}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="reward-chip">{snapshot.rewards.leaderboardLabel}</span>
            <span className="reward-chip">Level {snapshot.rewards.level}</span>
            <span className="reward-chip">{snapshot.rewards.nextBadgeLabel}</span>
          </div>
        </div>

        <div className="surface-panel p-6">
          <p className="eyebrow">Recent activity</p>
          {snapshot.recentActivity.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Take one practice set and your recent activity will appear here.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {snapshot.recentActivity.map((item) => (
                <li className="rounded-2xl bg-white px-4 py-4 shadow-sm" key={item.completedAt}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{item.scorePercent}% score</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.subjectId.toUpperCase()} {item.topicId ? `• ${item.topicId}` : "• mixed practice"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="pill">{item.correctCount}/{item.totalCount} correct</span>
                      <span className="pill">+{item.xpEarned} XP</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="surface-panel p-6">
          <p className="eyebrow">Weak topics</p>
          {snapshot.weakTopics.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No weak-topic data yet. Practice will reveal this automatically.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {snapshot.weakTopics.map((topic) => (
                <li className="rounded-2xl bg-white px-4 py-4 shadow-sm" key={topic.topicId}>
                  <p className="font-semibold text-slate-950">{topic.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {topic.accuracy}% accuracy over {topic.attempts} attempts
                  </p>
                  <Link className="mt-3 inline-flex text-sm font-semibold text-teal-700" href={`/app/learn/${topic.subjectId}/${topic.topicId}`}>
                    Revise this topic
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface-panel p-6">
          <p className="eyebrow">Badges and strengths</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {snapshot.rewards.badges.length === 0 ? (
              <span className="reward-chip">First badge waiting</span>
            ) : (
              snapshot.rewards.badges.map((badge) => (
                <span className="reward-chip" key={badge.id}>
                  {badge.label}
                </span>
              ))
            )}
          </div>
          {snapshot.strongTopics.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">Strong topics will appear here after a few solid practice runs.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {snapshot.strongTopics.map((topic) => (
                <li className="rounded-2xl bg-white px-4 py-4 shadow-sm" key={topic.topicId}>
                  <p className="font-semibold text-slate-950">{topic.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {topic.accuracy}% accuracy over {topic.attempts} attempts
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
