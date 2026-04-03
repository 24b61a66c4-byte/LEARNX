# Deployment Guide

LearnX is designed to run as a split deployment:

- Next.js frontend from `web/`
- Spring Boot backend from the repo root
- PostgreSQL and auth services provided by Supabase or a compatible stack

Vercel for the frontend and Railway for the backend are the primary documented targets, but the repo structure also supports other compatible platforms.

## Pre-Deployment Checklist

- Backend and frontend test suites pass
- Required environment variables are set in the target platforms
- CORS allows the frontend origin
- Database migrations are ready to run
- Example env files reflect any new required config

## Backend Deployment

The backend builds from the repo root using `pom.xml` and the root `Dockerfile`.

Required platform configuration:

- `LEARNX_ENV=prod`
- database connection settings
- one JWT validation source
- `LEARNX_ALLOWED_ORIGINS`
- optional AI/search provider keys

Recommended validation:

```bash
mvn test
curl https://<backend-host>/actuator/health
curl https://<backend-host>/api/v1/health
```

## Frontend Deployment

The frontend is in `web/` and should be deployed with:

```bash
cd web
npm run build
```

Required environment variables:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Recommended validation:

```bash
cd web
npm run lint
npm run typecheck
npm run test
npm run build
```

## Database And Auth

- Flyway migrations live in `src/main/resources/db/migration/`
- Supabase is the documented reference for PostgreSQL plus JWT-backed auth
- If using hosted auth, make sure issuer/JWK settings match the deployed project

## Post-Deploy Verification

- Frontend loads without runtime errors
- Backend health endpoints return success
- Authenticated routes accept valid tokens
- No CORS or JWT validation failures appear in logs
- Catalog, profile, quiz, notes, and tutor flows work end to end

## Rollback Approach

- Roll back the frontend to the last stable deployment
- Roll back the backend to the last validated release
- Restore database state only when a schema or migration issue requires it

## Related Docs

- [Getting Started](GETTING_STARTED.md)
- [Environment Guide](ENVIRONMENT.md)
- [Operations](../OPERATIONS.md)
