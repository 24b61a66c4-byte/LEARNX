import Link from "next/link";

import { AskStudioShell } from "@/components/ask-studio-shell";
import { StudySupportDock } from "@/components/study-support-dock";
import { SearchLane } from "@/components/search-lane";
import { TopicNotesPanel } from "@/components/topic-notes-panel";
import { TutorPanel } from "@/components/tutor-panel";
import { getSubjectById, getTopicsBySubject } from "@/lib/data/catalog";
import { getPublicLearnHref, getPublicPracticeHref, getPublicSubjectHref, resolveSubjectIdFromSegment, resolveTopicIdFromSegment } from "@/lib/public-routes";
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
        // No subject selected: completely open-ended ask mode
        <div className="surface-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Ask anything</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                What would you like to learn?
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Ask me any question. Your tutor will personalize the answer based on your age and learning level.
                Optionally pick a subject for more focused answers.
              </p>
            </div>
          </div>
        </div>
      ) : !workspaceContext ? (
        // Subject selected but no topic: general subject ask mode
        <div className="surface-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Subject guidance</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Ask about {subject.name}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                The tutor works right away for broad subject guidance. When you attach a topic from the switcher, the page
                upgrades to a focused study thread.
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
        <>
          <div className="surface-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Connected study thread</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{workspaceContext.topic.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your tutor chat, search lane, and notes now share one topic context so every answer stays focused.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {workspaceContext.topic.tags.map((tag) => (
                    <span className={`pill ${subject.backdrop}`} key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link className="button-primary" href={getPublicLearnHref(subject.id, workspaceContext.topic.id)}>
                  Open full topic studio
                </Link>
                <Link className="button-secondary" href={getPublicPracticeHref(subject.id, workspaceContext.topic.id)}>
                  Jump to drill
                </Link>
              </div>
            </div>
          </div>

          <StudySupportDock
            defaultTab="search"
            description="Open one support tool at a time so the tutor stays the lead workspace."
            notes={
              <TopicNotesPanel
                key={`ask-notes-${workspaceContext.topic.id}`}
                seedNotes={workspaceContext.noteSeeds}
                subjectId={subject.id}
                topicId={workspaceContext.topic.id}
                topicTitle={workspaceContext.topic.title}
              />
            }
            search={
              <SearchLane
                key={`ask-search-${workspaceContext.topic.id}`}
                searchSuggestions={workspaceContext.searchSuggestions}
                tags={workspaceContext.topic.tags}
                topicSummary={workspaceContext.topic.summary}
                topicTitle={workspaceContext.topic.title}
                watchLane={workspaceContext.watchLane}
              />
            }
            title="Search & notes"
          />
        </>
      )}
    </section>
  );
}
