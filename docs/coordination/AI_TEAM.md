# LearnX Team Guide

This file defines maintainable ownership boundaries for human contributors.

## Backend Ownership Boundaries

- `com.learnx.api`: API controllers, filters, error contract
- `com.learnx.core`: domain engine, catalog, quiz, progress, analytics
- `com.learnx.ai`: tutor orchestration, provider and search adapters
- `com.learnx.shared`: environment and shared config

## Frontend Ownership Boundaries

- Routing and layouts under `web/src/app`
- Reusable components under `web/src/components`
- Runtime gateways and types under `web/src/lib`

## Engineering Rules

- No secrets in source control.
- No merge-conflict markers in committed files.
- All behavior changes require test updates.
- Keep module boundaries explicit and avoid cross-layer leakage.
