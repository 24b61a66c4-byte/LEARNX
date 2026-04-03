# Branching Strategy

The authoritative branch workflow lives in [`CONTRIBUTING.md`](../../CONTRIBUTING.md). This document is a short reference for coordination discussions.

## Branch Roles

- `main`: stable public branch
- `learnx-clean`: integration branch for active development
- `feat/<name>`, `fix/<name>`, `chore/<name>`: short-lived working branches created from `learnx-clean`

## Flow

1. Update `learnx-clean`
2. Branch from `learnx-clean`
3. Open PRs back into `learnx-clean`
4. Promote validated changes from `learnx-clean` into `main`

## Coordination Notes

- Keep generated artifacts and local-only files out of commits.
- Use small, focused PRs when possible.
- Update docs when branch policy or delivery flow changes.
