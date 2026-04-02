# User Feedback Backlog (2026-04-02)

## Scope
Raw feedback from live frontend walkthrough, rewritten as implementation-ready issues.

## Issues List

1. Onboarding copy is too rigid and adult-oriented in Step 1.
- Current copy: "Tell us your age first", "We will tune the next step", "pick a starter track".
- Problem: feels mandatory and inflexible for kids/parents.
- Expected: neutral, friendly copy with age-appropriate wording.

2. "Select your interests" is too limited and appears too early.
- Current: fixed small set (Reading, Mathematics, Science, Languages, Creativity, Coding).
- Problem: not enough options, no search, no personalization.
- Expected: move topic picking to a dedicated next step/page with search + AI suggestions by age (example: 6-year-old -> tables, planet names, basic vocabulary).

3. Step 2 labels ("Focused revision", "Practical study") do not fit all learners.
- Problem: wording is exam/productivity-heavy for children and beginner exploration.
- Expected: beginner-friendly, age-aware mode naming and descriptions.

4. Goal flow is mixed and conditional logic is missing.
- Current: exam target UI appears even when exam prep is not selected.
- Expected: top-level goal should be broad (Learn / Prepare for exam / Revise).
- Expected: show "Exam goal" fields only when "Prepare for exam" is selected.

5. Step 4 learning-style page is unclear.
- Problem: users do not understand value of "Lesson-first / Coach-first / Streak-first" and summary text.
- Expected: simplify, explain outcomes, and reduce jargon.

6. Sidebar UX problems.
- Problem: two-letter shortcuts (HM, SB, TU...) look poor.
- Problem: collapsed sidebar alignment is off.
- Problem: personal info (email/age/adult) shown in nav context.
- Problem: History is always prominent but not user-controlled.
- Expected: full labels/icons, better collapsed alignment, move personal details to account settings, make History optional and useful.

7. Subject/topic mismatch bug.
- Problem: user selected Coding but recommendation showed "Science Basics".
- Expected: recommendation pipeline must honor selected subject/topic preferences.

8. Top HUD metrics are confusing.
- Problem: items like "OP 45% pace" and "L1" are unclear and always visible.
- Expected: use clear labels/tooltips or move to secondary panel.

9. Dashboard stat tiles are oversized and poorly placed.
- Problem: "Today 0/2" and "Level + XP" dominate main screen.
- Expected: reduce size and reposition to less intrusive area.

10. Drill dock subject/topic variety is too narrow.
- Problem: only Math/Science seen; topic remains static.
- Expected: broader subject catalog and dynamic topic generation from current learning context.

11. Drill question quality is poor and not aligned to learned topic.
- Problem: generic/repetitive questions, weak personalization.
- Expected: AI-generated questions based on actual studied topic + level + age.
- Expected: remove hardcoded/legacy limited-topic seed data causing irrelevant outputs.

12. Drill results flow needs redesign.
- Problem: result shown immediately in same flow; weak remediation loop.
- Expected: after enough answered questions (e.g., 10+, configurable), show dedicated results page.
- Expected: include revision recommendations, auto-notes prompts, and optional curated video links.
- Expected: provide web-backed notes and references (Perplexity-like citation-oriented behavior).

13. Header auth state is inconsistent after login.
- Problem: "Sign in" still appears on top even when user is authenticated.
- Expected: authenticated header state should replace sign-in action with user menu/profile actions.

14. Next.js warning in console about smooth scrolling.
- Warning: missing `data-scroll-behavior="smooth"` on `<html>` while using `scroll-behavior: smooth`.
- Expected: add required html attribute in app root layout to avoid future route-transition issues.

## Priority Suggestion
- P0: #7, #11, #13, #14
- P1: #2, #4, #6, #10, #12
- P2: #1, #3, #5, #8, #9

## Definition of Done (High Level)
- Onboarding becomes age-aware and conditionally rendered.
- Subject/topic selections reliably drive recommendations and drills.
- Drill generation is dynamic and personalized (topic + age + level).
- Navigation and dashboard readability improve on desktop and mobile.
- Auth UI state is consistent; console warning removed.
