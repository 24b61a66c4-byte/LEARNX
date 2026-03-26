"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { learnerStateGateway } from "@/lib/gateways";
import { ProgressSnapshot } from "@/lib/types";

export function ProgressPanel() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(learnerStateGateway.getProgressSnapshot());
  }, []);

  if (!snapshot) {
    return (
      <section className="surface-card p-6">
        <p className="eyebrow">Loading progress</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Collecting your latest study history...
        </h2>
      </section>
    );
  }

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
              <p className="text-sm text-slate-500">Weak topics</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{snapshot.weakTopics.length}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Strong topics</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{snapshot.strongTopics.length}</p>
            </div>
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
                  <p className="font-semibold text-slate-950">{item.scorePercent}% score</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.subjectId.toUpperCase()} {item.topicId ? `• ${item.topicId}` : "• mixed practice"}
                  </p>
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
          <p className="eyebrow">Strong topics</p>
          {snapshot.strongTopics.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Strong topics will appear here after a few solid practice runs.</p>
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
