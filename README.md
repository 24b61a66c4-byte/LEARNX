# LearnX

LearnX is a full-stack learning platform that combines a Spring Boot backend, a Next.js web app, and an AI-assisted tutoring layer. The repository is structured as a monorepo so product, platform, and delivery work stay in one place.

## What Is In This Repo

- `src/`: Java 17 backend code for API, domain engine, AI integrations, persistence, and shared runtime config
- `web/`: Next.js App Router frontend with TypeScript, tests, and deployment scripts
- `docs/`: architecture, guides, planning notes, coordination docs, and archived historical material
- `Dockerfile`, `docker-compose.yml`, `vercel.json`: deployment and local orchestration entrypoints

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20.9+ (the frontend supports Node 20.x, 22.x, or 24.x)

### 1. Configure Environment Files

```bash
cp .env.example .env.local
cp web/.env.example web/.env.local
```

Minimum local setup:

- `LEARNX_ENV=dev`
- `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional AI/search integrations:

- `LEARNX_GEMINI_API_KEY`
- `LEARNX_TAVILY_API_KEY`
- `LEARNX_BRAVE_API_KEY`
- `LEARNX_YOUTUBE_API_KEY`
- `LEARNX_PEXELS_API_KEY`

### 2. Start the Backend

```bash
mvn spring-boot:run
```

### 3. Start the Frontend

```bash
cd web
npm install
npm run dev
```

The frontend automatically forwards the active Supabase access token to authenticated backend requests, so UI code does not need to manage `Authorization` headers manually.

## Verification Commands

Run these before opening a pull request:

```bash
mvn test
cd web
npm run lint
npm run typecheck
npm run test
npm run build
```

## Branch Model

- `main`: stable public branch and default GitHub entrypoint
- `learnx-clean`: integration branch for active development
- `feat/<name>`, `fix/<name>`, `chore/<name>`: short-lived working branches created from `learnx-clean`

Pull requests should target `learnx-clean`. Promotions into `main` should happen intentionally after validation.

## Documentation Map

- [Getting Started](docs/guides/GETTING_STARTED.md)
- [Environment Guide](docs/guides/ENVIRONMENT.md)
- [Deployment Guide](docs/guides/DEPLOYMENT.md)
- [Multi-Device Sync Guide](docs/guides/MULTI_DEVICE_SYNC.md)
- [Docs Index](docs/README.md)
- [Contributing Guide](CONTRIBUTING.md)

## Configuration Notes

For authenticated backend routes, configure exactly one of:

- `LEARNX_JWT_ISSUER_URI`
- `LEARNX_JWT_JWK_SET_URI`
- `LEARNX_JWT_SECRET`

Make sure `LEARNX_ALLOWED_ORIGINS` includes the frontend origin you are serving from.

The tutor search stack includes free providers with no API key required: Wikipedia and arXiv.

## License

MIT. See `LICENSE`.
