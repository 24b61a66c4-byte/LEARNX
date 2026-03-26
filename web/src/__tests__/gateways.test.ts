import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionGateway, catalogGateway } from '@/lib/gateways';
import { getSubjects } from '@/lib/data/catalog';

vi.mock('@/lib/storage', () => ({
    readLocalStorage: vi.fn(),
    writeLocalStorage: vi.fn(),
    setCookie: vi.fn(),
    clearCookie: vi.fn(),
    clearLocalStorage: vi.fn(),
}));

describe('Session Gateway', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns default session when no storage', () => {
        const result = sessionGateway.getSession();
        expect(result.isAuthenticated).toBe(false);
    });

    it('signs in user', () => {
        const profile = { displayName: 'Test', email: 'test@example.com' };
        sessionGateway.signIn(profile);
        expect(profile).toMatchInlineSnapshot();
    });
});

describe('Catalog Gateway', () => {
    it('fetches subjects', () => {
        const subjects = catalogGateway.getSubjects();
        expect(Array.isArray(subjects)).toBe(true);
        expect(subjects.length).toBeGreaterThan(0);
    });
});
