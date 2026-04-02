import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  catalogGateway,
  getServerDashboard,
  getServerProgressSnapshot,
  learnerStateGateway,
  notesGateway,
  practiceGateway,
  sessionGateway,
  tutorGateway,
} from "@/lib/gateways";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

vi.mock("@/lib/storage", () => ({
  readLocalStorage: vi.fn((_key: string, fallback: unknown) => fallback),
  writeLocalStorage: vi.fn(),
  setCookie: vi.fn(),
  clearCookie: vi.fn(),
  clearLocalStorage: vi.fn(),
}));

describe("Session Gateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns default session when no storage", () => {
    const result = sessionGateway.getSession();
    expect(result.isAuthenticated).toBe(false);
  });

  it("signs in user", () => {
    const profile = { displayName: "Test", email: "test@example.com" };
    const result = sessionGateway.signIn(profile);
    expect(result.isAuthenticated).toBe(true);
    expect(result.profile).toEqual(profile);
  });
});

describe("Catalog Gateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("fetches subjects", () => {
    const subjects = catalogGateway.getSubjects();
    expect(Array.isArray(subjects)).toBe(true);
    expect(subjects.length).toBeGreaterThan(0);
  });
});

describe("Server-safe snapshots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns a deterministic server progress snapshot without storage reads", () => {
    const snapshot = getServerProgressSnapshot();

    expect(snapshot.completedAttempts).toBe(0);
    expect(snapshot.recentActivity).toHaveLength(0);
    expect(snapshot.rewards.level).toBe(1);
    expect(vi.mocked(readLocalStorage)).not.toHaveBeenCalled();
  });

  it("returns a server dashboard fallback without storage reads", () => {
    const dashboard = getServerDashboard("dbms");

    expect(dashboard.todayAttempts).toBe(0);
    expect(dashboard.quickPracticeHref).toContain("/app/practice?");
    expect(dashboard.recommendation).not.toBeNull();
    expect(vi.mocked(readLocalStorage)).not.toHaveBeenCalled();
  });
});

describe("Learner Rewards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("derives rewards from practice history", () => {
    vi.mocked(readLocalStorage).mockImplementation((key: string, fallback: unknown) => {
      if (key === "learnx.practiceHistory") {
        return [
          {
            subjectId: "dbms",
            topicId: "dbms-joins",
            scorePercent: 90,
            correctCount: 2,
            totalCount: 2,
            xpEarned: 130,
            badgeAwarded: "Sharp Answer",
            answers: [],
            completedAt: new Date().toISOString(),
          },
          {
            subjectId: "dbms",
            topicId: "dbms-sql-basics",
            scorePercent: 82,
            correctCount: 1,
            totalCount: 1,
            xpEarned: 117,
            badgeAwarded: null,
            answers: [],
            completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
      }

      return fallback;
    });

    const snapshot = learnerStateGateway.getProgressSnapshot();

    expect(snapshot.rewards.xp).toBeGreaterThan(0);
    expect(snapshot.rewards.level).toBeGreaterThanOrEqual(1);
    expect(snapshot.rewards.badges.length).toBeGreaterThan(0);
    expect(snapshot.rewards.streakDays).toBeGreaterThanOrEqual(2);
  });
});

describe("Practice Gateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("awards xp and persists the result", () => {
    vi.mocked(readLocalStorage).mockImplementation((key: string, fallback: unknown) => {
      if (key === "learnx.practiceHistory") {
        return [];
      }

      return fallback;
    });

    const result = practiceGateway.submit({
      subjectId: "dbms",
      topicId: "dbms-sql-basics",
      answers: [
        {
          questionId: "q-dbms-1",
          answer: "WHERE",
        },
      ],
    });

    expect(result.xpEarned).toBeGreaterThan(0);
    expect(vi.mocked(writeLocalStorage)).toHaveBeenCalled();
  });

  it("persists and reloads latest result for results-page refresh", () => {
    const captured = new Map<string, unknown>();
    vi.mocked(writeLocalStorage).mockImplementation((key: string, value: unknown) => {
      captured.set(key, value);
    });
    vi.mocked(readLocalStorage).mockImplementation((key: string, fallback: unknown) => {
      return captured.has(key) ? captured.get(key) : fallback;
    });

    const submitted = practiceGateway.submit({
      subjectId: "dbms",
      topicId: "dbms-sql-basics",
      answers: [
        {
          questionId: "q-dbms-1",
          answer: "WHERE",
        },
      ],
    });

    const latest = practiceGateway.getLatestResult();

    expect(latest).not.toBeNull();
    expect(latest?.completedAt).toBe(submitted.completedAt);
    expect(latest?.subjectId).toBe("dbms");
    expect(latest?.topicId).toBe("dbms-sql-basics");
  });
});

describe("Notes Gateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("saves and persists a topic note", () => {
    vi.mocked(readLocalStorage).mockImplementation((key: string, fallback: unknown) => {
      if (key === "learnx.topicNotes") {
        return [];
      }

      return fallback;
    });

    const result = notesGateway.saveTopicNote({
      subjectId: "dbms",
      topicId: "dbms-joins",
      title: "Joins quick note",
      content: "Inner join returns matching rows. Left join keeps all rows from the left table.",
      source: "lesson",
    });

    expect(result.topicId).toBe("dbms-joins");
    expect(result.source).toBe("lesson");
    expect(vi.mocked(writeLocalStorage)).toHaveBeenCalled();
  });

  it("prefers onboarding topic choices when building recommendations", () => {
    vi.mocked(readLocalStorage).mockImplementation((key: string, fallback: unknown) => {
      if (key === "learnx.onboarding") {
        return {
          preferredSubjectId: "dbms",
          preferredTopicIds: ["dbms-joins"],
          studyGoal: "understand-concepts",
        };
      }

      if (key === "learnx.practiceHistory") {
        return [];
      }

      return fallback;
    });

    const recommendation = learnerStateGateway.getRecommendation("dbms");

    expect(recommendation?.title).toBe("Patterns and Relationships");
    expect(recommendation?.reason).toContain("picked during onboarding");
  });
});

describe("Tutor Gateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("supports open-ended asks without forcing subject or topic context", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        explanation: "Photosynthesis is how plants turn sunlight into food.",
        examAnswerOutline: "Define it, explain the inputs, state the output.",
        keyPoints: ["Sunlight", "Water", "Carbon dioxide"],
        fallback: false,
        aiResponse: {
          text: "Photosynthesis is how plants turn sunlight into food.",
          model: "learnx-gemini",
          mode: "explain",
          latencyMs: 128,
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await tutorGateway.ask({
      prompt: "What's photosynthesis?",
      mode: "explain",
    });

    expect(result.answer).toContain("Photosynthesis");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const requestBody = JSON.parse(String(requestInit.body));
    expect(requestBody.subjectId).toBe("");
    expect(requestBody.topicId).toBe("");
  });
});
