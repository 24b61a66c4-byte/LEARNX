import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthenticatedRequestHeaders = vi.hoisted(() =>
  vi.fn(async () => ({
    Authorization: "Bearer test-token",
  })),
);

const mockFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({
  getAuthenticatedRequestHeaders: mockGetAuthenticatedRequestHeaders,
}));

vi.mock("@/lib/storage", () => ({
  readLocalStorage: vi.fn((key: string, fallback: unknown) => {
    if (key === "learnx.session") {
      return { profile: { email: "student@example.com" } };
    }

    return fallback;
  }),
  writeLocalStorage: vi.fn(),
  setCookie: vi.fn(),
  clearCookie: vi.fn(),
  clearLocalStorage: vi.fn(),
}));

import { profileApi } from "@/lib/api";
import { tutorGateway } from "@/lib/gateways";

function createJsonResponse(body: unknown, status = 200) {
  const payload = JSON.stringify(body);

  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({
      "content-type": "application/json",
    }),
    text: async () => payload,
    json: async () => body,
  } as Response;
}

describe("authenticated backend requests", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockGetAuthenticatedRequestHeaders.mockClear();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("includes the bearer token in API client requests", async () => {
    mockFetch.mockResolvedValueOnce(createJsonResponse({ id: 1, userId: "user-123" }));

    await profileApi.getProfile("user-123");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, init] = mockFetch.mock.calls[0];
    const headers = new Headers((init as RequestInit).headers);

    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("includes the bearer token in tutor requests", async () => {
    vi.useFakeTimers();
    mockFetch.mockResolvedValueOnce(
      createJsonResponse({
        explanation: "Joins combine rows from related tables.",
        examAnswerOutline: "",
        keyPoints: [],
        fallback: false,
        aiResponse: {
          text: "Joins combine rows from related tables.",
          model: "learnx-gemini",
          mode: "explain",
          latencyMs: 12,
        },
      }),
    );

    const askPromise = tutorGateway.ask({
      subjectId: "dbms",
      topicId: "dbms-sql-basics",
      prompt: "Explain joins",
      mode: "explain",
    });

    await vi.advanceTimersByTimeAsync(200);
    const result = await askPromise;

    expect(result.answer).toContain("Joins combine rows");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [, init] = mockFetch.mock.calls[0];
    const headers = new Headers((init as RequestInit).headers);

    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });
});
