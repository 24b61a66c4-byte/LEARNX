import { beforeEach, describe, expect, it, vi } from "vitest";

import { catalogGateway, sessionGateway } from "@/lib/gateways";

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
