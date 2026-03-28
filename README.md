# LearnX

> App-grade adaptive learning for engineering students — powered by AI tutoring, prerequisite-aware recommendations, and a clean study workspace.

---

## Overview

LearnX pairs a **Java + Spring Boot** AI engine with a **Next.js** web frontend to deliver a tightly scoped study experience built for engineering exams.  
Launch subjects: **DBMS** and **EDC**. The path is simple: choose a subject → read the lesson → ask a doubt → run a quick drill.

---

## Repository Structure

```
.
├── src/                        # Java 17 / Spring Boot backend
│   └── main/java/com/learnx/
│       ├── api/                # Spring Boot entry point & REST controllers
│       ├── core/               # Domain models, services, stores, engine
│       ├── ai/                 # AI provider abstraction (Gemini), search (Tavily)
│       └── shared/config/      # Environment-driven configuration
├── web/                        # Next.js 15 + TypeScript + Tailwind frontend
│   └── src/
│       ├── app/                # Next.js App Router pages
│       ├── components/         # Reusable UI components
│       └── lib/                # Gateways, types, constants, catalog data
├── docs/                       # Architecture docs, blueprints, planning notes
├── Dockerfile                  # Backend container image
├── docker-compose.yml          # Local multi-service dev stack
├── pom.xml                     # Maven build configuration
└── .env.example                # Required environment variables template
```

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.9+ |
| Node.js | 20.9+ |
| Docker (optional) | 24+ |

### Backend

```bash
# Run all tests
mvn test

# Build a runnable JAR
mvn package

# Start the API server (port 8080)
mvn spring-boot:run
```

### Frontend

```bash
cd web
npm install
npm run dev       # Development server on http://localhost:3000
npm run build     # Production build
npm run test      # Run vitest unit tests
npm run typecheck # TypeScript type checking
npm run lint      # ESLint
```

### Docker (full stack)

```bash
cp .env.example .env.local
# Edit .env.local with your API keys
docker compose up --build
```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:8080`.

---

## Configuration

Copy `.env.example` to `.env.local` and fill in your keys.

| Variable | Required | Default | Description |
|---|---|---|---|
| `LEARNX_GEMINI_API_KEY` | For AI tutoring | — | [Get one](https://aistudio.google.com/app/apikey) |
| `LEARNX_TAVILY_API_KEY` | For search grounding | — | [Get one](https://app.tavily.com/home/api-keys) |
| `LEARNX_GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model identifier |
| `LEARNX_REQUEST_TIMEOUT_SECONDS` | No | `20` | API timeout |
| `LEARNX_SEARCH_MAX_RESULTS` | No | `5` | Max Tavily results |

> **All AI and search keys are optional.** The quiz, catalog, recommendation, and progress flows work without them. Tutor responses fall back to a local structured answer.

---

## Features

- JSON-seeded multi-subject catalog (DBMS + EDC out of the box)
- Prerequisite-aware topic recommendation engine
- Quiz evaluation for MCQ and keyword-based short answers
- Learner progress tracking and analytics
- Gemini AI integration via LangChain4j
- Tavily web-search grounding with composite result merging
- Framework-agnostic `LearnxEngine` facade

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a pull request

Please run `mvn test` (backend) and `npm test` inside `web/` (frontend) before submitting.

---

## License

MIT © LearnX Contributors
