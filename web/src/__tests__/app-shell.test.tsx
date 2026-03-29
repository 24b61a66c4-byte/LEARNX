import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/app-shell";

vi.mock("next/navigation", () => ({
    usePathname: vi.fn(),
    useRouter: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({
    useAuth: () => ({
        user: null,
        loading: false,
        signOut: vi.fn(),
    }),
}));

describe("AppShell", () => {
    it("renders nav links", () => {
        vi.mocked(usePathname).mockReturnValue("/app");
        render(<AppShell>Test content</AppShell>);
        expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Subjects").length).toBeGreaterThan(0);
    });

    it("highlights active nav", () => {
        vi.mocked(usePathname).mockReturnValue("/app/subjects");
        render(<AppShell>Test content</AppShell>);
        const subjectsLinks = screen.getAllByText("Subjects");
        subjectsLinks.forEach((link) => {
            expect(link).toHaveClass("bg-slate-950", "text-white");
        });
    });
});
