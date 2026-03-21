# LearnX AI Team Assignment

This file is the working contract for the AI assistants contributing to LearnX.

## Project Context

- Project: LearnX
- Language: Java 17
- Build: Maven
- Base package: `com.learnx`
- Current scope: core learning engine + AI/search layer
- Not in scope right now:
  - UI
  - Spring Boot controllers
  - auth
  - collaboration features
  - real MySQL implementation

## Repo Files Already Present

- `pom.xml`
- `README.md`
- `BLUEPRINT.md`
- `IMPLEMENTATION_CHECKLIST.md`
- `src/main/resources/catalog.json`
- `src/main/java/com/learnx/shared/config/LearnxConfig.java`

## Team Goal

Build a clean Java library that can:

- load a multi-subject catalog
- evaluate quizzes
- track learner progress
- generate recommendations
- answer doubts using AI
- ground answers with web search
- expose everything through `LearnxEngine`

## Shared Rules For All AI Assistants

- Keep all code under `com.learnx`
- Do not add UI code
- Do not add Spring Boot-specific code
- Do not hardcode API keys
- Keep services framework-agnostic
- Prefer small classes with clear responsibilities
- Add JUnit 5 tests for behavior you implement
- Do not redesign unrelated files when extending the project
- Preserve separation between:
  - `com.learnx.core`
  - `com.learnx.ai`
  - `com.learnx.shared`

## Team Split

### 1. Codex

Codex is the integration owner and final architecture maintainer.

#### Codex responsibilities

- project structure consistency
- service wiring
- recommendation engine
- integration facade
- final code review and cleanup
- merge-safe coordination across the repo

#### Codex file ownership

- `src/main/java/com/learnx/core/engine/RecommendationEngine.java`
- `src/main/java/com/learnx/core/engine/RecommendationScore.java`
- `src/main/java/com/learnx/core/engine/LearnxEngine.java`
- `src/main/java/com/learnx/core/engine/LearnxEngineFactory.java`
- `src/main/java/com/learnx/core/store/LearnerStore.java`
- `src/main/java/com/learnx/core/store/QuizHistoryStore.java`
- `src/main/java/com/learnx/core/store/InMemoryLearnerStore.java`
- `src/main/java/com/learnx/core/store/InMemoryQuizHistoryStore.java`
- `src/test/java/com/learnx/core/engine/RecommendationEngineTest.java`
- `src/test/java/com/learnx/core/engine/LearnxEngineTest.java`

#### Codex main deliverables

- recommendation logic
- facade wiring
- in-memory runtime setup
- final end-to-end engine flow

### 2. Copilot

Copilot owns the core domain and learning logic.

#### Copilot responsibilities

- core models
- catalog loading
- quiz scoring
- progress updates
- analytics

#### Copilot file ownership

- `src/main/java/com/learnx/core/model/Subject.java`
- `src/main/java/com/learnx/core/model/Topic.java`
- `src/main/java/com/learnx/core/model/ExamContext.java`
- `src/main/java/com/learnx/core/model/QuestionType.java`
- `src/main/java/com/learnx/core/model/Question.java`
- `src/main/java/com/learnx/core/model/SubmittedAnswer.java`
- `src/main/java/com/learnx/core/model/QuizAttempt.java`
- `src/main/java/com/learnx/core/model/QuestionEvaluation.java`
- `src/main/java/com/learnx/core/model/QuizEvaluation.java`
- `src/main/java/com/learnx/core/model/TopicProgress.java`
- `src/main/java/com/learnx/core/model/LearnerProfile.java`
- `src/main/java/com/learnx/core/model/PerformanceSnapshot.java`
- `src/main/java/com/learnx/core/model/StudyRecommendation.java`
- `src/main/java/com/learnx/core/store/CatalogStore.java`
- `src/main/java/com/learnx/core/store/JsonCatalogStore.java`
- `src/main/java/com/learnx/core/service/CatalogData.java`
- `src/main/java/com/learnx/core/service/CatalogService.java`
- `src/main/java/com/learnx/core/service/CatalogValidationException.java`
- `src/main/java/com/learnx/core/service/QuizEngine.java`
- `src/main/java/com/learnx/core/service/ProgressService.java`
- `src/main/java/com/learnx/core/service/AnalyticsService.java`
- `src/test/java/com/learnx/core/service/CatalogServiceTest.java`
- `src/test/java/com/learnx/core/service/QuizEngineTest.java`
- `src/test/java/com/learnx/core/service/ProgressServiceTest.java`
- `src/test/java/com/learnx/core/service/AnalyticsServiceTest.java`

#### Copilot main deliverables

- validated catalog loading
- quiz evaluation for MCQ and short answer
- learner mastery updates
- analytics snapshot generation

### 3. Blackbox

Blackbox owns the AI integration and search-grounding layer.

#### Blackbox responsibilities

- AI models
- Gemini provider
- search adapters
- tutor orchestration
- provider parsing and fallback behavior

#### Blackbox file ownership

- `src/main/java/com/learnx/ai/model/SearchQuery.java`
- `src/main/java/com/learnx/ai/model/SearchResult.java`
- `src/main/java/com/learnx/ai/model/TutorPrompt.java`
- `src/main/java/com/learnx/ai/model/TutorRequest.java`
- `src/main/java/com/learnx/ai/model/TutorResponse.java`
- `src/main/java/com/learnx/ai/provider/AiProvider.java`
- `src/main/java/com/learnx/ai/provider/GeminiAiProvider.java`
- `src/main/java/com/learnx/ai/provider/FallbackAiProvider.java`
- `src/main/java/com/learnx/ai/search/SearchProvider.java`
- `src/main/java/com/learnx/ai/search/SearchException.java`
- `src/main/java/com/learnx/ai/search/BraveSearchProvider.java`
- `src/main/java/com/learnx/ai/search/TavilySearchProvider.java`
- `src/main/java/com/learnx/ai/search/CompositeSearchProvider.java`
- `src/main/java/com/learnx/ai/service/TutorService.java`
- `src/test/java/com/learnx/ai/search/BraveSearchProviderTest.java`
- `src/test/java/com/learnx/ai/search/TavilySearchProviderTest.java`
- `src/test/java/com/learnx/ai/search/CompositeSearchProviderTest.java`
- `src/test/java/com/learnx/ai/service/TutorServiceTest.java`

#### Blackbox main deliverables

- AI provider abstraction
- Gemini integration
- Brave and Tavily search support
- grounded tutor responses with citations

## Work Order

### Phase 1

- Copilot builds all core models
- Copilot builds catalog loading and validation
- Codex keeps package structure and interfaces aligned

### Phase 2

- Copilot builds quiz, progress, and analytics services
- Codex builds persistence-neutral store interfaces and in-memory adapters

### Phase 3

- Blackbox builds AI models and AI/search provider interfaces
- Blackbox builds Gemini, Brave, Tavily, and composite search

### Phase 4

- Codex builds recommendation engine
- Blackbox builds tutor service
- Codex builds `LearnxEngine` and factory wiring

### Phase 5

- Copilot completes core tests
- Blackbox completes AI/search tests
- Codex completes integration tests and final cleanup

## Dependency Order

Some files depend on others. Build in this order:

1. `com.learnx.core.model`
2. `CatalogStore`, `CatalogData`, `CatalogService`
3. `QuizEngine`, `ProgressService`, `AnalyticsService`
4. store interfaces and in-memory adapters
5. AI models and provider interfaces
6. search providers
7. `TutorService`
8. `RecommendationEngine`
9. `LearnxEngine`
10. tests

## Done Criteria By Assistant

### Codex is done when

- recommendation engine works
- in-memory stores work
- `LearnxEngine` exposes all main flows
- integration tests pass logically

### Copilot is done when

- catalog loads from JSON
- validation catches bad seed data
- quizzes score correctly
- progress and analytics update correctly

### Blackbox is done when

- AI provider can return a tutor response
- search providers return normalized results
- composite search merges and deduplicates correctly
- tutor service works with and without external APIs

## Suggested Prompts

### Prompt for Copilot

```text
You are working on LearnX, a Java 17 Maven project under com.learnx.
Your ownership is the core learning domain only.
Implement the classes and tests assigned to Copilot in AI_TEAM.md.
Do not add UI code, Spring Boot controllers, or database-specific code.
Keep catalog models clean, services framework-agnostic, and add JUnit 5 tests.
```

### Prompt for Blackbox

```text
You are working on LearnX, a Java 17 Maven project under com.learnx.
Your ownership is the AI and search layer only.
Implement the classes and tests assigned to Blackbox in AI_TEAM.md.
Use Gemini through LangChain4j, support Brave and Tavily, and keep fallback behavior safe when API keys are missing.
Do not modify core-learning files unless strictly required by a shared contract.
```

### Prompt for Codex

```text
You are the integration owner for LearnX.
Implement the files assigned to Codex in AI_TEAM.md and make the whole library work together cleanly.
Do not add UI code or framework-specific controllers.
Preserve package boundaries, finalize service wiring, and ensure the project stays easy for future Spring Boot integration.
```

## Final Project Outcome

When all three assistants finish their owned work, LearnX should have:

- a seeded academic catalog
- core learner state and topic progression
- quiz evaluation and analytics
- adaptive recommendations
- AI tutoring
- grounded search-backed study help
- one clean facade for future app integration

## Coordination Updates

### 2026-03-21 - Copilot progress update

- Reviewed Copilot-owned scope in this file and verified core domain implementation files already exist under `com.learnx.core.model`, `com.learnx.core.service`, and catalog store interfaces/adapters.
- Added missing Copilot-owned JUnit test files:
  - `src/test/java/com/learnx/core/service/CatalogServiceTest.java`
  - `src/test/java/com/learnx/core/service/QuizEngineTest.java`
  - `src/test/java/com/learnx/core/service/ProgressServiceTest.java`
  - `src/test/java/com/learnx/core/service/AnalyticsServiceTest.java`
- Test coverage added for:
  - catalog validation (duplicates, missing references, cycle detection, lookup behavior)
  - quiz scoring (MCQ, short answer threshold, mixed scoring, context mismatch)
  - progress updates (learner aggregates, topic mastery, weak/strong topic state, recent score window)
  - analytics snapshots (weak/strong topics, topic accuracy, recent average score, practice frequency)
- Current blocker noted during validation run: Maven command is not available in the active PowerShell terminal environment; test files are present and syntax-checked via editor diagnostics.
