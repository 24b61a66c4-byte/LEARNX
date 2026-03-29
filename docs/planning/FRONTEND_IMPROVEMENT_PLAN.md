# LearnX Frontend Improvement Plan

## Product Direction

LearnX should feel like one student workspace, not a collection of AI panels.

Target experience:

- chat-style copilot
- lesson and lecture-style reading
- notes and revision capture
- search-thinking and follow-up prompts
- drill/practice loop
- progress and momentum feedback

Short version:

`chat + notes + lesson + search-thinking + tutor + drill`

## What We Fixed In This Pass

### 1. Production Route Stability

- moved authenticated screens away from server/client-mismatched local-storage reads during initial render
- introduced a hydration-safe client snapshot helper for preview-state reads
- applied the safer pattern to app shell, dashboard, progress, and profile views

### 2. Lesson -> Tutor -> Practice Continuity

- topic drills now fall back to mixed-subject practice when a specific topic has no seeded question bank
- tutor now shows visible progress stages while generating an answer
- tutor now surfaces a clearer next-step CTA back into the drill flow

### 3. Trust / Preview Copy

- removed dev-sounding auth copy
- updated loading and profile wording to sound like a student-facing preview instead of an internal mock
- reduced some repeated “protected workspace” language in the shell

## Confirmed Improvement Areas

### Product Foundation

1. Clarify the primary student segment LearnX is serving first.
2. Keep the core problem statement visible in product decisions:
   students should know what to study next, how to understand it, and how to revise it in one place.
3. Preserve the actual LearnX USP:
   AI-supported study flow with lesson, tutor, search-thinking, notes, and drill continuity.

### Highest Priority

1. Keep authenticated routes stable in production builds.
2. Preserve one obvious next study action on every page.
3. Avoid dead ends when drills or topic-specific data are sparse.

### Student Experience

1. Add a real notes pane instead of note-like cards only.
2. Add a real web-search/results lane instead of search-thinking prompts only.
3. Make `/app`, `/app/ask`, and `/app/learn/...` feel like one continuous study studio.
4. Make the tutor feel like the student’s main copilot, not a side feature.

### Learning Loop

1. After each tutor answer, encourage immediate topic check or drill.
2. After each drill, surface what to save as notes and what to revisit next.
3. Keep the dashboard focused on “continue one topic” rather than broad overview clutter.

### Trust / Product Polish

1. Keep public pages user-facing and preview-honest without developer language.
2. Reduce repeated shell messaging and keep copy centered on the next learning action.
3. Strengthen mobile rhythm and thumb-friendly flow.

### Backend / Realism

1. Replace mock gateway flows with real API wiring.
2. Persist notes, tutor threads, progress, and rewards beyond local device storage.
3. Introduce real grounded search results instead of placeholder search guidance.

### System-Level Backlog

1. Real authentication instead of preview-only local session flow.
2. Real course/module/content delivery beyond the seeded local catalog.
3. Analytics and user journey tracking.
4. Security hardening for auth and AI usage.
5. SEO and discoverability improvements for public pages.
6. Optional monetization only after the core study loop is genuinely strong.

## Recommended Order

### Phase 1: Stability and Flow

- keep hydration-safe state reads
- remove any remaining production route errors
- keep drill fallback and tutor progress states solid

### Phase 2: Real Student Workspace

- build a genuine notes pane
- add a search/results rail
- connect lesson, tutor, notes, and drills more tightly on topic pages

### Phase 3: Real Data

- wire frontend gateways to backend APIs
- persist progress, tutor, and notes
- connect real recommendation and search-backed tutor behavior

### Phase 4: Product System Upgrade

- real authentication
- stronger course/content model
- analytics and product instrumentation
- backend-backed personalization

### Phase 5: Final Polish

- mobile refinement
- accessibility pass
- richer reward visuals
- stronger landing proof and conversion cues

## Acceptance Markers For The Next Pass

- no production hydration/runtime errors on authenticated routes
- every topic page offers a usable drill path even when topic-specific questions are missing
- tutor clearly communicates response progress and next action
- notes are no longer implied only through static cards
- student can stay in one workspace for lesson, ask, search, note, and drill behavior
