package com.learnx.ai.client;

import com.learnx.ai.config.AiConfig;

/**
 * Factory for creating a configured LangChain4j {@code ChatLanguageModel}
 * backed by Google Gemini.
 *
 * <p><strong>Dependency:</strong> Add the following to your build tool:
 * <pre>
 * // Maven
 * &lt;dependency&gt;
 *   &lt;groupId&gt;dev.langchain4j&lt;/groupId&gt;
 *   &lt;artifactId&gt;langchain4j-google-ai-gemini&lt;/artifactId&gt;
 *   &lt;version&gt;0.31.0&lt;/version&gt;
 * &lt;/dependency&gt;
 * </pre>
 *
 * <p>The actual LangChain4j import is commented out below to keep this file
 * compilable before the dependency is added to the project.
 */
public class GeminiClientFactory {

    private GeminiClientFactory() {}

    /**
     * Creates and returns a ready-to-use chat language model client.
     *
     * <p>Reads {@code GEMINI_API_KEY} and {@code GEMINI_MODEL} from
     * environment variables via {@link AiConfig}.
     *
     * @return configured {@code ChatLanguageModel}
     *         (type is {@code Object} until LangChain4j dependency is added)
     */
    public static Object createModel() {
        AiConfig.validate();

        /*
         * Uncomment the block below once LangChain4j is on the classpath:
         *
         * return GoogleAiGeminiChatModel.builder()
         *         .apiKey(AiConfig.API_KEY)
         *         .modelName(AiConfig.MODEL_NAME)
         *         .maxOutputTokens(AiConfig.MAX_TOKENS)
         *         .temperature(AiConfig.TEMPERATURE)
         *         .build();
         */

        throw new UnsupportedOperationException(
                "Add the langchain4j-google-ai-gemini dependency and uncomment the builder code.");
    }
}
