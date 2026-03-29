# Operations

## Environment Variables

Core:

- `LEARNX_ENV` (`dev` or `prod`)
- `LEARNX_FRONTEND_URL` (required in `prod`)
- `LEARNX_DEBUG_PROMPTS` (`true`/`false`)
- `LEARNX_MAX_QUESTION_LENGTH`

AI/Search:

- `LEARNX_GEMINI_API_KEY`
- `LEARNX_BRAVE_API_KEY`
- `LEARNX_TAVILY_API_KEY`
- `LEARNX_GEMINI_MODEL`
- `LEARNX_REQUEST_TIMEOUT_SECONDS`
- `LEARNX_SEARCH_MAX_RESULTS`

## Logging and Error Handling

- Request IDs are attached via `RequestContextFilter`.
- Global exceptions are translated to stable API errors.
- AI provider failures are handled with fallback behavior where possible.

## Deployment Notes

- Use `Dockerfile` for backend container.
- Use `web/Dockerfile` for frontend container.
- Use `docker-compose.yml` for local full-stack orchestration.

## Production Checklist

- Set `LEARNX_ENV=prod`.
- Configure `LEARNX_FRONTEND_URL`.
- Provide API keys through secret manager.
- Run backend and frontend test suites before release.
