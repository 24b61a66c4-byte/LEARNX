package com.learnx.shared.config;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

/**
 * Centralized LearnX configuration loaded from environment variables.
 */
public record LearnxConfig(
        String geminiApiKey,
        String braveApiKey,
        String tavilyApiKey,
        String geminiModel,
        Duration requestTimeout,
        int maxSearchResults
) {

    public static final String GEMINI_API_KEY_ENV = "LEARNX_GEMINI_API_KEY";
    public static final String BRAVE_API_KEY_ENV = "LEARNX_BRAVE_API_KEY";
    public static final String TAVILY_API_KEY_ENV = "LEARNX_TAVILY_API_KEY";
    public static final String GEMINI_MODEL_ENV = "LEARNX_GEMINI_MODEL";
    public static final String REQUEST_TIMEOUT_ENV = "LEARNX_REQUEST_TIMEOUT_SECONDS";
    public static final String SEARCH_LIMIT_ENV = "LEARNX_SEARCH_MAX_RESULTS";

    public static LearnxConfig fromEnvironment() {
        return fromMap(System.getenv());
    }

    static LearnxConfig fromMap(Map<String, String> source) {
        String geminiModel = Optional.ofNullable(source.get(GEMINI_MODEL_ENV))
                .filter(value -> !value.isBlank())
                .orElse("gemini-2.5-flash");

        long timeoutSeconds = parseLong(source.get(REQUEST_TIMEOUT_ENV), 20L);
        int maxSearchResults = Math.max(1, (int) parseLong(source.get(SEARCH_LIMIT_ENV), 5L));

        return new LearnxConfig(
                normalize(source.get(GEMINI_API_KEY_ENV)),
                normalize(source.get(BRAVE_API_KEY_ENV)),
                normalize(source.get(TAVILY_API_KEY_ENV)),
                geminiModel,
                Duration.ofSeconds(Math.max(5L, timeoutSeconds)),
                maxSearchResults
        );
    }

    public boolean hasGeminiApiKey() {
        return geminiApiKey != null;
    }

    public boolean hasBraveApiKey() {
        return braveApiKey != null;
    }

    public boolean hasTavilyApiKey() {
        return tavilyApiKey != null;
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private static long parseLong(String value, long defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException ignored) {
            return defaultValue;
        }
    }
}
