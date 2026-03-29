"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { sessionGateway } from "@/lib/gateways";
import { StudyGoal, SubjectId } from "@/lib/types";

const studyGoals: { value: StudyGoal; label: string; description: string }[] = [
  {
    value: "prepare-exams",
    label: "Prepare for exams",
    description: "Focus on important answers, fast revision, and exam-style clarity.",
  },
  {
    value: "understand-concepts",
    label: "Understand concepts",
    description: "Go topic by topic with intuition, worked examples, and guided explanations.",
  },
  {
    value: "improve-problem-solving",
    label: "Improve problem solving",
    description: "Use practice and tutor prompts to build stronger question-solving flow.",
  },
  {
    value: "revise-weak-topics",
    label: "Revise weak topics",
    description: "Jump straight into the areas that need the most attention.",
  },
];

const launchModes = [
  {
    id: "lesson",
    title: "Lesson-first",
    detail: "Read one topic calmly, then branch into tutor and practice only when needed.",
  },
  {
    id: "coach",
    title: "Coach-first",
    detail: "Let the tutor unlock the topic quickly, then cement it with a short drill.",
  },
  {
    id: "streak",
    title: "Streak-first",
    detail: "Protect the daily rhythm with a tiny but consistent study win.",
  },
];

const subjectCards = [
  { id: "dbms" as const, title: "DBMS", detail: "SQL, joins, normalization" },
  { id: "edc" as const, title: "EDC", detail: "Diodes, rectifiers, transistor basics" },
];

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [subjectId, setSubjectId] = useState<SubjectId>("dbms");
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("prepare-exams");
  const [launchMode, setLaunchMode] = useState(launchModes[0].id);

  const selectedGoal = useMemo(
    () => studyGoals.find((goal) => goal.value === studyGoal) ?? studyGoals[0],
    [studyGoal],
  );
  const selectedSubject = useMemo(
    () => subjectCards.find((subject) => subject.id === subjectId) ?? subjectCards[0],
    [subjectId],
  );

  function completeOnboarding() {
    sessionGateway.completeOnboarding({
      preferredSubjectId: subjectId,
      studyGoal,
    });
    router.push("/app");
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="surface-card space-y-6 px-6 py-8 sm:px-8">
        <div className="space-y-2">
          <p className="eyebrow">Onboarding</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Launch your first study rhythm</h1>
          <p className="muted text-sm">
            Keep it small for now. LearnX only needs one subject, one goal, and one launch style to start strong.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {["Pick subject", "Choose goal", "Start day one"].map((label, index) => (
            <div
              className={`rounded-2xl border px-4 py-4 ${
                index === step
                  ? "border-teal-500 bg-teal-50"
                  : index < step
                    ? "border-teal-200 bg-white"
                    : "border-black/10 bg-white/80"
              }`}
              key={label}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Step {index + 1}
              </p>
              <p className="mt-2 font-semibold text-slate-950">{label}</p>
            </div>
          ))}
        </div>

        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {subjectCards.map((subject) => (
              <button
                className={`rounded-[24px] border px-5 py-5 text-left transition ${
                  subjectId === subject.id
                    ? "border-teal-500 bg-teal-50 shadow-sm"
                    : "border-black/10 bg-white hover:bg-slate-50"
                }`}
                key={subject.id}
                onClick={() => setSubjectId(subject.id)}
                type="button"
              >
                <p className="text-lg font-semibold text-slate-950">{subject.title}</p>
                <p className="mt-2 text-sm text-slate-600">{subject.detail}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="reward-chip">Launch subject</span>
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">Choose your current goal</p>
            <div className="grid gap-3">
              {studyGoals.map((goal) => (
                <button
                  className={`rounded-[24px] border px-5 py-4 text-left transition ${
                    studyGoal === goal.value
                      ? "border-teal-500 bg-teal-50 shadow-sm"
                      : "border-black/10 bg-white hover:bg-slate-50"
                  }`}
                  key={goal.value}
                  onClick={() => setStudyGoal(goal.value)}
                  type="button"
                >
                  <p className="font-semibold text-slate-950">{goal.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{goal.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="surface-panel p-5">
                <p className="eyebrow">Choose your launch style</p>
                <div className="mt-4 grid gap-3">
                  {launchModes.map((mode) => (
                    <button
                      className={`rounded-[22px] border px-4 py-4 text-left transition ${
                        launchMode === mode.id
                          ? "border-teal-500 bg-teal-50 shadow-sm"
                          : "border-black/10 bg-white hover:bg-slate-50"
                      }`}
                      key={mode.id}
                      onClick={() => setLaunchMode(mode.id)}
                      type="button"
                    >
                      <p className="font-semibold text-slate-950">{mode.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{mode.detail}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-panel p-5">
              <p className="eyebrow">Day 1 preview</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {selectedSubject.title} + {selectedGoal.label}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{selectedGoal.description}</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Quest 1</p>
                  <p className="mt-1 text-sm text-slate-600">Open one lesson and stay with it for one focused pass.</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Quest 2</p>
                  <p className="mt-1 text-sm text-slate-600">Use the tutor once to remove one exact confusion.</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Quest 3</p>
                  <p className="mt-1 text-sm text-slate-600">Finish one short drill and start your streak.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="reward-chip">+100 XP start</span>
                <span className="reward-chip">First badge waiting</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex gap-3">
            {step > 0 ? (
              <button className="button-secondary" onClick={() => setStep((current) => current - 1)} type="button">
                Back
              </button>
            ) : null}
            <button
              className="button-secondary"
              onClick={() => {
                sessionGateway.completeOnboarding({
                  preferredSubjectId: "dbms",
                  studyGoal: "prepare-exams",
                });
                router.push("/app");
              }}
              type="button"
            >
              Skip with defaults
            </button>
          </div>

          {step < 2 ? (
            <button className="button-primary" onClick={() => setStep((current) => current + 1)} type="button">
              Continue
            </button>
          ) : (
            <button className="button-primary" onClick={completeOnboarding} type="button">
              Launch LearnX
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
