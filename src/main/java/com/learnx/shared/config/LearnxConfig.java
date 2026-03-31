package com.learnx.shared.config;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

/**
 * Centralized LearnX configuration loaded from environment variables.
 */
public record LearnxConfig(
        String environment,
        String frontendUrl,
        boolean debugPromptLogging,
        int maxQuestionLength,
        String geminiApiKey,
        String youtubeApiKey,
        String pexelsApiKey,
        String braveApiKey,
        String tavilyApiKey,
        String geminiModel,
        Duration requestTimeout,
        int maxSearchResults) {

    public static final String ENVIRONMENT_ENV = "LEARNX_ENV";
    public static final String FRONTEND_URL_ENV = "LEARNX_FRONTEND_URL";
    public static final String DEBUG_PROMPTS_ENV = "LEARNX_DEBUG_PROMPTS";
    public static final String MAX_QUESTION_LENGTH_ENV = "LEARNX_MAX_QUESTION_LENGTH";
    public static final String GEMINI_API_KEY_ENV = "LEARNX_GEMINI_API_KEY";
    public static final String GOOGLE_API_KEY_ENV = "LEARNX_GOOGLE_API_KEY";
    public static final String GOOGLE_API_KEY_2_ENV = "LEARNX_GOOGLE_API_KEY_2";
    public static final String GOOGLE_API_KEY_3_ENV = "LEARNX_GOOGLE_API_KEY_3";
    public static final String YOUTUBE_API_KEY_ENV = "LEARNX_YOUTUBE_API_KEY";
    public static final String PEXELS_API_KEY_ENV = "LEARNX_PEXELS_API_KEY";
    public static final String BRAVE_API_KEY_ENV = "LEARNX_BRAVE_API_KEY";
    public static final String TAVILY_API_KEY_ENV = "LEARNX_TAVILY_API_KEY";
    public static final String GEMINI_MODEL_ENV = "LEARNX_GEMINI_MODEL";
    public static final String REQUEST_TIMEOUT_ENV = "LEARNX_REQUEST_TIMEOUT_SECONDS";
    public static final String SEARCH_LIMIT_ENV = "LEARNX_SEARCH_MAX_RESULTS";

    public static LearnxConfig fromEnvironment() {
        return fromMap(System.getenv());
    }

    static LearnxConfig fromMap(Map<String, String> source) {
        String environment = Optional.ofNullable(source.get(ENVIRONMENT_ENV))
                .filter(value -> !value.isBlank())
                .orElse("dev")
                .trim()
                .toLowerCase();
        String frontendUrl = normalize(source.get(FRONTEND_URL_ENV));
        String geminiModel = Optional.ofNullable(source.get(GEMINI_MODEL_ENV))
                .filter(value -> !value.isBlank())
                .orElse("gemini-2.5-flash");
        boolean debugPromptLogging = parseBoolean(source.get(DEBUG_PROMPTS_ENV), false);
        int maxQuestionLength = Math.max(200, (int) parseLong(source.get(MAX_QUESTION_LENGTH_ENV), 2000L));

        long timeoutSeconds = parseLong(source.get(REQUEST_TIMEOUT_ENV), 20L);
        int maxSearchResults = Math.max(1, (int) parseLong(source.get(SEARCH_LIMIT_ENV), 5L));

        return new LearnxConfig(
                environment,
                frontendUrl,
                debugPromptLogging,
                maxQuestionLength,
                resolveGeminiApiKey(source),
                resolveYouTubeApiKey(source),
                normalize(source.get(PEXELS_API_KEY_ENV)),
                normalize(source.get(BRAVE_API_KEY_ENV)),
                normalize(source.get(TAVILY_API_KEY_ENV)),
                geminiModel,
                Duration.ofSeconds(Math.max(5L, timeoutSeconds)),
                maxSearchResults);
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

    public boolean hasYoutubeApiKey() {
        return youtubeApiKey != null;
    }

    public boolean hasPexelsApiKey() {
        return pexelsApiKey != null;
    }

    public boolean isProduction() {
        return "prod".equals(environment);
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private static String resolveGeminiApiKey(Map<String, String> source) {
        String explicitGeminiKey = normalize(source.get(GEMINI_API_KEY_ENV));
        if (explicitGeminiKey != null) {
            return explicitGeminiKey;
        }

        String googleApiKey = normalize(source.get(GOOGLE_API_KEY_ENV));
        if (googleApiKey != null) {
            return googleApiKey;
        }

        String googleApiKey2 = normalize(source.get(GOOGLE_API_KEY_2_ENV));
        if (googleApiKey2 != null) {
            return googleApiKey2;
        }

        return normalize(source.get(GOOGLE_API_KEY_3_ENV));
    }

    private static String resolveYouTubeApiKey(Map<String, String> source) {
        String explicitYoutubeKey = normalize(source.get(YOUTUBE_API_KEY_ENV));
        if (explicitYoutubeKey != null) {
            return explicitYoutubeKey;
        }

        String googleApiKey = normalize(source.get(GOOGLE_API_KEY_ENV));
        if (googleApiKey != null) {
            return googleApiKey;
        }

        String googleApiKey2 = normalize(source.get(GOOGLE_API_KEY_2_ENV));
        if (googleApiKey2 != null) {
            return googleApiKey2;
        }

        return normalize(source.get(GOOGLE_API_KEY_3_ENV));
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

    private static boolean parseBoolean(String value, boolean defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value.trim());
    }
}
