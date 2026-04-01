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

      <div className="surface-card overflow-hidden p-0 shadow-2xl">
        <div className="border-b border-black/10 bg-slate-50/50 px-8 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live study workspace</p>
          </div>
        </div>
        
        <PracticeWorkspace defaultSubjectId={subjectId} defaultTopicId={topicId} />

        <div className="bg-slate-900 px-8 py-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Remember: Your performance in this drill affects your focus roadmap.
          </p>
        </div>
      </div>
    </div>
  );
}
