# LearnX Blueprint

## Goal

LearnX is an AI-powered smart learning system. This repository currently focuses on the **core learning engine** and the **AI/search layer**, and now also includes the first **web frontend scaffold** under `web/` that a future Spring Boot backend can serve.

In one line:

**LearnX = adaptive study engine + quiz evaluator + progress analyzer + AI tutor**

## Current Technical Direction

- Java 17
- Maven
- Base package: `com.learnx`
- Architecture style: plain Java library, framework-agnostic
- External AI: Gemini via LangChain4j
- External search: Tavily
- Catalog source: JSON seed data in resources
- Persistence strategy: interfaces now, database adapters later

## Project Layout

```text
learnx/
├─ pom.xml
├─ README.md
├─ BLUEPRINT.md
├─ web/
├─ src/
│  ├─ main/
│  │  ├─ java/
│  │  │  └─ com/learnx/
│  │  │     ├─ core/
│  │  │     │  ├─ model/
│  │  │     │  ├─ service/
│  │  │     │  ├─ engine/
│  │  │     │  └─ store/
│  │  │     ├─ ai/
│  │  │     │  ├─ model/
│  │  │     │  ├─ service/
│  │  │     │  ├─ provider/
│  │  │     │  └─ search/
│  │  │     └─ shared/
│  │  │        └─ config/
│  │  └─ resources/
│  │     └─ catalog.json
│  └─ test/
│     └─ java/
```

## Core Features To Build

### 1. Catalog And Curriculum
- Multi-subject catalog
- Topic graph with prerequisites
- Exam context metadata
- Seeded question bank
- Validation for duplicates, missing references, and cycles

### 2. Quiz And Progress
- MCQ evaluation
- Keyword-based short-answer evaluation
- Quiz scoring and feedback
- Topic mastery tracking
- Weak-topic and strong-topic detection

### 3. Analytics And Recommendation
- Learner performance snapshot
- Topic-level accuracy
- Recent performance trends
- Practice frequency
- Next-best-topic recommendation based on prerequisites, weakness, and exam weight

### 4. AI Tutor And Grounding
- Gemini-based tutoring
- Search-grounded answers
- Resource fetching from Tavily
- Composite search with fallback and deduplication
- Exam-oriented response formatting

### 5. Integration Surface
- A single facade: `LearnxEngine`
- Consumers later:
  - Spring Boot services/controllers
  - web frontend
  - future mobile support through the web experience or shared APIs

## Main Code Blueprint

### `com.learnx.core.model`
- `Subject`: subject identity and tags
- `Topic`: topic metadata, prerequisites, difficulty, exam weight
- `ExamContext`: exam-specific focus metadata
- `Question`: quiz question definition
- `QuizAttempt`: submitted answers
- `QuizEvaluation`: scored result
- `LearnerProfile`: learner-level progress state
- `TopicProgress`: per-topic mastery state
- `PerformanceSnapshot`: analytics summary
- `StudyRecommendation`: next action suggestion

### `com.learnx.core.service`
- `CatalogService`: load and validate catalog data
- `QuizEngine`: score quizzes
- `ProgressService`: update learner mastery
- `AnalyticsService`: produce learner insights

### `com.learnx.core.engine`
- `RecommendationEngine`: choose next study action
- `LearnxEngine`: public facade for the whole library

### `com.learnx.core.store`
- `CatalogStore`: source of catalog data
- `LearnerStore`: learner persistence port
- `QuizHistoryStore`: quiz history persistence port
- In-memory implementations for local use and tests

### `com.learnx.ai.model`
- `SearchQuery`
- `SearchResult`
- `TutorRequest`
- `TutorResponse`
- `TutorPrompt`

### `com.learnx.ai.provider`
- `AiProvider`: common LLM interface
- `GeminiAiProvider`: Gemini implementation

### `com.learnx.ai.search`
- `SearchProvider`: common search interface
- `TavilySearchProvider`
- `CompositeSearchProvider`

### `com.learnx.ai.service`
- `TutorService`: combines catalog context, learner context, AI, and search results

## Functional Flow

1. Load subjects, topics, exams, and questions from `catalog.json`
2. Initialize learner profile
3. Evaluate quiz answers
4. Update topic mastery and learner stats
5. Generate analytics snapshot
6. Recommend next topic or revision target
7. Answer learner doubts with AI
8. Ground AI response with live search results when keys are available

## What Other AI Assistants Can Work On

### Agent 1: Core Models
- Create and refine all `com.learnx.core.model` classes
- Keep catalog models immutable
- Keep learner progress models easy to update

### Agent 2: Catalog + Validation
- Build `CatalogStore` and `CatalogService`
- Load JSON
- Validate prerequisites, subject links, and question consistency

### Agent 3: Quiz + Progress
- Build `QuizEngine`
- Build `ProgressService`
- Handle MCQ and keyword scoring

### Agent 4: Analytics + Recommendation
- Build `AnalyticsService`
- Build `RecommendationEngine`
- Tune weak-topic and exam-weight logic

### Agent 5: AI Layer
- Build `AiProvider`
- Build `GeminiAiProvider`
- Keep AI provider optional and fault-tolerant

### Agent 6: Search Layer
- Build Tavily adapter
- Build composite search merge and deduplication
- Normalize result shape

### Agent 7: Integration + Tests
- Build `LearnxEngine`
- Add end-to-end tests
- Document sample usage in `README.md`

## Rules For All Assistants

- Do not add UI code yet
- Do not hardcode secrets
- Keep code under `com.learnx`
- Use small, focused classes
- Prefer constructor injection
- Keep services framework-agnostic
- Use JSON resources for seed data
- Preserve the separation between:
  - core logic
  - AI/search integration
  - persistence interfaces

## Environment Variables

- `LEARNX_GEMINI_API_KEY`
- `LEARNX_TAVILY_API_KEY`
- `LEARNX_GEMINI_MODEL`
- `LEARNX_REQUEST_TIMEOUT_SECONDS`
- `LEARNX_SEARCH_MAX_RESULTS`

## MVP Definition For Your Slice

The MVP for this repo is complete when:

- catalog loads from JSON
- quizzes can be evaluated
- learner progress is updated
- recommendations are generated
- tutor responses can be produced
- search grounding works when keys are present
- the whole flow is accessible through `LearnxEngine`
- unit tests cover core logic and provider parsing

## Suggested Prompt For Other AI Assistants

```text
You are contributing to LearnX, a Java 17 Maven project under base package com.learnx.
Your task is limited to [MODULE NAME].
Do not add UI code.
Do not add Spring Boot controllers.
Do not hardcode API keys.
Keep services framework-agnostic.
Preserve package boundaries:
- com.learnx.core = learning engine
- com.learnx.ai = AI and search
- com.learnx.shared = config
Before coding, inspect existing files and extend them instead of redesigning unrelated parts.
Add JUnit 5 tests for every behavior you implement.
```
