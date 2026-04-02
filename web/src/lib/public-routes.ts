import type { SubjectId, Topic } from "@/lib/types";

const subjectSlugById: Record<SubjectId, string> = {
  dbms: "mathematics",
  edc: "science",
  coding: "coding",
};

const subjectIdBySlug: Record<string, SubjectId> = {
  dbms: "dbms",
  edc: "edc",
  coding: "coding",
  mathematics: "dbms",
  science: "edc",
};

const topicSlugById: Record<string, string> = {
  "dbms-sql-basics": "number-basics",
  "dbms-joins": "patterns-and-relationships",
  "dbms-normalization": "organizing-problems",
  "edc-diode-basics": "science-basics",
  "edc-rectifiers": "energy-and-change",
  "edc-transistor-basics": "control-and-systems",
  "coding-logic-basics": "logic-and-sequences",
  "coding-variables": "variables-and-data",
  "coding-control-flow": "conditions-and-loops",
};

const topicIdBySlug: Record<string, string> = Object.fromEntries(
  Object.entries(topicSlugById).flatMap(([topicId, slug]) => [[slug, topicId], [topicId, topicId]]),
) as Record<string, string>;

function normalizeSegment(value: string) {
  return value.trim().toLowerCase();
}

export function getPublicSubjectSlug(subjectId: SubjectId) {
  return subjectSlugById[subjectId] ?? subjectId;
}

export function getPublicTopicSlug(topicId: string) {
  return topicSlugById[topicId] ?? topicId;
}

export function resolveSubjectIdFromSegment(value?: string | null): SubjectId | null {
  if (!value) {
    return null;
  }

  const normalized = normalizeSegment(value);
  return subjectIdBySlug[normalized] ?? null;
}

export function resolveTopicIdFromSegment(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalized = normalizeSegment(value);
  return topicIdBySlug[normalized] ?? null;
}

export function getPublicSubjectHref(subjectId: SubjectId) {
  return `/app/subjects/${getPublicSubjectSlug(subjectId)}`;
}

export function getPublicLearnHref(subjectId: SubjectId, topicId: string, fragment?: string) {
  return `/app/learn/${getPublicSubjectSlug(subjectId)}/${getPublicTopicSlug(topicId)}${fragment ? `#${fragment}` : ""}`;
}

export function getPublicTopicHref(subjectId: SubjectId, topicId: string) {
  return getPublicLearnHref(subjectId, topicId);
}

export function getPublicAskHref(subjectId?: SubjectId, topicId?: string, prompt?: string) {
  const searchParams = new URLSearchParams();

  if (subjectId) {
    searchParams.set("subjectId", getPublicSubjectSlug(subjectId));
  }

  if (subjectId && topicId) {
    searchParams.set("topicId", getPublicTopicSlug(topicId));
  }

  if (prompt) {
    searchParams.set("prompt", prompt);
  }

  const query = searchParams.toString();
  return query ? `/app/ask?${query}` : "/app/ask";
}

export function getPublicPracticeHref(subjectId: SubjectId, topicId?: string) {
  const searchParams = new URLSearchParams({
    subjectId: getPublicSubjectSlug(subjectId),
  });

  if (topicId) {
    searchParams.set("topicId", getPublicTopicSlug(topicId));
  }

  return `/app/practice?${searchParams.toString()}`;
}

export function getPublicPracticeResultsHref(subjectId: SubjectId, topicId?: string) {
  const searchParams = new URLSearchParams({
    subjectId: getPublicSubjectSlug(subjectId),
  });

  if (topicId) {
    searchParams.set("topicId", getPublicTopicSlug(topicId));
  }

  return `/app/practice/results?${searchParams.toString()}`;
}

export function getResolvedTopicHref(topic: Topic, fragment?: string) {
  return getPublicLearnHref(topic.subjectId, topic.id, fragment);
}
