# LearnX BlackboxAI / AI Layer TODO

## Current Progress

Phase 3 is no longer in the starting state.

### Implemented
- `src/main/java/com/learnx/ai/model/SearchQuery.java`
- `src/main/java/com/learnx/ai/model/SearchResult.java`
- `src/main/java/com/learnx/ai/model/TutorPrompt.java`
- `src/main/java/com/learnx/ai/model/TutorRequest.java`
- `src/main/java/com/learnx/ai/model/TutorResponse.java`
- `src/main/java/com/learnx/ai/provider/AiProvider.java`
- `src/main/java/com/learnx/ai/provider/GeminiAiProvider.java`
- `src/main/java/com/learnx/ai/provider/FallbackAiProvider.java`
- `src/main/java/com/learnx/ai/search/SearchProvider.java`
- `src/main/java/com/learnx/ai/search/SearchException.java`
- `src/main/java/com/learnx/ai/search/BraveSearchProvider.java`
- `src/main/java/com/learnx/ai/search/TavilySearchProvider.java`
- `src/main/java/com/learnx/ai/search/CompositeSearchProvider.java`
- `src/main/java/com/learnx/ai/service/TutorService.java`

### Tests Added
- `src/test/java/com/learnx/ai/provider/AiProviderTest.java`
- `src/test/java/com/learnx/ai/search/BraveSearchProviderTest.java`
- `src/test/java/com/learnx/ai/search/TavilySearchProviderTest.java`
- `src/test/java/com/learnx/ai/search/CompositeSearchProviderTest.java`
- `src/test/java/com/learnx/ai/service/TutorServiceTest.java`

## Status

- AI/search layer: ✅ implemented
- Tutor orchestration: ✅ implemented
- Engine integration: ✅ implemented through `LearnxEngineFactory`
- Local compile/test verification: pending because this shell does not currently expose `java` or `mvn`

## Remaining Next Actions

### 1. Toolchain Verification
- [x] Install Java 17 locally
- [x] Provision Maven locally
- [x] Run `mvn test`

### 2. Fix Anything Found By Real Build
- [x] Resolve compile and test issues reported by Maven
- [x] Re-run full test suite

### 3. Next Product Layer After Verification
- [ ] Add Spring Boot adapter layer if needed
- [ ] Add persistence adapters for `LearnerStore` and `QuizHistoryStore`
- [ ] Expand catalog/question coverage
- [ ] Improve tutor prompt shaping and source ranking

## Notes

- The older TODO state saying “Starting Phase 3” is outdated.
- The repo now contains the actual AI/search implementation.
- Coordination details are tracked in `AI_COORDINATION.md`.
- Local verification is complete: `mvn test` passes with 20 tests green.
