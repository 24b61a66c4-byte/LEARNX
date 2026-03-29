import { PracticeResult, SubjectId, Topic } from "@/lib/types";

export interface TopicMasteryView {
  topicId: string;
  title: string;
  attempts: number;
  accuracy: number | null;
  status: "untouched" | "recover" | "steady" | "strong";
}

export interface SubjectMasteryView {
  masteryPercent: number;
  attemptedTopics: number;
  totalTopics: number;
  strongCount: number;
  weakCount: number;
  continueTopic: Topic | null;
  continueReason: string;
  topicViews: TopicMasteryView[];
}

function getStatus(accuracy: number | null): TopicMasteryView["status"] {
  if (accuracy === null) {
    return "untouched";
  }

  if (accuracy >= 80) {
    return "strong";
  }

  if (accuracy < 70) {
    return "recover";
  }

  return "steady";
}

export function buildSubjectMasteryView(
  subjectId: SubjectId,
  topics: Topic[],
  history: PracticeResult[],
): SubjectMasteryView {
  const subjectHistory = history.filter((item) => item.subjectId === subjectId && item.topicId);

  const topicViews = topics.map((topic) => {
    const attempts = subjectHistory.filter((item) => item.topicId === topic.id);
    const accuracy =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, item) => sum + item.scorePercent, 0) / attempts.length)
        : null;

    return {
      topicId: topic.id,
      title: topic.title,
      attempts: attempts.length,
      accuracy,
      status: getStatus(accuracy),
    };
  });

  const attemptedTopics = topicViews.filter((topic) => topic.attempts > 0).length;
  const attemptedAccuracies = topicViews
    .map((topic) => topic.accuracy)
    .filter((value): value is number => value !== null);
  const masteryPercent =
    attemptedAccuracies.length > 0
      ? Math.round(attemptedAccuracies.reduce((sum, value) => sum + value, 0) / attemptedAccuracies.length)
      : 0;
  const weakCount = topicViews.filter((topic) => topic.status === "recover").length;
  const strongCount = topicViews.filter((topic) => topic.status === "strong").length;

  const latestAttempt = subjectHistory.find((item) => item.topicId);
  const latestTopic = latestAttempt ? topics.find((topic) => topic.id === latestAttempt.topicId) ?? null : null;
  const weakTopic = topicViews.find((topic) => topic.status === "recover");
  const untouchedTopic = topicViews.find((topic) => topic.status === "untouched");

  let continueTopic = latestTopic;
  let continueReason = latestTopic ? "Resume your most recent topic." : "Open the first topic to start the subject loop.";

  if (!continueTopic && weakTopic) {
    continueTopic = topics.find((topic) => topic.id === weakTopic.topicId) ?? null;
    continueReason = "This topic needs a recovery loop.";
  }

  if (!continueTopic && untouchedTopic) {
    continueTopic = topics.find((topic) => topic.id === untouchedTopic.topicId) ?? null;
    continueReason = "Start the next untouched topic in this subject.";
  }

  if (!continueTopic) {
    continueTopic = topics[0] ?? null;
  }

  return {
    masteryPercent,
    attemptedTopics,
    totalTopics: topics.length,
    strongCount,
    weakCount,
    continueTopic,
    continueReason,
    topicViews,
  };
}
