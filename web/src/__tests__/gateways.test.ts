import { beforeEach, describe, expect, it, vi } from "vitest";

import { catalogGateway, learnerStateGateway, practiceGateway, sessionGateway } from "@/lib/gateways";
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
  it("fetches subjects", () => {
    const subjects = catalogGateway.getSubjects();
    expect(Array.isArray(subjects)).toBe(true);
    expect(subjects.length).toBeGreaterThan(0);
  });
});

describe("Learner Rewards", () => {
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
});
