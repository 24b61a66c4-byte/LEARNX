"use client";

import { useEffect, useMemo, useState } from "react";

import { catalogGateway, tutorGateway } from "@/lib/gateways";
import { SubjectId, TutorMode, TutorThread } from "@/lib/types";

const modeLabels: Record<TutorMode, string> = {
  explain: "Explain",
  "exam-answer": "Exam answer",
  "quiz-me": "Quiz me",
};

function createThreadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `thread-${Date.now()}`;
}

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

  const availableTopics = useMemo(() => catalogGateway.getTopicsBySubject(subjectId), [subjectId]);

  useEffect(() => {
    const existing = tutorGateway
      .getThreads()
      .find((item) => item.subjectId === subjectId && (item.topicId ?? "") === (topicId || ""));
    setThread(existing ?? null);
  }, [subjectId, topicId]);

  async function submitPrompt() {
    if (!prompt.trim()) {
      return;
    }

    setSending(true);
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
        text: `${response.answer}\n\n${response.followUpPrompt}`,
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
    } catch {
      setError("The mock tutor could not respond. Try again once more.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="surface-card space-y-5 p-5">
      <div className="space-y-2">
        <p className="eyebrow">Tutor workspace</p>
        <h3 className="text-2xl font-bold tracking-tight text-slate-950">
          Ask for clarity, exam answers, or a quick self-check
        </h3>
        <p className="text-sm leading-6 text-slate-600">
          This slice uses local mock responses, but keeps the tutor contract shaped for future API wiring.
        </p>
      </div>

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

      <div className="flex flex-wrap gap-2">
        {(Object.keys(modeLabels) as TutorMode[]).map((item) => (
          <button
            className={`pill ${mode === item ? "bg-slate-950 text-white" : ""}`}
            key={item}
            onClick={() => setMode(item)}
            type="button"
          >
            {modeLabels[item]}
          </button>
        ))}
      </div>

      <div className="surface-panel max-h-80 space-y-3 overflow-y-auto p-4">
        {thread?.messages?.length ? (
          thread.messages.map((message) => (
            <article
              className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "assistant" ? "bg-teal-50 text-slate-800" : "bg-slate-950 text-white"
              }`}
              key={message.id}
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                {message.role === "assistant" ? "LearnX tutor" : "You"}
              </p>
              <p className="whitespace-pre-line">{message.text}</p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-500">
            Ask about a topic, request an exam-style answer, or switch to quiz mode for a self-check.
          </div>
        )}
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-800">Prompt</span>
        <textarea
          className="field min-h-28 resize-y"
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Explain joins with one easy example and then give me a 5-mark answer."
          value={prompt}
        />
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
        {sending ? "Generating response..." : "Send to tutor"}
      </button>
    </section>
  );
}
