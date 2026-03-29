import { getLessonByTopicId, getTopicById } from "@/lib/data/catalog";
import { SubjectId } from "@/lib/types";

export function getTopicWorkspaceContext(subjectId: SubjectId, topicId: string) {
  const topic = getTopicById(topicId);
  const lesson = getLessonByTopicId(topicId);

  if (!topic || topic.subjectId !== subjectId) {
    return null;
  }

  return {
    topic,
    lesson,
    noteSeeds: [
      topic.summary,
      lesson?.blocks[0]?.content[0] ?? "Open the first lesson block and turn it into one revision line.",
      lesson?.blocks.find((block) => block.kind === "exam")?.content[0] ??
        "Ask the copilot to convert the topic into one exam-ready answer.",
      lesson?.blocks.find((block) => block.kind === "mistake-watch")?.content[0] ??
        "Save the first common mistake you notice and turn it into a correction card.",
    ],
    searchSuggestions: [
      `${topic.title} explained with one real example`,
      `Common mistakes in ${topic.title}`,
      `${topic.title} viva questions and exam answers`,
    ],
    watchLane: [
      {
        title: `${topic.title} as a short lecture`,
        detail: "Think in terms of a focused classroom explanation or video recap, not isolated notes.",
      },
      {
        title: `${topic.title} with examples and visuals`,
        detail: "Use diagrams, analogies, and short examples before memorizing final answers.",
      },
    ],
  };
}
