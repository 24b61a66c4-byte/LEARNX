import { PRACTICE_QUESTION_TARGET } from "@/lib/constants";
import { getLessonByTopicId, getQuestions, getTopicsBySubject } from "@/lib/data/catalog";
import { OnboardingProfile, PracticeResult, Question, SubjectId, Topic } from "@/lib/types";

const STOP_WORDS = new Set([
  "about",
  "after",
  "before",
  "being",
  "build",
  "clear",
  "daily",
  "each",
  "from",
  "helps",
  "idea",
  "into",
  "just",
  "keep",
  "learn",
  "make",
  "more",
  "once",
  "part",
  "show",
  "that",
  "them",
  "then",
  "they",
  "this",
  "through",
  "topic",
  "use",
  "with",
  "your",
]);

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function getDeterministicIndex(seed: string, length: number) {
  if (length <= 1) {
    return 0;
  }

  return [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % length;
}

function buildOptionSet(correctOption: string, distractors: string[], seed: string) {
  const pool = uniqueStrings([correctOption, ...distractors]).filter((item) => item !== correctOption);
  const options = pool.slice(0, 3);
  const insertAt = getDeterministicIndex(seed, options.length + 1);
  options.splice(insertAt, 0, correctOption);
  return {
    options,
    correctOptionIndex: insertAt,
  };
}

function extractKeywords(values: string[], fallbacks: string[] = []) {
  const tokens = values
    .flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/))
    .filter((value) => value.length > 3 && !STOP_WORDS.has(value));

  return uniqueStrings([...fallbacks.map((value) => value.toLowerCase()), ...tokens]).slice(0, 5);
}

function getQuestionVoice(onboarding: OnboardingProfile | null, level: number) {
  if (onboarding?.studyGoal === "prepare-exams" || level >= 3) {
    return {
      summaryPrompt: "Which answer choice best summarizes",
      shortPrompt: "Write one exam-ready idea you should remember about",
      actionPrompt: "What is the most useful next move when reviewing",
    };
  }

  if (onboarding?.cognitiveGroup === "kids" || onboarding?.cognitiveGroup === "tweens") {
    return {
      summaryPrompt: "Which choice best fits",
      shortPrompt: "Write one important idea you learned about",
      actionPrompt: "What should you do next to understand",
    };
  }

  return {
    summaryPrompt: "Which statement best matches",
    shortPrompt: "Name one key idea from",
    actionPrompt: "Which step would help you review",
  };
}

function getTopicAttempts(history: PracticeResult[], topicId: string) {
  const results = history.filter((item) => item.topicId === topicId);
  const average =
    results.length === 0
      ? null
      : results.reduce((sum, item) => sum + item.scorePercent, 0) / results.length;

  return {
    attempts: results.length,
    average,
  };
}

function pickFocusTopics(subjectId: SubjectId, topicId: string | undefined, onboarding: OnboardingProfile | null, history: PracticeResult[]) {
  const subjectTopics = getTopicsBySubject(subjectId);
  const directTopic = topicId ? subjectTopics.find((topic) => topic.id === topicId) : null;
  if (directTopic) {
    return [directTopic];
  }

  const preferredIds = onboarding?.preferredTopicIds?.filter((item) =>
    subjectTopics.some((topic) => topic.id === item),
  ) ?? [];
  const preferredIdSet = new Set(preferredIds);
  const easierFirst = onboarding?.cognitiveGroup === "kids" || onboarding?.cognitiveGroup === "tweens";

  return [...subjectTopics]
    .sort((left, right) => {
      const leftPreferred = preferredIdSet.has(left.id) ? 1 : 0;
      const rightPreferred = preferredIdSet.has(right.id) ? 1 : 0;
      if (leftPreferred !== rightPreferred) {
        return rightPreferred - leftPreferred;
      }

      const leftAttempts = getTopicAttempts(history, left.id);
      const rightAttempts = getTopicAttempts(history, right.id);

      if (leftAttempts.attempts === 0 && rightAttempts.attempts !== 0) {
        return -1;
      }
      if (rightAttempts.attempts === 0 && leftAttempts.attempts !== 0) {
        return 1;
      }

      if ((leftAttempts.average ?? 0) !== (rightAttempts.average ?? 0)) {
        return (leftAttempts.average ?? 0) - (rightAttempts.average ?? 0);
      }

      if (easierFirst && left.difficulty !== right.difficulty) {
        return left.difficulty - right.difficulty;
      }

      if (!easierFirst && left.examImportance !== right.examImportance) {
        return right.examImportance - left.examImportance;
      }

      return left.title.localeCompare(right.title);
    })
    .slice(0, 3);
}

function buildSummaryQuestion(topic: Topic, subjectId: SubjectId, distractorTopics: Topic[], voice: ReturnType<typeof getQuestionVoice>): Question {
  const correctOption = topic.summary;
  const distractors = distractorTopics.map((item) => item.summary).filter((summary) => summary !== correctOption);
  const { options, correctOptionIndex } = buildOptionSet(correctOption, distractors, `${topic.id}-summary`);

  return {
    id: `${topic.id}-adaptive-summary`,
    subjectId,
    topicId: topic.id,
    type: "MCQ",
    prompt: `${voice.summaryPrompt} ${topic.title}?`,
    options,
    correctOptionIndex,
    acceptedKeywords: [],
    explanation: `The best answer stays close to the main idea of ${topic.title}: ${topic.summary}`,
    difficulty: Math.min(0.95, topic.difficulty + 0.05),
  };
}

function buildKeywordQuestion(topic: Topic, subjectId: SubjectId, voice: ReturnType<typeof getQuestionVoice>): Question {
  const keywords = extractKeywords([topic.summary], topic.tags);

  return {
    id: `${topic.id}-adaptive-keyword`,
    subjectId,
    topicId: topic.id,
    type: "SHORT_ANSWER",
    prompt: `${voice.shortPrompt} ${topic.title}.`,
    options: [],
    correctOptionIndex: null,
    acceptedKeywords: keywords,
    minKeywordMatches: Math.min(2, keywords.length || 1),
    explanation: `A strong answer should reuse the core language of the topic, such as ${keywords.join(", ")}.`,
    difficulty: Math.min(0.95, topic.difficulty + 0.08),
  };
}

function buildTagQuestion(topic: Topic, subjectId: SubjectId, distractorTopics: Topic[]): Question {
  const correctOption = topic.tags[0] ?? topic.title;
  const distractors = distractorTopics.flatMap((item) => item.tags).filter((tag) => tag !== correctOption);
  const { options, correctOptionIndex } = buildOptionSet(correctOption, distractors, `${topic.id}-tag`);

  return {
    id: `${topic.id}-adaptive-tag`,
    subjectId,
    topicId: topic.id,
    type: "MCQ",
    prompt: `Which cue belongs most directly to ${topic.title}?`,
    options,
    correctOptionIndex,
    acceptedKeywords: [],
    explanation: `${correctOption} is one of the main cues carried by ${topic.title}.`,
    difficulty: Math.min(0.95, topic.difficulty + 0.02),
  };
}

function buildLessonQuestions(topic: Topic, subjectId: SubjectId, distractorTopics: Topic[], voice: ReturnType<typeof getQuestionVoice>) {
  const lesson = getLessonByTopicId(topic.id);
  if (!lesson) {
    return [];
  }

  const examBlock = lesson.blocks.find((block) => block.kind === "exam");
  const stepsBlock = lesson.blocks.find((block) => block.kind === "steps");
  const exampleBlock = lesson.blocks.find((block) => block.kind === "example");
  const mistakeBlock = lesson.blocks.find((block) => block.kind === "mistake-watch");
  const firstBlock = lesson.blocks[0];

  const questions: Question[] = [];

  if (firstBlock?.content[0]) {
    const keywords = extractKeywords(firstBlock.content, topic.tags);
    questions.push({
      id: `${topic.id}-adaptive-first-block`,
      subjectId,
      topicId: topic.id,
      type: "SHORT_ANSWER",
      prompt: `${voice.actionPrompt} ${topic.title} after reading the lesson?`,
      options: [],
      correctOptionIndex: null,
      acceptedKeywords: keywords,
      minKeywordMatches: Math.min(2, keywords.length || 1),
      explanation: `The lesson keeps coming back to ideas like ${keywords.join(", ")}.`,
      difficulty: Math.min(0.95, topic.difficulty + 0.06),
    });
  }

  if (stepsBlock?.content[0]) {
    const keywords = extractKeywords(stepsBlock.content, topic.tags);
    questions.push({
      id: `${topic.id}-adaptive-steps`,
      subjectId,
      topicId: topic.id,
      type: "SHORT_ANSWER",
      prompt: `Name one review step from ${topic.title}.`,
      options: [],
      correctOptionIndex: null,
      acceptedKeywords: keywords,
      minKeywordMatches: 1,
      explanation: `Any of the lesson steps that mention ${keywords.join(", ")} would count as a strong answer.`,
      difficulty: Math.min(0.95, topic.difficulty + 0.1),
    });
  }

  if (exampleBlock?.content[0]) {
    const correctOption = exampleBlock.content[0];
    const distractors = distractorTopics.map((item) => item.summary);
    const { options, correctOptionIndex } = buildOptionSet(correctOption, distractors, `${topic.id}-example`);
    questions.push({
      id: `${topic.id}-adaptive-example`,
      subjectId,
      topicId: topic.id,
      type: "MCQ",
      prompt: `Which example fits ${topic.title} best?`,
      options,
      correctOptionIndex,
      acceptedKeywords: [],
      explanation: `This example is pulled directly from the lesson examples for ${topic.title}.`,
      difficulty: Math.min(0.95, topic.difficulty + 0.04),
    });
  }

  if (examBlock?.content[0]) {
    const distractors = distractorTopics
      .map((item) => getLessonByTopicId(item.id)?.blocks.find((block) => block.kind === "exam")?.content[0] ?? item.summary)
      .filter((value) => value !== examBlock.content[0]);
    const { options, correctOptionIndex } = buildOptionSet(examBlock.content[0], distractors, `${topic.id}-exam`);
    questions.push({
      id: `${topic.id}-adaptive-exam`,
      subjectId,
      topicId: topic.id,
      type: "MCQ",
      prompt: `If you had to explain ${topic.title} in class or in a test, which answer plan fits best?`,
      options,
      correctOptionIndex,
      acceptedKeywords: [],
      explanation: "The best option mirrors the answer frame that the topic lesson recommends.",
      difficulty: Math.min(0.95, topic.difficulty + 0.12),
    });
  }

  if (mistakeBlock?.content[0]) {
    const distractors = [
      "Read the question carefully and show the key step.",
      "Use one clear example before adding detail.",
      "Check whether the final answer matches the question.",
    ];
    const { options, correctOptionIndex } = buildOptionSet(
      mistakeBlock.content[0],
      distractors,
      `${topic.id}-mistake`,
    );
    questions.push({
      id: `${topic.id}-adaptive-mistake`,
      subjectId,
      topicId: topic.id,
      type: "MCQ",
      prompt: `Which habit should you avoid while studying ${topic.title}?`,
      options,
      correctOptionIndex,
      acceptedKeywords: [],
      explanation: "The correct answer is the warning that appears in the topic's mistake-watch block.",
      difficulty: Math.min(0.95, topic.difficulty + 0.08),
    });
  }

  return questions;
}

function buildTopicQuestions(topic: Topic, subjectId: SubjectId, onboarding: OnboardingProfile | null, history: PracticeResult[]) {
  const rewardLevel = Math.max(
    1,
    Math.floor(history.reduce((sum, item) => sum + item.xpEarned, 0) / 160) + 1,
  );
  const voice = getQuestionVoice(onboarding, rewardLevel);
  const distractorTopics = getTopicsBySubject(subjectId).filter((item) => item.id !== topic.id);

  return [
    ...getQuestions(subjectId, topic.id),
    buildSummaryQuestion(topic, subjectId, distractorTopics, voice),
    buildKeywordQuestion(topic, subjectId, voice),
    buildTagQuestion(topic, subjectId, distractorTopics),
    ...buildLessonQuestions(topic, subjectId, distractorTopics, voice),
  ];
}

export function getPracticeFocusTopics(input: {
  subjectId: SubjectId;
  topicId?: string;
  onboarding: OnboardingProfile | null;
  history: PracticeResult[];
}) {
  return pickFocusTopics(input.subjectId, input.topicId, input.onboarding, input.history);
}

export function buildAdaptivePracticeSet(input: {
  subjectId: SubjectId;
  topicId?: string;
  onboarding: OnboardingProfile | null;
  history: PracticeResult[];
  desiredCount?: number;
}) {
  const desiredCount = input.desiredCount ?? PRACTICE_QUESTION_TARGET;
  const focusTopics = pickFocusTopics(input.subjectId, input.topicId, input.onboarding, input.history);
  const perTopicTarget = focusTopics.length === 1 ? desiredCount : Math.max(3, Math.ceil(desiredCount / focusTopics.length) + 1);

  const questionPool = focusTopics.flatMap((topic) =>
    buildTopicQuestions(topic, input.subjectId, input.onboarding, input.history).slice(0, perTopicTarget),
  );
  const deduped = questionPool.filter(
    (question, index, items) => items.findIndex((candidate) => candidate.id === question.id) === index,
  );

  if (deduped.length >= desiredCount) {
    return deduped.slice(0, desiredCount);
  }

  const fallbackTopics = getTopicsBySubject(input.subjectId).filter(
    (topic) => !focusTopics.some((focusTopic) => focusTopic.id === topic.id),
  );
  const fallbackQuestions = fallbackTopics.flatMap((topic) =>
    buildTopicQuestions(topic, input.subjectId, input.onboarding, input.history),
  );

  return [...deduped, ...fallbackQuestions]
    .filter((question, index, items) => items.findIndex((candidate) => candidate.id === question.id) === index)
    .slice(0, desiredCount);
}
