import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonBlock } from "@/components/lesson-block";
import { PracticeWorkspace } from "@/components/practice-workspace";
import { ResumeTracker } from "@/components/resume-tracker";
import { TutorPanel } from "@/components/tutor-panel";
import { getLessonByTopicId, getSubjectById, getTopicById } from "@/lib/data/catalog";
import { SubjectId } from "@/lib/types";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ subjectId: SubjectId; topicId: string }>;
}) {
  const { subjectId, topicId } = await params;
  const subject = getSubjectById(subjectId);
  const topic = getTopicById(topicId);
  const lesson = getLessonByTopicId(topicId);

  if (!subject || !topic || topic.subjectId !== subject.id) {
    notFound();
  }

  const noteSeeds = [
    topic.summary,
    lesson?.blocks[0]?.content[0] ?? "Open the first lesson block and turn it into one revision line.",
    lesson?.blocks.find((block) => block.kind === "exam")?.content[0] ??
      "Ask the copilot to convert the topic into one exam-ready answer.",
  ];
  const searchSuggestions = [
    `${topic.title} explained with one real example`,
    `Common mistakes in ${topic.title}`,
    `${topic.title} viva questions and exam answers`,
  ];
  const watchLane = [
    {
      title: `${topic.title} as a short lecture`,
      detail: "Think in terms of a focused classroom explanation or video recap, not isolated notes.",
    },
    {
      title: `${topic.title} with examples and visuals`,
      detail: "Use diagrams, analogies, and short examples before memorizing final answers.",
    },
  ];

  return (
    <section className="space-y-6">
      <ResumeTracker topicId={topic.id} />

      <div className="surface-card overflow-hidden p-6">
        <div className={`rounded-[32px] bg-gradient-to-br ${subject.accent} p-6 sm:p-7`}>
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-4">
              <p className="eyebrow">{subject.name}</p>
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
                <Link className="button-primary" href="/app/ask">
                  Open copilot on full page
                </Link>
                <Link className="button-secondary" href="/app/practice">
                  Open drill mode
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/78 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Study studio flow</p>
              <div className="mt-4 grid gap-3">
                {["Read the lesson", "Ask like a tutor chat", "Search deeper", "Save notes", "Run a drill"].map(
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

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.15fr_0.95fr]">
        <div className="space-y-6">
          <div className="surface-panel p-5">
            <p className="eyebrow">Search prompts</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">What to search next</h2>
            <div className="mt-4 space-y-3">
              {searchSuggestions.map((item) => (
                <div className="rounded-[22px] border border-black/10 bg-white/82 px-4 py-4 shadow-sm" key={item}>
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel p-5">
            <p className="eyebrow">Notebook seeds</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Start your notes here</h3>
            <div className="mt-4 space-y-3">
              {noteSeeds.map((item) => (
                <div className="rounded-[22px] border border-black/10 bg-white/82 px-4 py-4 shadow-sm" key={item}>
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel p-5">
            <p className="eyebrow">Watch lane</p>
            <div className="mt-4 space-y-3">
              {watchLane.map((item) => (
                <div className="rounded-[22px] border border-black/10 bg-white/82 px-4 py-4 shadow-sm" key={item.title}>
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Lesson + notes</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Stay in one topic until it actually makes sense
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
              This page is the student workspace for the topic. Keep the explanation open while the tutor, search
              prompts, and drill dock sit beside it.
            </p>
          </div>

          <div className="space-y-4">
            {lesson?.blocks?.map((block) => (
              <LessonBlock block={block} key={block.id} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <TutorPanel defaultSubjectId={subject.id} defaultTopicId={topic.id} />
          <PracticeWorkspace defaultSubjectId={subject.id} defaultTopicId={topic.id} />
        </div>
      </div>
    </section>
  );
}
