import { PracticeWorkspace } from "@/components/practice-workspace";
import { SubjectId } from "@/lib/types";

function isSubjectId(value?: string): value is SubjectId {
  return value === "dbms" || value === "edc";
}

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{
    subjectId?: string;
    topicId?: string;
  }>;
}) {
  const params = await searchParams;
  const subjectId = isSubjectId(params.subjectId) ? params.subjectId : "dbms";
  const topicId = params.topicId?.trim() || undefined;

  return <PracticeWorkspace defaultSubjectId={subjectId} defaultTopicId={topicId} />;
}
