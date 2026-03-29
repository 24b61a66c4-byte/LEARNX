# LearnX AI Team Split

This file replaces the old generic AI team notes.

LearnX work is now divided into 3 clear lanes:

1. Codex
2. Copilot
3. Blackbox

The goal is simple: no duplicated work, no mixed responsibilities, and no random edits outside each lane.

## Codex

Codex owns the active LearnX frontend build and product implementation.

### Main Job

- turn LearnX into a real student workspace instead of a generic AI dashboard
- implement frontend changes in `web/`
- keep the live Vercel frontend stable
- connect product vision to actual UI behavior

### Current Work To Do

1. Keep production routes stable and remove remaining frontend runtime issues.
2. Build the real student-side workspace:
   lesson + notes + search-thinking + tutor + drill in one flow.
3. Add a real notes pane instead of note-like placeholder cards.
4. Add a real search/results lane instead of prompt-only search hints.
5. Tighten continuity between:
   `/app`, `/app/ask`, `/app/learn/[subjectId]/[topicId]`, and `/app/practice`.
6. Improve tutor feedback states, next-step actions, and study flow clarity.
7. Finish landing-page polish after the core workspace feels right.

### Codex Should Not Own

- backend merge recovery
- Git history cleanup
- deep backend architecture changes
- visual-only brainstorming with no implementation

## Copilot

Copilot owns repo safety, backend alignment, and real data integration support.

### Main Job

- clean up branch / merge / repo state
- protect the real LearnX history
- verify backend APIs and data flow
- prepare backend support for frontend integration

### Current Work To Do

1. Finish git cleanup and keep `LEARNX` separate from accidental unrelated project history.
2. Verify backend ownership under `src/main/java/com/learnx/...`.
3. Confirm real API contracts for tutor, quiz, progress, catalog, and learner state.
4. Help replace mock frontend gateways with real backend-backed endpoints.
5. Set up persistence for notes, tutor threads, progress, and rewards.
6. Keep backend tests, validation, and error handling green.
7. Support CI / deployment hygiene when frontend integration starts depending on backend routes.

### Copilot Should Not Own

- frontend visual redesign decisions
- landing-page branding direction
- scattered cosmetic UI edits in `web/`

### Integration Boundary (Codex + Copilot)

- Codex owns frontend integration implementation in `web/`.
- Copilot owns backend API contract validation, route readiness, data integrity, and persistence safety.
- Codex consumes stable contracts.
- Copilot does not drive frontend UX decisions.
- If backend contract changes are required, Copilot proposes contract updates first, then Codex implements UI integration.

## Blackbox

Blackbox owns visual critique, product review, and fast UI idea generation.

### Main Job

- review live pages
- suggest layout, copy, hierarchy, and UX improvements
- pressure-test whether LearnX feels like a student product

### Current Work To Do

1. Review the live frontend as a student product, not as a codebase.
2. Suggest better UI direction for:
   dashboard, topic studio, tutor flow, notes area, search lane, and mobile UX.
3. Flag places where LearnX still feels like a generic AI app instead of a study workspace.
4. Suggest better landing-page conversion ideas:
   hero visual, CTA hierarchy, how-it-works, proof blocks, footer.
5. Provide concrete component-level or screen-level suggestions, not vague praise.
6. Focus on critique and ideation only unless explicitly asked to write code elsewhere.

### Blackbox Should Not Own

- git cleanup
- deployment recovery
- backend logic changes
- final implementation decisions in the repo

## Shared Rules

1. LearnX is the real project.
2. The target product is:
   `chat + notes + lesson + search-thinking + tutor + drill`
3. Avoid turning LearnX into a generic AI assistant shell.
4. Codex implements.
5. Copilot stabilizes backend and repo flow.
6. Blackbox critiques and suggests.
7. If two lanes overlap, Codex decides frontend product behavior, Copilot decides backend/repo safety, and Blackbox stays advisory.

## Definition Of Done By Lane

### Codex Done

- Routes are stable in production for the edited frontend slice.
- New UI behavior works through at least one full student flow (lesson -> tutor -> drill -> progress).
- Any mock-based behavior still present is explicitly documented.
- Frontend changes include focused validation (at minimum route and interaction sanity checks).

### Copilot Done

- Branch/repo state is safe and uncontaminated.
- API contracts for touched features are verified and documented.
- Backend tests/validation for changed integration paths are green or known failures are clearly documented.
- Persistence and error-handling impact are reviewed for changed routes.

### Blackbox Done

- Feedback is concrete at screen/component level.
- Suggestions map to the LearnX student-workspace vision.
- Critique includes mobile and conversion implications where relevant.
- Advice is implementation-ready and avoids vague praise.
