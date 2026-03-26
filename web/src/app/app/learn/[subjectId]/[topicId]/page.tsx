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

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="space-y-6">
        <ResumeTracker topicId={topic.id} />
        <div className="surface-card p-6">
          <p className="eyebrow">{subject.name}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">{topic.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{topic.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {topic.tags.map((tag) => (
              <span className={`pill ${subject.backdrop}`} key={tag}>
                {tag}
              </span>
            ))}
          </div>
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
    </section>
  );
}
