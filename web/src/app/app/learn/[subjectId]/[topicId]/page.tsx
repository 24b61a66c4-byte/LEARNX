import Link from "next/link";
import { notFound } from "next/navigation";

import { ResumeTracker } from "@/components/resume-tracker";
import { TutorPanel } from "@/components/tutor-panel";
import { getSubjectById } from "@/lib/data/catalog";
import { getPublicPracticeHref, resolveSubjectIdFromSegment, resolveTopicIdFromSegment } from "@/lib/public-routes";
import { getTopicWorkspaceContext } from "@/lib/topic-workspace";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ subjectId: string; topicId: string }>;
}) {
  const { subjectId, topicId } = await params;
  const resolvedSubjectId = resolveSubjectIdFromSegment(subjectId) ?? "dbms";
  const resolvedTopicId = resolveTopicIdFromSegment(topicId) ?? topicId;
  const subject = getSubjectById(resolvedSubjectId);
  const workspaceContext = getTopicWorkspaceContext(resolvedSubjectId, resolvedTopicId);
  const topic = workspaceContext?.topic;
  const lesson = workspaceContext?.lesson;

  if (!subject || !workspaceContext || !topic) {
    notFound();
  }

  const previewBlocks = (lesson?.blocks ?? []).slice(0, 3);

  return (
    <section className="space-y-6">
      <ResumeTracker topicId={topic.id} />

      <div className={`overflow-hidden rounded-[36px] border border-black/10 bg-gradient-to-br ${subject.accent} px-6 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.1)] sm:px-7`}>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow">{subject.name}</p>
              {topic.tags.map((tag) => (
                <span className={`pill ${subject.backdrop}`} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{topic.title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">{topic.summary}</p>
          </div>

          <div className="rounded-[28px] border border-white/40 bg-white/76 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Study loop</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[22px] bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm text-slate-500">Step 1</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">Ask until it clicks</p>
                <p className="mt-1 text-sm text-slate-600">Keep the explanation and follow-up questions in one thread.</p>
              </div>
              <div className="rounded-[22px] bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-sm text-slate-500">Step 2</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">Take the quiz</p>
                <p className="mt-1 text-sm text-slate-600">Move to the topic quiz while the idea is still fresh.</p>
              </div>
              <Link className="button-primary w-full" href={getPublicPracticeHref(resolvedSubjectId, resolvedTopicId)}>
                Go to topic quiz
              </Link>
            </div>
          </div>
        </div>
      </div>

      <TutorPanel
        defaultSubjectId={resolvedSubjectId}
        defaultTopicId={topic.id}
        sectionId="tutor-lane"
        showContextSelectors={false}
        showFloatingActions={false}
        showSupportLanes={false}
      />

      {previewBlocks.length > 0 ? (
        <section className="rounded-[34px] border border-black/10 bg-white/82 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Lesson snapshot</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Use these anchors while chatting</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Keep the chat as the main workspace. These blocks are just enough grounding before the quiz.
              </p>
            </div>
            <Link className="button-secondary" href={getPublicPracticeHref(resolvedSubjectId, resolvedTopicId)}>
              Ready for the quiz
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {previewBlocks.map((block) => (
              <article className="rounded-[24px] border border-black/10 bg-white p-5 shadow-sm" key={block.id}>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {block.kind.replace(/-/g, " ")}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{block.title}</h3>
                <div className="mt-3 space-y-2">
                  {block.content.slice(0, 2).map((item) => (
                    <p className="text-sm leading-6 text-slate-600" key={item}>
                      {item}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
