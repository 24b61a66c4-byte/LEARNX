# Environment Guide

LearnX uses separate environment files for the backend and frontend. Keep secrets out of source control and update the example env files whenever you add a new required variable.

## Local Files

- Root backend template: `.env.example`
- Root backend local file: `.env.local`
- Frontend template: `web/.env.example`
- Frontend local file: `web/.env.local`

## Backend Variables

Core runtime:

- `LEARNX_ENV`
- `LEARNX_FRONTEND_URL`
- `LEARNX_ALLOWED_ORIGINS`
- `LEARNX_DEBUG_PROMPTS`

Database and persistence:

- `LEARNX_DB_URL`
- `LEARNX_DB_USERNAME`
- `LEARNX_DB_PASSWORD`

Authentication:

- `LEARNX_JWT_ISSUER_URI`
- `LEARNX_JWT_JWK_SET_URI`
- `LEARNX_JWT_SECRET`

Configure exactly one JWT validation source. The backend must also allow the active frontend origin through `LEARNX_ALLOWED_ORIGINS`.

AI and search:

- `LEARNX_GEMINI_API_KEY`
- `LEARNX_GEMINI_MODEL`
- `LEARNX_TAVILY_API_KEY`
- `LEARNX_BRAVE_API_KEY`
- `LEARNX_YOUTUBE_API_KEY`
- `LEARNX_PEXELS_API_KEY`

Operational tuning:

- `LEARNX_REQUEST_TIMEOUT_SECONDS`
- `LEARNX_SEARCH_MAX_RESULTS`
- `LEARNX_RATE_LIMIT_*`

## Frontend Variables

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The frontend needs a backend base URL plus the Supabase public configuration required for auth and session handling.

## Local Development Defaults

Common local values:

```env
LEARNX_ENV=dev
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Use your own Supabase and backend credentials locally. Do not hardcode personal machine paths or environment-specific status notes into canonical docs.

## Deployment Notes

- Frontend preview and production environments should both define the required `NEXT_PUBLIC_*` keys.
- Backend environments should define database, auth, CORS, and optional AI/search settings through the platform secret manager.
- If you add a new required variable, update both the relevant example env file and the deployment guide.

## Related Docs

- [Getting Started](GETTING_STARTED.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Operations](../OPERATIONS.md)
