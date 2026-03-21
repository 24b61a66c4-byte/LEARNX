package com.learnx.ai.config;

/**
 * Loads AI-related configuration from environment variables.
 *
 * <p>Required environment variables:
 * <ul>
 *   <li>{@code GEMINI_API_KEY} – Google Gemini API key</li>
 *   <li>{@code GEMINI_MODEL}   – Model name (default: {@code gemini-pro})</li>
 * </ul>
 */
public class AiConfig {

    public static final String API_KEY    = System.getenv("GEMINI_API_KEY");
    public static final String MODEL_NAME = getEnvOrDefault("GEMINI_MODEL", "gemini-pro");
    public static final int    MAX_TOKENS = 1024;
    public static final double TEMPERATURE = 0.7;

    private AiConfig() {}

    private static String getEnvOrDefault(String key, String defaultValue) {
        String value = System.getenv(key);
        return (value != null && !value.isBlank()) ? value : defaultValue;
    }

    /**
     * Validates that required environment variables are present.
     *
     * @throws IllegalStateException if {@code GEMINI_API_KEY} is not set
     */
    public static void validate() {
        if (API_KEY == null || API_KEY.isBlank()) {
            throw new IllegalStateException(
                    "Environment variable GEMINI_API_KEY is not set. "
                    + "Please export it before starting the application.");
        }
    }
}
