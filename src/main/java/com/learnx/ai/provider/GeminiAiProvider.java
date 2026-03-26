package com.learnx.ai.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnx.ai.model.TutorPrompt;
import com.learnx.ai.model.TutorResponse;
import com.learnx.ai.provider.FallbackAiProvider;

import java.time.Duration;

/**
 * Gemini-backed tutor provider implemented through LangChain4j (deferred for
 * deps).
 * Uses fallback until Maven deps resolved.
 */
public class GeminiAiProvider implements AiProvider {

    private final AiProvider fallback;

    public GeminiAiProvider(String apiKey, String modelName, Duration timeout) {
        this.fallback = new FallbackAiProvider();
    }

    GeminiAiProvider(AiProvider fallback) {
        this.fallback = fallback;
    }

    @Override
    public TutorResponse generate(TutorPrompt prompt) {
        return fallback.generate(prompt);
    }
}
