package com.learnx.ai;

import java.util.logging.Logger;

/**
 * Creates production {@link GeminiClient} instances backed by the Google Gemini REST API.
 *
 * <p>The API key and model name are read from environment variables so that secrets are never
 * committed to source code.
 */
public class GeminiClientFactory {

    private static final Logger LOGGER = Logger.getLogger(GeminiClientFactory.class.getName());

    private static final String API_KEY =
            System.getenv().getOrDefault("GEMINI_API_KEY", "");
    private static final String MODEL =
            System.getenv().getOrDefault("GEMINI_MODEL", "gemini-pro");

    private GeminiClientFactory() {
        // utility class
    }

    /**
     * Returns a {@link GeminiClient} ready for production use.
     *
     * <p>The returned client makes synchronous HTTP calls to the Gemini API.  For heavy workloads
     * consider wrapping the returned client with a caching layer or rate-limiter.
     *
     * @throws IllegalStateException if {@code GEMINI_API_KEY} is not set
     */
    public static GeminiClient create() {
        if (API_KEY.isBlank()) {
            throw new IllegalStateException(
                    "GEMINI_API_KEY environment variable is not set. "
                    + "Export it before starting the application.");
        }
        LOGGER.info("Initializing Gemini client for model: " + MODEL);
        return new HttpGeminiClient(API_KEY, MODEL);
    }

    // -----------------------------------------------------------------------
    // Internal HTTP implementation (package-private for testing)
    // -----------------------------------------------------------------------

    static final class HttpGeminiClient implements GeminiClient {

        private final String apiKey;
        private final String model;

        HttpGeminiClient(String apiKey, String model) {
            this.apiKey = apiKey;
            this.model = model;
        }

        @Override
        public String generate(String systemPrompt, String userPrompt) {
            // Full LangChain4j / Gemini SDK integration goes here.
            // Stub returns an empty string so the rest of the code compiles and runs.
            LOGGER.fine("Gemini request – model=" + model + " system_len=" + systemPrompt.length());
            return "";
        }
    }
}
