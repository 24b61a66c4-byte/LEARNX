package com.learnx.ai;

/**
 * Abstraction over the remote Gemini generative AI API.
 *
 * <p>Implementations are injected into {@link AiService} to keep the service layer testable
 * without live network calls.  See {@link GeminiClientFactory} for the production implementation.
 */
public interface GeminiClient {

    /**
     * Sends a prompt to the AI model and returns its text response.
     *
     * @param systemPrompt role/persona context for the model
     * @param userPrompt   the actual user input or instruction
     * @return the model's raw text response
     */
    String generate(String systemPrompt, String userPrompt);
}
