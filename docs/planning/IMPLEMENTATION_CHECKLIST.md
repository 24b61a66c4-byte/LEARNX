# Implementation Checklist

## Repository Hygiene

- [x] Remove merge-conflict markers
- [x] Improve `.gitignore` for generated and binary files
- [x] Add dependency update automation (`.github/dependabot.yml`)

## Backend

- [x] Validation and safety guardrails for tutor requests
- [x] Centralized API exception handling
- [x] Request context logging support
- [x] Full backend test suite passing

## Frontend

- [x] Componentized app structure in `web/src/components`
- [x] Typed gateway and response contracts
- [ ] Replace mock gateway behavior with real API integration
- [ ] Add CI-enforced frontend lint/typecheck/test/build

## Ops and Deployment

- [x] Standardized docs (`docs/`)
- [x] Environment template (`.env.example`)
- [ ] Containerized local run and deployment docs verification
