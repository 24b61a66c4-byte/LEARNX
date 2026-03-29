export type SubjectId = "dbms" | "edc";
export type QuestionType = "MCQ" | "SHORT_ANSWER";
export type TutorMode = "explain" | "exam-answer" | "quiz-me";
export type StudyGoal =
  | "understand-concepts"
  | "prepare-exams"
  | "improve-problem-solving"
  | "revise-weak-topics";

export interface Subject {
  id: SubjectId;
  name: string;
  description: string;
  tags: string[];
  accent: string;
  backdrop: string;
}

export interface Topic {
  id: string;
  subjectId: SubjectId;
  title: string;
  summary: string;
  prerequisiteIds: string[];
  difficulty: number;
  examImportance: number;
  tags: string[];
}

export interface ExamContext {
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  focusTopicIds: string[];
  tags: string[];
}

export interface Question {
  id: string;
  subjectId: SubjectId;
  topicId: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctOptionIndex: number | null;
  acceptedKeywords: string[];
  minKeywordMatches?: number;
  explanation: string;
  difficulty: number;
}

export interface LessonBlock {
  id: string;
  kind:
  | "summary"
  | "deep-dive"
  | "steps"
  | "example"
  | "exam"
  | "mistake-watch"
  | "formula";
  title: string;
  content: string[];
}

export interface Lesson {
  topicId: string;
  blocks: LessonBlock[];
}

export interface SessionProfile {
  displayName: string;
  email: string;
}

export interface AppSession {
  isAuthenticated: boolean;
  profile: SessionProfile | null;
  onboarded: boolean;
}

export interface OnboardingProfile {
  preferredSubjectId: SubjectId;
  studyGoal: StudyGoal;
}

export interface ProgressTopicSummary {
  topicId: string;
  title: string;
  subjectId: SubjectId;
  accuracy: number;
  attempts: number;
}

export interface ProgressSnapshot {
  completedAttempts: number;
  weakTopics: ProgressTopicSummary[];
  strongTopics: ProgressTopicSummary[];
  recentActivity: PracticeResult[];
}

export interface PracticeSubmission {
  questionId: string;
  answer: string;
}

export interface PracticeAnswerResult {
  questionId: string;
  prompt: string;
  correct: boolean;
  score: number;
  explanation: string;
  learnerAnswer: string;
  correctAnswer: string;
}

export interface PracticeResult {
  subjectId: SubjectId;
  topicId?: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  answers: PracticeAnswerResult[];
  completedAt: string;
}

export interface RecommendationView {
  title: string;
  reason: string;
  href: string;
}

export interface DashboardView {
  resumeTopic: Topic | null;
  recommendation: RecommendationView | null;
  quickPracticeHref: string;
}

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  mode?: TutorMode;
  text: string;
  createdAt: string;
}

export interface TutorResponse {
  answer: string;
  followUpPrompt: string;
  aiResponse: {
    text: string;
    model: string;
    mode: TutorMode;
    latencyMs: number;
  };
}

export interface TutorThread {
  id: string;
  subjectId: SubjectId;
  topicId?: string;
  messages: TutorMessage[];
  updatedAt: string;
}
