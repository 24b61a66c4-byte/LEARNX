import {
  LAST_TOPIC_KEY,
  ONBOARDED_COOKIE,
  ONBOARDING_STORAGE_KEY,
  PRACTICE_HISTORY_KEY,
  SESSION_COOKIE,
  SESSION_STORAGE_KEY,
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
import {
  AppSession,
  DashboardView,
  OnboardingProfile,
  PracticeResult,
  PracticeSubmission,
  ProgressSnapshot,
  Question,
  RecommendationView,
  SessionProfile,
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

export interface PracticeGateway {
  getQuickPractice(subjectId?: SubjectId, topicId?: string): Question[];
  submit(input: {
    subjectId: SubjectId;
    topicId?: string;
    answers: PracticeSubmission[];
  }): PracticeResult;
  getHistory(): PracticeResult[];
}

const defaultSession: AppSession = {
  isAuthenticated: false,
  profile: null,
  onboarded: false,
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getOnboardingProfile(): OnboardingProfile | null {
  return readLocalStorage<OnboardingProfile | null>(ONBOARDING_STORAGE_KEY, null);
}

function getHistory() {
  return readLocalStorage<PracticeResult[]>(PRACTICE_HISTORY_KEY, []);
}

function getThreads() {
  return readLocalStorage<TutorThread[]>(TUTOR_THREADS_KEY, []);
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

export const sessionGateway: SessionGateway = {
  getSession() {
    return readLocalStorage<AppSession>(SESSION_STORAGE_KEY, defaultSession);
  },
  signIn(profile) {
    return persistSession(profile, Boolean(getOnboardingProfile()));
  },
  signUp(profile) {
    clearLocalStorage(ONBOARDING_STORAGE_KEY);
    return persistSession(profile, false);
  },
  completeOnboarding(profile) {
    writeLocalStorage(ONBOARDING_STORAGE_KEY, profile);
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
    const targetSubject = preferredSubjectId ?? getOnboardingProfile()?.preferredSubjectId ?? "dbms";
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
    const recommendation = learnerStateGateway.getRecommendation(preferredSubjectId);
    const resumeTopic = learnerStateGateway.getLastVisitedTopic();
    return {
      resumeTopic,
      recommendation,
      quickPracticeHref: "/app/practice",
    };
  },
  getProgressSnapshot() {
    const history = getHistory();
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

    return {
      completedAttempts: history.length,
      weakTopics: topicSummaries.filter((topic) => topic.accuracy < 70).slice(0, 3),
      strongTopics: topicSummaries.filter((topic) => topic.accuracy >= 80).slice(0, 3),
      recentActivity: history.slice(0, 4),
    };
  },
};

export const tutorGateway: TutorGateway = {
  async ask({ subjectId, topicId, prompt, mode }) {
    await wait(450);
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

    return {
      answer: `${answerMap[mode]} Your prompt was: "${prompt.trim()}".`,
      followUpPrompt:
        mode === "quiz-me"
          ? "Want me to generate a 2-question drill on this topic next?"
          : "Want a shorter note version or a quick quiz on this topic?",
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

export const practiceGateway: PracticeGateway = {
  getQuickPractice(subjectId, topicId) {
    return getQuestions(subjectId, topicId).slice(0, 5);
  },
  submit({ subjectId, topicId, answers }) {
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
    const result: PracticeResult = {
      subjectId,
      topicId,
      scorePercent,
      correctCount: evaluated.filter((answer) => answer.correct).length,
      totalCount: evaluated.length,
      answers: evaluated,
      completedAt: new Date().toISOString(),
    };

    writeLocalStorage(PRACTICE_HISTORY_KEY, [result, ...getHistory()]);
    return result;
  },
  getHistory,
};
