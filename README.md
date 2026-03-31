# LearnX

LearnX is a production-oriented learning platform with:

- Java 17 Spring Boot API + domain engine
- AI-assisted tutor (Gemini + fallback) with optional search grounding
- Next.js web frontend (App Router, TypeScript)

## Monorepo Layout

- `src/`: backend source code (API, core engine, AI/search, shared config)
- `web/`: frontend application
- `docs/`: organized project documentation
- `docs/architecture/`: blueprint and project overview
- `docs/planning/`: implementation and product planning docs
- `docs/coordination/`: team workflow and branching notes
- `src/main/resources/`: backend runtime resources

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20.9+

### 1. Configure Environment

```bash
cp .env.example .env.local
cp web/.env.example web/.env.local
```

Set at least:

- `LEARNX_ENV=dev`
- `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `LEARNX_GEMINI_API_KEY` (optional)
- `LEARNX_TAVILY_API_KEY` (optional)

When a user is signed in, the frontend automatically forwards the current Supabase access token to backend API requests, so UI code does not need to manage `Authorization` headers manually.

### 2. Run Backend Tests

```bash
mvn clean compile test
```

### 3. Run Frontend

```bash
cd web
npm install
npm run dev
```

### Docker (full stack, optional)

```bash
cp .env.example .env.local
docker compose --env-file .env.local up --build
```

## Configuration

Copy `.env.example` to `.env.local`, copy `web/.env.example` to `web/.env.local`, and fill in your keys. For Vercel deployments, add the `NEXT_PUBLIC_*` keys in the project environment settings for both Preview and Production.

For authenticated backend routes, configure one of `LEARNX_JWT_ISSUER_URI`, `LEARNX_JWT_JWK_SET_URI`, or `LEARNX_JWT_SECRET`, and make sure `LEARNX_ALLOWED_ORIGINS` includes the frontend origin you are serving from.

| Variable | Required | Default | Description |
|---|---|---|---|
| `LEARNX_GEMINI_API_KEY` | For AI tutoring | — | [Get one](https://aistudio.google.com/app/apikey) |
| `LEARNX_GOOGLE_API_KEY` / `_2` / `_3` | Optional alias | — | Fallback aliases used for Gemini/YouTube key resolution |
| `LEARNX_TAVILY_API_KEY` | For search grounding | — | [Get one](https://app.tavily.com/home/api-keys) |
| `LEARNX_BRAVE_API_KEY` | Optional | — | Brave web search provider |
| `LEARNX_YOUTUBE_API_KEY` | Optional | — | YouTube Data API for study videos |
| `LEARNX_PEXELS_API_KEY` | Optional | — | Pexels videos API for free stock learning visuals |
| `LEARNX_GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model identifier |
| `LEARNX_REQUEST_TIMEOUT_SECONDS` | No | `20` | API timeout |
| `LEARNX_SEARCH_MAX_RESULTS` | No | `5` | Max Tavily results |

The tutor search stack now also includes free providers with no API key required: Wikipedia and arXiv.

## Contributing

Please run backend and frontend checks before opening a pull request:

```bash
mvn test
cd web && npm run lint && npm run typecheck && npm run test && npm run build
```

For full documentation map, see `docs/README.md`.

## License

MIT (see `LICENSE`)
