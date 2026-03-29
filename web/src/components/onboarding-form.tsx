"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { sessionGateway } from "@/lib/gateways";
import { AccessibilityFeature, CognitiveGroup, ExamTarget, LaunchMode, StudyGoal, SubjectId } from "@/lib/types";

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

const subjectCards = [
  { id: "dbms" as const, title: "DBMS", detail: "SQL, joins, normalization" },
  { id: "edc" as const, title: "EDC", detail: "Diodes, rectifiers, transistor basics" },
];

const interestOptions = ["Programming", "Mathematics", "Physics", "Chemistry", "Computer Science", "Engineering"];

function getCognitiveGroup(age: number): CognitiveGroup {
  if (age >= 5 && age <= 8) return "kids";
  if (age >= 9 && age <= 12) return "tweens";
  if (age >= 13 && age <= 17) return "teens";
  return "adults";
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [subjectId, setSubjectId] = useState<SubjectId>("dbms");
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("prepare-exams");
  const [examTarget, setExamTarget] = useState<ExamTarget>("semester-exam");
  const [launchMode, setLaunchMode] = useState<LaunchMode>(launchModes[0].id);
  const [age, setAge] = useState<number | "">(16);
  const [interests, setInterests] = useState<string[]>([]);
  const [enableVisualDiagrams, setEnableVisualDiagrams] = useState(true);
  const [enableVoiceInput, setEnableVoiceInput] = useState(true);
  const [enableQuizMode, setEnableQuizMode] = useState(true);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<AccessibilityFeature[]>([]);

  const selectedGoal = useMemo(
    () => studyGoals.find((goal) => goal.value === studyGoal) ?? studyGoals[0],
    [studyGoal],
  );
  const selectedExamTarget = useMemo(
    () => examTargets.find((target) => target.value === examTarget) ?? examTargets[0],
    [examTarget],
  );
  const selectedSubject = useMemo(
    () => subjectCards.find((subject) => subject.id === subjectId) ?? subjectCards[0],
    [subjectId],
  );
  const selectedLaunchMode = useMemo(
    () => launchModes.find((mode) => mode.id === launchMode) ?? launchModes[0],
    [launchMode],
  );

  const cognitiveGroup = age !== "" ? getCognitiveGroup(age) : "teens";

  function toggleInterest(interest: string) {
    setInterests((current) =>
      current.includes(interest) ? current.filter((i) => i !== interest) : [...current, interest],
    );
  }

  function toggleAccessibilityFeature(feature: AccessibilityFeature) {
    setAccessibilityFeatures((current) =>
      current.includes(feature) ? current.filter((f) => f !== feature) : [...current, feature],
    );
  }

  function completeOnboarding() {
    sessionGateway.completeOnboarding({
      preferredSubjectId: subjectId,
      studyGoal,
      examTarget,
      launchMode,
      age: age !== "" ? age : undefined,
      cognitiveGroup,
      interests: interests.length > 0 ? interests : undefined,
      enableVisualDiagrams,
      enableVoiceInput,
      enableQuizMode,
      accessibilityFeatures: accessibilityFeatures.length > 0 ? accessibilityFeatures : undefined,
    });
    router.push("/app");
  }

  const stepLabels = ["Your profile", "Pick subject", "Goal + target", "Study style", "Features"];

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="surface-card space-y-6 px-6 py-8 sm:px-8">
        <div className="space-y-2">
          <p className="eyebrow">Adaptive Onboarding</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Start your personalized learning journey</h1>
          <p className="muted text-sm">
            LearnX adapts to your age, interests, and learning preferences. Answer a few quick questions and we&apos;ll customize your experience.
          </p>
        </div>

        <div className="hidden grid-cols-5 gap-2 sm:grid">
          {stepLabels.map((label, index) => (
            <div
              className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold ${
                index === step
                  ? "border-teal-500 bg-teal-50 text-teal-900"
                  : index < step
                    ? "border-teal-200 bg-white text-slate-600"
                    : "border-black/10 bg-white/80 text-slate-500"
              }`}
              key={label}
            >
              <p className="uppercase tracking-[0.1em]">{label}</p>
            </div>
          ))}
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
                {age !== "" && (
                  <p className="text-xs text-slate-600">
                    📚 Learning group: <strong>{getCognitiveGroup(age).toUpperCase()}</strong>
                  </p>
                )}
              </label>
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
                aria-pressed={subjectId === subject.id}
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

        {/* Step 2: Goal & Exam Target */}
        {step === 2 ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
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
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
            </div>

            <div className="surface-panel p-5">
              <p className="eyebrow">Your learning path</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                {selectedSubject.title} • {cognitiveGroup.toUpperCase()}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedGoal.description}
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Quick start:</p>
                <p className="text-sm text-slate-700">
                  Learn at your pace with explanations adapted to {cognitiveGroup}. Toggle voice, diagrams, and quizzes next.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Step 4: Features & Accessibility */}
        {step === 4 ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface-panel space-y-3 p-5">
                <p className="font-semibold text-slate-950">✨ Learning Features</p>
                <label className="flex items-center gap-3">
                  <input
                    aria-label="Enable visual diagrams for complex topics"
                    checked={enableVisualDiagrams}
                    onChange={(e) => setEnableVisualDiagrams(e.target.checked)}
                    type="checkbox"
                  />
                  <span className="text-sm text-slate-700">Visual Diagrams (Mermaid)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    aria-label="Enable voice-based interaction"
                    checked={enableVoiceInput}
                    onChange={(e) => setEnableVoiceInput(e.target.checked)}
                    type="checkbox"
                  />
                  <span className="text-sm text-slate-700">Voice Mode (Deepgram)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    aria-label="Enable adaptive quiz generation after topics"
                    checked={enableQuizMode}
                    onChange={(e) => setEnableQuizMode(e.target.checked)}
                    type="checkbox"
                  />
                  <span className="text-sm text-slate-700">Adaptive Quiz Module</span>
                </label>
                <p className="text-xs text-slate-600 pt-2">These can be toggled anytime in settings.</p>
              </div>

              <div className="surface-panel space-y-3 p-5">
                <p className="font-semibold text-slate-950">♿ Accessibility</p>
                <div className="space-y-2">
                  {(["high-contrast", "large-text", "screen-reader", "voice-mode"] as AccessibilityFeature[]).map(
                    (feature) => (
                      <label className="flex items-center gap-3" key={feature}>
                        <input
                          aria-label={`Enable ${feature} accessibility feature`}
                          checked={accessibilityFeatures.includes(feature)}
                          onChange={() => toggleAccessibilityFeature(feature)}
                          type="checkbox"
                        />
                        <span className="text-sm text-slate-700 capitalize">{feature.replace("-", " ")}</span>
                      </label>
                    ),
                  )}
                </div>
                <p className="text-xs text-slate-600 pt-2">Fully WCAG 2.1 accessible.</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-teal-200 bg-teal-50 p-5">
              <p className="font-semibold text-slate-950">🎯 Your LearnX Profile</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                <li>
                  <strong>Age Group:</strong> {cognitiveGroup.charAt(0).toUpperCase() + cognitiveGroup.slice(1)}
                </li>
                <li>
                  <strong>Subject:</strong> {selectedSubject.title}
                </li>
                <li>
                  <strong>Goal:</strong> {selectedGoal.label}
                </li>
                <li>
                  <strong>Learning Mode:</strong> {selectedLaunchMode.title}
                </li>
                {interests.length > 0 && <li><strong>Interests:</strong> {interests.join(", ")}</li>}
              </ul>
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
              onClick={() => {
                sessionGateway.completeOnboarding({
                  preferredSubjectId: "dbms",
                  studyGoal: "prepare-exams",
                  examTarget: "semester-exam",
                  launchMode: "lesson",
                  age: 16,
                  cognitiveGroup: "teens",
                  enableVisualDiagrams: true,
                  enableVoiceInput: true,
                  enableQuizMode: true,
                });
                router.push("/app");
              }}
              type="button"
            >
              Skip & Start
            </button>
          </div>

          {step < 4 ? (
            <button
              aria-label={`Continue to step ${step + 2}`}
              className="button-primary"
              onClick={() => setStep((current) => current + 1)}
              type="button"
            >
              Continue →
            </button>
          ) : (
            <button aria-label="Complete onboarding and launch LearnX" className="button-primary" onClick={completeOnboarding} type="button">
              🚀 Launch LearnX
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
