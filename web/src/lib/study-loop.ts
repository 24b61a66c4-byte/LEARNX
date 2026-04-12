import { PRACTICE_HISTORY_KEY, PRACTICE_LATEST_RESULT_KEY } from "@/lib/constants";
import { getApiBaseUrl } from "@/lib/runtime-config";
import { getAuthenticatedRequestHeaders } from "@/lib/supabase";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";
import type { PracticeResult, PracticeSubmission, SubjectId } from "@/lib/types";

interface ServerScoredAnswer {
  questionId: string;
  topicId?: string;
  prompt: string;
  learnerAnswer: string;
  correctAnswer: string;
  correct: boolean;
  score: number;
  explanation: string;
  weakConcepts?: string[];
}

interface ServerScoreDrillResponse {
  subjectId: SubjectId;
  topicId?: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  xpEarned: number;
  recoveryScore: number;
  weakConcepts: string[];
  nextAction: string;
  resultId?: number;
  completedAt?: string;
  answers: ServerScoredAnswer[];
}

export interface ScorePracticeInput {
  subjectId: SubjectId;
  topicId?: string;
  answers: PracticeSubmission[];
}

async function buildJsonHeaders() {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const authHeaders = await getAuthenticatedRequestHeaders();
  for (const [name, value] of Object.entries(authHeaders)) {
    headers.set(name, value);
  }

  return headers;
}

function normalizeCompletedAt(value?: string) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export function mapServerScoreToPracticeResult(response: ServerScoreDrillResponse): PracticeResult {
  return {
    serverResultId: response.resultId,
    subjectId: response.subjectId,
    topicId: response.topicId || undefined,
    scorePercent: Math.round(response.scorePercent),
    correctCount: response.correctCount,
    totalCount: response.totalQuestions,
    xpEarned: response.xpEarned,
    badgeAwarded: null,
    weakConcepts: response.weakConcepts ?? [],
    recoveryScore: response.recoveryScore,
    nextAction: response.nextAction,
    completedAt: normalizeCompletedAt(response.completedAt),
    answers: (response.answers ?? []).map((answer) => ({
      questionId: answer.questionId,
      topicId: answer.topicId,
      prompt: answer.prompt,
      correct: answer.correct,
      score: Math.max(0, Math.min(1, answer.score / 100)),
      explanation: answer.explanation,
      learnerAnswer: answer.learnerAnswer,
      correctAnswer: answer.correctAnswer,
      weakConcepts: answer.weakConcepts ?? [],
    })),
  };
}

export function persistPracticeResultToCache(result: PracticeResult) {
  const history = readLocalStorage<PracticeResult[]>(PRACTICE_HISTORY_KEY, []);
  const nextHistory = [
    result,
    ...history.filter((item) => {
      if (result.serverResultId && item.serverResultId) {
        return item.serverResultId !== result.serverResultId;
      }
      return item.completedAt !== result.completedAt;
    }),
  ];

  writeLocalStorage(PRACTICE_HISTORY_KEY, nextHistory);
  writeLocalStorage(PRACTICE_LATEST_RESULT_KEY, result);
}

export async function scorePracticeOnServer(input: ScorePracticeInput) {
  const response = await fetch(`${getApiBaseUrl()}/drills/score`, {
    method: "POST",
    headers: await buildJsonHeaders(),
    body: JSON.stringify({
      subjectId: input.subjectId,
      topicId: input.topicId ?? "",
      answers: input.answers.map((answer) => ({
        questionId: answer.questionId,
        answer: answer.answer,
      })),
    }),
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Drill scoring failed with ${response.status}`);
  }

  const result = mapServerScoreToPracticeResult(await response.json() as ServerScoreDrillResponse);
  persistPracticeResultToCache(result);
  return result;
}
