"use client";

import { useMemo, useState } from "react";

import { catalogGateway, practiceGateway } from "@/lib/gateways";
import { SubjectId } from "@/lib/types";

interface PracticeWorkspaceProps {
  defaultSubjectId?: SubjectId;
  defaultTopicId?: string;
}

export function PracticeWorkspace({
  defaultSubjectId = "dbms",
  defaultTopicId,
}: PracticeWorkspaceProps) {
  const [subjectId, setSubjectId] = useState<SubjectId>(defaultSubjectId);
  const [topicId, setTopicId] = useState(defaultTopicId ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReturnType<typeof practiceGateway.submit> | null>(null);

  const subjects = catalogGateway.getSubjects();
  const topicOptions = useMemo(() => catalogGateway.getTopicsBySubject(subjectId), [subjectId]);
  const questions = practiceGateway.getQuickPractice(subjectId, topicId || undefined);
  const hasQuestions = questions.length > 0;

  return (
    <section className="surface-card space-y-5 p-5">
      <div className="space-y-2">
        <p className="eyebrow">Quick practice</p>
        <h3 className="text-2xl font-bold tracking-tight text-slate-950">
          Run a 5-question drill without leaving the app
        </h3>
        <p className="text-sm leading-6 text-slate-600">
          Practice history is local-only in this slice, but the scoring contract is already separated behind a gateway.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold text-slate-800">
          Subject
          <select
            className="field"
            onChange={(event) => {
              setSubjectId(event.target.value as SubjectId);
              setTopicId("");
              setAnswers({});
              setResult(null);
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
              setResult(null);
            }}
            value={topicId}
          >
            <option value="">Mixed subject practice</option>
            {topicOptions.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasQuestions ? (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <article className="surface-panel space-y-4 p-5" key={question.id}>
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-lg font-semibold text-slate-950">
                  {index + 1}. {question.prompt}
                </h4>
                <span className="pill">{question.type === "MCQ" ? "MCQ" : "Short answer"}</span>
              </div>

              {question.type === "MCQ" ? (
                <div className="grid gap-3">
                  {question.options.map((option) => (
                    <label
                      className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
                      key={option}
                    >
                      <input
                        checked={answers[question.id] === option}
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
                </div>
              ) : (
                <textarea
                  className="field min-h-24 resize-y"
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="Type your answer in simple exam language..."
                  value={answers[question.id] ?? ""}
                />
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-500">
          No question bank is seeded for this exact topic yet. Switch to mixed subject practice to keep moving.
        </div>
      )}

      <button
        className="button-primary w-full"
        disabled={!hasQuestions}
        onClick={() =>
          setResult(
            practiceGateway.submit({
              subjectId,
              topicId: topicId || undefined,
              answers: questions.map((question) => ({
                questionId: question.id,
                answer: answers[question.id] ?? "",
              })),
            }),
          )
        }
        type="button"
      >
        Submit practice
      </button>

      {result ? (
        <div className="surface-panel space-y-5 p-5">
          <div>
            <p className="eyebrow">Result</p>
            <h4 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {result.scorePercent}% score
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              {result.correctCount} correct out of {result.totalCount}.
            </p>
          </div>

          <div className="space-y-3">
            {result.answers.map((answer) => (
              <article
                className={`rounded-2xl border px-4 py-4 ${answer.correct ? "border-teal-200 bg-teal-50" : "border-rose-200 bg-rose-50"
                  }`}
                key={answer.questionId}
              >
                <p className="font-semibold text-slate-950">{answer.prompt}</p>
                <p className="mt-2 text-sm text-slate-700">
                  <strong>Your answer:</strong> {answer.learnerAnswer || "No answer"}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  <strong>Expected:</strong> {answer.correctAnswer}
                </p>
                <p className="mt-2 text-sm text-slate-600">{answer.explanation}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
