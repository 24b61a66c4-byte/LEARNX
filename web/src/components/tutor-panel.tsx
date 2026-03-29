"use client";

import Link from "next/link";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";

import {
  EXAM_WORD_HINTS,
  SUBJECT_SAMPLE_PROMPTS,
  TUTOR_MAX_PROMPT_LENGTH,
  TUTOR_MODE_LABELS,
} from "@/lib/constants";
import { getLessonByTopicId } from "@/lib/data/catalog";
import { catalogGateway, tutorGateway } from "@/lib/gateways";
import { SubjectId, TutorMode, TutorThread } from "@/lib/types";

function createThreadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `thread-${Date.now()}`;
}

const modeDescriptions: Record<TutorMode, string> = {
  explain: "Use the copilot like a short lecture plus guided explanation.",
  "exam-answer": "Turn the topic into compact exam-ready writing without leaving the page.",
  "quiz-me": "Bounce into a tutor-led self-check while the concept is still fresh.",
};

const responseStages = [
  "Analyzing the topic",
  "Structuring the explanation",
  "Preparing notes and next steps",
];

interface TutorPanelProps {
  defaultSubjectId?: SubjectId;
  defaultTopicId?: string;
}

export function TutorPanel({ defaultSubjectId = "dbms", defaultTopicId }: TutorPanelProps) {
  const subjects = catalogGateway.getSubjects();
  const [subjectId, setSubjectId] = useState<SubjectId>(defaultSubjectId);
  const [topicId, setTopicId] = useState<string>(defaultTopicId ?? "");
  const [mode, setMode] = useState<TutorMode>("explain");
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thread, setThread] = useState<TutorThread | null>(null);
  const [responseStageIndex, setResponseStageIndex] = useState(0);

  const availableTopics = useMemo(() => catalogGateway.getTopicsBySubject(subjectId), [subjectId]);
  const wordCount = prompt.trim().length === 0 ? 0 : prompt.trim().split(/\s+/).length;
  const samplePrompts = SUBJECT_SAMPLE_PROMPTS[subjectId] ?? SUBJECT_SAMPLE_PROMPTS.dbms;
  const selectedTopic = availableTopics.find((topic) => topic.id === topicId);
  const lesson = selectedTopic ? getLessonByTopicId(selectedTopic.id) : null;
  const noteSeeds = [
    selectedTopic?.summary,
    lesson?.blocks[0]?.content[0],
    mode === "exam-answer" ? EXAM_WORD_HINTS["exam-answer"] : "Ask for examples, then turn them into notes.",
  ].filter(Boolean) as string[];
  const researchCards = [
    {
      label: "Lecture lane",
      title: selectedTopic ? `Teach ${selectedTopic.title} like a short class` : "Ask for a lecture-style explanation",
      detail: "This should feel closer to a teacher or a focused video recap than a generic chatbot answer.",
    },
    {
      label: "Search lane",
      title: selectedTopic ? `What should I search next for ${selectedTopic.title}?` : "Ask what to search next",
      detail: "Use the tutor to generate smart web-search directions, examples, and keywords.",
    },
    {
      label: "Note lane",
      title: selectedTopic ? `Convert ${selectedTopic.title} into revision notes` : "Turn answers into notes",
      detail: "Collect note-ready lines, exam points, and correction cards in the same workspace.",
    },
  ];

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

  async function submitPrompt() {
    if (!prompt.trim()) {
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
        subjectId,
        topicId: topicId || undefined,
        prompt: prompt.trim(),
        mode,
      });

      const assistantMessage = {
        id: createThreadId(),
        role: "assistant" as const,
        mode,
        text: `${response.aiResponse.text}\n\n${response.followUpPrompt}\n\n(Model: ${response.aiResponse.model}, latency: ${response.aiResponse.latencyMs} ms)`,
        createdAt: new Date().toISOString(),
      };

      const nextThread: TutorThread = {
        id: threadId,
        subjectId,
        topicId: topicId || undefined,
        updatedAt: new Date().toISOString(),
        messages: [...(thread?.messages ?? []), userMessage, assistantMessage],
      };

      tutorGateway.appendThread(nextThread);
      setThread(nextThread);
      setPrompt("");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "The copilot could not respond.";
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

  return (
    <section className="space-y-5">
      <div className="surface-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Study copilot</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Keep chat, search thinking, and note-making in the same lane
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This is the student-facing assistant lane. It should feel like ChatGPT plus a tutor plus a web guide,
              not a separate AI tool bolted onto the app.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="reward-chip">{TUTOR_MODE_LABELS[mode]}</span>
            <span className="reward-chip">Notes-ready</span>
          </div>
        </div>
      </div>

      <div className="surface-panel p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-800">
            Subject
            <select
              className="field"
              onChange={(event) => setSubjectId(event.target.value as SubjectId)}
              value={subjectId}
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-800">
            Topic
            <select className="field" onChange={(event) => setTopicId(event.target.value)} value={topicId}>
              <option value="">General subject help</option>
              {availableTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {researchCards.map((card) => (
            <div className="rounded-[24px] border border-black/10 bg-white/80 p-4 shadow-sm" key={card.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
              <p className="mt-2 font-semibold text-slate-950">{card.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[24px] border border-white/35 bg-white/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Notebook seeds</p>
          <div className="mt-3 space-y-2">
            {noteSeeds.map((seed) => (
              <div className="rounded-[20px] bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700" key={seed}>
                {seed}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card space-y-5 p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Live thread</p>
              <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                Ask for clarity, web directions, note conversion, or a quiz
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{modeDescriptions[mode]}</p>
            </div>
            {mode !== "explain" ? <span className="pill">{EXAM_WORD_HINTS[mode]}</span> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Try one student-style prompt</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {samplePrompts.map((item) => (
              <button
                className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                key={item}
                onClick={() => setPrompt(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {(Object.keys(TUTOR_MODE_LABELS) as TutorMode[]).map((item) => (
            <button
              className={`rounded-[22px] border px-4 py-4 text-left transition ${
                mode === item ? "border-teal-500 bg-teal-50 shadow-sm" : "border-black/10 bg-white hover:bg-slate-50"
              }`}
              key={item}
              onClick={() => setMode(item)}
              type="button"
            >
              <p className="font-semibold text-slate-950">{TUTOR_MODE_LABELS[item]}</p>
              <p className="mt-1 text-sm text-slate-600">{modeDescriptions[item]}</p>
            </button>
          ))}
        </div>

        <div className="surface-panel max-h-96 space-y-3 overflow-y-auto p-4">
          {thread?.messages?.length ? (
            thread.messages.map((message) => (
              <article
                className={`rounded-[24px] px-4 py-3 text-sm leading-6 ${
                  message.role === "assistant" ? "bg-teal-50 text-slate-800" : "bg-slate-950 text-white"
                }`}
                key={message.id}
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                  {message.role === "assistant" ? "LearnX copilot" : "You"}
                </p>
                <p className="whitespace-pre-line">{message.text}</p>
              </article>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-500">
              Start with a doubt, ask what to search, or request note-ready lines for the topic on screen.
            </div>
          )}
          {sending ? (
            <div className="space-y-3 rounded-[24px] bg-slate-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                {responseStages[responseStageIndex]}
              </p>
              <div className="h-2 w-2/3 animate-pulse rounded bg-slate-300" />
              <div className="h-2 w-1/2 animate-pulse rounded bg-slate-300" />
              <div className="h-2 w-1/3 animate-pulse rounded bg-slate-300" />
            </div>
          ) : null}
        </div>

        {selectedTopic ? (
          <div className="rounded-[24px] border border-black/10 bg-white/82 px-4 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Best next step after the answer</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Use the same topic immediately in a short drill so the explanation turns into retention.
                </p>
              </div>
              <Link className="button-secondary" href={`/app/learn/${subjectId}/${selectedTopic.id}#drill-dock`}>
                Start topic check
              </Link>
            </div>
          </div>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">Workspace prompt</span>
          <textarea
            className="field min-h-32 resize-y"
            onKeyDown={handlePromptKeyDown}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Explain the topic like a short lecture, tell me what to search next, and turn the answer into notes. (Enter to send, Shift+Enter for newline)"
            value={prompt}
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{wordCount} words</span>
            <span>{prompt.length}/{TUTOR_MAX_PROMPT_LENGTH} chars</span>
          </div>
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <button
          className="button-primary w-full"
          disabled={sending || !prompt.trim()}
          onClick={submitPrompt}
          type="button"
        >
          {sending ? "Generating response..." : "Send to copilot"}
        </button>
      </div>
    </section>
  );
}
