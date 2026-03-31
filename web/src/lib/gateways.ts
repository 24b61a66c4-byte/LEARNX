import {
  DAILY_PRACTICE_TARGET,
  EXAM_WORD_HINTS,
  LAST_TOPIC_KEY,
  LEVEL_XP_STEP,
  ONBOARDED_COOKIE,
  ONBOARDING_STORAGE_KEY,
  PRACTICE_HISTORY_KEY,
  SESSION_COOKIE,
  SESSION_STORAGE_KEY,
  TOPIC_NOTES_KEY,
  TUTOR_MAX_PROMPT_LENGTH,
  TUTOR_THREADS_KEY,
} from "@/lib/constants";
import {
  getLessonByTopicId,
  getQuestions,
  getSubjectById,
  getSubjects,
  getTopicById,
  getTopicsBySubject,
  searchCatalog,
} from "@/lib/data/catalog";
import {
  clearCookie,
  clearLocalStorage,
  readLocalStorage,
  setCookie,
  writeLocalStorage,
} from "@/lib/storage";
import { getTutorApiUrl } from "@/lib/runtime-config";
import { getAuthenticatedRequestHeaders } from "@/lib/supabase";
import { getStoredOnboardingProfile, getRecommendedSubjectId, normalizeOnboardingProfile } from "@/lib/profile-preferences";
import {
  AppSession,
  DashboardView,
  OnboardingProfile,
  PracticeResult,
  PracticeSubmission,
  ProgressSnapshot,
  ProgressTopicSummary,
  Question,
  RecommendationView,
  RewardBadge,
  RewardSnapshot,
  SessionProfile,
  StudyNote,
  StudyNoteSource,
  SubjectId,
  Topic,
  TutorMode,
  TutorResponse,
  TutorThread,
} from "@/lib/types";

export interface SessionGateway {
  getSession(): AppSession;
  signIn(profile: SessionProfile): AppSession;
  signUp(profile: SessionProfile): AppSession;
  completeOnboarding(profile: OnboardingProfile): AppSession;
  signOut(): void;
}

export interface CatalogGateway {
  getSubjects(): ReturnType<typeof getSubjects>;
  getTopicsBySubject(subjectId: SubjectId): ReturnType<typeof getTopicsBySubject>;
  search(query: string): ReturnType<typeof searchCatalog>;
}

export interface LearnerStateGateway {
  saveLastVisitedTopic(topicId: string): void;
  getLastVisitedTopic(): Topic | null;
  getRecommendation(preferredSubjectId?: SubjectId): RecommendationView | null;
  getDashboard(preferredSubjectId?: SubjectId): DashboardView;
  getProgressSnapshot(): ProgressSnapshot;
}

export interface TutorGateway {
  ask(input: {
    subjectId: SubjectId;
    topicId?: string;
    prompt: string;
    mode: TutorMode;
  }): Promise<TutorResponse>;
  getThreads(): TutorThread[];
  appendThread(thread: TutorThread): void;
}

export interface NotesGateway {
  getTopicNotes(topicId: string): StudyNote[];
  saveTopicNote(input: {
    subjectId: SubjectId;
    topicId: string;
    title: string;
    content: string;
    source?: StudyNoteSource;
  }): StudyNote;
  deleteTopicNote(noteId: string): void;
}

export interface PracticeGateway {
  getQuickPractice(subjectId?: SubjectId, topicId?: string): Question[];
  submit(input: {
    subjectId: SubjectId;
    topicId?: string;
    answers: PracticeSubmission[];
  }): PracticeResult;
  getHistory(): PracticeResult[];
}

export const defaultSession: AppSession = {
  isAuthenticated: false,
  profile: null,
  onboarded: false,
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function buildAuthenticatedJsonHeaders() {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const authHeaders = await getAuthenticatedRequestHeaders();
  for (const [name, value] of Object.entries(authHeaders)) {
    headers.set(name, value);
  }

  return headers;
}

function createClientId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

function hasBlockedContent(prompt: string) {
  const normalized = prompt.toLowerCase();
  return ["hate", "kill", "abuse", "harass"].some((item) => normalized.includes(item));
}

function toDayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayDifference(leftKey: string, rightKey: string) {
  const left = new Date(`${leftKey}T00:00:00`);
  const right = new Date(`${rightKey}T00:00:00`);

  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.round((left.getTime() - right.getTime()) / (1000 * 60 * 60 * 24));
}

function getPreferredSubjectId(preferredSubjectId?: SubjectId) {
  if (preferredSubjectId) {
    return preferredSubjectId;
  }

  const onboarding = getStoredOnboardingProfile();
  return getRecommendedSubjectId(onboarding?.age, onboarding?.cognitiveGroup, onboarding?.interests);
}

function getHistory() {
  return readLocalStorage<PracticeResult[]>(PRACTICE_HISTORY_KEY, []);
}

function getThreads() {
  return readLocalStorage<TutorThread[]>(TUTOR_THREADS_KEY, []);
}

function getStoredNotes() {
  return readLocalStorage<StudyNote[]>(TOPIC_NOTES_KEY, []);
}

function persistSession(profile: SessionProfile, onboarded: boolean) {
  const session: AppSession = {
    isAuthenticated: true,
    profile,
    onboarded,
  };

  writeLocalStorage(SESSION_STORAGE_KEY, session);
  setCookie(SESSION_COOKIE, "active");
  setCookie(ONBOARDED_COOKIE, onboarded ? "1" : "0");
  return session;
}

function getQuestionAnswerLabel(question: Question) {
  if (question.type === "MCQ" && question.correctOptionIndex !== null) {
    return question.options[question.correctOptionIndex];
  }

  return question.acceptedKeywords.join(", ");
}

function evaluateAnswer(question: Question, answer: string) {
  if (question.type === "MCQ") {
    const correctAnswer = getQuestionAnswerLabel(question);
    const correct = answer.trim() === correctAnswer;
    return { correct, score: correct ? 1 : 0, correctAnswer };
  }

  const normalized = answer.toLowerCase();
  const matches = question.acceptedKeywords.filter((keyword) =>
    normalized.includes(keyword.toLowerCase()),
  );
  const needed = question.minKeywordMatches ?? Math.max(1, question.acceptedKeywords.length);
  const correct = matches.length >= needed;
  return {
    correct,
    score: correct ? 1 : matches.length / needed,
    correctAnswer: getQuestionAnswerLabel(question),
  };
}

function calculateXpForResult(result: Pick<PracticeResult, "scorePercent" | "correctCount" | "topicId">) {
  const masteryBonus = result.scorePercent >= 85 ? 20 : result.scorePercent >= 70 ? 10 : 0;
  const topicBonus = result.topicId ? 5 : 0;
  return 20 + result.scorePercent + result.correctCount * 5 + masteryBonus + topicBonus;
}

function getRewardBadges(input: {
  completedAttempts: number;
  streakDays: number;
  history: PracticeResult[];
  strongTopics: ProgressTopicSummary[];
  weakTopics: ProgressTopicSummary[];
}): RewardBadge[] {
  const badges: RewardBadge[] = [];

  if (input.completedAttempts >= 1) {
    badges.push({
      id: "first-drill",
      label: "First Drill",
      description: "Completed the first practice run.",
    });
  }

  if (input.history.some((result) => result.scorePercent >= 85)) {
    badges.push({
      id: "sharp-answer",
      label: "Sharp Answer",
      description: "Scored at least 85% in one drill.",
    });
  }

  if (input.streakDays >= 3) {
    badges.push({
      id: "consistency-streak",
      label: "Consistency Streak",
      description: "Studied on three consecutive days.",
    });
  }

  if (input.strongTopics.length >= 2) {
    badges.push({
      id: "concept-anchor",
      label: "Concept Anchor",
      description: "Built strong confidence across multiple topics.",
    });
  }

  if (input.completedAttempts >= 5 && input.weakTopics.length <= 1) {
    badges.push({
      id: "recovery-run",
      label: "Recovery Run",
      description: "Turned repeated practice into visible recovery.",
    });
  }

  return badges;
}

function getNextBadgeLabel(completedAttempts: number, streakDays: number, badges: RewardBadge[]) {
  const earned = new Set(badges.map((badge) => badge.id));

  if (!earned.has("first-drill")) {
    return "Complete your first drill";
  }

  if (!earned.has("sharp-answer")) {
    return "Hit 85% on one practice";
  }

  if (!earned.has("consistency-streak")) {
    const daysLeft = Math.max(0, 3 - streakDays);
    return `${daysLeft} more day${daysLeft === 1 ? "" : "s"} to earn Consistency Streak`;
  }

  if (!earned.has("concept-anchor")) {
    return "Build 2 strong topics to unlock Concept Anchor";
  }

  if (!earned.has("recovery-run")) {
    return `${Math.max(0, 5 - completedAttempts)} more drills to unlock Recovery Run`;
  }

  return "All current badges unlocked";
}

function buildRewardSnapshot(
  history: PracticeResult[],
  strongTopics: ProgressTopicSummary[],
  weakTopics: ProgressTopicSummary[],
): RewardSnapshot {
  const todayKey = toDayKey(new Date().toISOString());
  const uniqueDays = [...new Set(history.map((result) => toDayKey(result.completedAt)).filter(Boolean))].sort(
    (left, right) => right.localeCompare(left),
  );

  let streakDays = 0;
  const latestDay = uniqueDays[0];
  if (latestDay && getDayDifference(todayKey, latestDay) <= 1) {
    let previousDay = latestDay;
    streakDays = 1;

    for (let index = 1; index < uniqueDays.length; index += 1) {
      const day = uniqueDays[index];
      if (getDayDifference(previousDay, day) === 1) {
        streakDays += 1;
        previousDay = day;
        continue;
      }
      break;
    }
  }

  const xp = history.reduce(
    (sum, result) => sum + (result.xpEarned ?? calculateXpForResult(result)),
    0,
  );
  const level = Math.max(1, Math.floor(xp / LEVEL_XP_STEP) + 1);
  const xpToNextLevel = level * LEVEL_XP_STEP - xp;
  const percentile = Math.min(98, 55 + Math.round(xp / 30));
  const badges = getRewardBadges({
    completedAttempts: history.length,
    streakDays,
    history,
    strongTopics,
    weakTopics,
  });

  return {
    xp,
    level,
    xpToNextLevel,
    streakDays,
    percentile,
    leaderboardLabel: `Top ${Math.max(2, 100 - percentile)}% pace`,
    nextBadgeLabel: getNextBadgeLabel(history.length, streakDays, badges),
    badges,
  };
}

function buildProgressSnapshot(history: PracticeResult[]): ProgressSnapshot {
  const summaries = new Map<string, { title: string; subjectId: SubjectId; scores: number[] }>();

  history.forEach((result) => {
    if (!result.topicId) {
      return;
    }

    const topic = getTopicById(result.topicId);
    if (!topic) {
      return;
    }

    const current = summaries.get(topic.id) ?? {
      title: topic.title,
      subjectId: topic.subjectId,
      scores: [],
    };
    current.scores.push(result.scorePercent);
    summaries.set(topic.id, current);
  });

  const topicSummaries = [...summaries.entries()].map(([topicId, summary]) => ({
    topicId,
    title: summary.title,
    subjectId: summary.subjectId,
    accuracy: Math.round(
      summary.scores.reduce((sum, value) => sum + value, 0) / summary.scores.length,
    ),
    attempts: summary.scores.length,
  }));

  const weakTopics = topicSummaries.filter((topic) => topic.accuracy < 70).slice(0, 3);
  const strongTopics = topicSummaries.filter((topic) => topic.accuracy >= 80).slice(0, 3);
  const rewards = buildRewardSnapshot(history, strongTopics, weakTopics);

  return {
    completedAttempts: history.length,
    weakTopics,
    strongTopics,
    recentActivity: history.slice(0, 4),
    rewards,
  };
}

export function getServerProgressSnapshot(): ProgressSnapshot {
  return buildProgressSnapshot([]);
}

export function getServerDashboard(preferredSubjectId?: SubjectId): DashboardView {
  const targetSubject = getPreferredSubjectId(preferredSubjectId);
  const topics = getTopicsBySubject(targetSubject);
  const fallbackTopic = topics[0] ?? getTopicsBySubject("dbms")[0] ?? null;
  const rewards = getServerProgressSnapshot().rewards;

  return {
    resumeTopic: null,
    recommendation: fallbackTopic
      ? {
        title: fallbackTopic.title,
        reason: "Start the next recommended topic in your selected subject.",
        href: `/app/learn/${fallbackTopic.subjectId}/${fallbackTopic.id}`,
      }
      : null,
    quickPracticeHref: "/app/practice",
    rewards,
    todayAttempts: 0,
    dailyGoalTarget: DAILY_PRACTICE_TARGET,
  };
}

export const sessionGateway: SessionGateway = {
  getSession() {
    return readLocalStorage<AppSession>(SESSION_STORAGE_KEY, defaultSession);
  },
  signIn(profile) {
    return persistSession(profile, Boolean(getStoredOnboardingProfile()));
  },
  signUp(profile) {
    clearLocalStorage(ONBOARDING_STORAGE_KEY);
    return persistSession(profile, false);
  },
  completeOnboarding(profile) {
    writeLocalStorage(ONBOARDING_STORAGE_KEY, normalizeOnboardingProfile(profile));
    const currentSession = readLocalStorage<AppSession>(SESSION_STORAGE_KEY, defaultSession);

    return persistSession(
      currentSession.profile ?? {
        displayName: "LearnX Student",
        email: "student@learnx.app",
      },
      true,
    );
  },
  signOut() {
    clearCookie(SESSION_COOKIE);
    clearCookie(ONBOARDED_COOKIE);
    clearLocalStorage(SESSION_STORAGE_KEY);
    clearLocalStorage(ONBOARDING_STORAGE_KEY);
    clearLocalStorage(PRACTICE_HISTORY_KEY);
    clearLocalStorage(TOPIC_NOTES_KEY);
    clearLocalStorage(TUTOR_THREADS_KEY);
    clearLocalStorage(LAST_TOPIC_KEY);
  },
};

export const catalogGateway: CatalogGateway = {
  getSubjects,
  getTopicsBySubject,
  search: searchCatalog,
};

export const learnerStateGateway: LearnerStateGateway = {
  saveLastVisitedTopic(topicId) {
    writeLocalStorage(LAST_TOPIC_KEY, topicId);
  },
  getLastVisitedTopic() {
    const topicId = readLocalStorage<string | null>(LAST_TOPIC_KEY, null);
    return topicId ? getTopicById(topicId) ?? null : null;
  },
  getRecommendation(preferredSubjectId) {
    const history = getHistory();
    const targetSubject = getPreferredSubjectId(preferredSubjectId);
    const candidateTopics = getTopicsBySubject(targetSubject);

    const ranked = candidateTopics
      .map((topic) => {
        const attempts = history.filter((result) => result.topicId === topic.id);
        const average =
          attempts.length === 0
            ? 0
            : attempts.reduce((sum, result) => sum + result.scorePercent, 0) / attempts.length;
        return { topic, average, attempts: attempts.length };
      })
      .sort((left, right) => {
        if (left.attempts === 0 && right.attempts !== 0) {
          return -1;
        }
        if (right.attempts === 0 && left.attempts !== 0) {
          return 1;
        }
        return left.average - right.average;
      });

    const next = ranked[0]?.topic;
    if (!next) {
      return null;
    }

    return {
      title: next.title,
      reason:
        ranked[0]?.attempts === 0
          ? "Start the next recommended topic in your selected subject."
          : "This topic still has room to improve based on your latest practice.",
      href: `/app/learn/${next.subjectId}/${next.id}`,
    };
  },
  getDashboard(preferredSubjectId) {
    const history = getHistory();
    const recommendation = learnerStateGateway.getRecommendation(preferredSubjectId);
    const resumeTopic = learnerStateGateway.getLastVisitedTopic();
    const progress = buildProgressSnapshot(history);
    const todayKey = toDayKey(new Date().toISOString());
    const todayAttempts = history.filter((item) => toDayKey(item.completedAt) === todayKey).length;

    return {
      resumeTopic,
      recommendation,
      quickPracticeHref: "/app/practice",
      rewards: progress.rewards,
      todayAttempts,
      dailyGoalTarget: DAILY_PRACTICE_TARGET,
    };
  },
  getProgressSnapshot() {
    return buildProgressSnapshot(getHistory());
  },
};

export const tutorGateway: TutorGateway = {
  async ask({ subjectId, topicId, prompt, mode }) {
    const sanitized = prompt.trim();
    if (!sanitized) {
      throw new Error("validation: Prompt must not be empty.");
    }
    if (sanitized.length > TUTOR_MAX_PROMPT_LENGTH) {
      throw new Error(`validation: Prompt exceeds ${TUTOR_MAX_PROMPT_LENGTH} characters.`);
    }
    if (hasBlockedContent(sanitized)) {
      throw new Error("validation: Prompt violates tutor safety policy.");
    }

    await wait(200);

    const learnerId = readLocalStorage<{ profile: { email: string } | null } | null>(SESSION_STORAGE_KEY, null)?.profile?.email ?? "guest";
    const tutorApiUrl = getTutorApiUrl();
    const fallbackTopicId = topicId || getTopicsBySubject(subjectId)[0]?.id;

    if (!fallbackTopicId) {
      throw new Error("validation: No topic available for this subject.");
    }

    // Attempt real backend call first
    try {
      const headers = await buildAuthenticatedJsonHeaders();
      const res = await fetch(tutorApiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          learnerId,
          subjectId,
          topicId: fallbackTopicId,
          examContextId: "",
          userQuestion: sanitized,
          maxResources: 6,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json() as {
          explanation: string;
          examAnswerOutline: string;
          keyPoints: string[];
          fallback: boolean;
          aiResponse: { text: string; model: string; mode: string; latencyMs: number };
        };
        const answer = data.explanation ?? data.aiResponse?.text ?? "";
        return {
          answer,
          followUpPrompt:
            mode === "quiz-me"
              ? "Want me to generate a 2-question drill on this topic next?"
              : mode === "exam-answer"
                ? EXAM_WORD_HINTS["exam-answer"]
                : "Want a shorter note version or a quick quiz on this topic?",
          aiResponse: {
            text: answer,
            model: data.aiResponse?.model ?? "learnx-gemini",
            mode: mode,
            latencyMs: data.aiResponse?.latencyMs ?? 0,
          },
        };
      }

      if (process.env.NODE_ENV === "production") {
        throw new Error(`Tutor service returned ${res.status}.`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw error instanceof Error
          ? error
          : new Error("Tutor service is currently unavailable.");
      }

      // Fall through to local mock if backend is unreachable in development
    }

    // Local fallback mock
    const subject = getSubjectById(subjectId);
    const topic = topicId ? getTopicById(topicId) : null;
    const lesson = topicId ? getLessonByTopicId(topicId) : null;
    const focus = topic?.title ?? subject?.name ?? "the selected concept";
    const lessonHint = lesson?.blocks[0]?.content[0] ?? "Focus on the core definition first.";

    const answerMap: Record<TutorMode, string> = {
      explain: `${focus}: ${lessonHint} Break it into definition, intuition, and one short example before going deeper.`,
      "exam-answer": `${focus}: Start with a clean definition, list 2-3 key points, and end with one exam-oriented conclusion sentence.`,
      "quiz-me": `Quick self-check on ${focus}: explain it in one line, give one example, and identify one common mistake or confusion.`,
    };

    const answer = `${answerMap[mode]} Your prompt was: "${sanitized}".`;
    return {
      answer,
      followUpPrompt:
        mode === "quiz-me"
          ? "Want me to generate a 2-question drill on this topic next?"
          : mode === "exam-answer"
            ? EXAM_WORD_HINTS["exam-answer"]
            : "Want a shorter note version or a quick quiz on this topic?",
      aiResponse: {
        text: answer,
        model: "learnx-mock-v1",
        mode,
        latencyMs: 200,
      },
    };
  },
  getThreads() {
    return getThreads().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  },
  appendThread(thread) {
    const current = getThreads().filter((item) => item.id !== thread.id);
    writeLocalStorage(TUTOR_THREADS_KEY, [thread, ...current]);
  },
};

export const notesGateway: NotesGateway = {
  getTopicNotes(topicId) {
    return getStoredNotes()
      .filter((note) => note.topicId === topicId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  },
  saveTopicNote({ subjectId, topicId, title, content, source = "manual" }) {
    const sanitizedContent = content.trim();
    if (!sanitizedContent) {
      throw new Error("validation: Note content must not be empty.");
    }

    const timestamp = new Date().toISOString();
    const note: StudyNote = {
      id: createClientId("note"),
      subjectId,
      topicId,
      title: title.trim() || "Quick note",
      content: sanitizedContent,
      source,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    writeLocalStorage(TOPIC_NOTES_KEY, [note, ...getStoredNotes()]);
    return note;
  },
  deleteTopicNote(noteId) {
    writeLocalStorage(
      TOPIC_NOTES_KEY,
      getStoredNotes().filter((note) => note.id !== noteId),
    );
  },
};

export const practiceGateway: PracticeGateway = {
  getQuickPractice(subjectId, topicId) {
    return getQuestions(subjectId, topicId).slice(0, 5);
  },
  submit({ subjectId, topicId, answers }) {
    const previousHistory = getHistory();
    const questionBank = practiceGateway.getQuickPractice(subjectId, topicId);
    const evaluated = questionBank.map((question) => {
      const submitted = answers.find((answer) => answer.questionId === question.id);
      const learnerAnswer = submitted?.answer ?? "";
      const result = evaluateAnswer(question, learnerAnswer);
      return {
        questionId: question.id,
        prompt: question.prompt,
        correct: result.correct,
        score: result.score,
        explanation: question.explanation,
        learnerAnswer,
        correctAnswer: result.correctAnswer,
      };
    });

    const totalScore = evaluated.reduce((sum, answer) => sum + answer.score, 0);
    const scorePercent =
      questionBank.length === 0 ? 0 : Math.round((totalScore / questionBank.length) * 100);
    const baseResult = {
      subjectId,
      topicId,
      scorePercent,
      correctCount: evaluated.filter((answer) => answer.correct).length,
      totalCount: evaluated.length,
      completedAt: new Date().toISOString(),
    };
    const xpEarned = calculateXpForResult(baseResult);
    const result: PracticeResult = {
      ...baseResult,
      xpEarned,
      badgeAwarded: null,
      answers: evaluated,
    };

    const previousBadges = new Set(buildProgressSnapshot(previousHistory).rewards.badges.map((badge) => badge.id));
    const nextHistory = [result, ...previousHistory];
    const nextBadges = buildProgressSnapshot(nextHistory).rewards.badges;
    const earnedBadge = nextBadges.find((badge) => !previousBadges.has(badge.id));
    const persistedResult: PracticeResult = {
      ...result,
      badgeAwarded: earnedBadge?.label ?? null,
    };

    writeLocalStorage(PRACTICE_HISTORY_KEY, [persistedResult, ...previousHistory]);

    return persistedResult;
  },
  getHistory,
};
