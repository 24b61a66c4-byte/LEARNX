import { getSubjects, getTopicById, getTopicsBySubject } from "@/lib/data/catalog";
import { ONBOARDING_STORAGE_KEY } from "@/lib/constants";
import { readLocalStorage } from "@/lib/storage";
import { CognitiveGroup, OnboardingProfile, SubjectId } from "@/lib/types";

export function getCognitiveGroup(age: number): CognitiveGroup {
  if (age >= 5 && age <= 8) return "kids";
  if (age >= 9 && age <= 12) return "tweens";
  if (age >= 13 && age <= 17) return "teens";
  return "adults";
}

function normalizeInterest(value: string) {
  return value.trim().toLowerCase();
}

function hasAnyInterest(interests: string[] | null | undefined, keywords: string[]) {
  if (!interests || interests.length === 0) {
    return false;
  }

  const normalizedInterests = interests.map(normalizeInterest);
  return keywords.some((keyword) => normalizedInterests.some((interest) => interest.includes(keyword)));
}

export function getRecommendedSubjectId(
  age?: number | null,
  cognitiveGroup?: string | null,
  interests?: string[] | null,
): SubjectId {
  if (hasAnyInterest(interests, ["code", "coding", "program", "app", "game", "robot"])) {
    return "coding";
  }

  if (hasAnyInterest(interests, ["math", "maths", "mathematics", "number"])) {
    return "dbms";
  }

  if (hasAnyInterest(interests, ["science", "physics", "chemistry", "biology"])) {
    return "edc";
  }

  if (typeof age === "number") {
    return age <= 12 ? "edc" : "coding";
  }

  if (cognitiveGroup === "adults") {
    return "coding";
  }

  if (cognitiveGroup === "kids" || cognitiveGroup === "tweens") {
    return "edc";
  }

  return "coding";
}

function isValidTopicId(topicId: string) {
  return Boolean(getTopicById(topicId));
}

function buildSubjectFallbackTopicIds(subjectId: SubjectId) {
  return getTopicsBySubject(subjectId)
    .slice(0, 3)
    .map((topic) => topic.id)
    .filter(isValidTopicId);
}

function withFallbackTopics(topicIds: string[], fallbackSubjectId: SubjectId) {
  const validTopicIds = topicIds.filter(isValidTopicId);
  if (validTopicIds.length > 0) {
    return validTopicIds;
  }

  const bySubject = buildSubjectFallbackTopicIds(fallbackSubjectId);
  if (bySubject.length > 0) {
    return bySubject;
  }

  const firstAvailableSubject = getSubjects()[0]?.id;
  if (firstAvailableSubject) {
    return buildSubjectFallbackTopicIds(firstAvailableSubject);
  }

  return [];
}

export function getRecommendedTopicIds(
  age?: number | null,
  cognitiveGroup?: string | null,
  interests?: string[] | null,
) {
  const normalizedInterests = interests?.map(normalizeInterest) ?? [];
  const fallbackSubjectId = getRecommendedSubjectId(age, cognitiveGroup, interests);

  if (normalizedInterests.some((interest) => interest.includes("coding") || interest.includes("program"))) {
    return withFallbackTopics(["coding-logic-basics", "coding-variables", "coding-control-flow"], fallbackSubjectId);
  }

  if (normalizedInterests.some((interest) => interest.includes("science") || interest.includes("experiment"))) {
    return withFallbackTopics(
      age !== null && age !== undefined && age <= 9
        ? ["edc-diode-basics"]
        : ["edc-diode-basics", "edc-rectifiers"],
      fallbackSubjectId,
    );
  }

  if (normalizedInterests.some((interest) => interest.includes("problem") || interest.includes("logic"))) {
    return withFallbackTopics(["dbms-normalization", "dbms-joins"], fallbackSubjectId);
  }

  if (typeof age === "number") {
    if (age <= 8) {
      return withFallbackTopics(["edc-diode-basics", "dbms-sql-basics"], fallbackSubjectId);
    }

    if (age <= 12) {
      return withFallbackTopics(["edc-diode-basics", "dbms-joins"], fallbackSubjectId);
    }
  }

  if (cognitiveGroup === "adults") {
    return withFallbackTopics(["coding-control-flow", "dbms-normalization"], fallbackSubjectId);
  }

  return withFallbackTopics(["coding-logic-basics", "dbms-joins", "edc-diode-basics"], fallbackSubjectId);
}

export function normalizeOnboardingProfile(profile: OnboardingProfile): OnboardingProfile {
  const cognitiveGroup = typeof profile.age === "number" ? getCognitiveGroup(profile.age) : profile.cognitiveGroup;
  const preferredTopicIds =
    withFallbackTopics(
      profile.preferredTopicIds?.filter((topicId) => Boolean(getTopicById(topicId))) ??
      getRecommendedTopicIds(profile.age, cognitiveGroup, profile.interests),
      getRecommendedSubjectId(profile.age, cognitiveGroup, profile.interests),
    );
  const preferredSubjectId =
    preferredTopicIds[0] && getTopicById(preferredTopicIds[0])
      ? getTopicById(preferredTopicIds[0])?.subjectId
      : undefined;

  return {
    ...profile,
    cognitiveGroup,
    preferredTopicIds,
    preferredSubjectId:
      preferredSubjectId ??
      profile.preferredSubjectId ??
      getRecommendedSubjectId(profile.age, cognitiveGroup, profile.interests),
    enableVisualDiagrams: profile.enableVisualDiagrams ?? false,
    enableVoiceInput: profile.enableVoiceInput ?? false,
    enableQuizMode: profile.enableQuizMode ?? false,
    accessibilityFeatures: profile.accessibilityFeatures ?? [],
  };
}

export function getStoredOnboardingProfile() {
  const profile = readLocalStorage<OnboardingProfile | null>(ONBOARDING_STORAGE_KEY, null);
  return profile ? normalizeOnboardingProfile(profile) : null;
}
