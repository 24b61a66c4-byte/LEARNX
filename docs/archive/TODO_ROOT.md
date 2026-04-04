# LearnX Frontend Bug List

## Priority 1 (Critical - Block Onboarding/Setup)
1. **\"fetch the data is failed\" Error**
   - Occurs during first-time setup or study flows
   - Likely: backend-sync.ts syncOnboardingProfile/profileApi, or gateways.ts fetches (tutor/practice)
   - Files: web/src/lib/backend-sync.ts, web/src/lib/gateways.ts
   
2. **First-time setup Broken**
   - Onboarding flow fails to complete or save preferences
   - Related to data fetch failure above
   - Files: web/src/components/onboarding-form.tsx, web/src/lib/profile-preferences.ts

3. **Use defaults Button Not Working** (`{ponits : button is not wroking }`)
   - \"Skip and start\" button fails
   - Should use recommendations but doesn't
   - Reproduction: Onboarding step 0-3, click Skip and start
   - Files: web/src/components/onboarding-form.tsx (completeOnboarding), profile-preferences.ts defaults

## Priority 2 (Core Feature Broken)
4. **Study Plan Not Opening** (`Ope{study plain is not wroking }`)
   - Button/link to open study plan/mastery view fails
   - Likely in dashboard/profile/progress pages
   - Files: web/src/components/progress-panel.tsx, web/src/components/subject-study-track.tsx, web/src/app/app/profile/page.tsx?

## Priority 3 (UX Defaults)
5. **Always Defaults to Mathematics**
   - rnX always sets to maths even when other topics selected
   - Code: profile-preferences.ts getRecommendedSubjectId always returns \"dbms\" fallback
   - Should respect user selections better
   - Files: web/src/lib/profile-preferences.ts (resolveSubjectIdFromTopics)

## Next Steps
- Test onboarding flow end-to-end
- Add error boundaries/toasts for fetch failures
- Fix button handlers
- Verify topic persistence post-onboarding
- Check study plan links/buttons in dashboard
