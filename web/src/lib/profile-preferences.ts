import { getTopicById } from "@/lib/data/catalog";
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
    return age < 18 ? "dbms" : "dbms";
  }

  if (cognitiveGroup === "adults") {
    return "dbms";
  }

  return "dbms";
}

export function getRecommendedTopicIds(
  age?: number | null,
  cognitiveGroup?: string | null,
  interests?: string[] | null,
) {
  const normalizedInterests = interests?.map(normalizeInterest) ?? [];

  if (normalizedInterests.some((interest) => interest.includes("coding") || interest.includes("program"))) {
    return ["coding-logic-basics", "coding-variables", "coding-control-flow"];
  }

  if (normalizedInterests.some((interest) => interest.includes("science") || interest.includes("experiment"))) {
    return age !== null && age !== undefined && age <= 9
      ? ["edc-diode-basics"]
      : ["edc-diode-basics", "edc-rectifiers"];
  }

  if (normalizedInterests.some((interest) => interest.includes("problem") || interest.includes("logic"))) {
    return ["dbms-normalization", "dbms-joins"];
  }

  if (typeof age === "number") {
    if (age <= 8) {
      return ["dbms-sql-basics", "edc-diode-basics"];
    }

    if (age <= 12) {
      return ["dbms-joins", "edc-diode-basics"];
    }
  }

  if (cognitiveGroup === "adults") {
    return ["dbms-normalization", "edc-rectifiers"];
  }

  return ["dbms-joins", "edc-diode-basics"];
}

export function normalizeOnboardingProfile(profile: OnboardingProfile): OnboardingProfile {
  const cognitiveGroup = typeof profile.age === "number" ? getCognitiveGroup(profile.age) : profile.cognitiveGroup;
  const preferredTopicIds =
    profile.preferredTopicIds?.filter((topicId) => Boolean(getTopicById(topicId))) ??
    getRecommendedTopicIds(profile.age, cognitiveGroup, profile.interests);
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
