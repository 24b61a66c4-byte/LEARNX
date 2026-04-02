import { getApiBaseUrl } from "@/lib/runtime-config";
import { getAuthenticatedRequestHeaders } from "@/lib/supabase";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProfilePayload {
  userId: string;
  displayName: string;
  age?: number;
  cognitiveGroup?: string;
  preferredSubjectId?: string;
  preferredTopicIds?: string[];
  studyGoal?: string;
  examTarget?: string;
  launchMode?: string;
  interests?: string[];
  enableVisualDiagrams?: boolean;
  enableVoiceInput?: boolean;
  enableQuizMode?: boolean;
  accessibilityFeatures?: string[];
}

export interface QuizResultPayload {
  userId: string;
  subjectId: string;
  topicId?: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  xpEarned?: number;
  completedAt?: string;
  answers?: {
    questionId?: string;
    topicId?: string;
    prompt?: string;
    learnerAnswer?: string;
    correctAnswer?: string;
    correct?: boolean;
    score?: number;
    explanation?: string;
  }[];
}

export interface StudyNotePayload {
  userId: string;
  subjectId: string;
  topicId: string;
  title: string;
  content: string;
  source?: string;
}

export interface ProgressPayload {
  userId: string;
  subjectId: string;
  totalXp?: number;
  currentLevel?: number;
  completedTopics?: number;
  strongTopics?: string[];
  weakTopics?: string[];
  practiceStreakDays?: number;
  lastPracticeDate?: string;
  totalPracticeMinutes?: number;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  const authHeaders = await getAuthenticatedRequestHeaders();
  for (const [name, value] of Object.entries(authHeaders)) {
    if (!headers.has(name)) {
      headers.set(name, value);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  if (!responseText) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return JSON.parse(responseText) as T;
  }

  return responseText as T;
}

// Profile API
export const profileApi = {
  async getProfile(userId: string) {
    return apiFetch(`/profiles/${userId}`);
  },

  async saveProfile(profile: ProfilePayload) {
    return apiFetch(`/profiles`, {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

  async completeOnboarding(userId: string, profile: ProfilePayload) {
    return apiFetch(`/profiles/onboarding?userId=${userId}`, {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

  async deleteProfile(userId: string) {
    return apiFetch(`/profiles/${userId}`, {
      method: "DELETE",
    });
  },
};

// Quiz Results API
export const quizApi = {
  async submitQuiz(result: QuizResultPayload) {
    return apiFetch(`/quiz-results`, {
      method: "POST",
      body: JSON.stringify(result),
    });
  },

  async getUserResults(userId: string) {
    return apiFetch(`/quiz-results/user/${userId}`);
  },

  async getUserResultsBySubject(userId: string, subjectId: string) {
    return apiFetch(`/quiz-results/user/${userId}/subject/${subjectId}`);
  },

  async getAverageScore(userId: string, subjectId: string) {
    return apiFetch(`/quiz-results/user/${userId}/subject/${subjectId}/average`);
  },
};

// Study Notes API
export const notesApi = {
  async saveNote(note: StudyNotePayload) {
    return apiFetch(`/notes`, {
      method: "POST",
      body: JSON.stringify(note),
    });
  },

  async getNote(noteId: number) {
    return apiFetch(`/notes/${noteId}`);
  },

  async getUserNotes(userId: string) {
    return apiFetch(`/notes/user/${userId}`);
  },

  async getUserNotesByTopic(userId: string, topicId: string) {
    return apiFetch(`/notes/user/${userId}/topic/${topicId}`);
  },

  async updateNote(noteId: number, note: Partial<StudyNotePayload>) {
    return apiFetch(`/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify(note),
    });
  },

  async deleteNote(noteId: number) {
    return apiFetch(`/notes/${noteId}`, {
      method: "DELETE",
    });
  },
};

// Progress API
export const progressApi = {
  async getProgress(userId: string, subjectId: string) {
    return apiFetch(`/progress/user/${userId}/subject/${subjectId}`);
  },

  async updateProgress(progress: ProgressPayload) {
    return apiFetch(`/progress`, {
      method: "POST",
      body: JSON.stringify(progress),
    });
  },

  async initializeProgress(userId: string, subjectId: string) {
    return apiFetch(
      `/progress/initialize?userId=${userId}&subjectId=${subjectId}`,
      {
        method: "POST",
      }
    );
  },
};
