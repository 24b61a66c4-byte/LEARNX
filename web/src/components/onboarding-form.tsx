"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { syncOnboardingProfile } from "@/lib/backend-sync";
import { getSubjectById, getSubjects, getTopicById, getTopicsBySubject } from "@/lib/data/catalog";
import { getPublicAskHref } from "@/lib/public-routes";
import { sessionGateway } from "@/lib/gateways";
import { getCognitiveGroup, getRecommendedSubjectId, getRecommendedTopicIds } from "@/lib/profile-preferences";
import { CognitiveGroup, LaunchMode, StudyGoal, SubjectId, Topic } from "@/lib/types";

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

const DEFAULT_STUDY_GOAL: StudyGoal = "understand-concepts";
const DEFAULT_LAUNCH_MODE: LaunchMode = "coach";
const TOTAL_STEPS = 3;

const VALID_INTEREST_PRESETS = interestPresets.map((preset) => ({
  ...preset,
  topicIds: preset.topicIds.filter((topicId) => Boolean(getTopicById(topicId))),
}));

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function getFallbackTopicIds(subjectId: SubjectId) {
  return getTopicsBySubject(subjectId)
    .slice(0, 3)
    .map((topic) => topic.id);
}

function resolveSubjectIdFromTopics(topicIds: string[], fallbackSubjectId: SubjectId): SubjectId {
  const counts = new Map<SubjectId, number>();

  topicIds.forEach((topicId) => {
    const subjectId = getTopicById(topicId)?.subjectId;
    if (!subjectId) {
      return;
    }

    counts.set(subjectId, (counts.get(subjectId) ?? 0) + 1);
  });

  const ranked = [...counts.entries()].sort((left, right) => right[1] - left[1]);
  return ranked[0]?.[0] ?? fallbackSubjectId;
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<number | "">("");
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [topicSearch, setTopicSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const allTopics = useMemo(
    () => getSubjects().flatMap((subject) => getTopicsBySubject(subject.id)),
    [],
  );
  const selectedInterestPresets = useMemo(
    () => VALID_INTEREST_PRESETS.filter((preset) => selectedInterestIds.includes(preset.id)),
    [selectedInterestIds],
  );
  const selectedInterestLabels = selectedInterestPresets.map((preset) => preset.label);
  const presetTopicIds = useMemo(
    () => uniqueValues(selectedInterestPresets.flatMap((preset) => preset.topicIds)),
    [selectedInterestPresets],
  );
  const cognitiveGroup = age !== "" ? getCognitiveGroup(age) : "teens";
  const fallbackSubjectId = getRecommendedSubjectId(age === "" ? undefined : age, cognitiveGroup, selectedInterestLabels);
  const ageHint = age !== "" ? ageSuggestions[cognitiveGroup] : ["Age can be set later", "LearnX will start with balanced suggestions", "You can still change everything in settings"];
  const recommendedTopicIds = useMemo(() => {
    const adaptiveTopicIds = uniqueValues(
      getRecommendedTopicIds(age === "" ? undefined : age, cognitiveGroup, selectedInterestLabels)
        .filter((topicId) => Boolean(getTopicById(topicId))),
    );

    if (presetTopicIds.length === 0) {
      return adaptiveTopicIds.length > 0 ? adaptiveTopicIds.slice(0, 3) : getFallbackTopicIds(fallbackSubjectId);
    }

    const presetSubjectId = resolveSubjectIdFromTopics(presetTopicIds, fallbackSubjectId);
    const matchingAdaptiveTopicIds = adaptiveTopicIds.filter(
      (topicId) => getTopicById(topicId)?.subjectId === presetSubjectId,
    );

    const mergedTopicIds = uniqueValues([...presetTopicIds, ...matchingAdaptiveTopicIds]).slice(0, 3);
    return mergedTopicIds.length > 0 ? mergedTopicIds : getFallbackTopicIds(presetSubjectId);
  }, [age, cognitiveGroup, fallbackSubjectId, presetTopicIds, selectedInterestLabels]);
  const effectiveTopicIds = useMemo(
    () =>
      selectedTopicIds.length > 0
        ? selectedTopicIds.filter((topicId) => Boolean(getTopicById(topicId)))
        : recommendedTopicIds,
    [recommendedTopicIds, selectedTopicIds],
  );
  const effectiveSubjectId =
    selectedTopicIds.length > 0
      ? resolveSubjectIdFromTopics(selectedTopicIds, fallbackSubjectId)
      : presetTopicIds.length > 0
        ? resolveSubjectIdFromTopics(presetTopicIds, fallbackSubjectId)
        : resolveSubjectIdFromTopics(effectiveTopicIds, fallbackSubjectId);
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
  const progressPercent = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  function toggleInterest(interestId: string) {
    setErrorMessage(null);
    setWarningMessage(null);
    setSelectedInterestIds((current) =>
      current.includes(interestId) ? current.filter((item) => item !== interestId) : [...current, interestId],
    );
  }

  function toggleTopic(topicId: string) {
    setErrorMessage(null);
    setWarningMessage(null);
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
      studyGoal: DEFAULT_STUDY_GOAL,
      examTarget: undefined,
      launchMode: DEFAULT_LAUNCH_MODE,
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

  async function completeOnboarding() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setWarningMessage(null);
    setIsSubmitting(true);

    const profile = buildOnboardingProfile();
    try {
      sessionGateway.completeOnboarding(profile);

      try {
        await syncOnboardingProfile(profile);
      } catch {
        setWarningMessage("Saved locally. We could not sync to backend right now, but you can continue studying.");
      }

      router.push(getPublicAskHref(profile.preferredSubjectId, profile.preferredTopicIds?.[0]));
    } catch {
      setErrorMessage("Setup could not be completed. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="surface-card space-y-6 px-6 py-8 sm:px-8">
        <div className="space-y-2">
          <p className="eyebrow">First-time setup</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Set up your study path</h1>
          <p className="muted max-w-3xl text-sm leading-6">
            Keep it simple: choose an age if you want, pick a topic, and jump straight into the study assistant.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Step {step + 1} of {TOTAL_STEPS}</span>
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
                    Age is optional. Add it if you want simpler wording and pacing, or skip it and adjust later.
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
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{age === "" ? "Balanced study setup" : `${cognitiveGroup.charAt(0).toUpperCase()}${cognitiveGroup.slice(1)} study setup`}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  LearnX will keep the language friendly, open in study chat, and guide the learner toward one focused quiz.
                </p>
              </div>
              <div className="grid gap-2">
                {["Study chat first", "Topic quiz next", "Results with notes and video links"].map((item) => (
                  <div className="rounded-[22px] border border-black/10 bg-white/84 px-4 py-3 shadow-sm" key={item}>
                    <p className="text-sm font-semibold text-slate-950">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <p className="eyebrow">Step 2</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Pick a starting point</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choose up to three topics, or tap one broad interest and let LearnX suggest the rest.
                </p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">Search</span>
                <input
                  aria-label="Search available topics"
                  className="field"
                  onChange={(event) => setTopicSearch(event.target.value)}
                  placeholder="Search topics"
                  value={topicSearch}
                />
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">Quick interests</p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {interestPresets.map((preset) => {
                  const active = selectedInterestIds.includes(preset.id);
                  return (
                    <button
                      aria-pressed={active}
                      className={`rounded-[22px] border px-4 py-4 text-left transition ${active ? "border-teal-500 bg-teal-50 shadow-sm" : "border-black/10 bg-white hover:bg-slate-50"
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
                <p className="text-sm font-semibold text-slate-800">Topics</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {visibleTopics.map((topic) => {
                    const active = selectedTopicIds.includes(topic.id);
                    const subject = getSubjectById(topic.subjectId);
                    return (
                      <button
                        aria-pressed={active}
                        className={`rounded-[24px] border px-5 py-5 text-left transition ${active ? "border-teal-500 bg-teal-50 shadow-sm" : "border-black/10 bg-white hover:bg-slate-50"
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
                  <p className="eyebrow">Start here</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{selectedSubject?.name ?? "Starter track"}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    LearnX will open the study chat with this track in focus.
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
                  <p className="eyebrow">Chosen topics</p>
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
                      No topic selected yet, so LearnX will use the suggested topics above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div>
                <p className="eyebrow">Step 3</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Ready to start studying?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  LearnX will open in the study assistant first, then guide the learner into a focused quiz and a simple review pass.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  {
                    stepLabel: "1",
                    title: "Study in chat",
                    detail: "Ask like ChatGPT, clarify, and keep the topic in one clean thread.",
                  },
                  {
                    stepLabel: "2",
                    title: "Take the quiz",
                    detail: "Move to a 10-question topic quiz when the explanation feels clear enough.",
                  },
                  {
                    stepLabel: "3",
                    title: "Review the result",
                    detail: "See what to fix, what notes to keep, and which videos or links to open next.",
                  },
                ].map((item) => (
                  <div className="rounded-[24px] border border-black/10 bg-white px-5 py-4 shadow-sm" key={item.stepLabel}>
                    <p className="text-sm font-semibold text-slate-500">Step {item.stepLabel}</p>
                    <p className="mt-2 font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel space-y-4 p-5">
              <div>
                <p className="eyebrow">Study start</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{selectedTopics[0]?.title ?? "Starter topic"} first</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The first screen after this will be the study assistant, already pointed at the chosen topic.
                </p>
              </div>
              <div className="rounded-[22px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Subject</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{selectedSubject?.name ?? "Starter track"}</p>
              </div>
              <div className="rounded-[22px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Age profile</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{age === "" ? "Balanced default" : `${age} years old`}</p>
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
              <div className="rounded-[22px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Built-in tools</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Voice input", "Video demo", "Quiz feedback", "Revision links"].map((item) => (
                    <span className="pill" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          {errorMessage ? (
            <p aria-live="assertive" className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {!errorMessage && warningMessage ? (
            <p aria-live="polite" className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700" role="status">
              {warningMessage}
            </p>
          ) : null}

          <div className="flex gap-3">
            {step > 0 ? (
              <button
                aria-label="Go back to the previous step"
                className="button-secondary"
                disabled={isSubmitting}
                onClick={() => setStep((current) => current - 1)}
                type="button"
              >
                Back
              </button>
            ) : null}
            <button className="button-secondary" disabled={isSubmitting} onClick={() => void completeOnboarding()} type="button">
              {isSubmitting ? "Saving..." : "Use defaults"}
            </button>
          </div>

          {step < TOTAL_STEPS - 1 ? (
            <button
              aria-label={`Continue to step ${step + 2}`}
              className="button-primary"
              disabled={isSubmitting}
              onClick={() => setStep((current) => current + 1)}
              type="button"
            >
              Continue
            </button>
          ) : (
            <button aria-label="Complete onboarding and launch LearnX" className="button-primary" disabled={isSubmitting} onClick={() => void completeOnboarding()} type="button">
              {isSubmitting ? "Starting..." : "Start studying"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
