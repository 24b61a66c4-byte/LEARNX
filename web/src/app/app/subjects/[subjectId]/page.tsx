import { notFound } from "next/navigation";

import { SubjectStudyTrack } from "@/components/subject-study-track";
import { TopicCard } from "@/components/topic-card";
import { getExamContext, getSubjectById, getTopicsBySubject } from "@/lib/data/catalog";
import { SubjectId } from "@/lib/types";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: SubjectId }>;
}) {
  const { subjectId } = await params;
  const subject = getSubjectById(subjectId);

  if (!subject) {
    notFound();
  }

  const topicList = getTopicsBySubject(subject.id);
  const examContext = getExamContext(subject.id);

  return (
    <section className="space-y-6">
      <div className="surface-card overflow-hidden p-6">
        <div className={`rounded-[28px] bg-gradient-to-br ${subject.accent} p-6`}>
          <p className="eyebrow">Subject hub</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">{subject.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">{subject.description}</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="surface-panel p-5">
            <p className="eyebrow">Launch scope</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This subject ships with a tight topic set so the web app stays polished instead of spreading thin.
            </p>
          </div>
          <div className="surface-panel p-5">
            <p className="eyebrow">Exam context</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {examContext?.description ?? "Exam context will appear here once configured."}
            </p>
          </div>
        </div>
      </div>

      <SubjectStudyTrack subjectId={subjectId} topics={topicList} />

      <div className="grid gap-5">
        {topicList.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
}
