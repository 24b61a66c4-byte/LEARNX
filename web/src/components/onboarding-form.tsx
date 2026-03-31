"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { syncOnboardingProfile } from "@/lib/backend-sync";
import { sessionGateway } from "@/lib/gateways";
import { getCognitiveGroup, getRecommendedSubjectId } from "@/lib/profile-preferences";
import { CognitiveGroup, ExamTarget, LaunchMode, StudyGoal, SubjectId } from "@/lib/types";

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
    id: "lesson" as const,
    title: "Lesson-first",
    detail: "Read one topic calmly, then branch into tutor and practice only when needed.",
  },
  {
    id: "coach" as const,
    title: "Coach-first",
    detail: "Let the tutor unlock the topic quickly, then cement it with a short drill.",
  },
  {
    id: "streak" as const,
    title: "Streak-first",
    detail: "Protect the daily rhythm with a tiny but consistent study win.",
  },
];

const examTargets: { value: ExamTarget; label: string; description: string }[] = [
  {
    value: "semester-exam",
    label: "Semester exam",
    description: "Prioritize exam-weight topics, answer framing, and compact revision loops.",
  },
  {
    value: "internal-assessment",
    label: "Internal assessment",
    description: "Focus on fast concept cleanup and short, high-confidence practice runs.",
  },
  {
    value: "lab-viva",
    label: "Lab / viva",
    description: "Train for explanation clarity, definitions, and likely oral questions.",
  },
  {
    value: "interview-prep",
    label: "Interview prep",
    description: "Push for understanding, examples, and how to explain concepts out loud.",
  },
];

const subjectCardsByAge: Record<CognitiveGroup, { id: SubjectId; title: string; detail: string }[]> = {
  kids: [
    { id: "dbms", title: "Math starter", detail: "Numbers, patterns, and short wins" },
    { id: "edc", title: "Science starter", detail: "Simple examples and everyday cause-and-effect" },
  ],
  tweens: [
    { id: "dbms", title: "Math focus", detail: "Clear concepts, quick revision, and easy recall" },
    { id: "edc", title: "Science focus", detail: "Learn by doing with guided examples" },
  ],
  teens: [
    { id: "dbms", title: "Math exam prep", detail: "Focus on answers, revision, and topic repair" },
    { id: "edc", title: "Science repair", detail: "Fix weak spots with short, focused study" },
  ],
  adults: [
    { id: "dbms", title: "Focused revision", detail: "Fast recall, clear notes, and practical output" },
    { id: "edc", title: "Practical study", detail: "Keep the flow short, structured, and useful" },
  ],
};

const interestOptions = ["Reading", "Mathematics", "Science", "Languages", "Creativity", "Coding"];

const ageSuggestions: Record<CognitiveGroup, string[]> = {
  kids: ["Visual examples", "Short sessions", "Simple words"],
  tweens: ["Guided practice", "Quick wins", "Fun examples"],
  teens: ["Exam prep", "Topic repair", "Fast revision"],
  adults: ["Focused study", "Recall drills", "Clear notes"],
};

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("prepare-exams");
  const [examTarget, setExamTarget] = useState<ExamTarget>("semester-exam");
  const [launchMode, setLaunchMode] = useState<LaunchMode>(launchModes[0].id);
  const [age, setAge] = useState<number | "">("");
  const [interests, setInterests] = useState<string[]>([]);

  const selectedGoal = useMemo(
    () => studyGoals.find((goal) => goal.value === studyGoal) ?? studyGoals[0],
    [studyGoal],
  );
  const selectedExamTarget = useMemo(
    () => examTargets.find((target) => target.value === examTarget) ?? examTargets[0],
    [examTarget],
  );

  const cognitiveGroup = age !== "" ? getCognitiveGroup(age) : "teens";
  const recommendedSubjectId = useMemo(
    () => getRecommendedSubjectId(age === "" ? undefined : age, age === "" ? "teens" : cognitiveGroup, interests),
    [age, cognitiveGroup, interests],
  );
  const [subjectId, setSubjectId] = useState<SubjectId>(recommendedSubjectId);
  const [subjectManuallySelected, setSubjectManuallySelected] = useState(false);
  const effectiveSubjectId = subjectManuallySelected ? subjectId : recommendedSubjectId;
  const subjectCards = subjectCardsByAge[cognitiveGroup];
  const selectedSubject = useMemo(
    () => subjectCards.find((subject) => subject.id === effectiveSubjectId) ?? subjectCards[0],
    [effectiveSubjectId, subjectCards],
  );
  const selectedLaunchMode = useMemo(
    () => launchModes.find((mode) => mode.id === launchMode) ?? launchModes[0],
    [launchMode],
  );

  function toggleInterest(interest: string) {
    setInterests((current) =>
      current.includes(interest) ? current.filter((i) => i !== interest) : [...current, interest],
    );
  }

  function buildOnboardingProfile(overrides?: Partial<Parameters<typeof sessionGateway.completeOnboarding>[0]>) {
    return {
      preferredSubjectId: effectiveSubjectId,
      studyGoal,
      examTarget,
      launchMode,
      age: age !== "" ? age : undefined,
      cognitiveGroup: age !== "" ? cognitiveGroup : undefined,
      interests: interests.length > 0 ? interests : undefined,
      enableVisualDiagrams: false,
      enableVoiceInput: false,
      enableQuizMode: false,
      accessibilityFeatures: undefined,
      ...overrides,
    };
  }

  function completeOnboarding() {
    const profile = buildOnboardingProfile();
    sessionGateway.completeOnboarding(profile);
    void syncOnboardingProfile(profile).catch(() => undefined);
    router.push("/app");
  }

  const ageHint = age !== "" ? ageSuggestions[cognitiveGroup] : ["Tell us your age first", "We will tune the next step", "Then pick a starter track"];
  const progressPercent = Math.round(((step + 1) / 4) * 100);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="surface-card space-y-6 px-6 py-8 sm:px-8">
        <div className="space-y-2">
          <p className="eyebrow">Profile setup</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Complete your profile</h1>
          <p className="muted text-sm">
            Answer a few quick questions so LearnX can keep the workspace simple and focused.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Step {step + 1} of 4</span>
            <span>{progressPercent}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(15,118,110,0.9),rgba(245,158,11,0.88))]" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Step 0: Age & Interests */}
        {step === 0 ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">Your age</span>
                <input
                  aria-label="Enter your age to customize learning level"
                  className="field"
                  min="5"
                  max="100"
                  onChange={(e) => setAge(e.target.value === "" ? "" : parseInt(e.target.value))}
                  placeholder="Enter your age"
                  type="number"
                  value={age}
                />
                <p className="text-xs text-slate-500">
                  Age helps LearnX set the right subject, examples, and study pace.
                </p>
                {age !== "" && (
                  <p className="text-xs text-slate-600">
                    Learning group: <strong>{getCognitiveGroup(age).toUpperCase()}</strong>
                  </p>
                )}
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">Suggested starting topics</p>
              <div className="flex flex-wrap gap-2">
                {ageHint.map((item) => (
                  <span className="pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">Select your interests (optional)</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {interestOptions.map((interest) => (
                  <button
                    aria-label={`Toggle interest: ${interest}`}
                    aria-pressed={interests.includes(interest)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      interests.includes(interest)
                        ? "border-teal-500 bg-teal-50 text-teal-900"
                        : "border-black/10 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    type="button"
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Step 1: Subject Selection */}
        {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {subjectCards.map((subject) => (
                  <button
                    aria-label={`Select subject: ${subject.title} - ${subject.detail}`}
                    aria-pressed={effectiveSubjectId === subject.id}
                    className={`rounded-[24px] border px-5 py-5 text-left transition ${
                      effectiveSubjectId === subject.id
                        ? "border-teal-500 bg-teal-50 shadow-sm"
                        : "border-black/10 bg-white hover:bg-slate-50"
                    }`}
                    key={subject.id}
                    onClick={() => {
                      setSubjectManuallySelected(true);
                      setSubjectId(subject.id);
                    }}
                    type="button"
                  >
                    <p className="text-lg font-semibold text-slate-950">{subject.title}</p>
                    <p className="mt-2 text-sm text-slate-600">{subject.detail}</p>
                  </button>
                ))}
              </div>
        ) : null}

        {/* Step 2: Goal & Exam Target */}
        {step === 2 ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-800">Choose your current goal</p>
            <div className="grid gap-3">
              {studyGoals.map((goal) => (
                <button
                  aria-label={`Select goal: ${goal.label} - ${goal.description}`}
                  aria-pressed={studyGoal === goal.value}
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

            <div className="surface-panel space-y-4 p-5">
              <div>
                <p className="eyebrow">Exam target</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">What are you studying for?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This helps LearnX tune explanations to your learning level and goals.
                </p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">Exam goal</span>
                <select
                  aria-label="Select your exam target"
                  className="field"
                  onChange={(event) => setExamTarget(event.target.value as ExamTarget)}
                  value={examTarget}
                >
                  {examTargets.map((target) => (
                    <option key={target.value} value={target.value}>
                      {target.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-[22px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
                <p className="font-semibold text-slate-950">{selectedExamTarget.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedExamTarget.description}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Step 3: Launch Style */}
        {step === 3 ? (
          <div className="space-y-4">
            <div className="surface-panel p-5">
              <p className="eyebrow">Choose your learning style</p>
              <div className="mt-4 grid gap-3">
                {launchModes.map((mode) => (
                  <button
                    aria-label={`Select launch mode: ${mode.title} - ${mode.detail}`}
                    aria-pressed={launchMode === mode.id}
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

            <div className="surface-panel p-5">
              <p className="eyebrow">Your learning path</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                {selectedSubject.title} • {cognitiveGroup.toUpperCase()}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{selectedGoal.description}</p>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Quick start:</p>
                <p className="text-sm text-slate-700">
                  Learn at your pace with explanations adapted to {cognitiveGroup}. Visual diagrams, voice mode, and quizzes live in the sidebar and settings after you finish.
                </p>
                <p className="text-sm text-slate-700">
                  Launch style: <span className="font-semibold text-slate-950">{selectedLaunchMode.title}</span>.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex gap-3">
            {step > 0 ? (
              <button
                aria-label="Go back to previous step"
                className="button-secondary"
                onClick={() => setStep((current) => current - 1)}
                type="button"
              >
                ← Back
              </button>
            ) : null}
            <button
              className="button-secondary"
              onClick={completeOnboarding}
              type="button"
            >
              Skip & Start
            </button>
          </div>

          {step < 3 ? (
            <button
              aria-label={`Continue to step ${step + 2}`}
              className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={step === 0 && age === ""}
              onClick={() => setStep((current) => current + 1)}
              type="button"
            >
              Continue →
            </button>
          ) : (
            <button aria-label="Complete onboarding and launch LearnX" className="button-primary" onClick={completeOnboarding} type="button">
              Start LearnX
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
