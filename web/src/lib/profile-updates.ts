import { syncOnboardingProfile } from "@/lib/backend-sync";
import { sessionGateway } from "@/lib/gateways";
import { normalizeOnboardingProfile } from "@/lib/profile-preferences";
import { OnboardingProfile } from "@/lib/types";

export async function persistOnboardingProfile(profile: OnboardingProfile) {
  const normalized = normalizeOnboardingProfile(profile);
  sessionGateway.completeOnboarding(normalized);
  await syncOnboardingProfile(normalized).catch(() => undefined);
}
