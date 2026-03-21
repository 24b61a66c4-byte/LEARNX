# LearnX

LearnX is an AI-powered smart learning backend library focused on adaptive learning, quiz evaluation, performance analysis, and grounded AI tutoring.

## Scope

This repository currently implements the LearnX core engine and AI layer as a plain Java 17 Maven project. It is designed to be embedded later inside a Spring Boot backend and consumed by a desktop or web UI.

## Package Layout

- `com.learnx.core.model`: immutable catalog models and learner state
- `com.learnx.core.service`: catalog, quiz, progress, and analytics services
- `com.learnx.core.engine`: recommendation logic and facade entry point
- `com.learnx.core.store`: persistence-neutral interfaces and in-memory adapters
- `com.learnx.ai.model`: tutor and search request/response models
- `com.learnx.ai.provider`: AI provider abstraction and Gemini implementation
- `com.learnx.ai.search`: search provider abstraction and adapters
- `com.learnx.ai.service`: tutoring orchestration
- `com.learnx.shared.config`: environment-driven configuration

## Features

- JSON-seeded multi-subject catalog
- Prerequisite-aware recommendation engine
- Quiz evaluation for MCQs and keyword-based short answers
- Learner progress tracking and analytics
- Gemini integration through LangChain4j
- Brave Search and Tavily grounding with composite result merging
- Framework-agnostic `LearnxEngine` facade

## Configuration

Set these environment variables when you want to enable external integrations:

- `LEARNX_GEMINI_API_KEY`
- `LEARNX_BRAVE_API_KEY`
- `LEARNX_TAVILY_API_KEY`
- `LEARNX_GEMINI_MODEL` (optional, defaults to `gemini-2.5-flash`)
- `LEARNX_REQUEST_TIMEOUT_SECONDS` (optional, defaults to `20`)
- `LEARNX_SEARCH_MAX_RESULTS` (optional, defaults to `5`)

Core catalog, quiz, analytics, and recommendation flows work without any API keys. Tutor responses degrade to a local structured fallback when AI is unavailable. Search grounding is optional.

## Build

```bash
mvn test
```

```bash
mvn package
```

## Quick Start

```java
LearnxEngine engine = LearnxEngine.createDefault();

LearnerProfile learner = engine.initializeLearnerProfile("u-1", "Ricky");
QuizEvaluation evaluation = engine.submitQuiz(new QuizAttempt(
        "u-1",
        "dbms",
        "dbms-sql-basics",
        List.of(SubmittedAnswer.forMcq("q-dbms-1", 1)),
        LocalDateTime.now().minusMinutes(2),
        LocalDateTime.now()
));

StudyRecommendation recommendation = engine.getNextRecommendation("u-1", "dbms", "dbms-jntu-r22");
TutorResponse response = engine.answerDoubt(new TutorRequest(
        "u-1",
        "dbms",
        recommendation.topicId(),
        "dbms-jntu-r22",
        "Explain this topic in exam style",
        3
));
```

## Seed Data

The initial catalog lives in `src/main/resources/catalog.json`. It includes seeded subjects, topics, exam contexts, and a question bank for EDC and DBMS to keep the engine multi-subject from day one.
