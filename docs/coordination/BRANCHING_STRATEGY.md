# Branching Strategy

## Protected branches

- `main`: stable LEARNX baseline
- `learnx-clean`: clean integration branch that tracks the production-grade refactor line

## Working branches

Use prefixed short-lived branches from `learnx-clean`:

- `feat/<name>` for features
- `fix/<name>` for bug fixes
- `chore/<name>` for repo/documentation/devex work

## Workflow

1. `git switch learnx-clean`
2. `git pull`
3. `git switch -c feat/<name>`
4. Implement + test
5. Open PR into `learnx-clean`
6. Periodically promote from `learnx-clean` to `main`

## Safety rules

- Never merge unrelated histories into `main`.
- If accidental merge starts, create backup and abort merge.
- Keep uncommitted generated files out of commits.
