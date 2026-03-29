"use client";

import Link from "next/link";
import { useState } from "react";

import { ONBOARDING_STORAGE_KEY } from "@/lib/constants";
import { learnerStateGateway } from "@/lib/gateways";
import { readLocalStorage } from "@/lib/storage";
import { DashboardView, OnboardingProfile, ProgressSnapshot } from "@/lib/types";

export function DashboardPanel() {
  const [onboarding] = useState<OnboardingProfile | null>(() =>
    readLocalStorage<OnboardingProfile | null>(ONBOARDING_STORAGE_KEY, null),
  );
  const [dashboard] = useState<DashboardView | null>(() =>
    learnerStateGateway.getDashboard(onboarding?.preferredSubjectId),
  );
  const [progress] = useState<ProgressSnapshot | null>(() => learnerStateGateway.getProgressSnapshot());

  if (!dashboard || !progress) {
    return (
      <section className="surface-card p-6">
        <p className="eyebrow">Loading workspace</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Preparing your study dashboard...
        </h2>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <div className="surface-card p-6">
          <p className="eyebrow">Resume learning</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {dashboard.resumeTopic ? dashboard.resumeTopic.title : "Choose your first topic"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {dashboard.resumeTopic
              ? dashboard.resumeTopic.summary
              : "Start with a flagship subject and let LearnX build your next action from there."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="button-primary"
              href={
                dashboard.resumeTopic
                  ? `/app/learn/${dashboard.resumeTopic.subjectId}/${dashboard.resumeTopic.id}`
                  : "/app/subjects"
              }
            >
              {dashboard.resumeTopic ? "Continue topic" : "Browse subjects"}
            </Link>
            <Link className="button-secondary" href={dashboard.quickPracticeHref}>
              Quick practice
            </Link>
          </div>
        </div>

        {dashboard.recommendation ? (
          <div className="surface-panel p-6">
            <p className="eyebrow">One recommendation</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {dashboard.recommendation.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{dashboard.recommendation.reason}</p>
            <Link className="button-primary mt-5" href={dashboard.recommendation.href}>
              Open recommended topic
            </Link>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="surface-panel p-6">
          <p className="eyebrow">Current focus</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
            {onboarding?.preferredSubjectId === "edc" ? "EDC sprint" : "DBMS sprint"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {onboarding
              ? `Goal: ${onboarding.studyGoal.replaceAll("-", " ")}`
              : "Use onboarding to pin one subject and one goal."}
          </p>
        </div>

        <div className="surface-panel p-6">
          <p className="eyebrow">Progress pulse</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Attempts</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{progress.completedAttempts}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Weak topics</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{progress.weakTopics.length}</p>
            </div>
          </div>
          <Link className="button-secondary mt-5 w-full" href="/app/progress">
            Open progress view
          </Link>
        </div>
      </div>
    </section>
  );
}
