"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { syncPracticeResult } from "@/lib/backend-sync";
import { PRACTICE_QUESTION_TARGET } from "@/lib/constants";
import { getSubjectById, getTopicById } from "@/lib/data/catalog";
import { catalogGateway, practiceGateway } from "@/lib/gateways";
import { getPublicAskHref, getPublicPracticeResultsHref, getPublicSubjectHref } from "@/lib/public-routes";
import { SubjectId, Topic } from "@/lib/types";

interface PracticeWorkspaceProps {
  defaultSubjectId?: SubjectId;
  defaultTopicId?: string;
}

export function PracticeWorkspace({
  defaultSubjectId = "dbms",
  defaultTopicId,
}: PracticeWorkspaceProps) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState<SubjectId>(defaultSubjectId);
  const [topicId, setTopicId] = useState(defaultTopicId ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scoring, setScoring] = useState(false);

  const subjects = catalogGateway.getSubjects();
  const topicOptions = useMemo(() => catalogGateway.getTopicsBySubject(subjectId), [subjectId]);
  const questions = useMemo(
    () => practiceGateway.getQuickPractice(subjectId, topicId || undefined),
    [subjectId, topicId],
  );
  const focusTopics = useMemo(
    () =>
      [...new Set(questions.map((question) => question.topicId))]
        .map((questionTopicId) => getTopicById(questionTopicId))
        .filter((topic): topic is Topic => Boolean(topic)),
    [questions],
  );
  const isTopicLocked = Boolean(defaultTopicId);
  const hasQuestions = questions.length > 0;
  const answeredCount = questions.filter((question) => Boolean(answers[question.id]?.trim())).length;
  const selectedTopic = topicOptions.find((topic) => topic.id === topicId);
  const subjectName = getSubjectById(subjectId)?.name ?? "this subject";
  const focusLabel =
    focusTopics.length > 0 ? focusTopics.map((topic) => topic.title).join(" • ") : `${subjectName} adaptive mix`;

  async function handleScore() {
    const nextResult = practiceGateway.submit({
      subjectId,
      topicId: topicId || undefined,
      answers: questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id] ?? "",
      })),
    });

    setScoring(true);
    void syncPracticeResult(nextResult).catch(() => undefined);
    router.push(getPublicPracticeResultsHref(subjectId, topicId || undefined));
  }

  return (
    <section className="surface-card scroll-mt-28 space-y-5 p-5" id="drill-dock">
      <div className="space-y-3">
        <div>
          <p className="eyebrow">Quiz</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-950">Test the topic while it is still fresh</h3>
          <p className="text-sm leading-6 text-slate-600">
            Finish the quiz and get a simple fix list.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/35 bg-white/70 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Quiz progress</p>
                <p className="mt-1 text-xs text-slate-500">
                  Answer every question to submit.
                </p>
              </div>
              <span className="reward-chip">
                {answeredCount}/{questions.length || PRACTICE_QUESTION_TARGET} answered
              </span>
            </div>
            <div className="momentum-meter mt-4">
              {Array.from({ length: Math.max(questions.length, PRACTICE_QUESTION_TARGET) }).map((_, index) => (
                <span data-active={index < answeredCount} key={index} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/35 bg-white/70 px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">Focus</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{focusLabel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {focusTopics.map((topic) => (
                <span className="pill" key={topic.id}>
                  {topic.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isTopicLocked ? (
        <div className="flex flex-wrap gap-2">
          <span className="pill">Subject: {subjectName}</span>
          {selectedTopic ? <span className="pill">Topic: {selectedTopic.title}</span> : null}
          <span className="pill">{questions.length || PRACTICE_QUESTION_TARGET} questions</span>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-800">
            Subject
            <select
              className="field"
              onChange={(event) => {
                setSubjectId(event.target.value as SubjectId);
                setTopicId("");
                setAnswers({});
                setScoring(false);
              }}
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
            <select
              className="field"
              onChange={(event) => {
                setTopicId(event.target.value);
                setAnswers({});
                setScoring(false);
              }}
              value={topicId}
            >
              <option value="">Adaptive mix from this subject</option>
              {topicOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {hasQuestions ? (
        <div className="space-y-4">
          {questions.map((question, index) => {
            const questionTopic = getTopicById(question.topicId);

            return (
              <article className="surface-panel space-y-4 p-5" key={question.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Question {index + 1}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-slate-950">{question.prompt}</h4>
                    {questionTopic ? (
                      <p className="mt-2 text-sm text-slate-500">Focus topic: {questionTopic.title}</p>
                    ) : null}
                  </div>
                  <span className="pill">{question.type === "MCQ" ? "Multiple choice" : "Short answer"}</span>
                </div>

                {question.type === "MCQ" ? (
                  <fieldset className="space-y-3">
                    <legend className="sr-only">Select your answer</legend>
                    {question.options.map((option, optionIndex) => (
                      <label
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2"
                        key={option}
                      >
                        <input
                          aria-label={`Option ${String.fromCharCode(65 + optionIndex)}: ${option}`}
                          checked={answers[question.id] === option}
                          className="focus:outline-none"
                          name={question.id}
                          onChange={() =>
                            setAnswers((current) => ({
                              ...current,
                              [question.id]: option,
                            }))
                          }
                          type="radio"
                        />
                        <span className="text-sm text-slate-700">{option}</span>
                      </label>
                    ))}
                  </fieldset>
                ) : (
                  <textarea
                    aria-label={`Write your answer to: ${question.prompt}`}
                    className="field min-h-24 resize-y focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: event.target.value,
                      }))
                    }
                    placeholder="Write it the way you would explain it in class, in a notebook, or in a test answer..."
                    value={answers[question.id] ?? ""}
                  />
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-500">
          <p>No question bank is available for this subject yet. Keep the lesson open and use the tutor for now.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link className="button-secondary" href={getPublicAskHref(subjectId)}>
              Open tutor for this subject
            </Link>
            <Link className="button-secondary" href={getPublicSubjectHref(subjectId)}>
              Review subject topics
            </Link>
          </div>
        </div>
      )}

      {hasQuestions ? (
        <div className="space-y-2">
          <button
            aria-label={`Score this drill (${answeredCount}/${questions.length} questions answered)`}
            className="button-primary w-full focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            disabled={answeredCount < questions.length || scoring}
            onClick={() => {
              void handleScore();
            }}
            type="button"
          >
            {answeredCount < questions.length
              ? "Finish all answers to unlock results"
              : scoring
                ? "Opening your results"
                : "Submit quiz and see results"}
          </button>
          <p className="text-center text-xs text-slate-500">
            {answeredCount < questions.length
              ? "Submit is enabled when all answers are filled."
              : "Results page is ready."}
          </p>
        </div>
      ) : null}

      {selectedTopic ? (
        <div className="surface-panel p-5">
          <p className="eyebrow">Need help before submitting?</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Open the study assistant for {selectedTopic.title} and ask one quick doubt.
          </p>
          <Link className="button-secondary mt-4" href={getPublicAskHref(subjectId, selectedTopic.id)}>
            Back to study assistant
          </Link>
        </div>
      ) : null}
    </section>
  );
}
