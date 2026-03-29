import { useAuth } from "@/lib/auth-context";
import { profileApi, quizApi, notesApi, progressApi } from "@/lib/api";
import { OnboardingProfile, StudyNote, PracticeResult } from "@/lib/types";

/**
 * Hook to bridge Supabase auth context with backend API calls
 * Automatically includes userId in API requests
 */
export function useBackendApi() {
  const { user } = useAuth();

  if (!user?.id) {
    console.warn("useBackendApi: User not authenticated");
  }

  return {
    // Profile API with userId
    profile: {
      async getProfile() {
        if (!user?.id) throw new Error("User not authenticated");
        return profileApi.getProfile(user.id);
      },

      async completeOnboarding(profile: OnboardingProfile) {
        if (!user?.id) throw new Error("User not authenticated");
        return profileApi.completeOnboarding(user.id, {
          userId: user.id,
          displayName: user.user_metadata?.name || "LearnX Student",
          email: user.email,
          interests: profile.interests || [],
          preferredSubjectId: profile.preferredSubjectId || "dbms",
          age: profile.age,
          studyGoal: profile.studyGoal,
          examTarget: profile.examTarget,
          launchMode: profile.launchMode,
          cognitiveGroup: profile.cognitiveGroup,
          accessibility_features: profile.accessibilityFeatures || [],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      },

      async saveProfile(profileData: any) {
        if (!user?.id) throw new Error("User not authenticated");
        return profileApi.saveProfile({
          userId: user.id,
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
      async submitQuiz(result: any) {
        if (!user?.id) throw new Error("User not authenticated");
        return quizApi.submitQuiz({
          userId: user.id,
          ...result,
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
      async saveNote(note: any) {
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

      async updateNote(noteId: number, note: any) {
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

      async updateProgress(progress: any) {
        if (!user?.id) throw new Error("User not authenticated");
        return progressApi.updateProgress({
          userId: user.id,
          ...progress,
        });
      },

      async initializeProgress(subjectId: string) {
        if (!user?.id) throw new Error("User not authenticated");
        return progressApi.initializeProgress(user.id, subjectId);
      },
    },
  };
}
