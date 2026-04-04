import Link from "next/link";

import { AskStudioShell } from "@/components/ask-studio-shell";
import { TutorPanel } from "@/components/tutor-panel";
import { getSubjectById, getTopicsBySubject } from "@/lib/data/catalog";
import {
  getPublicPracticeHref,
  getPublicSubjectHref,
  resolveSubjectIdFromSegment,
  resolveTopicIdFromSegment,
} from "@/lib/public-routes";
import { getTopicWorkspaceContext } from "@/lib/topic-workspace";

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{
    subjectId?: string;
    topicId?: string;
    prompt?: string;
  }>;
}) {
  const params = await searchParams;
  const subjectId = resolveSubjectIdFromSegment(params.subjectId) ?? undefined;
  const subject = subjectId ? getSubjectById(subjectId) : null;
  const topicId = subject && params.topicId ? resolveTopicIdFromSegment(params.topicId) ?? undefined : undefined;
  const prompt = params.prompt?.trim() || "";
  const subjectTopics = subject ? getTopicsBySubject(subject.id) : [];
  const workspaceContext = topicId && subject ? getTopicWorkspaceContext(subject.id, topicId) : null;

  // Open-ended ask: users can ask without selecting a subject first
  // Subject context is optional for enhanced answers
  return (
    <section className="space-y-6">
      {subject && <AskStudioShell activeTopicId={topicId} subject={subject} topics={subjectTopics} />}

      {!subject ? (
        <div className="rounded-[32px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Open study mode</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Ask anything and study in one thread</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Start with one question and continue from there.
              </p>
            </div>
          </div>
        </div>
      ) : !workspaceContext ? (
        <div className="rounded-[32px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Subject study mode</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Ask about {subject.name}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Pick a topic for focused help or ask broadly.
              </p>
            </div>
            <Link className="button-secondary" href={getPublicSubjectHref(subject.id)}>
              Browse all {subject.name} topics
            </Link>
          </div>
        </div>
      ) : null}

      <TutorPanel
        defaultSubjectId={subjectId}
        defaultTopicId={topicId}
        initialPrompt={prompt}
        showContextSelectors={!subjectId}
        showSupportLanes={false}
        key={`tutor-${subjectId || "general"}-${topicId || ""}-${prompt}`}
      />

      {workspaceContext && subject && (
        <div className="rounded-[32px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Next step</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Ready? Try the quiz</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Take a quick quiz on this topic.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {workspaceContext.topic.tags.map((tag) => (
                  <span className={`pill ${subject.backdrop}`} key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Link className="button-primary" href={getPublicPracticeHref(subject.id, workspaceContext.topic.id)}>
              Open quiz
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
