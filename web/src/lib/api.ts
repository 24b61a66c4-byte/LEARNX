const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API error: ${response.status}`);
  }

  return response.json();
}

// Profile API
export const profileApi = {
  async getProfile(userId: string) {
    return apiFetch(`/profiles/${userId}`);
  },

  async saveProfile(profile: any) {
    return apiFetch(`/profiles`, {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

  async completeOnboarding(userId: string, profile: any) {
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
  async submitQuiz(result: any) {
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
  async saveNote(note: any) {
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

  async updateNote(noteId: number, note: any) {
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

  async updateProgress(progress: any) {
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
