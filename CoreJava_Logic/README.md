# CoreJava_Logic

## Focus
This module contains the **adaptive learning logic and system architecture** for LearnBot Pro.

## Responsibilities
- Adaptive learning engine: adjusting content difficulty based on learner performance
- Session management: tracking learner progress across sessions
- Domain models: `Learner`, `LearningSession`, `Question`, `Topic`, `PerformanceMetrics`
- Core algorithms: scoring, spaced-repetition scheduling, difficulty adaptation
- Service interfaces consumed by the AI and UI layers

## Package Structure
```
src/
└── com/
    └── learnx/
        └── core/
            ├── model/        # Domain model classes
            ├── service/      # Business logic / service interfaces and implementations
            ├── engine/       # Adaptive learning algorithms
            └── util/         # Shared utility helpers
```

## Integration
All source files compile into the common `src/` directory at the project root.  
When merging, place your classes under `src/com/learnx/core/`.

## Guidelines
- Use plain **Core Java (Java 17+)**; avoid external frameworks in this module.
- Every public class should have a corresponding unit test (JUnit 5).
- Follow the [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html).
- Keep classes small and focused (Single Responsibility Principle).
- Document public APIs with Javadoc.
