export const SESSION_COOKIE = "learnx_session";
export const ONBOARDED_COOKIE = "learnx_onboarded";
export const SESSION_STORAGE_KEY = "learnx.session";
export const ONBOARDING_STORAGE_KEY = "learnx.onboarding";
export const PRACTICE_HISTORY_KEY = "learnx.practiceHistory";
export const PRACTICE_LATEST_RESULT_KEY = "learnx.practiceLatestResult";
export const TUTOR_THREADS_KEY = "learnx.tutorThreads";
export const LAST_TOPIC_KEY = "learnx.lastTopic";
export const TOPIC_NOTES_KEY = "learnx.topicNotes";

export const TUTOR_MAX_PROMPT_LENGTH = 1200;
export const LEVEL_XP_STEP = 160;
export const DAILY_PRACTICE_TARGET = 2;
export const PRACTICE_QUESTION_TARGET = 8;

export const TUTOR_MODE_LABELS = {
    explain: "Explain",
    "exam-answer": "Exam answer",
    "quiz-me": "Quiz me",
} as const;

export const EXAM_WORD_HINTS = {
    "exam-answer": "Aim for 90-140 words for a compact exam-style answer.",
    "quiz-me": "Keep it concise: 25-60 words usually works for quick checks.",
} as const;

export const SUBJECT_SAMPLE_PROMPTS: Record<string, string[]> = {
    dbms: [
        "Walk me through the math step by step.",
        "Give me a short exam-style answer.",
        "Quiz me with two quick questions.",
    ],
    edc: [
        "Explain the science with a real-life example.",
        "Give me a compact revision answer.",
        "Quiz me on the core idea and one common mistake.",
    ],
    coding: [
        "Explain the coding idea with one simple example.",
        "Turn this into a beginner-friendly answer.",
        "Quiz me on the logic and one common bug to avoid.",
    ],
};
