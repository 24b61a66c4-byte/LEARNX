# AI_Integration

## Focus
This module handles **LangChain4j integration with Google Gemini** to power adaptive, personalised AI responses in LearnBot Pro.

## Responsibilities
- Configure and manage the LangChain4j `ChatLanguageModel` backed by Google Gemini
- Build dynamic prompts that include learner context (age, level, topic, performance)
- Parse and validate Gemini API responses
- Implement AI memory / conversation history for contextual dialogue
- Expose a clean service interface consumed by the UI and Core Logic layers

## Package Structure
```
src/
└── com/
    └── learnx/
        └── ai/
            ├── client/       # LangChain4j model client setup and factory
            ├── prompt/       # Prompt templates and builder utilities
            ├── response/     # Response parsing, validation, and DTOs
            └── config/       # API key loading, model parameters, retry config
```

## Key Technologies
| Technology       | Role                                             |
|------------------|--------------------------------------------------|
| LangChain4j      | Java SDK for LLM orchestration                   |
| Google Gemini    | Underlying large language model                  |
| AI Services API  | High-level `@AiService` interfaces (LangChain4j) |

## Integration
All source files compile into the common `src/` directory at the project root.  
When merging, place your classes under `src/com/learnx/ai/`.

## Guidelines
- Load the **Google Gemini API key** from an environment variable (`GEMINI_API_KEY`) — never commit keys.
- Design prompts to be **age-adaptive**: include learner age/grade in every system prompt.
- Handle API errors gracefully with retry logic and fallback messages.
- Log token usage for cost monitoring — do **not** log full prompt content in production.
- Write integration tests against a mocked LangChain4j `ChatLanguageModel`.
