import { beforeEach, describe, expect, it, vi } from "vitest";

import { PRACTICE_HISTORY_KEY, PRACTICE_LATEST_RESULT_KEY } from "@/lib/constants";
import { mapServerScoreToPracticeResult, persistPracticeResultToCache } from "@/lib/study-loop";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

vi.mock("@/lib/storage", () => ({
  readLocalStorage: vi.fn((_key: string, fallback: unknown) => fallback),
  writeLocalStorage: vi.fn(),
}));

describe("study-loop server scoring helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps server-scored drill results into the local practice cache shape", () => {
    const result = mapServerScoreToPracticeResult({
      subjectId: "coding",
      topicId: "coding-variables",
      totalQuestions: 1,
      correctCount: 0,
      scorePercent: 50,
      xpEarned: 80,
      recoveryScore: 62,
      weakConcepts: ["number", "string"],
      nextAction: "Review number, then retry this drill.",
      resultId: 77,
      completedAt: "2026-04-12T10:00:00",
      answers: [
        {
          questionId: "q-coding-2",
          topicId: "coding-variables",
          prompt: "Name two examples of values that can be stored in variables.",
          learnerAnswer: "score",
          correctAnswer: "number, text, boolean, string",
          correct: false,
          score: 50,
          explanation: "Common variable values include numbers and text.",
          weakConcepts: ["number"],
        },
      ],
    });

    expect(result.serverResultId).toBe(77);
    expect(result.recoveryScore).toBe(62);
    expect(result.weakConcepts).toEqual(["number", "string"]);
    expect(result.answers[0].score).toBe(0.5);
    expect(result.answers[0].weakConcepts).toEqual(["number"]);
  });

  it("persists server-scored results as latest and history entries", () => {
    const result = mapServerScoreToPracticeResult({
      subjectId: "dbms",
      topicId: "dbms-sql-basics",
      totalQuestions: 1,
      correctCount: 1,
      scorePercent: 100,
      xpEarned: 130,
      recoveryScore: 100,
      weakConcepts: [],
      nextAction: "Move on.",
      resultId: 12,
      completedAt: "2026-04-12T10:00:00",
      answers: [],
    });

    persistPracticeResultToCache(result);

    expect(readLocalStorage).toHaveBeenCalledWith(PRACTICE_HISTORY_KEY, []);
    expect(writeLocalStorage).toHaveBeenCalledWith(PRACTICE_LATEST_RESULT_KEY, result);
    expect(writeLocalStorage).toHaveBeenCalledWith(PRACTICE_HISTORY_KEY, [result]);
  });
});
