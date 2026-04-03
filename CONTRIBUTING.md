# Contributing

This repository uses `learnx-clean` as the integration branch for day-to-day development while keeping `main` as the stable public branch.

## Development Workflow

1. Start from the latest integration branch.

```bash
git switch learnx-clean
git pull origin learnx-clean
```

2. Create a short-lived branch.

```bash
git switch -c feat/<name>
```

Use the right prefix for the kind of change:

- `feat/<name>` for features
- `fix/<name>` for bug fixes
- `chore/<name>` for repo, docs, tooling, or maintenance work

3. Open pull requests into `learnx-clean`.
4. Promote validated work from `learnx-clean` into `main` as a separate intentional step.

## Local Quality Checks

Run the backend checks from the repo root:

```bash
mvn test
```

Run the frontend checks from `web/`:

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

## Engineering Standards

- Keep commits focused and easy to review.
- Add or update tests when behavior changes.
- Update documentation when workflows, contracts, or setup steps change.
- Add new environment variables to `.env.example` or `web/.env.example` when needed.
- Avoid hardcoded secrets; use environment variables or platform secret managers.

## Code Organization

- Java packages should stay aligned with domain responsibility: `api`, `core`, `ai`, `persistence`, `shared`.
- JPA entities should use explicit `*Entity` names.
- Frontend components should stay reusable, typed, and colocated under `web/src`.
- Historical or one-off notes should go in `docs/archive`, not the repo root.

## Pull Request Checklist

- [ ] The branch targets `learnx-clean`.
- [ ] Tests pass for the modified area.
- [ ] Documentation was updated when behavior or workflows changed.
- [ ] New config keys were added to the relevant example env file.
- [ ] No merge conflict markers or debug-only changes remain.
