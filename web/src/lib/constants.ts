export const SESSION_COOKIE = "learnx_session";
export const ONBOARDED_COOKIE = "learnx_onboarded";
export const SESSION_STORAGE_KEY = "learnx.session";
export const ONBOARDING_STORAGE_KEY = "learnx.onboarding";
export const PRACTICE_HISTORY_KEY = "learnx.practiceHistory";
export const TUTOR_THREADS_KEY = "learnx.tutorThreads";
export const LAST_TOPIC_KEY = "learnx.lastTopic";
export const TOPIC_NOTES_KEY = "learnx.topicNotes";

export const TUTOR_MAX_PROMPT_LENGTH = 1200;
export const LEVEL_XP_STEP = 160;
export const DAILY_PRACTICE_TARGET = 2;

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
        "Explain normalization with a simple everyday analogy.",
        "Give me a 5-mark answer on ACID properties.",
        "Quiz me on joins with two short questions.",
    ],
    edc: [
        "Explain full-wave rectifier with key formulas.",
        "Give a 10-mark style answer for transistor biasing.",
        "Quiz me on filters with one conceptual and one numerical question.",
    ],
};
