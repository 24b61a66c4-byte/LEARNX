"use client";

import { useState } from "react";
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

export function OnboardingForm() {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState<SubjectId>("dbms");
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("prepare-exams");

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="surface-card space-y-6 px-6 py-8 sm:px-8">
        <div className="space-y-2">
          <p className="eyebrow">Onboarding</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Set your first study path</h1>
          <p className="muted text-sm">
            Keep this small for now: pick one subject and one goal. You can change both later.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { id: "dbms" as const, title: "DBMS", detail: "SQL, joins, normalization" },
            { id: "edc" as const, title: "EDC", detail: "Diodes, rectifiers, transistor basics" },
          ].map((subject) => (
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
            </button>
          ))}
        </div>

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

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="button-primary"
            onClick={() => {
              sessionGateway.completeOnboarding({
                preferredSubjectId: subjectId,
                studyGoal,
              });
              router.push("/app");
            }}
            type="button"
          >
            Start learning
          </button>
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
      </div>
    </section>
  );
}
