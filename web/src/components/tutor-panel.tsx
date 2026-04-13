"use client";

import Link from "next/link";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import { StudyVideoDemo } from "@/components/study-video-demo";
import {
  EXAM_WORD_HINTS,
  SUBJECT_SAMPLE_PROMPTS,
  TUTOR_MAX_PROMPT_LENGTH,
  TUTOR_MODE_LABELS,
} from "@/lib/constants";
import { getLessonByTopicId } from "@/lib/data/catalog";
import { catalogGateway, tutorGateway } from "@/lib/gateways";
import { getPublicPracticeHref } from "@/lib/public-routes";
import { StudyDiagnosis, SubjectId, TutorMode, TutorThread } from "@/lib/types";

type SpeechRecognitionResultLike = {
  0?: {
    transcript?: string;
  };
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const modeDescriptions: Record<TutorMode, string> = {
  explain: "Learn the topic like a short guided class.",
  "exam-answer": "Turn the idea into a clean exam-style answer.",
  "quiz-me": "Get a short self-check before the real quiz starts.",
};

const responseStages = [
  "Understanding the question",
  "Building the explanation",
  "Preparing the next study step",
];

function createThreadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `thread-${Date.now()}`;
}

function buildSearchHref(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildVideoHref(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function getDiagnosisConfidenceLabel(diagnosis: StudyDiagnosis) {
  return `${Math.round(diagnosis.confidence * 100)}% confidence`;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const voiceWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition ?? null;
}

interface TutorPanelProps {
  defaultSubjectId?: SubjectId;
  defaultTopicId?: string;
  initialPrompt?: string;
  showContextSelectors?: boolean;
  showFloatingActions?: boolean;
  showSupportLanes?: boolean;
  sectionId?: string;
}

export function TutorPanel({
  defaultSubjectId,
  defaultTopicId,
  initialPrompt = "",
  showContextSelectors = false,
  showFloatingActions = true,
  showSupportLanes = true,
  sectionId,
}: TutorPanelProps) {
  void showFloatingActions;
  void showSupportLanes;

  const subjects = catalogGateway.getSubjects();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const [subjectId, setSubjectId] = useState<SubjectId | undefined>(defaultSubjectId);
  const [topicId, setTopicId] = useState<string>(defaultTopicId ?? "");
  const [mode, setMode] = useState<TutorMode>("explain");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thread, setThread] = useState<TutorThread | null>(null);
  const [responseStageIndex, setResponseStageIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);

  const activeSubject = useMemo(
    () => (subjectId ? subjects.find((subject) => subject.id === subjectId) : undefined),
    [subjectId, subjects],
  );
  const availableTopics = useMemo(
    () => (subjectId ? catalogGateway.getTopicsBySubject(subjectId) : []),
    [subjectId],
  );
  const selectedTopic = subjectId ? availableTopics.find((topic) => topic.id === topicId) : undefined;
  const lesson = selectedTopic ? getLessonByTopicId(selectedTopic.id) : null;
  const wordCount = prompt.trim().length === 0 ? 0 : prompt.trim().split(/\s+/).length;
  const samplePrompts = subjectId
    ? SUBJECT_SAMPLE_PROMPTS[subjectId] ?? []
    : [
      "Explain this topic simply",
      "Give me one real-life example",
      "Teach it like a short class",
    ];
  const latestAssistantMessage = [...(thread?.messages ?? [])]
    .reverse()
    .find((message) => message.role === "assistant");
  const latestAssistantText = latestAssistantMessage?.text.replace(/\n\n\(Model:[\s\S]*$/, "").trim() ?? "";
  const latestDiagnosis = latestAssistantMessage?.diagnosis ?? null;
  const hasAssistantReply = Boolean(latestAssistantText);
  const practiceHref =
    selectedTopic && subjectId ? getPublicPracticeHref(subjectId, selectedTopic.id) : undefined;
  const targetedPracticeHref = latestDiagnosis?.suggestedDrill?.href || practiceHref;
  const lessonHighlights = (lesson?.blocks ?? []).slice(0, 3);
  const searchQuery = selectedTopic
    ? `${selectedTopic.title} explained with one example`
    : `${activeSubject?.name ?? "study topic"} explained simply`;
  const examSearchQuery = selectedTopic
    ? `${selectedTopic.title} exam answer viva questions`
    : `${activeSubject?.name ?? "study topic"} exam answer`;
  const notePrompt = selectedTopic
    ? `Turn ${selectedTopic.title} into 5 crisp revision notes with one example.`
    : "Turn this explanation into 5 crisp revision notes with one example.";
  const followUpPrompt = selectedTopic
    ? `Before the quiz, ask me 3 quick check questions about ${selectedTopic.title}.`
    : "Before the quiz, ask me 3 quick check questions about this topic.";

  useEffect(() => {
    setVoiceReady(Boolean(getSpeechRecognitionConstructor()) || ("speechSynthesis" in window));
  }, []);

  useEffect(() => {
    const existing = tutorGateway
      .getThreads()
      .find((item) => item.subjectId === subjectId && (item.topicId ?? "") === (topicId || ""));
    setThread(existing ?? null);
  }, [subjectId, topicId]);

  useEffect(() => {
    if (!sending) {
      return;
    }

    const interval = window.setInterval(() => {
      setResponseStageIndex((current) => (current + 1) % responseStages.length);
    }, 900);

    return () => window.clearInterval(interval);
  }, [sending]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function submitPrompt() {
    if (!prompt.trim()) {
      setError("Type a prompt before asking LearnX.");
      return;
    }

    setSending(true);
    setResponseStageIndex(0);
    setError(null);

    const threadId = thread?.id ?? createThreadId();
    const userMessage = {
      id: createThreadId(),
      role: "user" as const,
      mode,
      text: prompt.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await tutorGateway.ask({
        subjectId: subjectId || undefined,
        topicId: topicId || undefined,
        prompt: prompt.trim(),
        mode,
      });

      const assistantMessage = {
        id: createThreadId(),
        role: "assistant" as const,
        mode,
        text: `${response.aiResponse.text}\n\n${response.followUpPrompt}`,
        diagnosis: response.diagnosis ?? null,
        createdAt: new Date().toISOString(),
      };

      const nextThread: TutorThread = {
        id: threadId,
        subjectId: subjectId || undefined,
        topicId: topicId || undefined,
        updatedAt: new Date().toISOString(),
        messages: [...(thread?.messages ?? []), userMessage, assistantMessage],
      };

      tutorGateway.appendThread(nextThread);
      setThread(nextThread);
      setPrompt("");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "LearnX could not respond.";
      setError(message.replace("validation:", "Validation error:"));
    } finally {
      setResponseStageIndex(0);
      setSending(false);
    }
  }

  function handlePromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitPrompt();
    }
  }

  function toggleVoiceInput() {
    if (isListening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    setError(null);
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result?.[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (!transcript) {
        return;
      }

      setPrompt((current) => (current.trim() ? `${current.trim()} ${transcript}` : transcript));
    };

    recognition.onerror = () => {
      setError("Voice capture stopped before a transcript was ready.");
      setIsListening(false);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  function toggleReadAloud() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!latestAssistantText) {
      setError("Ask LearnX first, then play the latest explanation.");
      return;
    }

    setError(null);
    const utterance = new SpeechSynthesisUtterance(latestAssistantText);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className="scroll-mt-24 space-y-5" id={sectionId}>
      {showContextSelectors ? (
        <div className="rounded-[30px] border border-black/10 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <div className="space-y-3">
            <div>
              <p className="eyebrow">Study setup</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Pick a subject or ask freely</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep it open-ended, or connect the chat to one subject and topic before you begin.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-800">
                Subject
                <select
                  className="field"
                  onChange={(event) => {
                    const nextSubjectId = event.target.value || undefined;
                    setSubjectId(nextSubjectId as SubjectId | undefined);
                    setTopicId("");
                  }}
                  value={subjectId ?? ""}
                >
                  <option value="">General ask</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-semibold text-slate-800">
                Topic
                <select
                  className="field"
                  disabled={!subjectId}
                  onChange={(event) => setTopicId(event.target.value)}
                  value={topicId}
                >
                  <option value="">{subjectId ? "General subject help" : "Pick a subject first"}</option>
                  {availableTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_22rem]">
        <div className="rounded-[36px] border border-black/10 bg-white/88 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Study assistant</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Study in one focused thread</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Ask, clarify, and only move to the quiz when the topic feels clear enough.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeSubject ? <span className={`pill ${activeSubject.backdrop}`}>{activeSubject.name}</span> : null}
                {selectedTopic ? <span className="pill">{selectedTopic.title}</span> : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(TUTOR_MODE_LABELS) as TutorMode[]).map((item) => (
                <button
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${mode === item
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-black/10 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  key={item}
                  onClick={() => setMode(item)}
                  type="button"
                >
                  {TUTOR_MODE_LABELS[item]}
                </button>
              ))}
              {mode !== "explain" ? <span className="pill">{EXAM_WORD_HINTS[mode]}</span> : null}
            </div>

            <div className="overflow-hidden rounded-[30px] bg-slate-950 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
              <div className="border-b border-white/8 px-5 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-teal-200">Live thread</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{modeDescriptions[mode]}</p>
              </div>

              <div className="max-h-[30rem] space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
                {thread?.messages?.length ? (
                  thread.messages.map((message) => (
                    <article
                      className={`max-w-[90%] rounded-[24px] px-4 py-3 text-sm leading-7 ${message.role === "assistant"
                          ? "border border-white/10 bg-white/8 text-slate-100"
                          : "ml-auto bg-teal-400/18 text-white"
                        }`}
                      key={message.id}
                    >
                      <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                        {message.role === "assistant" ? "LearnX" : "You"}
                      </p>
                      <p className="whitespace-pre-line">{message.text.replace(/\n\n\(Model:[\s\S]*$/, "")}</p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/12 px-4 py-8 text-center text-sm leading-6 text-slate-400">
                    Start with a question, ask for a simpler explanation, or request a short class-style walkthrough.
                  </div>
                )}

                {sending ? (
                  <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-teal-200">
                      {responseStages[responseStageIndex]}
                    </p>
                    <div className="mt-3 h-2 w-2/3 animate-pulse rounded bg-white/18" />
                    <div className="mt-2 h-2 w-1/2 animate-pulse rounded bg-white/14" />
                    <div className="mt-2 h-2 w-1/3 animate-pulse rounded bg-white/12" />
                  </div>
                ) : null}
              </div>
            </div>

            {latestDiagnosis ? (
              <div className="rounded-[26px] border border-teal-200 bg-teal-50 px-4 py-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-teal-700">
                      Weakness diagnosis
                    </p>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                      Check {latestDiagnosis.weakConcepts[0] ?? "core recall"} next
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                      {latestDiagnosis.nextAction}
                    </p>
                  </div>
                  <span className="reward-chip">{getDiagnosisConfidenceLabel(latestDiagnosis)}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {latestDiagnosis.weakConcepts.map((concept) => (
                    <span className="pill border-teal-200 bg-white text-teal-900" key={concept}>
                      {concept}
                    </span>
                  ))}
                </div>
                <Link className="button-primary mt-4 w-full sm:w-auto" href={latestDiagnosis.suggestedDrill.href}>
                  Start targeted drill
                </Link>
              </div>
            ) : null}

            <div className="rounded-[30px] border border-black/10 bg-[rgba(255,255,255,0.7)] p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Prompt</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Ask for the explanation first, then move to notes or the quiz.
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  {wordCount} words · {prompt.length}/{TUTOR_MAX_PROMPT_LENGTH} chars
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {samplePrompts.map((item) => (
                  <button
                    className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    key={item}
                    onClick={() => setPrompt(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <textarea
                aria-label="Enter your study prompt for LearnX"
                className="mt-4 min-h-36 w-full resize-y rounded-[24px] border border-black/10 bg-white px-4 py-4 text-base leading-8 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={handlePromptKeyDown}
                placeholder="Explain the topic simply, give me one example, or ask me 3 quick check questions."
                value={prompt}
              />

              {error ? (
                <div aria-live="polite" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {error}
                </div>
              ) : null}

              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    onClick={toggleVoiceInput}
                    type="button"
                  >
                    {isListening ? "Stop voice input" : "Voice input"}
                  </button>
                  <button
                    className="inline-flex items-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    disabled={!voiceReady}
                    onClick={toggleReadAloud}
                    type="button"
                  >
                    {isSpeaking ? "Stop reading" : "Read reply aloud"}
                  </button>
                  {targetedPracticeHref ? (
                    <Link
                      className={`inline-flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${hasAssistantReply
                          ? "bg-slate-950 text-white hover:bg-slate-800"
                          : "cursor-not-allowed border border-black/10 bg-white text-slate-400"
                        }`}
                      href={hasAssistantReply ? targetedPracticeHref : "#"}
                      onClick={(event) => {
                        if (!hasAssistantReply) {
                          event.preventDefault();
                        }
                      }}
                    >
                      {hasAssistantReply ? "Start targeted drill" : "Explain first, then drill"}
                    </Link>
                  ) : null}
                </div>

                <button
                  className="button-primary min-w-[12rem] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={sending || !prompt.trim()}
                  onClick={() => {
                    void submitPrompt();
                  }}
                  type="button"
                >
                  {sending ? "Thinking…" : "Ask LearnX"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[30px] border border-white/10 bg-slate-950 p-5 text-white shadow-[0_20px_56px_rgba(15,23,42,0.2)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-teal-200">Study flow</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">Keep the next step obvious</h3>
            <div className="mt-5 space-y-3">
              <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Step 1</p>
                <p className="mt-2 font-semibold text-white">Learn with the assistant</p>
                <p className="mt-1 text-sm leading-6 text-white/60">Ask until the topic feels clear enough to test.</p>
              </div>
              <div className={`rounded-[22px] border px-4 py-4 ${hasAssistantReply ? "border-teal-300/30 bg-teal-400/12" : "border-white/10 bg-white/6"}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Step 2</p>
                <p className="mt-2 font-semibold text-white">Take the quiz</p>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  {practiceHref
                    ? hasAssistantReply
                      ? "You have an explanation now. Move to the quiz while the idea is still fresh."
                      : "Ask one question first, then the quiz button unlocks."
                    : "Pick a topic first if you want a linked topic quiz."}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Step 3</p>
                <p className="mt-2 font-semibold text-white">Review the result</p>
                <p className="mt-1 text-sm leading-6 text-white/60">See what to retry, what to save, and what to watch next.</p>
              </div>
            </div>
          </section>

          {selectedTopic ? (
            <section className="rounded-[30px] border border-black/10 bg-white/78 p-5 backdrop-blur-sm shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
              <p className="eyebrow">Topic snapshot</p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{selectedTopic.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selectedTopic.summary}</p>
              {lessonHighlights.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {lessonHighlights.map((block) => (
                    <div className="rounded-[22px] border border-black/10 bg-white px-4 py-4" key={block.id}>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {block.kind.replace(/-/g, " ")}
                      </p>
                      <p className="mt-2 font-semibold text-slate-950">{block.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{block.content[0]}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <StudyVideoDemo
            prompt={prompt}
            subjectLabel={activeSubject?.name}
            topicSummary={selectedTopic?.summary}
            topicTitle={selectedTopic?.title}
          />

          <section className="rounded-[30px] border border-black/10 bg-white/78 p-5 backdrop-blur-sm shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <p className="eyebrow">Quick tools</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Search, watch, or turn it into notes</h3>
            <div className="mt-4 space-y-3">
              <a
                className="block rounded-[22px] border border-black/10 bg-white px-4 py-4 transition hover:bg-slate-50"
                href={buildSearchHref(searchQuery)}
                rel="noreferrer"
                target="_blank"
              >
                <p className="font-semibold text-slate-950">Search the topic</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Open a focused Google search with a better study query.</p>
              </a>
              <a
                className="block rounded-[22px] border border-black/10 bg-white px-4 py-4 transition hover:bg-slate-50"
                href={buildVideoHref(searchQuery)}
                rel="noreferrer"
                target="_blank"
              >
                <p className="font-semibold text-slate-950">Watch a recap</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Open YouTube results when you want a classroom-style explanation.</p>
              </a>
              <a
                className="block rounded-[22px] border border-black/10 bg-white px-4 py-4 transition hover:bg-slate-50"
                href={buildSearchHref(examSearchQuery)}
                rel="noreferrer"
                target="_blank"
              >
                <p className="font-semibold text-slate-950">Find exam wording</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Search for viva questions, short answers, and answer framing.</p>
              </a>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                onClick={() => {
                  setMode("explain");
                  setPrompt(notePrompt);
                }}
                type="button"
              >
                Turn this into notes
              </button>
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                onClick={() => {
                  setMode("quiz-me");
                  setPrompt(followUpPrompt);
                }}
                type="button"
              >
                Ask for a mini self-check
              </button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
