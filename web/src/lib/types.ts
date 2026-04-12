export type SubjectId = string; // Dynamically loaded from API, not hardcoded
export type QuestionType = "MCQ" | "SHORT_ANSWER";
export type TutorMode = "explain" | "exam-answer" | "quiz-me";
export type StudyGoal =
  | "understand-concepts"
  | "prepare-exams"
  | "improve-problem-solving"
  | "revise-weak-topics";
export type ExamTarget = "semester-exam" | "internal-assessment" | "lab-viva" | "interview-prep";
export type LaunchMode = "lesson" | "coach" | "streak";
export type CognitiveGroup = "kids" | "tweens" | "teens" | "adults";
export type AccessibilityFeature = "high-contrast" | "large-text" | "screen-reader" | "voice-mode";

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
  preferredTopicIds?: string[];
  studyGoal: StudyGoal;
  examTarget?: ExamTarget;
  launchMode?: LaunchMode;
  age?: number;
  cognitiveGroup?: CognitiveGroup;
  interests?: string[];
  enableVisualDiagrams?: boolean;
  enableVoiceInput?: boolean;
  enableQuizMode?: boolean;
  accessibilityFeatures?: AccessibilityFeature[];
}

export interface ProgressTopicSummary {
  topicId: string;
  title: string;
  subjectId: SubjectId;
  accuracy: number;
  attempts: number;
}

export interface RewardBadge {
  id: string;
  label: string;
  description: string;
}

export interface RewardSnapshot {
  xp: number;
  level: number;
  xpToNextLevel: number;
  streakDays: number;
  percentile: number;
  leaderboardLabel: string;
  nextBadgeLabel: string;
  badges: RewardBadge[];
}

export interface ProgressSnapshot {
  completedAttempts: number;
  weakTopics: ProgressTopicSummary[];
  strongTopics: ProgressTopicSummary[];
  recentActivity: PracticeResult[];
  rewards: RewardSnapshot;
}

export type StudyNoteSource = "manual" | "seed" | "lesson" | "tutor" | "practice";

export interface StudyNote {
  id: string;
  serverId?: number;
  subjectId: SubjectId;
  topicId: string;
  title: string;
  content: string;
  source: StudyNoteSource;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeSubmission {
  questionId: string;
  answer: string;
}

export interface PracticeAnswerResult {
  questionId: string;
  topicId?: string;
  prompt: string;
  correct: boolean;
  score: number;
  explanation: string;
  learnerAnswer: string;
  correctAnswer: string;
  weakConcepts?: string[];
}

export interface PracticeResult {
  serverResultId?: number;
  subjectId: SubjectId;
  topicId?: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
  badgeAwarded?: string | null;
  weakConcepts?: string[];
  recoveryScore?: number;
  nextAction?: string;
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
  rewards: RewardSnapshot;
  todayAttempts: number;
  dailyGoalTarget: number;
}

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  mode?: TutorMode;
  text: string;
  createdAt: string;
  diagnosis?: StudyDiagnosis | null;
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
  diagnosis?: StudyDiagnosis | null;
}

export interface TutorThread {
  id: string;
  subjectId?: SubjectId;
  topicId?: string;
  messages: TutorMessage[];
  updatedAt: string;
}

export interface SuggestedDrill {
  subjectId: SubjectId | "";
  topicId: string;
  questionCount: number;
  href: string;
  reason: string;
}

export interface StudyDiagnosis {
  subjectId: SubjectId | "";
  topicId: string;
  weakConcepts: string[];
  confidence: number;
  suggestedDrill: SuggestedDrill;
  nextAction: string;
}
