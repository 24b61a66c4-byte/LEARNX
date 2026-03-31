"use client";

import Link from "next/link";

import { SubjectCard } from "@/components/subject-card";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { getTopicsBySubject } from "@/lib/data/catalog";
import { practiceGateway } from "@/lib/gateways";
import { buildSubjectMasteryView } from "@/lib/progress-views";
import { OnboardingProfile, PracticeResult, Subject } from "@/lib/types";
import { getStoredOnboardingProfile } from "@/lib/profile-preferences";

export function SubjectsPanel({ subjects }: { subjects: Subject[] }) {
  const state = useClientSnapshot(
    () => {
      const onboarding = getStoredOnboardingProfile();
      return {
        onboarding,
        history: practiceGateway.getHistory(),
      };
    },
    () => ({
      onboarding: null as OnboardingProfile | null,
      history: [] as PracticeResult[],
    }),
  );

  const onboarding = state.onboarding;
  const history = state.history;
  const preferredSubject = subjects.find((subject) => subject.id === onboarding?.preferredSubjectId)
    ?? subjects.find((subject) => subject.id === "dbms")
    ?? subjects[0];
  const orderedSubjects = [
    preferredSubject,
    ...subjects.filter((subject) => subject.id !== preferredSubject.id),
  ];
  const preferredMastery = buildSubjectMasteryView(
    preferredSubject.id,
    getTopicsBySubject(preferredSubject.id),
    history,
  );
  const continueTopic = preferredMastery.continueTopic;
  const continueHref = continueTopic
    ? `/app/learn/${preferredSubject.id}/${continueTopic.id}`
    : `/app/subjects/${preferredSubject.id}`;

  const topicViews = preferredMastery.topicViews;
  const getStatusColor = (status: string) => {
    if (status === "strong") return "bg-emerald-400";
    if (status === "recover") return "bg-amber-400";
    if (status === "steady") return "bg-blue-400";
    return "bg-slate-300";
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card overflow-hidden p-6 backdrop-blur-xl">
          <div className={`rounded-[28px] bg-gradient-to-br ${preferredSubject.accent} p-6`}>
            <p className="eyebrow">Study Tracks</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 bg-gradient-to-r bg-clip-text text-transparent from-slate-950 to-slate-800">Study Tracks Hub</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
              Follow structured learning paths with mastery tracking, recovery loops, and seamless studio transitions. Your preferred track leads.
            </p>
          </div>
          {/* Track Progress Path */}
          <div className="mt-6 flex items-center justify-between animate-fade-in">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-600 mb-2">Track Progress</p>
              <div className="flex items-center gap-2">
                {topicViews.map((view, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full ${getStatusColor(view.status)} shadow-lg animate-pulse-slow`} />
                    <div className="w-10 h-1 mx-[-10px] bg-gradient-to-r from-slate-200 to-slate-300" />
                    {view.title.length > 15 ? `${view.title.slice(0, 15)}...` : view.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="surface-panel p-6">
          <p className="eyebrow">Continue now</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {preferredSubject.name} workspace -&gt; {continueTopic?.title ?? "start here"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{preferredMastery.continueReason}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[20px] bg-white/84 px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Mastery</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{preferredMastery.masteryPercent}%</p>
            </div>
            <div className="rounded-[20px] bg-white/84 px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Topics touched</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {preferredMastery.attemptedTopics}/{preferredMastery.totalTopics}
              </p>
            </div>
            <div className="rounded-[20px] bg-white/84 px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Recovery topics</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{preferredMastery.weakCount}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="button-primary" href={continueHref}>
              Continue this topic
            </Link>
            <Link className="button-secondary" href={`/app/ask?subjectId=${preferredSubject.id}`}>
              Open tutor for {preferredSubject.name}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {orderedSubjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </section>
  );
}
