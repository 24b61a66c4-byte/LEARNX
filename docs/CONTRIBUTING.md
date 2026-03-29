# Contributing

## Branch and Commit Practices

- Work in feature branches, then open pull requests.
- Keep commits focused and atomic.
- Include tests for behavior changes.

## Coding Standards

- Java: follow package boundaries (`api`, `core`, `ai`, `shared`).
- Frontend: keep components reusable and typed.
- Avoid hardcoded secrets; use environment variables.

## Required Checks

Backend:

```bash
mvn clean compile test
```

Frontend:

```bash
cd web
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

## Pull Request Checklist

- [ ] No merge conflict markers remain.
- [ ] Tests pass for modified areas.
- [ ] Documentation updated if behavior changed.
- [ ] New configs added to `.env.example` when needed.
