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
  if (hasAnyInterest(interests, ["math", "maths", "mathematics", "number", "code", "coding", "programming"])) {
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

export function normalizeOnboardingProfile(profile: OnboardingProfile): OnboardingProfile {
  const cognitiveGroup = typeof profile.age === "number" ? getCognitiveGroup(profile.age) : profile.cognitiveGroup;

  return {
    ...profile,
    cognitiveGroup,
    preferredSubjectId:
      profile.preferredSubjectId ?? getRecommendedSubjectId(profile.age, cognitiveGroup, profile.interests),
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
