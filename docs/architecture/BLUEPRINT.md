# LearnX Blueprint

## Product Direction

LearnX is a full-stack learning product with a production-ready backend and a web frontend.

## Architecture Summary

- Backend: Spring Boot + Java 17 under `src/`
- Frontend: Next.js + TypeScript under `web/`
- Config and operations: environment-driven and documented in `docs/`

## Core Capabilities

- Catalog and topic graph management
- Quiz scoring and progress tracking
- Learner analytics and recommendation engine
- AI tutor with optional search grounding and safe fallback

## Engineering Priorities

1. Reliability: strict validation and stable error contracts.
2. Maintainability: modular package boundaries and typed frontend layers.
3. Operability: request IDs, centralized exception handling, deployment assets.
4. Scalability: provider abstractions and isolated service responsibilities.

See `docs/ARCHITECTURE.md` for implementation-level details.
