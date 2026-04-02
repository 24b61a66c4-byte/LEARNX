import { useAuth } from "@/lib/auth-context";
import {
  notesApi,
  profileApi,
  progressApi,
  quizApi,
  type ProfilePayload,
  type ProgressPayload,
  type StudyNotePayload,
} from "@/lib/api";
import { getRecommendedSubjectId, normalizeOnboardingProfile } from "@/lib/profile-preferences";
import { OnboardingProfile, PracticeResult, StudyNote } from "@/lib/types";

type NoteInput = Pick<StudyNote, "subjectId" | "topicId" | "title" | "content" | "source">;

type ProgressUpdateInput = Omit<ProgressPayload, "userId">;
type ProfileUpdateInput = Partial<Omit<ProfilePayload, "userId" | "displayName">>;
type NoteUpdateInput = Partial<Pick<StudyNotePayload, "title" | "content" | "source">>;

function getDisplayName(user: ReturnType<typeof useAuth>["user"]) {
  if (!user) {
    return "LearnX Student";
  }

  if (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()) {
    return user.user_metadata.display_name;
  }

  if (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) {
    return user.user_metadata.name;
  }

  return user.email?.split("@")[0] ?? "LearnX Student";
}

/**
 * Hook to bridge Supabase auth context with backend API calls
 * Automatically includes userId in API requests
 */
export function useBackendApi() {
  const { user } = useAuth();
  const displayName = getDisplayName(user);

  return {
    // Profile API with userId
    profile: {
      async getProfile() {
        if (!user?.id) throw new Error("User not authenticated");
        return profileApi.getProfile(user.id);
      },

      async completeOnboarding(profile: OnboardingProfile) {
        if (!user?.id) throw new Error("User not authenticated");
        const normalized = normalizeOnboardingProfile(profile);
        return profileApi.completeOnboarding(user.id, {
          userId: user.id,
          displayName,
          age: normalized.age,
          cognitiveGroup: normalized.cognitiveGroup,
          preferredSubjectId: normalized.preferredSubjectId || getRecommendedSubjectId(normalized.age, normalized.cognitiveGroup, normalized.interests),
          preferredTopicIds: normalized.preferredTopicIds || [],
          studyGoal: normalized.studyGoal,
          examTarget: normalized.examTarget,
          launchMode: normalized.launchMode,
          interests: normalized.interests || [],
          enableVisualDiagrams: normalized.enableVisualDiagrams ?? false,
          enableVoiceInput: normalized.enableVoiceInput ?? false,
          enableQuizMode: normalized.enableQuizMode ?? false,
          accessibilityFeatures: normalized.accessibilityFeatures || [],
        });
      },

      async saveProfile(profileData: ProfileUpdateInput) {
        if (!user?.id) throw new Error("User not authenticated");
        return profileApi.saveProfile({
          userId: user.id,
          displayName,
          age: profileData?.age,
          ...profileData,
        });
      },

      async deleteProfile() {
        if (!user?.id) throw new Error("User not authenticated");
        return profileApi.deleteProfile(user.id);
      },
    },

    // Quiz API with userId
    quiz: {
      async submitQuiz(result: PracticeResult) {
        if (!user?.id) throw new Error("User not authenticated");
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
      },

      async getUserResults() {
        if (!user?.id) throw new Error("User not authenticated");
        return quizApi.getUserResults(user.id);
      },

      async getUserResultsBySubject(subjectId: string) {
        if (!user?.id) throw new Error("User not authenticated");
        return quizApi.getUserResultsBySubject(user.id, subjectId);
      },

      async getAverageScore(subjectId: string) {
        if (!user?.id) throw new Error("User not authenticated");
        return quizApi.getAverageScore(user.id, subjectId);
      },
    },

    // Notes API with userId
    notes: {
      async saveNote(note: NoteInput) {
        if (!user?.id) throw new Error("User not authenticated");
        return notesApi.saveNote({
          userId: user.id,
          ...note,
        });
      },

      async getNote(noteId: number) {
        return notesApi.getNote(noteId);
      },

      async getUserNotes() {
        if (!user?.id) throw new Error("User not authenticated");
        return notesApi.getUserNotes(user.id);
      },

      async getUserNotesByTopic(topicId: string) {
        if (!user?.id) throw new Error("User not authenticated");
        return notesApi.getUserNotesByTopic(user.id, topicId);
      },

      async updateNote(noteId: number, note: NoteUpdateInput) {
        return notesApi.updateNote(noteId, note);
      },

      async deleteNote(noteId: number) {
        return notesApi.deleteNote(noteId);
      },
    },

    // Progress API with userId
    progress: {
      async getProgress(subjectId: string) {
        if (!user?.id) throw new Error("User not authenticated");
        return progressApi.getProgress(user.id, subjectId);
      },

      async updateProgress(progress: ProgressUpdateInput) {
        if (!user?.id) throw new Error("User not authenticated");
        return progressApi.updateProgress({
          userId: user.id,
          subjectId: progress.subjectId,
          totalXp: progress.totalXp ?? 0,
          currentLevel: progress.currentLevel ?? 1,
          completedTopics: progress.completedTopics ?? 0,
          strongTopics: progress.strongTopics ?? [],
          weakTopics: progress.weakTopics ?? [],
          practiceStreakDays: progress.practiceStreakDays ?? 0,
          lastPracticeDate: progress.lastPracticeDate?.split("T")[0],
          totalPracticeMinutes: progress.totalPracticeMinutes ?? 0,
        });
      },

      async initializeProgress(subjectId: string) {
        if (!user?.id) throw new Error("User not authenticated");
        return progressApi.initializeProgress(user.id, subjectId);
      },
    },
  };
}
