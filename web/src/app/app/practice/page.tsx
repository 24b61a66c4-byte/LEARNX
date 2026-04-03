import { PracticeWorkspace } from "@/components/practice-workspace";
import { PracticeEntryHeader } from "@/components/practice-entry-header";
import { getSubjectById, getTopicById } from "@/lib/data/catalog";
import { resolveSubjectIdFromSegment, resolveTopicIdFromSegment } from "@/lib/public-routes";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{
    subjectId?: string;
    topicId?: string;
  }>;
}) {
  const params = await searchParams;
  const subjectId = resolveSubjectIdFromSegment(params.subjectId) ?? "dbms";
  const topicId = resolveTopicIdFromSegment(params.topicId) ?? undefined;

  const subject = getSubjectById(subjectId);
  const topic = topicId ? getTopicById(topicId) : undefined;

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PracticeEntryHeader
        subjectName={subject?.name || "Subject Center"}
        topicTitle={topic?.title}
      />

      <div className="surface-card overflow-hidden p-0 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <PracticeWorkspace defaultSubjectId={subjectId} defaultTopicId={topicId} />
      </div>
    </div>
  );
}
