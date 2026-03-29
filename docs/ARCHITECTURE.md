# Architecture

## Overview

LearnX is organized into two deployable applications and one shared repository:

- Backend API and learning engine (`src/`)
- Frontend web app (`web/`)
- Documentation and delivery standards (`docs/`)

## Backend Modules

- `com.learnx.api`: REST controllers, filters, API error contract
- `com.learnx.core`: catalog, quiz, progress, analytics, recommendation engine
- `com.learnx.ai`: provider adapters, search adapters, tutor orchestration
- `com.learnx.shared`: configuration and common runtime settings

## Frontend Modules

- `src/app`: route-level pages and layouts
- `src/components`: reusable UI components
- `src/lib`: gateways, constants, types, data adapters

## Request Flow

1. Frontend issues tutor request to `/api/tutor`.
2. Controller enriches request context (MDC) and delegates to engine.
3. Tutor service validates input and composes context.
4. Search providers return grounding sources (optional by API key).
5. Primary AI provider responds or fallback provider is used.
6. Response metadata and citations are returned to client.

## Scalability Practices

- Constructor-based service composition
- Interface-driven provider abstractions
- Centralized exception handling
- Configurable environment-specific behavior
- Bounded in-memory conversation context for tutor continuity
