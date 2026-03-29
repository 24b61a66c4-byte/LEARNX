"use client";

import Link from "next/link";

import { SubjectCard } from "@/components/subject-card";
import { ONBOARDING_STORAGE_KEY } from "@/lib/constants";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { getTopicsBySubject } from "@/lib/data/catalog";
import { practiceGateway } from "@/lib/gateways";
import { buildSubjectMasteryView } from "@/lib/progress-views";
import { readLocalStorage } from "@/lib/storage";
import { OnboardingProfile, PracticeResult, Subject } from "@/lib/types";

export function SubjectsPanel({ subjects }: { subjects: Subject[] }) {
  const state = useClientSnapshot(
    () => {
      const onboarding = readLocalStorage<OnboardingProfile | null>(ONBOARDING_STORAGE_KEY, null);
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
  const preferredSubject = subjects.find((subject) => subject.id === onboarding?.preferredSubjectId) ?? subjects[0];
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

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card overflow-hidden p-6">
          <div className={`rounded-[28px] bg-gradient-to-br ${preferredSubject.accent} p-6`}>
            <p className="eyebrow">Subjects</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Start with one flagship subject</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
              Keep the launch scope narrow and strong. LearnX starts with DBMS and EDC so the experience stays focused,
              and now each subject shows where to continue instead of acting like a static catalog.
            </p>
          </div>
        </div>

        <div className="surface-panel p-6">
          <p className="eyebrow">Continue now</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {preferredSubject.id.toUpperCase()} workspace -&gt; {continueTopic?.title ?? "start here"}
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
              Open tutor for {preferredSubject.id.toUpperCase()}
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
