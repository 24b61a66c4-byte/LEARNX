# LearnX AI Coordination Board

This file is the live coordination board for the LearnX web frontend build.

## Team Roles

### Codex

Codex is the system architect and implementation owner inside this workspace.

Codex owns:

- product decisions
- route and shell architecture
- mock gateway contracts
- cross-page consistency
- coordination updates in this file
- final review of merged frontend slices

### GitHub Copilot

GitHub Copilot is the implementation partner.

Copilot should focus on:

- generating clean UI code
- following locked decisions from this file
- building page slices without redesigning shared contracts
- keeping components small and reusable

Copilot should not:

- change route decisions
- redesign adapter contracts
- add backend or database code
- invent new product scope without Codex approval

### Blackbox AI

Blackbox AI is the debugger, reviewer, and optimizer.

Blackbox should focus on:

- finding bugs and edge cases
- catching hydration and auth-gating risks
- checking accessibility and responsive issues
- suggesting performance improvements
- reviewing whether Copilot output matches the plan

Blackbox should not:

- expand scope casually
- rewrite architecture without a clear technical reason

## Locked Product Decisions

- LearnX is **web-only**.
- The web app should feel like a polished product, not a basic site.
- Frontend stack direction: **Next.js App Router + TypeScript + Tailwind + design tokens**.
- Public routes:
  - `/`
  - `/login`
  - `/signup`
- Protected routes:
  - `/app`
  - `/app/onboarding`
  - `/app/subjects`
  - `/app/subjects/[subjectId]`
  - `/app/learn/[subjectId]/[topicId]`
  - `/app/ask`
  - `/app/practice`
  - `/app/progress`
  - `/app/profile`
- Launch subjects are:
  - `dbms`
  - `edc`
- v1 search is only a **subject/topic jump palette**.
- Topic pages are **lesson-first**.
- Tutor modes in the first slice:
  - `Explain`
  - `Exam Answer`
  - `Quiz Me`
- Backend, database, real auth, and production API integration are out of scope for this phase.

## Current Phase

**Phase:** Frontend foundation plus first protected-app slice

**Goal:** Have a runnable `web/` app structure with:

- app shell
- public landing
- login/signup
- protected app routing
- onboarding
- dashboard
- subject hub
- topic page
- tutor panel
- quick practice
- progress page

## Work Split

### Codex Queue

Codex handles:

1. `web/` project scaffold and configuration
2. root layout, global design tokens, and shell structure
3. protected-route cookie contract
4. typed mock data and gateway interfaces
5. page composition across dashboard, subjects, learn, ask, practice, progress, and profile
6. this coordination file and final integration cleanup

### GitHub Copilot Queue

Copilot should implement or refine these slices in order:

1. landing page polish
2. login and signup forms
3. onboarding UX
4. dashboard cards
5. subject cards and topic cards
6. lesson block rendering
7. tutor panel UI
8. practice workspace UI
9. progress page UI
10. frontend tests once Node tooling is available

Copilot rules:

- follow the locked route map exactly
- reuse existing components before creating new ones
- keep styles consistent with the existing token system
- do not add extra pages or change app flow without updating this file

### Blackbox Review Queue

Blackbox should review these areas after each major Copilot slice:

1. route protection behavior
2. hydration safety around local session state
3. mobile shell spacing and bottom-nav overlap
4. keyboard and focus behavior in search, tutor, and forms
5. loading, empty, and retry states
6. performance and layout stability
7. placeholder logic that should stay behind adapter boundaries

Blackbox review rules:

- report concrete bugs first
- challenge over-scoped or fake-rich UI
- suggest performance or accessibility fixes before visual polish

## Current Implementation Queue

### Completed

- scaffolded `web/` Next.js app
- added global layout, fonts, and design-token styling
- added cookie-gated protected `/app/*` routing
- added local mock session and onboarding flow
- added subject/topic/question/lesson seed content in the frontend
- added protected app shell
- added dashboard, subject hub, topic page, tutor, practice, progress, and profile routes
- updated frontend docs and this coordination board

### Next

- install Node locally in the environment
- run `npm install`, `npm run lint`, and `npm run build` inside `web/`
- add frontend test tooling
- review mobile shell spacing and keyboard/focus behavior
- refine loading and error states after the first runtime pass

### Later

- add frontend test tooling
- add PWA polish
- connect real backend adapters

## Current Review Queue

- confirm middleware route gating works with the cookie contract
- confirm lesson pages remain lesson-first on mobile
- confirm tutor and practice stay behind adapter boundaries
- confirm dashboard stays intentionally minimal instead of fake-rich
- confirm focus states and 44px tap targets across main app flows
- confirm local-storage-backed screens avoid hydration mismatches

## Done Criteria For This Slice

This slice is done when all of these are true:

- `web/` exists as a real frontend app scaffold
- public routes are present
- protected `/app/*` routes are present
- onboarding gates the protected app until completion
- both flagship subjects render in the subject hub
- at least one topic page per subject renders with structured lesson blocks
- tutor panel works with mock responses
- practice flow works with mock scoring
- progress page reads local mock history
- this coordination file stays aligned with the actual repo state

## Backend Context Already Present

The Java engine already exists in this repo and remains unchanged during this frontend phase.

Implemented backend-side library pieces already include:

- catalog loading and validation
- quiz evaluation
- progress tracking
- analytics snapshots
- recommendation engine
- tutor orchestration
- `LearnxEngine` facade

Frontend work must treat that engine as future integration context, not something to redesign during this slice.

## Last Updated

Updated by Codex for the web frontend implementation phase.
