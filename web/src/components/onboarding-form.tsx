"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { syncOnboardingProfile } from "@/lib/backend-sync";
import { getSubjectById, getSubjects, getTopicById, getTopicsBySubject } from "@/lib/data/catalog";
import { sessionGateway } from "@/lib/gateways";
import { getCognitiveGroup, getRecommendedTopicIds } from "@/lib/profile-preferences";
import { CognitiveGroup, ExamTarget, LaunchMode, StudyGoal, SubjectId, Topic } from "@/lib/types";

const studyGoals: { value: StudyGoal; label: string; description: string }[] = [
  {
    value: "understand-concepts",
    label: "Understand a topic",
    description: "Take it step by step with simple explanations, examples, and a calm study flow.",
  },
  {
    value: "prepare-exams",
    label: "Get ready for a test",
    description: "Focus on likely questions, quick revision, and answer-ready explanations.",
  },
  {
    value: "improve-problem-solving",
    label: "Practice solving",
    description: "Use guided drills and tutor help to get faster and more confident.",
  },
  {
    value: "revise-weak-topics",
    label: "Fix weak spots",
    description: "Jump back into the topics that still feel shaky and repair them quickly.",
  },
];

const launchModes: Array<{ id: LaunchMode; title: string; detail: string; outcome: string }> = [
  {
    id: "lesson",
    title: "Start with a lesson",
    detail: "Read the topic first, then branch into tutor help and a drill when you need it.",
    outcome: "Best when the learner wants a clear path before answering questions.",
  },
  {
    id: "coach",
    title: "Talk it through first",
    detail: "Open with the tutor, get unstuck fast, and then lock it in with practice.",
    outcome: "Best when questions come before confidence.",
  },
  {
    id: "streak",
    title: "Quick daily win",
    detail: "Keep sessions short and steady so the learner can stay consistent without pressure.",
    outcome: "Best when routine matters more than long study blocks.",
  },
];

const examTargets: { value: ExamTarget; label: string; description: string }[] = [
  {
    value: "semester-exam",
    label: "Semester exam",
    description: "Prioritize the highest-value topics and compact revision loops.",
  },
  {
    value: "internal-assessment",
    label: "Class test or internal",
    description: "Stay sharp on the next short assessment with focused cleanup.",
  },
  {
    value: "lab-viva",
    label: "Lab or viva",
    description: "Practice saying answers clearly and connecting ideas out loud.",
  },
  {
    value: "interview-prep",
    label: "Interview or oral prep",
    description: "Build clear, confident explanations instead of memorized lines.",
  },
];

const interestPresets = [
  { id: "numbers", label: "Numbers", detail: "Foundations and confidence", topicIds: ["dbms-sql-basics"] },
  { id: "patterns", label: "Patterns", detail: "Logic and relationships", topicIds: ["dbms-joins"] },
  { id: "problem-solving", label: "Problem solving", detail: "Breaking work into steps", topicIds: ["dbms-normalization"] },
  {
    id: "coding-logic",
    label: "Coding logic",
    detail: "Instructions, choices, and repeat patterns",
    topicIds: ["coding-logic-basics", "coding-variables", "coding-control-flow"],
  },
  { id: "science-basics", label: "Science basics", detail: "Concepts with simple examples", topicIds: ["edc-diode-basics"] },
  { id: "experiments", label: "Experiments", detail: "Observe and explain change", topicIds: ["edc-diode-basics", "edc-rectifiers"] },
  { id: "energy", label: "Energy", detail: "Everyday transformations", topicIds: ["edc-rectifiers"] },
  { id: "systems", label: "Systems", detail: "Control and cause-effect", topicIds: ["edc-transistor-basics"] },
  { id: "revision", label: "Fast revision", detail: "Quick recall and answer framing", topicIds: ["dbms-normalization", "edc-rectifiers"] },
];

const ageSuggestions: Record<CognitiveGroup, string[]> = {
  kids: ["Short sessions", "Simple words", "Visual examples"],
  tweens: ["Quick wins", "Guided practice", "Concrete examples"],
  teens: ["Clear revision", "Topic repair", "Focused practice"],
  adults: ["Structured study", "Answer-ready notes", "Practical revision"],
};

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function resolveSubjectIdFromTopics(topicIds: string[]): SubjectId {
  const counts = new Map<SubjectId, number>();

  topicIds.forEach((topicId) => {
    const subjectId = getTopicById(topicId)?.subjectId;
    if (!subjectId) {
      return;
    }

    counts.set(subjectId, (counts.get(subjectId) ?? 0) + 1);
  });

  const ranked = [...counts.entries()].sort((left, right) => right[1] - left[1]);
  return ranked[0]?.[0] ?? "dbms";
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("understand-concepts");
  const [examTarget, setExamTarget] = useState<ExamTarget>("semester-exam");
  const [launchMode, setLaunchMode] = useState<LaunchMode>("lesson");
  const [age, setAge] = useState<number | "">("");
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [topicSearch, setTopicSearch] = useState("");

  const allTopics = useMemo(
    () => getSubjects().flatMap((subject) => getTopicsBySubject(subject.id)),
    [],
  );
  const selectedInterestPresets = useMemo(
    () => interestPresets.filter((preset) => selectedInterestIds.includes(preset.id)),
    [selectedInterestIds],
  );
  const selectedInterestLabels = selectedInterestPresets.map((preset) => preset.label);
  const cognitiveGroup = age !== "" ? getCognitiveGroup(age) : "teens";
  const ageHint = age !== "" ? ageSuggestions[cognitiveGroup] : ["Age can be set later", "LearnX will start with balanced suggestions", "You can still change everything in settings"];
  const recommendedTopicIds = useMemo(() => {
    const presetTopicIds = selectedInterestPresets.flatMap((preset) => preset.topicIds);
    return uniqueValues([
      ...presetTopicIds,
      ...getRecommendedTopicIds(age === "" ? undefined : age, cognitiveGroup, selectedInterestLabels),
    ]).slice(0, 3);
  }, [age, cognitiveGroup, selectedInterestLabels, selectedInterestPresets]);
  const effectiveTopicIds = selectedTopicIds.length > 0 ? selectedTopicIds : recommendedTopicIds;
  const effectiveSubjectId = resolveSubjectIdFromTopics(effectiveTopicIds);
  const selectedGoal = useMemo(
    () => studyGoals.find((goal) => goal.value === studyGoal) ?? studyGoals[0],
    [studyGoal],
  );
  const selectedLaunchMode = useMemo(
    () => launchModes.find((mode) => mode.id === launchMode) ?? launchModes[0],
    [launchMode],
  );
  const selectedExamTarget = useMemo(
    () => examTargets.find((target) => target.value === examTarget) ?? examTargets[0],
    [examTarget],
  );
  const visibleTopics = useMemo(() => {
    const normalized = topicSearch.trim().toLowerCase();
    if (!normalized) {
      return allTopics;
    }

    return allTopics.filter((topic) =>
      `${topic.title} ${topic.summary} ${topic.tags.join(" ")}`.toLowerCase().includes(normalized),
    );
  }, [allTopics, topicSearch]);
  const suggestedTopics = useMemo(
    () =>
      recommendedTopicIds
        .map((topicId) => getTopicById(topicId))
        .filter((topic): topic is Topic => Boolean(topic)),
    [recommendedTopicIds],
  );
  const selectedTopics = useMemo(
    () =>
      effectiveTopicIds
        .map((topicId) => getTopicById(topicId))
        .filter((topic): topic is Topic => Boolean(topic)),
    [effectiveTopicIds],
  );
  const selectedSubject = getSubjectById(effectiveSubjectId);
  const progressPercent = Math.round(((step + 1) / 4) * 100);
  const isExamFlow = studyGoal === "prepare-exams";

  function toggleInterest(interestId: string) {
    setSelectedInterestIds((current) =>
      current.includes(interestId) ? current.filter((item) => item !== interestId) : [...current, interestId],
    );
  }

  function toggleTopic(topicId: string) {
    setSelectedTopicIds((current) => {
      if (current.includes(topicId)) {
        return current.filter((item) => item !== topicId);
      }

      return [...current, topicId].slice(-3);
    });
  }

  function buildOnboardingProfile(overrides?: Partial<Parameters<typeof sessionGateway.completeOnboarding>[0]>) {
    const interestLabels = uniqueValues([
      ...selectedInterestLabels,
      ...selectedTopics.map((topic) => topic.title),
    ]);

    return {
      preferredSubjectId: effectiveSubjectId,
      preferredTopicIds: effectiveTopicIds,
      studyGoal,
      examTarget: isExamFlow ? examTarget : undefined,
      launchMode,
      age: age !== "" ? age : undefined,
      cognitiveGroup: age !== "" ? cognitiveGroup : undefined,
      interests: interestLabels.length > 0 ? interestLabels : undefined,
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

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="surface-card space-y-6 px-6 py-8 sm:px-8">
        <div className="space-y-2">
          <p className="eyebrow">First-time setup</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Build a study path that fits the learner</h1>
          <p className="muted max-w-3xl text-sm leading-6">
            LearnX only needs a few signals to choose a strong starting topic, a better tutor flow, and the right kind
            of practice.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Step {step + 1} of 4</span>
            <span>{progressPercent}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(15,118,110,0.9),rgba(245,158,11,0.88))]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {step === 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-6">
              <div className="space-y-3">
                <div>
                  <p className="eyebrow">Step 1</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Who is this plan for?</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Age is optional. Add it now if you want more tailored wording and pacing, or leave it blank and
                    adjust later in account settings.
                  </p>
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-800">Age</span>
                  <input
                    aria-label="Enter age to tailor the learning plan"
                    className="field"
                    min="5"
                    max="100"
                    onChange={(event) => setAge(event.target.value === "" ? "" : parseInt(event.target.value, 10))}
                    placeholder="Optional"
                    type="number"
                    value={age}
                  />
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-800">What LearnX will optimize for</p>
                <div className="flex flex-wrap gap-2">
                  {ageHint.map((item) => (
                    <span className="pill" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-panel space-y-4 p-5">
              <div>
                <p className="eyebrow">Preview</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  {age === "" ? "Balanced study setup" : `${cognitiveGroup.charAt(0).toUpperCase()}${cognitiveGroup.slice(1)} study setup`}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  LearnX will keep the copy friendly, choose a sensible starter topic, and stay flexible while you tune
                  the rest of the setup.
                </p>
              </div>
              <div className="rounded-[22px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">You can still change this later</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The learner profile, topic choices, accessibility settings, and study style all live in account
                  settings after onboarding.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <p className="eyebrow">Step 2</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">What should LearnX start with?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Pick broad interests, search actual topics, or do both. LearnX will keep up to three starting topics
                  in focus.
                </p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">Search topics</span>
                <input
                  aria-label="Search available topics"
                  className="field"
                  onChange={(event) => setTopicSearch(event.target.value)}
                  placeholder="Search by topic, summary, or tag"
                  value={topicSearch}
                />
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">Interest shortcuts</p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {interestPresets.map((preset) => {
                  const active = selectedInterestIds.includes(preset.id);
                  return (
                    <button
                      aria-pressed={active}
                      className={`rounded-[22px] border px-4 py-4 text-left transition ${
                        active ? "border-teal-500 bg-teal-50 shadow-sm" : "border-black/10 bg-white hover:bg-slate-50"
                      }`}
                      key={preset.id}
                      onClick={() => toggleInterest(preset.id)}
                      type="button"
                    >
                      <p className="font-semibold text-slate-950">{preset.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{preset.detail}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-800">Choose starting topics</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {visibleTopics.map((topic) => {
                    const active = selectedTopicIds.includes(topic.id);
                    const subject = getSubjectById(topic.subjectId);
                    return (
                      <button
                        aria-pressed={active}
                        className={`rounded-[24px] border px-5 py-5 text-left transition ${
                          active ? "border-teal-500 bg-teal-50 shadow-sm" : "border-black/10 bg-white hover:bg-slate-50"
                        }`}
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        type="button"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-lg font-semibold text-slate-950">{topic.title}</p>
                          <span className="pill text-xs">{subject?.name ?? "Topic"}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{topic.summary}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="surface-panel p-5">
                  <p className="eyebrow">Suggested start</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {selectedSubject?.name ?? "Starter track"} track
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    LearnX will start with the live subject that best matches the chosen interests and topics.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {suggestedTopics.map((topic) => (
                      <span className="pill" key={topic.id}>
                        {topic.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="surface-panel p-5">
                  <p className="eyebrow">Selected now</p>
                  {selectedTopics.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {selectedTopics.map((topic) => (
                        <div className="rounded-[20px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm" key={topic.id}>
                          <p className="font-semibold text-slate-950">{topic.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{topic.summary}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      No topic selected yet, so LearnX will use the suggested topic set above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div>
              <p className="eyebrow">Step 3</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">What is the goal right now?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                LearnX only asks for test details when the learner actually wants exam prep.
              </p>
            </div>

            <div className="grid gap-3">
              {studyGoals.map((goal) => (
                <button
                  aria-pressed={studyGoal === goal.value}
                  className={`rounded-[24px] border px-5 py-4 text-left transition ${
                    studyGoal === goal.value ? "border-teal-500 bg-teal-50 shadow-sm" : "border-black/10 bg-white hover:bg-slate-50"
                  }`}
                  key={goal.value}
                  onClick={() => setStudyGoal(goal.value)}
                  type="button"
                >
                  <p className="font-semibold text-slate-950">{goal.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{goal.description}</p>
                </button>
              ))}
            </div>

            {isExamFlow ? (
              <div className="surface-panel space-y-4 p-5">
                <div>
                  <p className="eyebrow">Exam goal</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                    Which kind of test are we preparing for?
                  </h3>
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-800">Choose one</span>
                  <select
                    aria-label="Select exam target"
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
            ) : (
              <div className="surface-panel p-5">
                <p className="eyebrow">No extra test setup needed</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  LearnX will focus on the chosen topics and keep the flow simple until the learner switches to exam
                  prep later.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div>
                <p className="eyebrow">Step 4</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">How should each session begin?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This is not a personality quiz. It only changes the first move LearnX suggests when the learner opens
                  the app.
                </p>
              </div>

              <div className="grid gap-3">
                {launchModes.map((mode) => (
                  <button
                    aria-pressed={launchMode === mode.id}
                    className={`rounded-[24px] border px-5 py-4 text-left transition ${
                      launchMode === mode.id ? "border-teal-500 bg-teal-50 shadow-sm" : "border-black/10 bg-white hover:bg-slate-50"
                    }`}
                    key={mode.id}
                    onClick={() => setLaunchMode(mode.id)}
                    type="button"
                  >
                    <p className="font-semibold text-slate-950">{mode.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{mode.detail}</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{mode.outcome}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-panel space-y-4 p-5">
              <div>
                <p className="eyebrow">Starting plan</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {selectedTopics[0]?.title ?? "Starter topic"} first
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedGoal.description}</p>
              </div>
              <div className="rounded-[22px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Subject</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{selectedSubject?.name ?? "Starter track"}</p>
              </div>
              <div className="rounded-[22px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Session opening</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{selectedLaunchMode.detail}</p>
              </div>
              <div className="rounded-[22px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Topics in focus</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTopics.map((topic) => (
                    <span className="pill" key={topic.id}>
                      {topic.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex gap-3">
            {step > 0 ? (
              <button
                aria-label="Go back to the previous step"
                className="button-secondary"
                onClick={() => setStep((current) => current - 1)}
                type="button"
              >
                Back
              </button>
            ) : null}
            <button className="button-secondary" onClick={completeOnboarding} type="button">
              Skip and start
            </button>
          </div>

          {step < 3 ? (
            <button
              aria-label={`Continue to step ${step + 2}`}
              className="button-primary"
              onClick={() => setStep((current) => current + 1)}
              type="button"
            >
              Continue
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
