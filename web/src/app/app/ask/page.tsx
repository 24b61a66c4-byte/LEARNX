import Link from "next/link";

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
  const workspaceContext = topicId ? getTopicWorkspaceContext(subjectId, topicId) : null;
  const suggestedTopics = getTopicsBySubject(subjectId).slice(0, 4);

  if (!subject) {
    return null;
  }

  if (!workspaceContext) {
    return (
      <section className="space-y-6">
        <div className="surface-card overflow-hidden p-6">
          <div className={`rounded-[32px] bg-gradient-to-br ${subject.accent} p-6 sm:p-7`}>
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
              <div className="space-y-4">
                <p className="eyebrow">{subject.name}</p>
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  Open one topic so the copilot can keep notes and search in sync
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
                  The full ask studio gets much better when it knows the topic you are actually studying. Pick one topic
                  below and LearnX will keep the tutor, notes lane, and search lane in the same workspace.
                </p>
                <div className="flex flex-wrap gap-3">
                  {suggestedTopics.map((topic) => (
                    <Link
                      className="pill"
                      href={`/app/ask?subjectId=${subject.id}&topicId=${topic.id}`}
                      key={topic.id}
                    >
                      {topic.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/40 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ask studio flow</p>
                <div className="mt-4 grid gap-3">
                  {["Pick topic", "Ask like a tutor", "Open search lane", "Save one note", "Run a drill"].map(
                    (step, index) => (
                      <div className="flex items-center gap-3" key={step}>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-800">{step}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <TutorPanel
          defaultSubjectId={subjectId}
          initialPrompt={prompt}
          key={`${subjectId}-general-${prompt}`}
        />
      </section>
    );
  }

  const { topic, noteSeeds, searchSuggestions, watchLane } = workspaceContext;

  return (
    <section className="space-y-6">
      <div className="surface-card overflow-hidden p-6">
        <div className={`rounded-[32px] bg-gradient-to-br ${subject.accent} p-6 sm:p-7`}>
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
            <div className="space-y-4">
              <p className="eyebrow">{subject.name} ask studio</p>
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
                <Link className="button-primary" href={`/app/learn/${subject.id}/${topic.id}`}>
                  Open full topic studio
                </Link>
                <Link className="button-secondary" href={`/app/practice?subjectId=${subject.id}&topicId=${topic.id}`}>
                  Jump to drill
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shared workspace context</p>
              <div className="mt-4 grid gap-3">
                {["Tutor keeps topic context", "Search lane stays nearby", "Notes save under the same topic", "Drill stays one click away"].map(
                  (line) => (
                    <div className="rounded-[20px] bg-white/84 px-4 py-3 text-sm font-medium text-slate-800" key={line}>
                      {line}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.15fr_0.95fr]">
        <div className="space-y-6">
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
