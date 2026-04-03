"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { useClientSnapshot } from "@/lib/client-snapshot";
import { getSubjectById, getTopicById } from "@/lib/data/catalog";
import { practiceGateway } from "@/lib/gateways";
import {
  getPublicAskHref,
  getPublicLearnHref,
  getPublicPracticeHref,
  getPublicSubjectHref,
  resolveSubjectIdFromSegment,
  resolveTopicIdFromSegment,
} from "@/lib/public-routes";
import { getTopicWorkspaceContext } from "@/lib/topic-workspace";
import { PracticeResult, Topic } from "@/lib/types";

function buildSearchHref(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildVideoHref(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function getResultTone(result: PracticeResult) {
  if (result.scorePercent >= 90) {
    return {
      label: "Strong retention",
      detail: "The learner is ready for one harder follow-up or a cleaner revision note.",
    };
  }

  if (result.scorePercent >= 70) {
    return {
      label: "Almost there",
      detail: "A short repair pass on the misses should be enough before the next drill.",
    };
  }

  return {
    label: "Repair loop needed",
    detail: "Stay on the same concept, review the misses, and then retry while the context is still fresh.",
  };
}

export function PracticeResultsPanel() {
  const searchParams = useSearchParams();
  const fallbackSubjectId = resolveSubjectIdFromSegment(searchParams.get("subjectId")) ?? "dbms";
  const fallbackTopicId = resolveTopicIdFromSegment(searchParams.get("topicId")) ?? undefined;
  const resultState = useClientSnapshot(
    () => ({
      latest: practiceGateway.getLatestResult(),
      history: practiceGateway.getHistory(),
    }),
    () => ({
      latest: null as PracticeResult | null,
      history: [] as PracticeResult[],
    }),
  );
  const result = resultState.latest ?? resultState.history[0] ?? null;

  const focusTopicIds = useMemo(() => {
    if (!result) {
      return fallbackTopicId ? [fallbackTopicId] : [];
    }

    return [...new Set([result.topicId, ...result.answers.map((answer) => answer.topicId)].filter(Boolean))] as string[];
  }, [fallbackTopicId, result]);
  const focusTopics = focusTopicIds
    .map((topicId) => getTopicById(topicId))
    .filter((topic): topic is Topic => Boolean(topic));
  const primaryTopic = focusTopics[0] ?? (fallbackTopicId ? getTopicById(fallbackTopicId) : null);
  const subjectId = result?.subjectId ?? fallbackSubjectId;
  const subject = getSubjectById(subjectId);
  const wrongAnswers = result?.answers.filter((answer) => !answer.correct) ?? [];
  const tone = result ? getResultTone(result) : null;
  const workspaceContext =
    primaryTopic && subjectId ? getTopicWorkspaceContext(subjectId, primaryTopic.id) : null;
  const searchLinks = workspaceContext
    ? [
        {
          label: "Web explainer",
          detail: "Open a plain-language explainer for the same topic.",
          href: buildSearchHref(workspaceContext.searchSuggestions[0]),
        },
        {
          label: "Worked examples",
          detail: "Find examples and mistake patterns for the same concept.",
          href: buildSearchHref(workspaceContext.searchSuggestions[1] ?? `${primaryTopic?.title} examples and mistakes`),
        },
        {
          label: "Video recap",
          detail: "Watch a short visual recap if reading alone did not make it click.",
          href: buildVideoHref(`${primaryTopic?.title ?? subject?.name} lecture with examples`),
        },
      ]
    : [];
  const tutorPrompt =
    wrongAnswers.length > 0
      ? `Help me fix these misses in ${primaryTopic?.title ?? subject?.name}: ${wrongAnswers.map((answer) => answer.prompt).join(" | ")}`
      : `Give me one harder follow-up question on ${primaryTopic?.title ?? subject?.name}.`;

  if (!result) {
    return (
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="surface-card p-8">
          <p className="eyebrow">Practice results</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">No scored drill yet</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Finish one drill first, then LearnX will show the score, weak spots, revision prompts, and reference links
            here.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="button-primary" href={getPublicPracticeHref(subjectId, fallbackTopicId)}>
              Start a drill
            </Link>
            <Link className="button-secondary" href={fallbackTopicId ? getPublicLearnHref(subjectId, fallbackTopicId) : getPublicSubjectHref(subjectId)}>
              Open study track
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="surface-card overflow-hidden p-6">
        <div className={`rounded-[32px] bg-gradient-to-br ${subject?.accent ?? "from-slate-200 via-white to-slate-100"} p-6`}>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div>
                <p className="eyebrow">Quiz result</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">{result.scorePercent}% on this drill</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
                  {tone?.detail} You got {result.correctCount} out of {result.totalCount} questions right.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="reward-chip">+{result.xpEarned} XP</span>
                <span className="pill">{tone?.label}</span>
                {result.badgeAwarded ? <span className="pill">{result.badgeAwarded}</span> : null}
                {focusTopics.map((topic) => (
                  <span className="pill" key={topic.id}>
                    {topic.title}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="button-primary" href={getPublicPracticeHref(subjectId, primaryTopic?.id ?? result.topicId)}>
                  Retry this drill
                </Link>
                <Link className="button-secondary" href={getPublicAskHref(subjectId, primaryTopic?.id, tutorPrompt)}>
                  Ask tutor about misses
                </Link>
                <Link
                  className="button-secondary"
                  href={primaryTopic ? getPublicLearnHref(subjectId, primaryTopic.id) : getPublicSubjectHref(subjectId)}
                >
                  Return to topic studio
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="shell-stat-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Questions answered</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{result.totalCount}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Enough to show whether the topic is landing or still needs repair.</p>
              </div>
              <div className="shell-stat-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Needs review</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{wrongAnswers.length}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Use the misses to drive the next tutor prompt and note card.</p>
              </div>
              <div className="shell-stat-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Next move</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{tone?.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {wrongAnswers.length > 0 ? "Repair the misses, then retry." : "Move to a harder follow-up or save a revision note."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <div className="surface-panel p-6">
            <p className="eyebrow">Fix next</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Turn the misses into your next study step</h2>
            {wrongAnswers.length > 0 ? (
              <div className="mt-4 space-y-3">
                {wrongAnswers.slice(0, 4).map((answer) => (
                  <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm" key={answer.questionId}>
                    <p className="font-semibold text-slate-950">{answer.prompt}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      <strong>Expected:</strong> {answer.correctAnswer}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{answer.explanation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
                <p className="font-semibold text-emerald-900">No repair queue this time</p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  The learner cleared the full drill. This is a good moment to save one strong note and move to a harder follow-up.
                </p>
              </div>
            )}
          </div>

          <div className="surface-panel p-6">
            <p className="eyebrow">Notes to save</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Quick revision cards worth keeping</h2>
            <div className="mt-4 grid gap-3">
              {(wrongAnswers.length > 0 ? wrongAnswers : result.answers.slice(0, 2)).map((answer) => (
                <div className="rounded-[24px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm" key={`note-${answer.questionId}`}>
                  <p className="text-sm font-semibold text-slate-950">Turn this into a note card</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{answer.prompt}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Write: what the correct idea is, what mistake to avoid, and one example to remember next time.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-6">
            <p className="eyebrow">Watch and search</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Use real sources for the repair pass</h2>
            <div className="mt-4 space-y-3">
              {searchLinks.map((link) => (
                <a
                  className="block rounded-[24px] border border-black/10 bg-white/84 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                  href={link.href}
                  key={link.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <p className="text-sm font-semibold text-slate-950">{link.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{link.detail}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="surface-panel p-6">
            <p className="eyebrow">Answer breakdown</p>
            <div className="mt-4 space-y-3">
              {result.answers.map((answer) => (
                <article
                  className={`rounded-[24px] border px-4 py-4 shadow-sm ${
                    answer.correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                  }`}
                  key={answer.questionId}
                >
                  <p className="font-semibold text-slate-950">{answer.prompt}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    <strong>Your answer:</strong> {answer.learnerAnswer || "No answer"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    <strong>Expected:</strong> {answer.correctAnswer}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{answer.explanation}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
