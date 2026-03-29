import type { User } from "@supabase/supabase-js";

import {
  ONBOARDING_STORAGE_KEY,
  PRACTICE_HISTORY_KEY,
  TOPIC_NOTES_KEY,
} from "@/lib/constants";
import { sessionGateway } from "@/lib/gateways";
import { clearLocalStorage, writeLocalStorage } from "@/lib/storage";
import type {
  OnboardingProfile,
  PracticeResult,
  SessionProfile,
  StudyNote,
  StudyNoteSource,
} from "@/lib/types";

type ServerLearnerProfile = {
  age?: number;
  cognitiveGroup?: string;
  preferredSubjectId?: string;
  studyGoal?: string;
  examTarget?: string;
  launchMode?: string;
  interests?: string[];
  enableVisualDiagrams?: boolean;
  enableVoiceInput?: boolean;
  enableQuizMode?: boolean;
  accessibilityFeatures?: string[];
};

type ServerQuizResult = {
  subjectId: string;
  topicId?: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  xpEarned?: number;
  completedAt?: string;
};

type ServerStudyNote = {
  id: number;
  subjectId: string;
  topicId: string;
  title: string;
  content: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
};

function getDisplayName(user: User) {
  const displayName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";

  return displayName.trim() || user.email?.split("@")[0] || "LearnX Student";
}

function normalizeTimestamp(value?: string) {
  if (!value) {
    return new Date().toISOString();
  }

  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? new Date().toISOString() : timestamp.toISOString();
}

function toStudyNoteSource(value?: string): StudyNoteSource {
  switch (value) {
    case "seed":
    case "lesson":
    case "tutor":
    case "practice":
      return value;
    default:
      return "manual";
  }
}

function mapServerNote(note: ServerStudyNote): StudyNote {
  return {
    id: `note-server-${note.id}`,
    serverId: note.id,
    subjectId: note.subjectId as StudyNote["subjectId"],
    topicId: note.topicId,
    title: note.title,
    content: note.content,
    source: toStudyNoteSource(note.source),
    createdAt: normalizeTimestamp(note.createdAt),
    updatedAt: normalizeTimestamp(note.updatedAt ?? note.createdAt),
  };
}

function mapServerProfile(profile: ServerLearnerProfile): OnboardingProfile | null {
  if (!profile.preferredSubjectId || !profile.studyGoal) {
    return null;
  }

  return {
    preferredSubjectId: profile.preferredSubjectId as OnboardingProfile["preferredSubjectId"],
    studyGoal: profile.studyGoal as OnboardingProfile["studyGoal"],
    examTarget: profile.examTarget as OnboardingProfile["examTarget"],
    launchMode: profile.launchMode as OnboardingProfile["launchMode"],
    age: profile.age,
    cognitiveGroup: profile.cognitiveGroup as OnboardingProfile["cognitiveGroup"],
    interests: profile.interests,
    enableVisualDiagrams: profile.enableVisualDiagrams,
    enableVoiceInput: profile.enableVoiceInput,
    enableQuizMode: profile.enableQuizMode,
    accessibilityFeatures: profile.accessibilityFeatures as OnboardingProfile["accessibilityFeatures"],
  };
}

function mapServerResult(result: ServerQuizResult): PracticeResult {
  return {
    subjectId: result.subjectId as PracticeResult["subjectId"],
    topicId: result.topicId,
    scorePercent: Math.round(result.scorePercent),
    correctCount: result.correctCount,
    totalCount: result.totalQuestions,
    xpEarned: result.xpEarned ?? 0,
    badgeAwarded: null,
    answers: [],
    completedAt: normalizeTimestamp(result.completedAt),
  };
}

async function getAuthenticatedUser() {
  const { getSessionUser } = await import("@/lib/supabase");
  return getSessionUser();
}

async function hydrateUserData(user: User) {
  const [{ notesApi, profileApi, quizApi }] = await Promise.all([import("@/lib/api")]);

  const [profileResult, notesResult, quizResult] = await Promise.allSettled([
    profileApi.getProfile(user.id),
    notesApi.getUserNotes(user.id),
    quizApi.getUserResults(user.id),
  ]);

  if (profileResult.status === "fulfilled") {
    const onboardingProfile = mapServerProfile(profileResult.value as ServerLearnerProfile);
    if (onboardingProfile) {
      writeLocalStorage(ONBOARDING_STORAGE_KEY, onboardingProfile);
    }
  }

  if (notesResult.status === "fulfilled" && Array.isArray(notesResult.value)) {
    writeLocalStorage(
      TOPIC_NOTES_KEY,
      notesResult.value.map((note) => mapServerNote(note as ServerStudyNote)),
    );
  }

  if (quizResult.status === "fulfilled" && Array.isArray(quizResult.value)) {
    writeLocalStorage(
      PRACTICE_HISTORY_KEY,
      quizResult.value
        .map((result) => mapServerResult(result as ServerQuizResult))
        .sort((left, right) => right.completedAt.localeCompare(left.completedAt)),
    );
  }
}

export function getSessionProfileForUser(user: User): SessionProfile {
  return {
    displayName: getDisplayName(user),
    email: user.email ?? `${user.id}@learnx.local`,
  };
}

export async function syncSessionFromAuthUser(user: User | null) {
  if (!user) {
    sessionGateway.signOut();
    clearLocalStorage(ONBOARDING_STORAGE_KEY);
    clearLocalStorage(PRACTICE_HISTORY_KEY);
    clearLocalStorage(TOPIC_NOTES_KEY);
    return null;
  }

  await hydrateUserData(user);
  return sessionGateway.signIn(getSessionProfileForUser(user));
}

export async function syncOnboardingProfile(profile: OnboardingProfile) {
  const user = await getAuthenticatedUser();
  if (!user?.id) {
    return null;
  }

  const { profileApi } = await import("@/lib/api");
  return profileApi.completeOnboarding(user.id, {
    userId: user.id,
    displayName: getDisplayName(user),
    age: profile.age,
    cognitiveGroup: profile.cognitiveGroup,
    preferredSubjectId: profile.preferredSubjectId,
    studyGoal: profile.studyGoal,
    examTarget: profile.examTarget,
    launchMode: profile.launchMode,
    interests: profile.interests,
    enableVisualDiagrams: profile.enableVisualDiagrams,
    enableVoiceInput: profile.enableVoiceInput,
    enableQuizMode: profile.enableQuizMode,
    accessibilityFeatures: profile.accessibilityFeatures,
  });
}

export async function syncPracticeResult(result: PracticeResult) {
  const user = await getAuthenticatedUser();
  if (!user?.id) {
    return null;
  }

  const { quizApi } = await import("@/lib/api");
  return quizApi.submitQuiz({
    userId: user.id,
    subjectId: result.subjectId,
    topicId: result.topicId,
    totalQuestions: result.totalCount,
    correctCount: result.correctCount,
    scorePercent: result.scorePercent,
    xpEarned: result.xpEarned,
    completedAt: result.completedAt,
  });
}

export async function fetchBackendNotesByTopic(topicId: string) {
  const user = await getAuthenticatedUser();
  if (!user?.id) {
    return [] as StudyNote[];
  }

  const { notesApi } = await import("@/lib/api");
  const notes = await notesApi.getUserNotesByTopic(user.id, topicId);
  return Array.isArray(notes) ? notes.map((note) => mapServerNote(note as ServerStudyNote)) : [];
}

export async function syncStudyNote(note: StudyNote) {
  const user = await getAuthenticatedUser();
  if (!user?.id) {
    return null;
  }

  const { notesApi } = await import("@/lib/api");

  const synced = note.serverId
    ? await notesApi.updateNote(note.serverId, {
      title: note.title,
      content: note.content,
      source: note.source,
    })
    : await notesApi.saveNote({
      userId: user.id,
      subjectId: note.subjectId,
      topicId: note.topicId,
      title: note.title,
      content: note.content,
      source: note.source,
    });

  return mapServerNote(synced as ServerStudyNote);
}

export async function deleteSyncedStudyNote(note: StudyNote) {
  if (!note.serverId) {
    return;
  }

  const { notesApi } = await import("@/lib/api");
  await notesApi.deleteNote(note.serverId);
}
