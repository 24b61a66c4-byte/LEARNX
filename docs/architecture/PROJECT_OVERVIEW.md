# LearnX Project Overview

## 1. What LearnX Is

LearnX is an AI-powered learning system for all learners—students of all ages and backgrounds.

In simple terms, the product vision is:

**LearnX = smart tutor + quiz system + progress tracker + exam assistant**

The idea is to help a learner:

- understand topics step by step
- practice with questions
- track strengths and weak areas
- get AI help in a study-friendly format

You can think of the end product as a mix of:

- a subject tutor
- an exam-prep assistant
- a coding and concept helper

## 2. Product Vision vs Current Repository

This part is very important for new contributors:

- The full product vision includes a frontend, backend APIs, AI integrations, and a database.
- The full product vision is **web-first and web-only**. We are not planning a separate desktop app.
- This repository currently implements the **core learning engine** and the **AI/search layer** as a plain Java library, and it now also contains the first **web frontend scaffold** under `web/`.

That means the repo already has:

- subject and topic catalog loading
- quiz evaluation
- learner progress tracking
- analytics snapshots
- recommendation logic
- AI tutoring orchestration
- optional search grounding

This repo does **not** yet contain:

- a production-ready frontend connected to real backend APIs
- Spring Boot controllers
- authentication
- a real MySQL/PostgreSQL persistence layer

## 3. Big-Picture Architecture

At the product level, LearnX can be understood like this:

```text
Frontend UI
    ->
Backend API Layer
    ->
LearnX Engine
    ->
AI/Search Providers
    ->
Database / Persistent Storage
```

In the current repository, the implemented center of that architecture is:

```text
Catalog + Quiz + Progress + Analytics + Recommendations + Tutor Service
```

Those pieces are exposed through one main entry point:

```text
LearnxEngine
```

## 4. Frontend Role

The frontend is what the student would use directly.

Typical responsibilities:

- chat-style question input
- subject and topic selection
- showing explanations, quiz results, and recommendations
- displaying progress and weak-topic insights

Recommended frontend direction:

- React or Next.js
- responsive design for mobile and desktop browsers
- PWA-style behavior so the web product feels close to a native app

The frontend is part of the product vision, and the first scaffold now lives in `web/`.
That means the web layer now has:

- a public landing page
- login and signup screens
- a protected `/app/*` shell
- onboarding
- subject, topic, tutor, practice, progress, and profile routes backed by mock/local frontend adapters

For LearnX, "web-only" does **not** mean a weak website. The target experience should feel as polished as a consumer app:

- fast navigation
- clean mobile layouts
- rich lesson pages
- strong video and media support
- smooth chat and quiz flows
- installable behavior when useful

## 5. Backend Role

A future backend layer would sit between the UI and the LearnX engine.

Its job would be to:

- receive requests from the frontend
- manage sessions and users
- call `LearnxEngine`
- return formatted responses
- connect the engine to a real database

Spring Boot is the most natural next step for that layer, but this repo intentionally keeps the core logic framework-agnostic so it can be embedded cleanly later.

## 6. AI Layer

The AI layer is what makes LearnX feel like a tutor instead of only a quiz engine.

In this repository, the AI layer already supports:

- a common `AiProvider` abstraction
- a Gemini-based provider
- a fallback provider when external AI is unavailable
- a `TutorService` that builds grounded, learner-aware responses

The tutor flow combines:

- catalog context
- learner performance context
- optional search results
- AI-generated explanation and answer structure

So the system is not only answering a question in isolation. It can shape the answer using the learner's topic history and the selected exam context.

## 7. Search Grounding

LearnX can optionally improve tutor answers with external search results.

Current support in the repo:

- `TavilySearchProvider`
- `CompositeSearchProvider`

This helps the tutor layer attach fresher external references when keys are available, while still falling back safely if search is unavailable.

## 8. Database and Memory

Every learning platform needs memory.

At the product level, storage would eventually keep:

- user accounts
- chat history
- quiz attempts
- topic mastery
- subject progress
- recommendation history

In the current repo, persistence is still intentionally simple:

- `LearnerStore`
- `QuizHistoryStore`
- in-memory implementations for both

This means the architecture is already prepared for a future database adapter, even though a real SQL implementation is not added yet.

## 9. How a Real Learning Flow Works

Here is a simple example.

### Example question

> "Explain Thevenin theorem in exam style."

### Product-level flow

1. A learner asks the question in the UI.
2. The backend receives the request.
3. The backend calls `LearnxEngine`.
4. `LearnxEngine` routes the request to the tutoring flow.
5. The tutor layer loads subject and topic context.
6. The tutor layer checks learner performance data.
7. Search grounding can fetch supporting resources.
8. The AI provider generates the explanation.
9. The response is returned to the UI.

### Quiz and recommendation flow

LearnX also supports a non-chat flow:

1. learner attempts quiz questions
2. quiz is evaluated
3. learner progress is updated
4. analytics snapshot is generated
5. next topic is recommended

That is the part that makes LearnX adaptive instead of being only a chatbot.

## 10. Main Capabilities Already Present

The current repo already supports these major capabilities:

- multi-subject catalog loading from JSON
- quiz scoring for MCQ and keyword-based short answers
- learner progress and mastery updates
- analytics summaries for performance
- recommendation logic based on readiness and weakness
- AI tutor orchestration
- optional search-grounded tutoring
- one framework-neutral facade through `LearnxEngine`

## 11. Future Product Features

These are strong next-step ideas for the full platform:

- full chat UI
- subject dashboards
- exam-mode answer formats for 2-mark and 10-mark questions
- coding-helper screens
- voice interaction
- test series and auto-evaluation
- recommendation dashboard for "what to study next"
- database-backed learner accounts

## 12. Tech Stack Direction

Current repository stack:

- Java 17
- Maven
- JSON seed catalog
- Gemini integration
- Tavily search integration
- in-memory storage adapters

Likely full-product stack later:

- Frontend: React or Next.js
- Backend: Spring Boot
- Database: MySQL or PostgreSQL
- AI: current Gemini path or another provider abstraction in the future

## 13. Main Challenges

Anyone building LearnX should expect these real challenges:

- AI API cost and rate limits
- prompt design quality
- keeping answers structured and exam-focused
- mapping learner progress accurately
- designing a clean UI for study workflows
- moving from in-memory storage to production persistence

## 14. Recommended Build Path

If you are building the full product from this repo, the clean path is:

1. keep the current engine as the stable domain core
2. add Spring Boot API wrappers around `LearnxEngine`
3. add database-backed store implementations
4. build the frontend on top of those APIs
5. expand exam flows, tutoring styles, and learner personalization

## 15. One-Line Summary

If you want to explain LearnX in one sentence:

**LearnX is a learning engine that combines structured study logic, adaptive recommendations, quiz evaluation, and AI tutoring into one system.**
