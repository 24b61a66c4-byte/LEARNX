import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonBlock } from "@/components/lesson-block";
import { PracticeWorkspace } from "@/components/practice-workspace";
import { ResumeTracker } from "@/components/resume-tracker";
import { SearchLane } from "@/components/search-lane";
import { StudySupportDock } from "@/components/study-support-dock";
import { TopicNotesPanel } from "@/components/topic-notes-panel";
import { TopicStudioOverview } from "@/components/topic-studio-overview";
import { TutorPanel } from "@/components/tutor-panel";
import { getSubjectById } from "@/lib/data/catalog";
import { getPublicAskHref, getPublicPracticeHref, resolveSubjectIdFromSegment, resolveTopicIdFromSegment } from "@/lib/public-routes";
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

  return (
    <section className="space-y-6">
      <ResumeTracker topicId={topic.id} />

      <div className="surface-card overflow-hidden p-6">
        <div className={`rounded-[32px] bg-gradient-to-br ${subject.accent} p-6 sm:p-7`}>
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-4">
              <p className="eyebrow">{subject.name} studio</p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{topic.title}</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">{topic.summary}</p>
              <div className="flex flex-wrap gap-2">
                {topic.tags.map((tag) => (
                  <span className={`pill ${subject.backdrop}`} key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="button-primary" href={getPublicAskHref(resolvedSubjectId, resolvedTopicId)}>
                  Open ask studio
                </Link>
                <Link className="button-secondary" href={getPublicPracticeHref(resolvedSubjectId, resolvedTopicId)}>
                  Open drill mode
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/78 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Topic flight plan</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-[22px] bg-white/86 px-4 py-4 shadow-sm">
                  <p className="text-sm text-slate-500">Lesson map</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{lesson?.blocks.length ?? 0}</p>
                  <p className="mt-1 text-sm text-slate-600">guided blocks</p>
                </div>
                <div className="rounded-[22px] bg-white/86 px-4 py-4 shadow-sm">
                  <p className="text-sm text-slate-500">Search cues</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{workspaceContext.searchSuggestions.length}</p>
                  <p className="mt-1 text-sm text-slate-600">web prompts ready</p>
                </div>
                <div className="rounded-[22px] bg-slate-950 px-4 py-4 text-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                  <p className="text-sm text-slate-300">Closeout</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">Note + drill</p>
                  <p className="mt-1 text-sm text-slate-300">Do not leave the topic cold.</p>
                </div>
              </div>
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

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-6">
          <TopicStudioOverview
            lessonBlockCount={lesson?.blocks.length ?? 0}
            topicId={topic.id}
            topicTitle={topic.title}
          />
        </div>

        <div className="space-y-5">
          <div className="surface-card scroll-mt-28 p-6" id="topic-lesson">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Lesson center</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Stay with one topic until it actually clicks
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="pill">Read</span>
                <span className="pill">Search</span>
                <span className="pill">Notes</span>
                <span className="pill">Drill</span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Read first, then clarify, save, and test. The whole point of this page is to stop the study flow from
              breaking into tabs and disconnected tools.
            </p>
          </div>

          <div className="space-y-4">
            {lesson?.blocks?.map((block) => (
              <LessonBlock block={block} key={block.id} />
            ))}
          </div>

          <StudySupportDock
            defaultTab="search"
            description="Search examples or capture notes without pulling attention away from the lesson."
            notes={
              <TopicNotesPanel
                key={`notes-${topic.id}`}
                seedNotes={workspaceContext.noteSeeds}
                subjectId={resolvedSubjectId}
                topicId={topic.id}
                topicTitle={topic.title}
              />
            }
            search={
              <SearchLane
                sectionId="search-lane"
                key={`search-${topic.id}`}
                searchSuggestions={workspaceContext.searchSuggestions}
                tags={topic.tags}
                topicSummary={topic.summary}
                topicTitle={topic.title}
                watchLane={workspaceContext.watchLane}
              />
            }
            title="Search & notes"
          />
          <PracticeWorkspace defaultSubjectId={resolvedSubjectId} defaultTopicId={topic.id} />
        </div>
      </div>
    </section>
  );
}
