# LearnX Implementation Checklist

This checklist turns the LearnX blueprint into concrete files and work items.

Use it to:

- see what code the project needs
- assign work to other AI assistants
- track implementation progress without mixing responsibilities

## Recommended Build Order

1. Foundation and config
2. Core models
3. Catalog loading and validation
4. Quiz and progress services
5. Analytics and recommendation
6. AI provider layer
7. Search provider layer
8. Tutor orchestration
9. LearnxEngine facade
10. Tests and docs

## 1. Foundation

- [x] `pom.xml`
  - Maven project setup
  - Java 17 compiler config
  - dependencies for Jackson, LangChain4j Gemini, SLF4J, JUnit
- [x] `.gitignore`
- [x] `README.md`
- [x] `BLUEPRINT.md`
- [x] `src/main/resources/catalog.json`
  - seeded subjects
  - seeded topics
  - exam contexts
  - starter question bank
- [x] `src/main/java/com/learnx/shared/config/LearnxConfig.java`
  - env var loading
  - API key handling
  - timeout and search limit defaults

## 2. Core Models

Create these files under `src/main/java/com/learnx/core/model/`

- [ ] `Subject.java`
  - fields: `id`, `name`, `description`, `tags`
- [ ] `Topic.java`
  - fields: `id`, `subjectId`, `title`, `summary`, `prerequisiteIds`, `difficulty`, `examImportance`, `tags`
- [ ] `ExamContext.java`
  - fields: `id`, `subjectId`, `title`, `description`, `focusTopicIds`, `tags`
- [ ] `QuestionType.java`
  - enum for `MCQ`, `SHORT_ANSWER`
- [ ] `Question.java`
  - fields: `id`, `subjectId`, `topicId`, `type`, `prompt`, `options`, `correctOptionIndex`, `acceptedKeywords`, `explanation`, `difficulty`
- [ ] `SubmittedAnswer.java`
  - question ID + learner answer payload
- [ ] `QuizAttempt.java`
  - learner ID, subject ID, topic ID, submitted answers, started/ended time
- [ ] `QuestionEvaluation.java`
  - per-question correctness, feedback, score, matched keywords
- [ ] `QuizEvaluation.java`
  - aggregate score, correct count, incorrect count, question-level evaluations
- [ ] `TopicProgress.java`
  - topic mastery score, attempts, accuracy, last practiced, weak/strong markers
- [ ] `LearnerProfile.java`
  - learner identity + map of topic progress + aggregate stats
- [ ] `PerformanceSnapshot.java`
  - weak topics, strong topics, recent score trend, practice frequency
- [ ] `StudyRecommendation.java`
  - target topic, reason, confidence, suggested action

## 3. Catalog Layer

Create these files under `src/main/java/com/learnx/core/store/` and `src/main/java/com/learnx/core/service/`

- [ ] `CatalogStore.java`
  - interface for loading catalog seed data
- [ ] `JsonCatalogStore.java`
  - loads `catalog.json` from resources
- [ ] `CatalogData.java`
  - resource DTO bundle for subjects, topics, exam contexts, questions
- [ ] `CatalogService.java`
  - public API for subject/topic/question lookup
  - graph traversal helpers
  - exam-context lookup
- [ ] `CatalogValidationException.java`
  - thrown on invalid seed data

Validation rules to implement:

- [ ] duplicate subject IDs rejected
- [ ] duplicate topic IDs rejected
- [ ] duplicate question IDs rejected
- [ ] missing subject references rejected
- [ ] missing topic prerequisite references rejected
- [ ] missing question topic references rejected
- [ ] topic/question subject mismatch rejected
- [ ] cyclic prerequisites rejected

## 4. Persistence Boundary

Create these files under `src/main/java/com/learnx/core/store/`

- [ ] `LearnerStore.java`
  - save/load learner profiles
- [ ] `QuizHistoryStore.java`
  - save and query quiz evaluations
- [ ] `InMemoryLearnerStore.java`
- [ ] `InMemoryQuizHistoryStore.java`

Rules:

- [ ] keep interfaces database-neutral
- [ ] no MySQL implementation yet
- [ ] support tests and local runs with in-memory adapters

## 5. Quiz And Progress Services

Create these files under `src/main/java/com/learnx/core/service/`

- [ ] `QuizEngine.java`
  - evaluate MCQ answers
  - evaluate short answers using keyword matching
  - return `QuizEvaluation`
- [ ] `ProgressService.java`
  - update learner stats after quiz
  - update topic mastery
  - update weak/strong topic state
- [ ] `AnalyticsService.java`
  - build `PerformanceSnapshot`
  - compute topic accuracy
  - compute recent performance trends
  - compute practice frequency

Behavior checklist:

- [ ] MCQ scoring works by option index
- [ ] short-answer scoring works by keyword match threshold
- [ ] mastery increases on strong performance
- [ ] weak topics surface after repeated poor performance
- [ ] last-practiced timestamps update

## 6. Recommendation Engine

Create these files under `src/main/java/com/learnx/core/engine/`

- [ ] `RecommendationEngine.java`
  - choose next topic to study
  - consider prerequisites first
  - prioritize weak-topic recovery
  - factor exam importance
  - factor learner mastery and recency
- [ ] `RecommendationScore.java`
  - optional internal scoring model for debugging/tuning

Behavior checklist:

- [ ] never recommend blocked topics with unmet prerequisites
- [ ] recommend weak prerequisite topics before harder dependent topics
- [ ] reward high exam-importance topics
- [ ] avoid repeatedly recommending an already-mastered topic unless revision is needed

## 7. AI Models

Create these files under `src/main/java/com/learnx/ai/model/`

- [ ] `SearchQuery.java`
- [ ] `SearchResult.java`
  - title, url, snippet, provider, score
- [ ] `TutorPrompt.java`
  - structured prompt payload sent to AI provider
- [ ] `TutorRequest.java`
  - learner context + topic + exam context + optional question
- [ ] `TutorResponse.java`
  - explanation, exam answer outline, key points, citations, fallback flag

## 8. AI Provider Layer

Create these files under `src/main/java/com/learnx/ai/provider/`

- [ ] `AiProvider.java`
  - common interface for text generation
- [ ] `GeminiAiProvider.java`
  - LangChain4j Gemini implementation
- [ ] `FallbackAiProvider.java`
  - simple local fallback when no external AI key is present

Behavior checklist:

- [ ] Gemini only activates when `LEARNX_GEMINI_API_KEY` is available
- [ ] missing key does not break core engine
- [ ] AI failures degrade gracefully to fallback response

## 9. Search Provider Layer

Create these files under `src/main/java/com/learnx/ai/search/`

- [ ] `SearchProvider.java`
  - common interface for provider search
- [ ] `TavilySearchProvider.java`
  - calls Tavily API
- [ ] `CompositeSearchProvider.java`
  - parallel calls
  - partial failure tolerance
  - deduplication
  - ranking
- [ ] `SearchException.java`
  - provider-level exception for failed requests or parsing

Behavior checklist:

- [ ] normalize provider responses into one `SearchResult` shape
- [ ] deduplicate same URLs from different providers
- [ ] tolerate one provider failing
- [ ] respect timeout and max-results config

## 10. Tutor Service

Create these files under `src/main/java/com/learnx/ai/service/`

- [ ] `TutorService.java`
  - build tutor prompt from topic + learner + exam context
  - fetch grounded resources from search
  - ask AI provider for final explanation
  - return structured `TutorResponse`

Behavior checklist:

- [ ] can answer a topic explanation request
- [ ] can include exam-oriented answer outline
- [ ] can include key points and formulas
- [ ] includes citations when search providers are enabled
- [ ] still works without search

## 11. Integration Facade

Create these files under `src/main/java/com/learnx/core/engine/`

- [ ] `LearnxEngine.java`
  - create/load learner profile
  - fetch catalog data
  - evaluate quiz
  - update progress
  - build analytics snapshot
  - get next recommendation
  - answer doubts with AI
- [ ] `LearnxEngineFactory.java`
  - wires default in-memory services and providers

Facade checklist:

- [ ] one public entry point for future backend/UI layers
- [ ] no Spring dependency required
- [ ] easy default setup for local testing

## 12. Tests

Create tests under `src/test/java/`

### Catalog Tests
- [x] `CatalogServiceTest.java`
  - valid catalog loads
  - duplicate IDs rejected
  - missing references rejected
  - cycles rejected

### Quiz Tests
- [x] `QuizEngineTest.java`
  - MCQ scoring
  - keyword short-answer scoring
  - mixed quiz scoring

### Progress And Analytics Tests
- [x] `ProgressServiceTest.java`
  - mastery updates
  - weak-topic detection
- [x] `AnalyticsServiceTest.java`
  - accuracy summary
  - recent trend summary

### Recommendation Tests
- [ ] `RecommendationEngineTest.java`
  - prerequisite safety
  - weak-topic recovery
  - exam-importance influence

### Search Tests
- [ ] `TavilySearchProviderTest.java`
  - parsing
  - failure handling
- [ ] `CompositeSearchProviderTest.java`
  - merge
  - dedupe
  - partial provider failure

### AI And Integration Tests
- [ ] `TutorServiceTest.java`
  - grounded response with fake AI provider
  - fallback response without provider
- [ ] `LearnxEngineTest.java`
  - end-to-end learner flow

## 13. Documentation

- [ ] expand `README.md`
  - setup
  - architecture summary
  - environment variables
  - sample usage
- [ ] keep `BLUEPRINT.md` updated when architecture changes
- [ ] update this checklist as files are added

## Parallel Work Split For Other AI Assistants

### Assistant A: Core Models
- `Subject.java`
- `Topic.java`
- `ExamContext.java`
- `Question.java`
- `QuizAttempt.java`
- `QuizEvaluation.java`
- `LearnerProfile.java`
- `TopicProgress.java`
- `PerformanceSnapshot.java`
- `StudyRecommendation.java`

### Assistant B: Catalog + Stores
- `CatalogStore.java`
- `JsonCatalogStore.java`
- `CatalogData.java`
- `CatalogService.java`
- `CatalogValidationException.java`
- `LearnerStore.java`
- `QuizHistoryStore.java`
- in-memory store implementations

### Assistant C: Quiz + Progress + Analytics
- `QuizEngine.java`
- `ProgressService.java`
- `AnalyticsService.java`

### Assistant D: Recommendation
- `RecommendationEngine.java`
- `RecommendationScore.java`

### Assistant E: AI + Search
- `AiProvider.java`
- `GeminiAiProvider.java`
- `FallbackAiProvider.java`
- `SearchProvider.java`
- `TavilySearchProvider.java`
- `CompositeSearchProvider.java`
- `SearchException.java`
- `TutorService.java`

### Assistant F: Facade + Tests
- `LearnxEngine.java`
- `LearnxEngineFactory.java`
- all JUnit test files

## Minimum Viable Completion

This repo is usable for your slice when all of these are true:

- [ ] catalog loads from JSON successfully
- [ ] quiz evaluation works for MCQ and short answers
- [ ] learner progress updates after quizzes
- [ ] recommendation engine returns valid next steps
- [ ] tutor service can produce a response with or without external AI/search
- [ ] `LearnxEngine` exposes the whole flow cleanly
- [ ] tests cover core logic and adapter behavior
