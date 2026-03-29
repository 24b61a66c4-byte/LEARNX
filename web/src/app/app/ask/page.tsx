import { TutorPanel } from "@/components/tutor-panel";
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
  const topicId = params.topicId?.trim() || undefined;
  const prompt = params.prompt?.trim() || "";

  return (
    <TutorPanel
      defaultSubjectId={subjectId}
      defaultTopicId={topicId}
      initialPrompt={prompt}
      key={`${subjectId}-${topicId ?? "general"}-${prompt}`}
    />
  );
}
