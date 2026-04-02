import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/components/site-header";

const mockGetSession = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
  })),
}));

vi.mock("@/lib/client-snapshot", () => ({
  useClientSnapshot: (getSnapshot: () => unknown) => getSnapshot(),
}));

vi.mock("@/lib/gateways", () => ({
  sessionGateway: {
    getSession: () => mockGetSession(),
  },
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
  });

  it("shows sign in when there is no session", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    mockGetSession.mockReturnValue({
      isAuthenticated: false,
      profile: null,
      onboarded: false,
    });

    render(<SiteHeader />);

    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("shows workspace actions when there is an authenticated session", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    mockGetSession.mockReturnValue({
      isAuthenticated: true,
      profile: {
        displayName: "Riley",
        email: "riley@example.com",
      },
      onboarded: true,
    });

    render(<SiteHeader />);

    expect(screen.getByText("Signed in as Riley")).toBeInTheDocument();
    expect(screen.getByText("Open app")).toBeInTheDocument();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });
});
