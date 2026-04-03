# Getting Started

This guide covers the canonical local setup flow for LearnX. Historical import and machine-specific notes live in `docs/archive/`.

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 20.9+ (or 22.x / 24.x for the frontend)

## 1. Create Local Environment Files

```bash
cp .env.example .env.local
cp web/.env.example web/.env.local
```

Set the minimum required values:

- Backend: `LEARNX_ENV=dev`
- Frontend: `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`
- Frontend auth: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

For authenticated backend endpoints, configure one of `LEARNX_JWT_ISSUER_URI`, `LEARNX_JWT_JWK_SET_URI`, or `LEARNX_JWT_SECRET`.

## 2. Install Frontend Dependencies

```bash
cd web
npm install
```

## 3. Start the Application

### Full local stack

Terminal 1:

```bash
mvn spring-boot:run
```

Terminal 2:

```bash
cd web
npm run dev
```

### Frontend-only workflow

If `web/.env.local` points `NEXT_PUBLIC_API_URL` at a reachable backend, you can run only the frontend:

```bash
cd web
npm run dev
```

## Optional Helpers

- `start-learnx.ps1` and `start-learnx.bat` can help launch the app from the repo root.
- `run-frontend.ps1` provides a frontend-focused helper for dev, build, and production startup flows.
- `docker compose --env-file .env.local up --build` can be used for container-based local orchestration.

## Recommended Verification

Backend:

```bash
mvn test
```

Frontend:

```bash
cd web
npm run lint
npm run typecheck
npm run test
npm run build
```

## Next Docs

- [Environment Guide](ENVIRONMENT.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Backend Integration Guide](../BACKEND_INTEGRATION_GUIDE.md)
