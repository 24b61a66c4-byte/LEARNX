# LearnX AI Coordination

This file defines how Codex, Copilot, and Blackbox should work together on LearnX.

## Main Principle

Each tool has a lane.

- Codex builds the frontend product.
- Copilot protects repo and backend correctness.
- Blackbox reviews UX and visual quality.

Do not collapse these roles into one mixed stream of edits and suggestions.

## Coordination Order

1. Blackbox reviews and suggests improvements.
2. Codex decides which frontend/product changes should actually be built.
3. Copilot supports backend, repo, and integration safety where needed.
4. Codex implements the final frontend changes in the repo.

## What To Work On Now

### Codex Priority

1. Keep authenticated routes stable in production.
2. Build the actual student workspace:
   notes + lesson + tutor + search/results + drill in one study flow.
3. Reduce anything that still feels like a generic AI dashboard.
4. Improve landing-page conversion only after the core workspace is strong.

### Copilot Priority

1. Keep git history and branch state safe.
2. Confirm backend API readiness for tutor, practice, progress, notes, and catalog.
3. Help replace mock gateways with real API-backed data.
4. Protect backend quality, tests, and deployability.

### Blackbox Priority

1. Review live UX for clarity, hierarchy, and student motivation.
2. Suggest improvements to the dashboard, topic studio, tutor flow, notes experience, and search lane.
3. Suggest better conversion framing for landing without changing the core product direction.

## Done Criteria Snapshot

### Codex

- Frontend slice is shipped and stable on target routes.
- Student-workspace continuity is improved, not fragmented.
- Remaining mocks are called out explicitly.

### Copilot

- Repo safety is preserved (history, branch integrity, clean merge posture).
- Backend/API readiness for touched features is confirmed.
- Integration risks are documented before Codex ships dependent UI changes.

### Blackbox

- Suggestions are specific, concrete, and tied to real screens.
- Feedback improves student clarity, motivation, and flow.
- Critique stays advisory and does not override implementation ownership.

## Frontend Decisions Already Locked In

These points should not be re-litigated unless there is a strong product reason:

1. LearnX should feel like one student workspace.
2. The core product shape is:
   `chat + notes + lesson + search-thinking + tutor + drill`
3. Student-side UX comes before secondary polish like monetization or heavy marketing.
4. The tutor is part of the study flow, not the entire product.

## Handoff Rules

### When Blackbox finishes

Blackbox should hand over:

- concrete screen-level suggestions
- critique of weak UX
- copy/layout improvement ideas

Blackbox should not directly redefine repo strategy or backend scope.

### When Copilot finishes

Copilot should hand over:

- confirmed backend routes
- repo cleanup status
- merge / branch safety notes
- integration constraints Codex needs to know

Copilot should not take over product design direction.

### When Codex finishes a pass

Codex should hand over:

- shipped frontend changes
- validation status
- what is still mock-based
- what the next slice should be

## Do Not Do

1. Do not let unrelated projects contaminate LearnX history.
2. Do not ship frontend changes that ignore the student-workspace vision.
3. Do not spend time polishing marketing pages while the in-app study flow still feels incomplete.
4. Do not duplicate work across Codex, Copilot, and Blackbox.

## Conflict Resolution Protocol

1. Product behavior dispute in frontend flow:
Codex decides.

2. Backend contract, data integrity, repo safety, or release-risk dispute:
Copilot decides.

3. UX quality or conversion critique without code-ownership impact:
Blackbox advises, Codex decides implementation.

4. If a decision blocks active delivery for more than one work session:
Log the blocker in coordination notes with owner, decision needed, and deadline.

5. Default tie-breaker:
Protect student-flow continuity first, then backend/release safety, then cosmetic polish.
