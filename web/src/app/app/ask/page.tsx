import Link from "next/link";

import { AskStudioShell } from "@/components/ask-studio-shell";
import { SearchLane } from "@/components/search-lane";
import { TopicNotesPanel } from "@/components/topic-notes-panel";
import { TutorPanel } from "@/components/tutor-panel";
import { getSubjectById, getTopicsBySubject } from "@/lib/data/catalog";
import { getTopicWorkspaceContext } from "@/lib/topic-workspace";
import { SubjectId } from "@/lib/types";

function isSubjectId(value?: string): value is SubjectId {
  return value === "dbms" || value === "edc";
}

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
  const subjectId = isSubjectId(params.subjectId) ? params.subjectId : "dbms";
  const subject = getSubjectById(subjectId);
  const topicId = params.topicId?.trim() || undefined;
  const prompt = params.prompt?.trim() || "";
  const subjectTopics = getTopicsBySubject(subjectId);
  const workspaceContext = topicId ? getTopicWorkspaceContext(subjectId, topicId) : null;

  if (!subject) {
    return null;
  }

  if (!workspaceContext) {
    return (
      <section className="space-y-6">
        <AskStudioShell activeTopicId={topicId} subject={subject} topics={subjectTopics} />

        <div className="surface-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">General ask mode</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Start the conversation while you choose the exact topic
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                The tutor works right away for broad subject guidance. When you attach a topic from the switcher, the page
                upgrades to the full three-lane workspace.
              </p>
            </div>
            <Link className="button-secondary" href={`/app/subjects/${subject.id}`}>
              Browse all {subject.name} topics
            </Link>
          </div>
        </div>

        <TutorPanel
          defaultSubjectId={subjectId}
          initialPrompt={prompt}
          showSupportLanes={false}
          key={`${subjectId}-general-${prompt}`}
        />
      </section>
    );
  }

  const { topic, noteSeeds, searchSuggestions, watchLane } = workspaceContext;

  return (
    <section className="space-y-6">
      <AskStudioShell activeTopicId={topic.id} subject={subject} topics={subjectTopics} />

      <div className="surface-panel p-5">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.95fr]">
          <div>
            <p className="eyebrow">Connected study thread</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{topic.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your tutor chat, web research lane, and notes lane now share one topic context so each answer and save card
              stays focused.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {topic.tags.map((tag) => (
                <span className={`pill ${subject.backdrop}`} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap content-start items-center justify-start gap-3 lg:justify-end">
            <Link className="button-primary" href={`/app/learn/${subject.id}/${topic.id}`}>
              Open full topic studio
            </Link>
            <Link className="button-secondary" href={`/app/practice?subjectId=${subject.id}&topicId=${topic.id}`}>
              Jump to drill
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.12fr_0.95fr]">
        <div className="space-y-6">
          <div className="surface-panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lane 1</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Search and watch</p>
          </div>
          <SearchLane
            key={`ask-search-${topic.id}`}
            searchSuggestions={searchSuggestions}
            tags={topic.tags}
            topicSummary={topic.summary}
            topicTitle={topic.title}
            watchLane={watchLane}
          />
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lane 2</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Tutor conversation</p>
          </div>
          <TutorPanel
            defaultSubjectId={subjectId}
            defaultTopicId={topic.id}
            initialPrompt={prompt}
            showFloatingActions={false}
            showSupportLanes={false}
            key={`${subjectId}-${topic.id}-${prompt}`}
          />
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lane 3</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Topic notes</p>
          </div>
          <TopicNotesPanel
            key={`ask-notes-${topic.id}`}
            seedNotes={noteSeeds}
            subjectId={subject.id}
            topicId={topic.id}
            topicTitle={topic.title}
          />
        </div>
      </div>
    </section>
  );
}
